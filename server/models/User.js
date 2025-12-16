// server/models/User.js - UPDATED WITH DEVICE SECURITY
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const deviceSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true },
  deviceName: String,
  macAddress: String,
  ipAddress: String,
  userAgent: String,
  location: String,
  os: String,
  browser: String,
  isVerified: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  verifiedAt: Date,
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastLogin: Date,
  loginCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
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
  
  // DEVICE SECURITY FIELDS
  devices: [deviceSchema],
  securitySettings: {
    maxDevices: { type: Number, default: 2 },
    requireDeviceApproval: { type: Boolean, default: true },
    notifyOnNewDevice: { type: Boolean, default: true },
    autoBlockSuspicious: { type: Boolean, default: true }
  },
  
  // LOGIN SECURITY
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
  
  // AUDIT TRAIL
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Add device method
userSchema.methods.addDevice = function(deviceData) {
  const existingDevice = this.devices.find(d => d.deviceId === deviceData.deviceId);
  if (!existingDevice) {
    this.devices.push(deviceData);
  }
  return this.save();
};

// Verify device method
userSchema.methods.verifyDevice = function(deviceId, verifiedBy) {
  const device = this.devices.find(d => d.deviceId === deviceId);
  if (device) {
    device.isVerified = true;
    device.verifiedAt = new Date();
    device.verifiedBy = verifiedBy;
  }
  return this.save();
};

// Block device method
userSchema.methods.blockDevice = function(deviceId) {
  const device = this.devices.find(d => d.deviceId === deviceId);
  if (device) {
    device.isBlocked = true;
  }
  return this.save();
};

// Check if device is allowed
userSchema.methods.isDeviceAllowed = function(deviceId) {
  const device = this.devices.find(d => d.deviceId === deviceId);
  if (!device) return false;
  return device.isVerified && !device.isBlocked;
};

// Existing methods...
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

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

export default mongoose.model("User", userSchema);
