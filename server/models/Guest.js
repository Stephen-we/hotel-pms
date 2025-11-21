import mongoose from "mongoose";

const guestSchema = new mongoose.Schema(
  {
    // Basic Information
    firstName: { type: String, required: true },
    lastName: { type: String },
    phone: { type: String, required: true },
    email: { type: String },
    
    // Identification
    idType: { 
      type: String, 
      enum: ["AADHAAR", "PASSPORT", "DRIVING_LICENSE", "VOTER_ID", "OTHER"],
      default: "AADHAAR"
    },
    idNumber: { type: String },
    
    // Address Information
    address: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    country: { type: String, default: "India" },
    
    // Additional Details
    dateOfBirth: { type: Date },
    gender: { 
      type: String, 
      enum: ["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"] 
    },
    nationality: { type: String, default: "Indian" },
    
    // Preferences
    preferences: {
      smoking: { type: Boolean, default: false },
      newsletter: { type: Boolean, default: true },
      specialRequests: { type: String }
    },
    
    // Loyalty & Statistics
    loyaltyTier: { 
      type: String, 
      enum: ["STANDARD", "SILVER", "GOLD", "PLATINUM"],
      default: "STANDARD"
    },
    totalStays: { type: Number, default: 0 },
    totalNights: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    
    // Status
    isBlacklisted: { type: Boolean, default: false },
    blacklistReason: { type: String },
    
    // System
    createdBy: { type: String, default: "system" }
  },
  { timestamps: true }
);

// Index for better search performance
guestSchema.index({ firstName: 1, lastName: 1 });
guestSchema.index({ phone: 1 });
guestSchema.index({ email: 1 });
guestSchema.index({ idNumber: 1 });

export default mongoose.model("Guest", guestSchema);
