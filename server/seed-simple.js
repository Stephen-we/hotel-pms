import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/hotel_pms";

async function seedUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    await User.deleteMany({});
    console.log("🧹 Existing users cleared");

    // ✅ Use User.create() so pre('save') runs and password becomes bcrypt hash
    await User.create([
      {
        username: "admin",
        email: "admin@hotel.com",
        password: "admin123",
        firstName: "System",
        lastName: "Administrator",
        role: "SUPER_ADMIN",
        department: "MANAGEMENT",
        isActive: true,
        devices: [], // ✅ keep empty
      },
      {
        username: "manager",
        email: "manager@hotel.com",
        password: "manager123",
        firstName: "Hotel",
        lastName: "Manager",
        role: "MANAGER",
        department: "MANAGEMENT",
        isActive: true,
        devices: [],
      },
      {
        username: "reception",
        email: "reception@hotel.com",
        password: "reception123",
        firstName: "Front",
        lastName: "Desk",
        role: "RECEPTIONIST",
        department: "FRONT_DESK",
        isActive: true,
        devices: [],
      },
    ]);

    const users = await User.find({}, { username: 1, role: 1, isActive: 1 });
    console.log("\n📋 Users seeded:");
    users.forEach((u) => console.log(`- ${u.username} (${u.role}) Active:${u.isActive}`));

    await mongoose.connection.close();
    console.log("\n🎉 Done. Now login from UI.");
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  }
}

seedUsers();
