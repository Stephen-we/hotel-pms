import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { extractDeviceInfo } from "../middleware/deviceSecurity.js";
import { sendOTPToUser, sendDeviceAlertToOwner } from "../services/notificationService.js";

const router = express.Router();

// POST /api/auth/login - User login with device security ENABLED
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("🔐 DEVICE SECURITY LOGIN for:", username);

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

    // Check if device is verified
    const existingDevice = user.devices?.find(d => d.deviceId === deviceInfo.deviceId);
    const isDeviceVerified = existingDevice?.isVerified && !existingDevice?.isBlocked;

    // 🚨 DEVICE SECURITY ENABLED - Require verification for new devices
    if (!isDeviceVerified) {
      // NEW DEVICE - Require OTP and notify owner
      console.log("🆕 NEW DEVICE DETECTED - Requiring OTP verification");
      console.log("📧 User:", user.email, "Device:", deviceInfo.deviceName);
      
      // Generate OTP
      const otp = crypto.randomInt(100000, 999999).toString();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      
      // Store OTP in temporary collection
      const otpCollection = db.collection('otps');
      await otpCollection.insertOne({
        userId: user._id,
        deviceId: deviceInfo.deviceId,
        otp,
        expiresAt: otpExpires,
        createdAt: new Date()
      });

      // Send OTP to user (console for testing)
      await sendOTPToUser(user.email, otp, user.firstName);
      
      // Send device alert to owner
      await sendDeviceAlertToOwner(user, deviceInfo, 'NEW_DEVICE_ATTEMPT');
      
      return res.status(200).json({
        requiresOTP: true,
        message: "New device detected. OTP sent to your registered email.",
        deviceId: deviceInfo.deviceId,
        tempToken: jwt.sign(
          { userId: user._id, deviceId: deviceInfo.deviceId, type: 'otp_verification' },
          process.env.JWT_SECRET || "hotel_pms_secret_key",
          { expiresIn: '10m' }
        ),
        userEmail: user.email // For frontend to show which email OTP was sent to
      });
    }

    // DEVICE IS VERIFIED - Generate login token
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

    // Update device last login
    if (existingDevice) {
      await usersCollection.updateOne(
        { _id: user._id, "devices.deviceId": deviceInfo.deviceId },
        { 
          $set: { 
            "devices.$.lastLogin": new Date(),
            lastLogin: new Date()
          },
          $inc: { "devices.$.loginCount": 1 }
        }
      );
    }

    console.log("✅ VERIFIED DEVICE LOGIN for:", username, "on device:", deviceInfo.deviceId);
    
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
      }
    });
    
  } catch (err) {
    console.error("❌ LOGIN ERROR:", err);
    res.status(500).json({ message: "Login failed" });
  }
});

// OTP Verification endpoint
router.post("/verify-otp", async (req, res) => {
  try {
    const { tempToken, otp, deviceId } = req.body;
    
    const db = mongoose.connection.db;
    const otpCollection = db.collection('otps');
    const usersCollection = db.collection('users');
    
    // Verify temp token
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET || "hotel_pms_secret_key");
    
    if (decoded.type !== 'otp_verification' || decoded.deviceId !== deviceId) {
      return res.status(401).json({ message: "Invalid verification request" });
    }
    
    // Check OTP
    const otpRecord = await otpCollection.findOne({
      userId: decoded.userId,
      deviceId: deviceId,
      otp: otp,
      expiresAt: { $gt: new Date() }
    });
    
    if (!otpRecord) {
      return res.status(401).json({ message: "Invalid or expired OTP" });
    }
    
    // Get device info
    const deviceInfo = extractDeviceInfo(req);
    
    // Add device to user's devices (auto-verify for testing)
    await usersCollection.updateOne(
      { _id: decoded.userId },
      { 
        $push: {
          devices: {
            deviceId: deviceInfo.deviceId,
            deviceName: deviceInfo.deviceName,
            ipAddress: deviceInfo.ipAddress,
            userAgent: deviceInfo.userAgent,
            os: deviceInfo.os,
            browser: deviceInfo.browser,
            isVerified: true, // Auto-verify for testing
            isBlocked: false,
            lastLogin: new Date(),
            loginCount: 1,
            createdAt: new Date()
          }
        }
      }
    );
    
    // Clean up OTP
    await otpCollection.deleteOne({ _id: otpRecord._id });
    
    // Generate final token
    const token = jwt.sign(
      { 
        userId: decoded.userId,
        deviceId: deviceInfo.deviceId
      },
      process.env.JWT_SECRET || "hotel_pms_secret_key",
      { expiresIn: "24h" }
    );

    // Get user for response
    const user = await usersCollection.findOne({ _id: decoded.userId });
    
    res.json({
      success: true,
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
      message: "Device verified successfully!"
    });
    
  } catch (error) {
    console.error("❌ OTP VERIFICATION ERROR:", error);
    res.status(500).json({ message: "OTP verification failed" });
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

// OTP Verification endpoint
router.post("/verify-otp", async (req, res) => {
  try {
    const { tempToken, otp, deviceId } = req.body;
    
    const db = mongoose.connection.db;
    const otpCollection = db.collection('otps');
    const usersCollection = db.collection('users');
    
    // Verify temp token
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET || "hotel_pms_secret_key");
    
    if (decoded.type !== 'otp_verification' || decoded.deviceId !== deviceId) {
      return res.status(401).json({ message: "Invalid verification request" });
    }
    
    // Check OTP
    const otpRecord = await otpCollection.findOne({
      userId: decoded.userId,
      deviceId: deviceId,
      otp: otp,
      expiresAt: { $gt: new Date() }
    });
    
    if (!otpRecord) {
      return res.status(401).json({ message: "Invalid or expired OTP" });
    }
    
    // Get device info
    const deviceInfo = extractDeviceInfo(req);
    
    // Add device to user's devices (auto-verify for testing)
    await usersCollection.updateOne(
      { _id: decoded.userId },
      { 
        $push: {
          devices: {
            deviceId: deviceInfo.deviceId,
            deviceName: deviceInfo.deviceName,
            ipAddress: deviceInfo.ipAddress,
            userAgent: deviceInfo.userAgent,
            os: deviceInfo.os,
            browser: deviceInfo.browser,
            isVerified: true, // Auto-verify for testing
            isBlocked: false,
            lastLogin: new Date(),
            loginCount: 1,
            createdAt: new Date()
          }
        }
      }
    );
    
    // Clean up OTP
    await otpCollection.deleteOne({ _id: otpRecord._id });
    
    // Generate final token
    const token = jwt.sign(
      { 
        userId: decoded.userId,
        deviceId: deviceInfo.deviceId
      },
      process.env.JWT_SECRET || "hotel_pms_secret_key",
      { expiresIn: "24h" }
    );

    // Get user for response
    const user = await usersCollection.findOne({ _id: decoded.userId });
    
    res.json({
      success: true,
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
      message: "Device verified successfully!"
    });
    
  } catch (error) {
    console.error("❌ OTP VERIFICATION ERROR:", error);
    res.status(500).json({ message: "OTP verification failed" });
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
