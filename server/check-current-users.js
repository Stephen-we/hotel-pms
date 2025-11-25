import mongoose from "mongoose";
import User from "./models/User.js";

const checkUsers = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/hotel_pms");
    console.log("✅ Connected to MongoDB");

    const users = await User.find();
    console.log("Total users:", users.length);
    
    users.forEach(user => {
      console.log("\\n🔍 User:", user.username);
      console.log("Password:", user.password);
      console.log("Is hashed:", user.password.startsWith('$2b$'));
      console.log("Password length:", user.password.length);
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
};

checkUsers();
