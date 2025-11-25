import mongoose from "mongoose";
import User from "./models/User.js";

const verifyLogin = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/hotel_pms");
    console.log("✅ Connected to MongoDB");

    const adminUser = await User.findOne({ username: "admin" });
    
    console.log("\\n🔍 Verifying admin user:");
    console.log("Username:", adminUser.username);
    console.log("Password hash:", adminUser.password.substring(0, 20) + "...");
    console.log("Is hashed:", adminUser.password !== "admin123");
    console.log("Password length:", adminUser.password.length);
    
    // Test password comparison
    const test1 = await adminUser.comparePassword("admin123");
    const test2 = await adminUser.comparePassword("wrongpassword");
    
    console.log("\\n🔐 Password test results:");
    console.log("'admin123':", test1);
    console.log("'wrongpassword':", test2);
    
    if (test1 && !test2) {
      console.log("\\n✅ SUCCESS! Password hashing and verification working correctly!");
    } else {
      console.log("\\n❌ FAILED! Password verification not working.");
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
};

verifyLogin();
