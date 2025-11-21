import express from "express";
import Guest from "../models/Guest.js";

const router = express.Router();

/**
 * POST /api/guests
 * Create guest
 */
router.post("/", async (req, res) => {
  try {
    const guest = await Guest.create(req.body);
    res.status(201).json(guest);
  } catch (err) {
    console.error("Error creating guest:", err);
    res.status(500).json({ message: "Failed to create guest" });
  }
});

/**
 * GET /api/guests
 * Simple list
 */
router.get("/", async (req, res) => {
  try {
    const guests = await Guest.find().sort({ createdAt: -1 }).limit(50);
    res.json(guests);
  } catch (err) {
    console.error("Error fetching guests:", err);
    res.status(500).json({ message: "Failed to fetch guests" });
  }
});

export default router;
