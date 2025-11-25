import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const router = express.Router();

// POST /api/auth/login - User login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("🔐 LOGIN ATTEMPT for:", username);

    // Get users collection directly
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Find user in the collection
    const user = await usersCollection.findOne({ 
      $or: [{ username }, { email: username }] 
    });
    
    console.log("User found:", user ? "YES" : "NO");
    
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log("User active:", user.isActive);
    if (!user.isActive) {
      return res.status(401).json({ message: "Account is deactivated" });
    }

    console.log("Password hash:", user.password.substring(0, 25) + "...");
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log("Password valid:", isValidPassword);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign(
      { 
        userId: user._id, 
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET || "hotel_pms_secret_key",
      { expiresIn: "24h" }
    );

    console.log("✅ LOGIN SUCCESSFUL for:", username);
    
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

// POST /api/auth/verify - Verify token
router.post("/verify", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || "hotel_pms_secret_key"
    );

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ _id: new mongoose.Types.ObjectId(decoded.userId) });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "User not found or inactive" });
    }

    res.json({ user });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
});

export default router;
