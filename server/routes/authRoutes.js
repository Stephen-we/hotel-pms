// server/routes/authRoutes.js
import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendOTPEmail } from "../services/emailService.js";

const router = express.Router();

// ⭐ Helper: Get IP address
const getClientIP = (req) => {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.headers["x-real-ip"] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    "Unknown"
  );
};

// ⭐ Helper: Device info
const extractDeviceInfo = (req) => {
  const userAgent = req.headers["user-agent"] || "";
  const ip = getClientIP(req);

  const getOS = (ua) => {
    if (ua.includes("Windows")) return "Windows";
    if (ua.includes("Mac")) return "macOS";
    if (ua.includes("Linux")) return "Linux";
    if (ua.includes("Android")) return "Android";
    if (ua.includes("iOS") || ua.includes("iPhone")) return "iOS";
    return "Unknown OS";
  };

  const getBrowser = (ua) => {
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Safari")) return "Safari";
    if (ua.includes("Edge")) return "Edge";
    return "Unknown Browser";
  };

  return {
    deviceId: crypto.createHash("sha256").update(ip + userAgent).digest("hex"),
    ipAddress: ip,
    userAgent,
    os: getOS(userAgent),
    browser: getBrowser(userAgent),
    deviceName: `${getOS(userAgent)} Device`,
  };
};

// ⭐ Device limit logic
const getMaxDevicesForUser = (user) => {
  if (user.role === "SUPER_ADMIN") return Infinity; // unlimited for admin
  return user.securitySettings?.maxDevices || 2; // staff allowed 2 devices
};

const JWT_SECRET = process.env.JWT_SECRET || "hotel_pms_secret_key";

// --- LOGIN: STEP 1 ---
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const db = mongoose.connection.db;
    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({
      $or: [{ username }, { email: username }],
    });

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    if (!user.isActive)
      return res.status(401).json({ message: "Account is deactivated" });

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword)
      return res.status(401).json({ message: "Invalid credentials" });

    const deviceInfo = extractDeviceInfo(req);

    const devices = user.devices || [];
    const currentDevice = devices.find((d) => d.deviceId === deviceInfo.deviceId);
    const allowedDevices = devices.filter((d) => !d.isBlocked);
    const maxDevices = getMaxDevicesForUser(user);

    // Case 1: Already verified device
    if (currentDevice && currentDevice.isVerified && !currentDevice.isBlocked) {
      const token = jwt.sign(
        {
          userId: user._id.toString(),
          role: user.role,
          username: user.username,
          deviceId: deviceInfo.deviceId,
        },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      await usersCollection.updateOne(
        { _id: user._id, "devices.deviceId": deviceInfo.deviceId },
        {
          $set: {
            lastLogin: new Date(),
            "devices.$.lastLogin": new Date(),
          },
          $inc: { "devices.$.loginCount": 1 },
        }
      );

      return res.json({ token, user });
    }

    // Case 2: Device limit reached
    if (!currentDevice && allowedDevices.length >= maxDevices) {
      return res.status(403).json({
        message: `Maximum allowed devices (${maxDevices}) reached.`,
        code: "MAX_DEVICES",
      });
    }

    // Case 3: OTP required for new / unverified device
    const otp = crypto.randomInt(100000, 999999).toString();

    const otpCollection = db.collection("otps");
    await otpCollection.insertOne({
      userId: user._id,
      deviceId: deviceInfo.deviceId,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      createdAt: new Date(),
    });

    // 📩 SEND REAL EMAIL
    await sendOTPEmail(user.email, otp, user, deviceInfo);

    const tempToken = jwt.sign(
      {
        userId: user._id.toString(),
        deviceId: deviceInfo.deviceId,
        type: "device_otp",
      },
      JWT_SECRET,
      { expiresIn: "10m" }
    );

    return res.json({
      requiresOTP: true,
      tempToken,
      message: "OTP sent to your email.",
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// --- OTP VERIFICATION: STEP 2 ---
router.post("/verify-otp", async (req, res) => {
  try {
    const { tempToken, otp } = req.body;

    const decoded = jwt.verify(tempToken, JWT_SECRET);

    if (decoded.type !== "device_otp")
      return res.status(401).json({ message: "Invalid verification token" });

    const db = mongoose.connection.db;
    const otpCollection = db.collection("otps");
    const usersCollection = db.collection("users");

    const userId = new mongoose.Types.ObjectId(decoded.userId);
    const deviceId = decoded.deviceId;

    const otpRecord = await otpCollection.findOne({
      userId,
      deviceId,
      otp,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord)
      return res.status(401).json({ message: "Invalid or expired OTP" });

    const user = await usersCollection.findOne({ _id: userId });
    if (!user) return res.status(401).json({ message: "User not found" });

    const devices = user.devices || [];
    const existingDevice = devices.find((d) => d.deviceId === deviceId);
    const maxDevices = getMaxDevicesForUser(user);

    const deviceInfo = extractDeviceInfo(req);

    // Add device if new
    if (!existingDevice) {
      const allowedDevices = devices.filter((d) => !d.isBlocked);
      if (allowedDevices.length >= maxDevices) {
        return res.status(403).json({
          message: `Maximum allowed devices (${maxDevices}) reached.`,
        });
      }

      await usersCollection.updateOne(
        { _id: userId },
        {
          $push: {
            devices: {
              ...deviceInfo,
              isVerified: true,
              isBlocked: false,
              createdAt: new Date(),
              lastLogin: new Date(),
              loginCount: 1,
            },
          },
        }
      );
    } else {
      // Mark existing device verified
      await usersCollection.updateOne(
        { _id: userId, "devices.deviceId": deviceId },
        {
          $set: {
            "devices.$.isVerified": true,
            "devices.$.isBlocked": false,
            "devices.$.lastLogin": new Date(),
          },
          $inc: { "devices.$.loginCount": 1 },
        }
      );
    }

    // Delete OTP
    await otpCollection.deleteOne({ _id: otpRecord._id });

    // Generate JWT final token
    const token = jwt.sign(
      {
        userId: userId.toString(),
        username: user.username,
        role: user.role,
        deviceId: deviceInfo.deviceId,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.json({ success: true, token, user });
  } catch (err) {
    console.error("OTP VERIFY ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// --- TOKEN VERIFY ---
router.post("/verify", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    const db = mongoose.connection.db;
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({
      _id: new mongoose.Types.ObjectId(decoded.userId),
    });

    if (!user) return res.status(401).json({ message: "User not found" });

    const device = (user.devices || []).find(
      (d) => d.deviceId === decoded.deviceId
    );

    if (!device || !device.isVerified || device.isBlocked)
      return res.status(401).json({ message: "Device not allowed" });

    return res.json({ user });
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
});

export default router;
