import mongoose from "mongoose";

const guestSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String },
    phone: { type: String, required: true },
    email: { type: String },
    idType: { type: String },     // Aadhaar / Passport etc.
    idNumber: { type: String },
    address: { type: String },
    city: { type: String },
    country: { type: String, default: "India" },
  },
  { timestamps: true }
);

export default mongoose.model("Guest", guestSchema);
