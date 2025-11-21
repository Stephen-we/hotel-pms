import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    guest: { type: mongoose.Schema.Types.ObjectId, ref: "Guest", required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },

    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },

    status: {
      type: String,
      enum: ["BOOKED", "CHECKED_IN", "CHECKED_OUT", "CANCELLED"],
      default: "BOOKED",
    },

    source: { type: String, default: "DIRECT" }, // OTA / Corporate / Travel Agent
    totalAmount: { type: Number, default: 0 },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Reservation", reservationSchema);
