import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30
    },
    email: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true,
      lowercase: true
    },
    password: { 
      type: String, 
      required: true,
      minlength: 6
    },
    firstName: { 
      type: String, 
      required: true,
      trim: true
    },
    lastName: { 
      type: String, 
      required: true,
      trim: true
    },
    role: {
      type: String,
      enum: ["SUPER_ADMIN", "MANAGER", "RECEPTIONIST", "HOUSEKEEPING", "RESTAURANT"],
      default: "RECEPTIONIST"
    },
    department: {
      type: String,
      enum: ["FRONT_DESK", "HOUSEKEEPING", "RESTAURANT", "MANAGEMENT", "MAINTENANCE"],
      default: "FRONT_DESK"
    },
    phone: { 
      type: String,
      trim: true
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    lastLogin: { 
      type: Date 
    },
    permissions: [{
      module: String,
      canRead: { type: Boolean, default: false },
      canWrite: { type: Boolean, default: false },
      canDelete: { type: Boolean, default: false }
    }],
    profileImage: { 
      type: String 
    },
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

export default mongoose.model("User", userSchema);
