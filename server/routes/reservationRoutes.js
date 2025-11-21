import express from "express";
import Reservation from "../models/Reservation.js";
import Room from "../models/Room.js";

const router = express.Router();

/**
 * POST /api/reservations
 * Body: { guest, room, checkInDate, checkOutDate, source, totalAmount, notes }
 */
router.post("/", async (req, res) => {
  try {
    const { guest, room, checkInDate, checkOutDate } = req.body;

    // Basic overlap check: same room, date overlap, and active status
    const overlapping = await Reservation.findOne({
      room,
      status: { $in: ["BOOKED", "CHECKED_IN"] },
      $or: [
        {
          checkInDate: { $lt: new Date(checkOutDate) },
          checkOutDate: { $gt: new Date(checkInDate) },
        },
      ],
    });

    if (overlapping) {
      return res
        .status(400)
        .json({ message: "Room already booked for selected dates." });
    }

    const reservation = await Reservation.create(req.body);
    res.status(201).json(reservation);
  } catch (err) {
    console.error("Error creating reservation:", err);
    res.status(500).json({ message: "Failed to create reservation" });
  }
});

/**
 * GET /api/reservations
 */
router.get("/", async (req, res) => {
  try {
    const items = await Reservation.find()
      .populate("guest")
      .populate("room")
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(items);
  } catch (err) {
    console.error("Error fetching reservations:", err);
    res.status(500).json({ message: "Failed to fetch reservations" });
  }
});

/**
 * POST /api/reservations/:id/checkin
 */
router.post("/:id/checkin", async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate("room");
    if (!reservation) return res.status(404).json({ message: "Not found" });

    reservation.status = "CHECKED_IN";
    await reservation.save();

    // Update room status
    reservation.room.status = "OCCUPIED";
    await reservation.room.save();

    res.json(reservation);
  } catch (err) {
    console.error("Error checking in:", err);
    res.status(500).json({ message: "Failed to check-in" });
  }
});

/**
 * POST /api/reservations/:id/checkout
 */
router.post("/:id/checkout", async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate("room");
    if (!reservation) return res.status(404).json({ message: "Not found" });

    reservation.status = "CHECKED_OUT";
    await reservation.save();

    reservation.room.status = "VACANT_DIRTY"; // then HK will clean
    await reservation.room.save();

    res.json(reservation);
  } catch (err) {
    console.error("Error checking out:", err);
    res.status(500).json({ message: "Failed to check-out" });
  }
});

export default router;
