import mongoose from "mongoose";
import User from "./models/User.js";

const fixUsers = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/hotel_pms");
    console.log("✅ Connected to MongoDB");

    // Clear existing users
    await User.deleteMany({});
    console.log("✅ Cleared existing users");

    // Create users using User.create() which triggers the pre-save hook
    console.log("\\n🔑 Creating users with proper password hashing...");
    
    const adminUser = await User.create({
      username: "admin",
      email: "admin@hotel.com",
      password: "admin123", // This will be hashed by pre-save hook
      firstName: "System",
      lastName: "Administrator",
      role: "SUPER_ADMIN",
      department: "MANAGEMENT",
      isActive: true
    });

    const managerUser = await User.create({
      username: "manager",
      email: "manager@hotel.com",
      password: "manager123",
      firstName: "Hotel",
      lastName: "Manager",
      role: "MANAGER",
      department: "MANAGEMENT",
      isActive: true
    });

    const receptionUser = await User.create({
      username: "reception",
      email: "reception@hotel.com",
      password: "reception123",
      firstName: "Front",
      lastName: "Desk",
      role: "RECEPTIONIST",
      department: "FRONT_DESK",
      isActive: true
    });

    console.log("✅ Users created successfully with proper hashing!");

    // Verify the hashing worked
    const users = await User.find();
    console.log("\\n📋 Users with password hashes:");
    users.forEach(user => {
      console.log(`- ${user.username}: ${user.password.substring(0, 20)}...`);
    });

    // Test password comparison
    console.log("\\n🔐 Testing password verification...");
    const testAdmin = await User.findOne({ username: "admin" });
    const isValid = await testAdmin.comparePassword("admin123");
    console.log("Admin password 'admin123' valid:", isValid);

    await mongoose.connection.close();
    console.log("\\n🎉 SUCCESS! Login should work now with:");
    console.log("   admin / admin123");
    console.log("   manager / manager123"); 
    console.log("   reception / reception123");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
};

fixUsers();
