import mongoose from "mongoose";

const hotelConfigSchema = new mongoose.Schema(
  {
    // Hotel Basic Information
    hotelName: { type: String, default: "My Hotel" },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    pincode: { type: String, default: "" },
    country: { type: String, default: "India" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    website: { type: String, default: "" },
    
    // Business Configuration
    currency: { type: String, default: "INR" },
    timezone: { type: String, default: "Asia/Kolkata" },
    dateFormat: { type: String, default: "DD/MM/YYYY" },
    language: { type: String, default: "en" },
    
    // Room Configuration
    defaultCheckInTime: { type: String, default: "14:00" },
    defaultCheckOutTime: { type: String, default: "12:00" },
    earlyCheckInFee: { type: Number, default: 500 },
    lateCheckOutFee: { type: Number, default: 500 },
    
    // Tax Configuration
    taxRate: { type: Number, default: 5.0 }, // 5%
    serviceCharge: { type: Number, default: 0.0 },
    
    // POS Configuration
    posTaxInclusive: { type: Boolean, default: true },
    autoPrintKitchenOrders: { type: Boolean, default: false },
    
    // Notification Settings
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    lowInventoryAlert: { type: Boolean, default: true },
    
    // Security Settings
    sessionTimeout: { type: Number, default: 60 }, // minutes
    passwordPolicy: {
      minLength: { type: Number, default: 6 },
      requireSpecialChar: { type: Boolean, default: false },
      requireNumbers: { type: Boolean, default: false },
      requireUppercase: { type: Boolean, default: false }
    },
    
    // Backup Settings
    autoBackup: { type: Boolean, default: false },
    backupFrequency: { 
      type: String, 
      enum: ["DAILY", "WEEKLY", "MONTHLY"],
      default: "WEEKLY"
    },
    
    // System Information
    version: { type: String, default: "1.0.0" },
    lastBackup: { type: Date },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

// Ensure only one configuration document exists
hotelConfigSchema.statics.getConfig = async function () {
  let config = await this.findOne();
  if (!config) {
    config = await this.create({});
  }
  return config;
};

export default mongoose.model("HotelConfig", hotelConfigSchema);
