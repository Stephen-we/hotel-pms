import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const router = express.Router();

// Simple device info extraction
const extractDeviceInfo = (req) => {
  const userAgent = req.headers['user-agent'] || '';
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  
  const getOS = (ua) => {
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS') || ua.includes('iPhone')) return 'iOS';
    return 'Unknown OS';
  };

  const getBrowser = (ua) => {
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown Browser';
  };

  const deviceId = crypto.createHash('sha256').update(ip + userAgent).digest('hex');

  return {
    deviceId,
    ipAddress: ip,
    userAgent,
    os: getOS(userAgent),
    browser: getBrowser(userAgent),
    deviceName: getOS(userAgent) + ' Device'
  };
};

// POST /api/auth/login - User login with SIMPLE device tracking
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("🔐 LOGIN ATTEMPT for:", username);

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Get device information
    const deviceInfo = extractDeviceInfo(req);
    
    console.log("📱 Device attempting login:", {
      deviceId: deviceInfo.deviceId,
      ip: deviceInfo.ipAddress,
      os: deviceInfo.os,
      browser: deviceInfo.browser
    });

    const user = await usersCollection.findOne({ 
      $or: [{ username }, { email: username }] 
    });
    
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: "Account is deactivated" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 🚨 DEVICE SECURITY: Track device but don't block login
    const existingDevice = user.devices?.find(d => d.deviceId === deviceInfo.deviceId);
    
    if (!existingDevice) {
      console.log("🆕 NEW DEVICE DETECTED:", user.email, "on", deviceInfo.deviceName);
      console.log("📧 [SIMULATION] OTP would be sent to:", user.email);
      console.log("🚨 SECURITY ALERT: New device login attempt from IP:", deviceInfo.ipAddress);
      
      // Add device to user's devices for tracking
      await usersCollection.updateOne(
        { _id: user._id },
        { 
          $push: {
            devices: {
              deviceId: deviceInfo.deviceId,
              deviceName: deviceInfo.deviceName,
              ipAddress: deviceInfo.ipAddress,
              userAgent: deviceInfo.userAgent,
              os: deviceInfo.os,
              browser: deviceInfo.browser,
              isVerified: true, // Auto-verify for now
              isBlocked: false,
              lastLogin: new Date(),
              loginCount: 1,
              createdAt: new Date()
            }
          }
        }
      );
    } else {
      // Update existing device
      await usersCollection.updateOne(
        { _id: user._id, "devices.deviceId": deviceInfo.deviceId },
        { 
          $set: { 
            "devices.$.lastLogin": new Date()
          },
          $inc: { "devices.$.loginCount": 1 }
        }
      );
    }

    // Generate token
    const token = jwt.sign(
      { 
        userId: user._id, 
        username: user.username,
        role: user.role,
        deviceId: deviceInfo.deviceId
      },
      process.env.JWT_SECRET || "hotel_pms_secret_key",
      { expiresIn: "24h" }
    );

    console.log("✅ LOGIN SUCCESSFUL for:", username, "on device:", deviceInfo.deviceId);
    
    res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        department: user.department
      },
      deviceInfo: {
        isNewDevice: !existingDevice,
        deviceName: deviceInfo.deviceName
      }
    });
    
  } catch (err) {
    console.error("❌ LOGIN ERROR:", err);
    res.status(500).json({ message: "Login failed" });
  }
});

// Verify token
router.post("/verify", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "hotel_pms_secret_key");
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    const user = await usersCollection.findOne({ 
      _id: new mongoose.Types.ObjectId(decoded.userId) 
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "User not found or inactive" });
    }

    res.json({ user });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
});

export default router;
