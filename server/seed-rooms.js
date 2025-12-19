import mongoose from "mongoose";
import dotenv from "dotenv";
import Room from "./models/Room.js";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/hotel_pms";

const ROOM_TYPES = [
  { type: "DELUXE", bed: "KING", max: 2, split: true },
  { type: "SUPERIOR", bed: "QUEEN", max: 2, split: false },
  { type: "SUITE", bed: "KING", max: 3, split: false },
  { type: "FAMILY", bed: "TWIN", max: 4, split: true },
];

async function seedRooms() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    await Room.deleteMany({});
    console.log("🧹 Existing rooms cleared");

    const rooms = [];
    let roomNo = 101;

    for (let floor = 1; floor <= 5; floor++) {
      for (let i = 0; i < 8; i++) {
        const config = ROOM_TYPES[Math.floor(Math.random() * ROOM_TYPES.length)];

        rooms.push({
          number: String(roomNo++),
          type: config.type,
          floor,

          baseBedType: config.bed,
          canSplitBed: config.split,
          maxOccupancy: config.max,

          currentOccupancy: 0,
          currentBedMode: "LARGE",

          occupancyStatus: "VACANT",
          housekeepingStatus: "CLEAN",
          maintenanceStatus: "OK",

          rate: 2800 + Math.floor(Math.random() * 2000),
          features: ["AC", "TV", "WiFi"],
        });
      }
    }

    await Room.insertMany(rooms);
    console.log(`🎉 ${rooms.length} rooms created successfully`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Room seed failed:", err);
    process.exit(1);
  }
}

seedRooms();
