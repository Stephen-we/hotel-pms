import express from "express";
import User from "../models/User.js";

const router = express.Router();

// GET /api/users - Get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// GET /api/users/:id - Get user by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

// POST /api/users - Create new user
router.post("/", async (req, res) => {
  try {
    const { username, email, password, ...userData } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: "User with this username or email already exists" 
      });
    }

    const user = await User.create({
      username,
      email,
      password, // Will be hashed by pre-save middleware
      ...userData
    });

    res.status(201).json(user);
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ message: "Failed to create user" });
  }
});

// PATCH /api/users/:id - Update user
router.patch("/:id", async (req, res) => {
  try {
    const { password, ...updateData } = req.body;

    const updateFields = { ...updateData };
    if (password) {
      updateFields.password = password; // Will be hashed by pre-save middleware
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ message: "Failed to update user" });
  }
});

// DELETE /api/users/:id - Delete user
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Failed to delete user" });
  }
});

// POST /api/users/:id/toggle-active - Toggle user active status
router.post("/:id/toggle-active", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ 
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: await User.findById(req.params.id).select("-password")
    });
  } catch (err) {
    console.error("Error toggling user status:", err);
    res.status(500).json({ message: "Failed to toggle user status" });
  }
});

// POST /api/users/seed - Seed default admin user
router.post("/seed", async (req, res) => {
  try {
    const count = await User.countDocuments();
    if (count > 0) {
      return res.status(400).json({ message: "Users already exist" });
    }

    const defaultUsers = [
      {
        username: "admin",
        email: "admin@hotel.com",
        password: "admin123",
        firstName: "System",
        lastName: "Administrator",
        role: "SUPER_ADMIN",
        department: "MANAGEMENT",
        permissions: {
          canManageRooms: true,
          canManageGuests: true,
          canManageReservations: true,
          canManageHousekeeping: true,
          canManagePOS: true,
          canViewReports: true,
          canManageUsers: true,
          canManageSettings: true
        }
      },
      {
        username: "manager",
        email: "manager@hotel.com",
        password: "manager123",
        firstName: "Hotel",
        lastName: "Manager",
        role: "MANAGER",
        department: "MANAGEMENT",
        permissions: {
          canManageRooms: true,
          canManageGuests: true,
          canManageReservations: true,
          canManageHousekeeping: true,
          canManagePOS: true,
          canViewReports: true,
          canManageUsers: false,
          canManageSettings: false
        }
      },
      {
        username: "reception",
        email: "reception@hotel.com",
        password: "reception123",
        firstName: "Front",
        lastName: "Desk",
        role: "RECEPTIONIST",
        department: "FRONT_DESK",
        permissions: {
          canManageRooms: false,
          canManageGuests: true,
          canManageReservations: true,
          canManageHousekeeping: false,
          canManagePOS: false,
          canViewReports: false,
          canManageUsers: false,
          canManageSettings: false
        }
      }
    ];

    await User.insertMany(defaultUsers);
    res.json({ message: "Default users created successfully" });
  } catch (err) {
    console.error("Error seeding users:", err);
    res.status(500).json({ message: "Failed to seed users" });
  }
});

export default router;
