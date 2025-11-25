import mongoose from "mongoose";
import User from "./models/User.js";

const checkUsers = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/hotel_pms");
    console.log("✅ Connected to MongoDB");

    const users = await User.find();
    console.log("Total users found:", users.length);
    
    if (users.length === 0) {
      console.log("❌ NO USERS FOUND IN DATABASE!");
    } else {
      console.log("\\n📋 Users in database:");
      users.forEach(user => {
        console.log(`- ${user.username} (${user.role}) - ${user.email}`);
      });
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
};

checkUsers();
