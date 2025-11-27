import mongoose from "mongoose";

const inventoryItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      enum: ["FOOD", "BEVERAGE", "LINEN", "AMENITY", "CLEANING", "OFFICE", "OTHER"],
      default: "OTHER"
    },
    description: {
      type: String,
      trim: true
    },
    unit: {
      type: String,
      required: true,
      enum: ["KG", "LITER", "PIECE", "PACK", "BOTTLE", "CARTON", "OTHER"],
      default: "PIECE"
    },
    currentStock: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    minStockLevel: {
      type: Number,
      required: true,
      default: 10
    },
    maxStockLevel: {
      type: Number,
      required: true,
      default: 100
    },
    costPrice: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    sellingPrice: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    supplier: {
      name: String,
      contact: String,
      phone: String,
      email: String
    },
    location: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    reorderPoint: {
      type: Number,
      default: 20
    },
    lastRestocked: {
      type: Date
    },
    notes: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

// Index for efficient searching
inventoryItemSchema.index({ name: "text", sku: "text", category: 1 });
inventoryItemSchema.index({ currentStock: 1 });
inventoryItemSchema.index({ isActive: 1 });

export default mongoose.model("InventoryItem", inventoryItemSchema);
