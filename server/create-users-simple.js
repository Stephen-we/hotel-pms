import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Simple approach - create users directly without complex model
const createUsersSimple = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/hotel_pms");
    console.log("✅ Connected to MongoDB");

    // Get the users collection
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Delete all existing users
    await usersCollection.deleteMany({});
    console.log("✅ Cleared existing users");

    // Hash passwords
    console.log("\\n🔑 Hashing passwords...");
    const hashedAdmin = await bcrypt.hash("admin123", 12);
    const hashedManager = await bcrypt.hash("manager123", 12);
    const hashedReception = await bcrypt.hash("reception123", 12);

    // Create users directly in the collection
    const users = [
      {
        username: "admin",
        email: "admin@hotel.com",
        password: hashedAdmin,
        firstName: "System",
        lastName: "Administrator",
        role: "SUPER_ADMIN",
        department: "MANAGEMENT",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: "manager",
        email: "manager@hotel.com",
        password: hashedManager,
        firstName: "Hotel",
        lastName: "Manager",
        role: "MANAGER",
        department: "MANAGEMENT",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: "reception",
        email: "reception@hotel.com",
        password: hashedReception,
        firstName: "Front",
        lastName: "Desk",
        role: "RECEPTIONIST",
        department: "FRONT_DESK",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await usersCollection.insertMany(users);
    console.log("✅ Users created successfully!");

    // Verify
    const createdUsers = await usersCollection.find({}).toArray();
    console.log("\\n📋 Users in database:");
    createdUsers.forEach(user => {
      console.log(`- ${user.username} (${user.role}) - Password: ${user.password.substring(0, 25)}...`);
    });

    // Test password verification
    console.log("\\n🔐 Testing password verification...");
    const admin = await usersCollection.findOne({ username: "admin" });
    const test1 = await bcrypt.compare("admin123", admin.password);
    const test2 = await bcrypt.compare("wrongpass", admin.password);
    
    console.log("Password 'admin123':", test1);
    console.log("Password 'wrongpass':", test2);

    if (test1 && !test2) {
      console.log("\\n🎉 SUCCESS! Users created and password verification working!");
      console.log("\\nYou can now login with:");
      console.log("   admin / admin123");
      console.log("   manager / manager123");
      console.log("   reception / reception123");
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
};

createUsersSimple();
