// server/models/User.js - FINAL (NO DUP NULL INDEX + DEVICE SECURITY)
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const deviceSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true, trim: true }, // ✅ NOT unique here
    deviceName: { type: String, default: "" },
    macAddress: { type: String, default: "" },
    ipAddress: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    location: { type: String, default: "" },
    os: { type: String, default: "" },
    browser: { type: String, default: "" },

    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    verifiedAt: Date,
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    lastLogin: Date,
    loginCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },

    role: {
      type: String,
      enum: ["SUPER_ADMIN", "MANAGER", "RECEPTIONIST", "HOUSEKEEPING", "RESTAURANT"],
      default: "RECEPTIONIST",
    },
    department: {
      type: String,
      enum: ["FRONT_DESK", "HOUSEKEEPING", "RESTAURANT", "MANAGEMENT", "MAINTENANCE"],
      default: "FRONT_DESK",
    },

    phone: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    lastLogin: Date,

    devices: { type: [deviceSchema], default: [] },

    securitySettings: {
      maxDevices: { type: Number, default: 2 },
      requireDeviceApproval: { type: Boolean, default: true },
      notifyOnNewDevice: { type: Boolean, default: true },
      autoBlockSuspicious: { type: Boolean, default: true },
    },

    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

/**
 * ✅ SAFE UNIQUE index for deviceId:
 * Only index when deviceId exists AND is a string (prevents null duplicates)
 */
userSchema.index(
  { "devices.deviceId": 1 },
  {
    unique: true,
    partialFilterExpression: { "devices.deviceId": { $type: "string" } },
  }
);

// -------------------- METHODS --------------------
userSchema.methods.addDevice = async function (deviceData) {
  if (!deviceData?.deviceId) return this; // ✅ don't insert null deviceId

  const exists = this.devices.some((d) => d.deviceId === deviceData.deviceId);
  if (!exists) {
    this.devices.push(deviceData);
    await this.save();
  }
  return this;
};

userSchema.methods.verifyDevice = async function (deviceId, verifiedBy) {
  const device = this.devices.find((d) => d.deviceId === deviceId);
  if (device) {
    device.isVerified = true;
    device.isBlocked = false;
    device.verifiedAt = new Date();
    device.verifiedBy = verifiedBy;
    await this.save();
  }
  return this;
};

userSchema.methods.blockDevice = async function (deviceId) {
  const device = this.devices.find((d) => d.deviceId === deviceId);
  if (device) {
    device.isBlocked = true;
    await this.save();
  }
  return this;
};

userSchema.methods.isDeviceAllowed = function (deviceId) {
  const device = this.devices.find((d) => d.deviceId === deviceId);
  if (!device) return false;
  return device.isVerified && !device.isBlocked;
};

// -------------------- PASSWORD HASH --------------------
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (e) {
    next(e);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const u = this.toObject();
  delete u.password;
  return u;
};

export default mongoose.model("User", userSchema);
