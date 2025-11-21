import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    number: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: ["DELUXE", "SUPERIOR", "SUITE", "FAMILY"],
      required: true,
    },
    floor: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ["VACANT_CLEAN", "VACANT_DIRTY", "OCCUPIED", "OUT_OF_ORDER"],
      default: "VACANT_CLEAN",
    },
    rate: { type: Number, default: 0 },
    features: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model("Room", roomSchema);
