import mongoose from "mongoose";
import User from "./models/User.js";
import bcrypt from "bcryptjs";

const createUsers = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/hotel_pms");
    console.log("✅ Connected to MongoDB");

    // Clear existing users
    await User.deleteMany({});
    console.log("✅ Cleared existing users");

    // Manually hash passwords and create users
    console.log("\\n🔑 Creating users with manually hashed passwords...");
    
    const hashedAdmin = await bcrypt.hash("admin123", 12);
    const hashedManager = await bcrypt.hash("manager123", 12);
    const hashedReception = await bcrypt.hash("reception123", 12);

    // Create users using the actual User model but with pre-hashed passwords
    const adminUser = new User({
      username: "admin",
      email: "admin@hotel.com",
      password: hashedAdmin,
      firstName: "System",
      lastName: "Administrator",
      role: "SUPER_ADMIN",
      department: "MANAGEMENT",
      isActive: true
    });

    const managerUser = new User({
      username: "manager",
      email: "manager@hotel.com",
      password: hashedManager,
      firstName: "Hotel",
      lastName: "Manager",
      role: "MANAGER",
      department: "MANAGEMENT",
      isActive: true
    });

    const receptionUser = new User({
      username: "reception",
      email: "reception@hotel.com",
      password: hashedReception,
      firstName: "Front",
      lastName: "Desk",
      role: "RECEPTIONIST",
      department: "FRONT_DESK",
      isActive: true
    });

    await adminUser.save();
    await managerUser.save();
    await receptionUser.save();

    console.log("✅ Users created successfully!");

    // Verify
    const users = await User.find();
    console.log("\\n📋 Users in database:");
    users.forEach(user => {
      console.log(`- ${user.username}: ${user.password.substring(0, 25)}...`);
    });

    // Test login
    console.log("\\n🔐 Testing password verification...");
    const admin = await User.findOne({ username: "admin" });
    const test1 = await bcrypt.compare("admin123", admin.password);
    const test2 = await bcrypt.compare("wrongpass", admin.password);
    
    console.log("Password 'admin123':", test1);
    console.log("Password 'wrongpass':", test2);

    if (test1 && !test2) {
      console.log("\\n🎉 SUCCESS! Password verification working!");
    } else {
      console.log("\\n❌ Password verification failed");
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
};

createUsers();
