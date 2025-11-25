import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Temporary user model to ensure clean creation
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  firstName: String,
  lastName: String,
  role: String,
  department: String,
  isActive: Boolean
}, { timestamps: true });

// Add the comparePassword method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const TempUser = mongoose.model('TempUser', userSchema);

const resetUsers = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/hotel_pms");
    console.log("✅ Connected to MongoDB");

    // Drop the entire users collection to start fresh
    await mongoose.connection.db.collection('users').drop().catch(() => {
      console.log("Collection didn't exist or couldn't be dropped");
    });
    console.log("✅ Cleared users collection");

    // Manually hash passwords
    console.log("\\n🔑 Hashing passwords manually...");
    const hashedAdmin = await bcrypt.hash("admin123", 12);
    const hashedManager = await bcrypt.hash("manager123", 12);
    const hashedReception = await bcrypt.hash("reception123", 12);

    // Create users with pre-hashed passwords
    const users = [
      {
        username: "admin",
        email: "admin@hotel.com",
        password: hashedAdmin,
        firstName: "System",
        lastName: "Administrator",
        role: "SUPER_ADMIN",
        department: "MANAGEMENT",
        isActive: true
      },
      {
        username: "manager",
        email: "manager@hotel.com",
        password: hashedManager,
        firstName: "Hotel",
        lastName: "Manager",
        role: "MANAGER",
        department: "MANAGEMENT",
        isActive: true
      },
      {
        username: "reception",
        email: "reception@hotel.com",
        password: hashedReception,
        firstName: "Front",
        lastName: "Desk",
        role: "RECEPTIONIST",
        department: "FRONT_DESK",
        isActive: true
      }
    ];

    await TempUser.insertMany(users);
    console.log("✅ Users created with manually hashed passwords");

    // Verify
    const createdUsers = await TempUser.find();
    console.log("\\n📋 Created users:");
    createdUsers.forEach(user => {
      console.log(`- ${user.username}: ${user.password.substring(0, 25)}...`);
    });

    // Test login
    console.log("\\n🔐 Testing login...");
    const admin = await TempUser.findOne({ username: "admin" });
    const test1 = await admin.comparePassword("admin123");
    const test2 = await admin.comparePassword("wrongpass");
    console.log("Password 'admin123':", test1);
    console.log("Password 'wrongpass':", test2);

    if (test1 && !test2) {
      console.log("\\n🎉 SUCCESS! Login should work now!");
    } else {
      console.log("\\n❌ Something is still wrong with password comparison");
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
};

resetUsers();
