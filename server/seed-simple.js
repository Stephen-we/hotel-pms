import mongoose from "mongoose";
import User from "./models/User.js";

const seedUsers = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/hotel_pms");
    console.log("✅ Connected to MongoDB");

    // Clear existing users
    await User.deleteMany({});
    console.log("✅ Cleared existing users");

    // Create default users
    const defaultUsers = [
      {
        username: "admin",
        email: "admin@hotel.com",
        password: "admin123",
        firstName: "System",
        lastName: "Administrator",
        role: "SUPER_ADMIN",
        department: "MANAGEMENT",
        isActive: true
      },
      {
        username: "manager",
        email: "manager@hotel.com",
        password: "manager123",
        firstName: "Hotel",
        lastName: "Manager",
        role: "MANAGER",
        department: "MANAGEMENT",
        isActive: true
      },
      {
        username: "reception",
        email: "reception@hotel.com",
        password: "reception123",
        firstName: "Front",
        lastName: "Desk",
        role: "RECEPTIONIST",
        department: "FRONT_DESK",
        isActive: true
      }
    ];

    await User.insertMany(defaultUsers);
    console.log("✅ Default users created successfully!");

    // Verify
    const users = await User.find();
    console.log("\\n📋 Users in database:");
    users.forEach(user => {
      console.log(`- ${user.username} (${user.role}) - Active: ${user.isActive}`);
    });

    await mongoose.connection.close();
    console.log("\\n🎉 Users seeded successfully! You can now login.");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
};

seedUsers();
