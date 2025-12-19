import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const router = express.Router();

// ---------------------------
// HELPERS
// ---------------------------
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || "hotel_pms_secret",
    { expiresIn: "1d" }
  );
};

const getDeviceId = (req) => {
  return crypto
    .createHash("sha256")
    .update(
      req.headers["user-agent"] +
        (req.ip || "") +
        (req.headers["x-forwarded-for"] || "")
    )
    .digest("hex");
};

// ---------------------------
// LOGIN
// POST /api/auth/login
// ---------------------------
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ message: "Missing credentials" });

    // username OR email
    const user = await User.findOne({
      $or: [{ username }, { email: username }],
      isActive: true,
    });

    if (!user)
      return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const deviceId = getDeviceId(req);

    const existingDevice = user.devices.find(
      (d) => d.deviceId === deviceId
    );

    // ✅ FIRST DEVICE = allow login directly
    if (!existingDevice) {
      user.devices.push({
        deviceId,
        deviceName: req.headers["user-agent"] || "Unknown device",
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        isVerified: true, // ✅ IMPORTANT
      });
      await user.save();
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);

    res.json({
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------------------
// VERIFY TOKEN
// POST /api/auth/verify
// ---------------------------
router.post("/verify", async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ message: "No token" });

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "hotel_pms_secret"
    );

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive)
      return res.status(401).json({ message: "Invalid token" });

    res.json({ user: user.toJSON() });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
});

export default router;
