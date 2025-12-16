// server/routes/deviceRoutes.js
import express from "express";
import mongoose from "mongoose";

const router = express.Router();

// Get all devices (Admin only)
router.get("/devices", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    const users = await usersCollection.find({}).toArray();
    const allDevices = users.flatMap(user => 
      user.devices?.map(device => ({
        ...device,
        userName: `${user.firstName} ${user.lastName}`,
        userEmail: user.email,
        userRole: user.role
      })) || []
    );
    
    res.json(allDevices);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch devices" });
  }
});

// Approve device (Admin only)
router.post("/devices/:deviceId/approve", async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { approvedBy } = req.body;
    
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    const result = await usersCollection.updateOne(
      { "devices.deviceId": deviceId },
      { 
        $set: { 
          "devices.$.isVerified": true,
          "devices.$.verifiedAt": new Date(),
          "devices.$.verifiedBy": new mongoose.Types.ObjectId(approvedBy)
        }
      }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Device not found" });
    }
    
    res.json({ message: "Device approved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to approve device" });
  }
});

// Block device (Admin only)
router.post("/devices/:deviceId/block", async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { reason } = req.body;
    
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    const result = await usersCollection.updateOne(
      { "devices.deviceId": deviceId },
      { 
        $set: { 
          "devices.$.isBlocked": true,
          "devices.$.blockedAt": new Date(),
          "devices.$.blockReason": reason
        }
      }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Device not found" });
    }
    
    res.json({ message: "Device blocked successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to block device" });
  }
});

export default router;
