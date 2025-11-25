import mongoose from "mongoose";
import User from "./models/User.js";
import bcrypt from "bcryptjs";

const debugPassword = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/hotel_pms");
    console.log("✅ Connected to MongoDB");

    // Check the admin user
    const adminUser = await User.findOne({ username: "admin" });
    console.log("Admin user found:", adminUser ? "YES" : "NO");
    
    if (adminUser) {
      console.log("\\n🔍 User details:");
      console.log("Username:", adminUser.username);
      console.log("Password hash:", adminUser.password);
      console.log("Password length:", adminUser.password.length);
      
      // Test password comparison
      const testPassword = "admin123";
      console.log("\\n🔑 Testing password:", testPassword);
      
      const isValid = await adminUser.comparePassword(testPassword);
      console.log("Password comparison result:", isValid);
      
      // Also test direct bcrypt compare
      const directCompare = await bcrypt.compare(testPassword, adminUser.password);
      console.log("Direct bcrypt compare:", directCompare);
      
      // Let's see what happens if we create a new hash
      const newHash = await bcrypt.hash(testPassword, 12);
      console.log("New hash for same password:", newHash);
      console.log("New hash matches old hash:", newHash === adminUser.password);
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
};

debugPassword();
