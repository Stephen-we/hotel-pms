import express from "express";
import mongoose from "mongoose";
import HotelConfig from "../models/HotelConfig.js";

const router = express.Router();

// GET /api/settings - Get hotel configuration
router.get("/", async (req, res) => {
  try {
    const config = await HotelConfig.getConfig();
    res.json(config);
  } catch (err) {
    console.error("Error fetching settings:", err);
    res.status(500).json({ message: "Failed to fetch settings" });
  }
});

// PATCH /api/settings - Update hotel configuration
router.patch("/", async (req, res) => {
  try {
    let config = await HotelConfig.findOne();
    
    if (!config) {
      config = await HotelConfig.create(req.body);
    } else {
      config = await HotelConfig.findByIdAndUpdate(
        config._id,
        req.body,
        { new: true, runValidators: true }
      );
    }

    res.json(config);
  } catch (err) {
    console.error("Error updating settings:", err);
    res.status(500).json({ message: "Failed to update settings" });
  }
});

// GET /api/settings/system-info - Get system information
router.get("/system-info", async (req, res) => {
  try {
    const systemInfo = {
      version: "1.0.0",
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      database: {
        connected: mongoose.connection.readyState === 1,
        host: mongoose.connection.host,
        name: mongoose.connection.name
      },
      timestamp: new Date().toISOString()
    };

    res.json(systemInfo);
  } catch (err) {
    console.error("Error fetching system info:", err);
    res.status(500).json({ message: "Failed to fetch system information" });
  }
});

export default router;
