import express from "express";
import Room from "../models/Room.js";

const router = express.Router();

/**
 * GET /api/rooms
 * Filters:
 * - occupancyStatus (VACANT, OCCUPIED, RESERVED)
 * - housekeepingStatus (CLEAN, DIRTY)
 * - maintenanceStatus (OK, OUT_OF_ORDER)
 * - type
 * - floor
 * - baseBedType
 * - minOccupancy
 * - search (room number)
 */
router.get("/", async (req, res) => {
  try {
    const {
      occupancyStatus,
      housekeepingStatus,
      maintenanceStatus,
      type,
      floor,
      baseBedType,
      minOccupancy,
      search,
    } = req.query;

    const query = {};

    if (occupancyStatus && occupancyStatus !== "ALL") {
      query.occupancyStatus = occupancyStatus;
    }

    if (housekeepingStatus && housekeepingStatus !== "ALL") {
      query.housekeepingStatus = housekeepingStatus;
    }

    if (maintenanceStatus && maintenanceStatus !== "ALL") {
      query.maintenanceStatus = maintenanceStatus;
    }

    if (type && type !== "ALL") {
      query.type = type;
    }

    if (floor) {
      query.floor = Number(floor);
    }

    if (baseBedType) {
      query.baseBedType = baseBedType;
    }

    if (minOccupancy) {
      query.maxOccupancy = { $gte: Number(minOccupancy) };
    }

    if (search) {
      query.number = { $regex: search, $options: "i" };
    }

    const rooms = await Room.find(query).sort({
      floor: 1,
      number: 1,
    });

    res.json(rooms);
  } catch (err) {
    console.error("Error fetching rooms:", err);
    res.status(500).json({ message: "Failed to fetch rooms" });
  }
});

/**
 * PATCH /api/rooms/:id/status
 * Body:
 * {
 *   occupancyStatus,
 *   housekeepingStatus,
 *   maintenanceStatus
 * }
 */
router.patch("/:id/status", async (req, res) => {
  try {
    const { occupancyStatus, housekeepingStatus, maintenanceStatus } = req.body;

    const update = {};
    if (occupancyStatus) update.occupancyStatus = occupancyStatus;
    if (housekeepingStatus) update.housekeepingStatus = housekeepingStatus;
    if (maintenanceStatus) update.maintenanceStatus = maintenanceStatus;

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.json(room);
  } catch (err) {
    console.error("Error updating room status:", err);
    res.status(500).json({ message: "Failed to update room status" });
  }
});

/**
 * PATCH /api/rooms/:id/occupancy
 * Body:
 * {
 *   guests: Number
 * }
 *
 * Applies bed logic automatically
 */
router.patch("/:id/occupancy", async (req, res) => {
  try {
    const { guests } = req.body;

    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (guests < 0 || guests > room.maxOccupancy) {
      return res.status(400).json({
        message: "Invalid guest count for this room",
      });
    }

    room.currentOccupancy = guests;

    if (guests === 0) {
      room.occupancyStatus = "VACANT";
      room.currentBedMode = "LARGE";
    } else {
      room.occupancyStatus = "OCCUPIED";

      if (guests === 1) {
        room.currentBedMode = "LARGE";
      } else if (guests >= 2 && room.canSplitBed) {
        room.currentBedMode = "SPLIT";
      } else {
        room.currentBedMode = "LARGE";
      }
    }

    await room.save();
    res.json(room);
  } catch (err) {
    console.error("Error updating occupancy:", err);
    res.status(500).json({ message: "Failed to update occupancy" });
  }
});

/**
 * DEV ONLY – Seed rooms (REALISTIC HOTEL DATA)
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

    const rooms = [];
    let roomNumber = 101;

    for (let floor = 1; floor <= 5; floor++) {
      for (let i = 0; i < 8; i++) {
        const type = ["DELUXE", "SUPERIOR", "SUITE", "FAMILY"][
          Math.floor(Math.random() * 4)
        ];

        let baseBedType = "KING";
        let canSplitBed = false;
        let maxOccupancy = 2;

        if (type === "DELUXE") {
          baseBedType = "KING";
          canSplitBed = true;
        }

        if (type === "SUPERIOR") {
          baseBedType = "QUEEN";
        }

        if (type === "SUITE") {
          baseBedType = "KING";
          maxOccupancy = 3;
        }

        if (type === "FAMILY") {
          baseBedType = "TWIN";
          maxOccupancy = 4;
        }

        rooms.push({
          number: String(roomNumber++),
          type,
          floor,
          rate: 3000 + Math.floor(Math.random() * 2000),
          features: ["AC", "TV", "WiFi"],

          baseBedType,
          canSplitBed,
          maxOccupancy,
          splitInto: canSplitBed ? "TWO_SINGLE" : null,

          currentOccupancy: 0,
          currentBedMode: "LARGE",

          occupancyStatus: "VACANT",
          housekeepingStatus: "CLEAN",
          maintenanceStatus: "OK",
        });
      }
    }

    await Room.insertMany(rooms);
    res.json({ message: "Rooms seeded successfully", count: rooms.length });
  } catch (err) {
    console.error("Error seeding rooms:", err);
    res.status(500).json({ message: "Failed to seed rooms" });
  }
});

export default router;
