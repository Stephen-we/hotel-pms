import mongoose from "mongoose";

const stockTransactionSchema = new mongoose.Schema(
  {
    inventoryItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryItem",
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ["PURCHASE", "SALE", "ADJUSTMENT", "WASTAGE", "TRANSFER"],
      default: "PURCHASE"
    },
    quantity: {
      type: Number,
      required: true
    },
    unitCost: {
      type: Number,
      required: true,
      min: 0
    },
    totalCost: {
      type: Number,
      required: true,
      min: 0
    },
    batchNumber: {
      type: String,
      trim: true
    },
    expiryDate: {
      type: Date
    },
    reference: {
      type: String,
      trim: true
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId
    },
    notes: {
      type: String,
      trim: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    location: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

// Index for efficient querying
stockTransactionSchema.index({ inventoryItem: 1, createdAt: -1 });
stockTransactionSchema.index({ type: 1, createdAt: -1 });
stockTransactionSchema.index({ batchNumber: 1 });

// Pre-save middleware to calculate total cost
stockTransactionSchema.pre("save", function (next) {
  this.totalCost = this.quantity * this.unitCost;
  next();
});

export default mongoose.model("StockTransaction", stockTransactionSchema);
