import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    // --------------------------------------------------
    // BASIC INFO (EXISTING – SAFE)
    // --------------------------------------------------
    number: {
      type: String,
      required: true,
      unique: true,
    },

    type: {
      type: String,
      enum: ["DELUXE", "SUPERIOR", "SUITE", "FAMILY"],
      required: true,
    },

    floor: {
      type: Number,
      default: 1,
    },

    rate: {
      type: Number,
      default: 0,
    },

    features: [
      {
        type: String,
      },
    ],

    // --------------------------------------------------
    // ROOM CAPABILITY (STATIC – PHYSICAL)
    // --------------------------------------------------
    baseBedType: {
      type: String,
      enum: ["KING", "QUEEN", "TWIN"],
      required: true,
      default: "KING",
    },

    maxOccupancy: {
      type: Number,
      default: 2,
      min: 1,
    },

    canSplitBed: {
      type: Boolean,
      default: false,
    },

    splitInto: {
      type: String,
      enum: ["TWO_SINGLE"],
      default: null,
    },

    // --------------------------------------------------
    // CURRENT STATE (DYNAMIC)
    // --------------------------------------------------
    currentOccupancy: {
      type: Number,
      default: 0,
      min: 0,
    },

    currentBedMode: {
      type: String,
      enum: ["LARGE", "SPLIT"],
      default: "LARGE",
    },

    // --------------------------------------------------
    // STATUS (SEPARATED – REAL HOTEL LOGIC)
    // --------------------------------------------------
    occupancyStatus: {
      type: String,
      enum: ["VACANT", "OCCUPIED", "RESERVED"],
      default: "VACANT",
    },

    housekeepingStatus: {
      type: String,
      enum: ["CLEAN", "DIRTY"],
      default: "CLEAN",
    },

    maintenanceStatus: {
      type: String,
      enum: ["OK", "OUT_OF_ORDER"],
      default: "OK",
    },

    // --------------------------------------------------
    // OPTIONAL NOTES
    // --------------------------------------------------
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Room", roomSchema);
