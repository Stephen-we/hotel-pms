import express from "express";
import Room from "../models/Room.js";

const router = express.Router();

/**
 * GET /api/rooms
 * Filters: status, type, floor, search (room number)
 */
router.get("/", async (req, res) => {
  try {
    const { status, type, floor, search } = req.query;
    const query = {};

    if (status && status !== "ALL") query.status = status;
    if (type && type !== "ALL") query.type = type;
    if (floor) query.floor = Number(floor);
    if (search) query.number = { $regex: search, $options: "i" };

    const rooms = await Room.find(query).sort({ floor: 1, number: 1 });
    res.json(rooms);
  } catch (err) {
    console.error("Error fetching rooms:", err);
    res.status(500).json({ message: "Failed to fetch rooms" });
  }
});

/**
 * PATCH /api/rooms/:id/status
 * Body: { status }
 */
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json(room);
  } catch (err) {
    console.error("Error updating room status:", err);
    res.status(500).json({ message: "Failed to update room status" });
  }
});

/**
 * DEV ONLY – seed rooms
 * POST /api/rooms/seed
 */
router.post("/seed", async (req, res) => {
  try {
    const count = await Room.countDocuments();
    if (count > 0) {
      return res
        .status(400)
        .json({ message: "Rooms already exist, skipping seed." });
    }

    const sampleRooms = [];
    const types = ["DELUXE", "SUPERIOR", "SUITE", "FAMILY"];

    let roomNumber = 101;
    for (let floor = 1; floor <= 5; floor++) {
      for (let i = 0; i < 8; i++) {
        sampleRooms.push({
          number: String(roomNumber++),
          type: types[Math.floor(Math.random() * types.length)],
          floor,
          status: "VACANT_CLEAN",
          rate: 2800 + Math.floor(Math.random() * 2000),
          features: ["AC", "TV", "WiFi"],
        });
      }
    }

    await Room.insertMany(sampleRooms);
    res.json({ message: "Sample rooms created", count: sampleRooms.length });
  } catch (err) {
    console.error("Error seeding rooms:", err);
    res.status(500).json({ message: "Failed to seed rooms" });
  }
});

export default router;
