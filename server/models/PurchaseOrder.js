import mongoose from "mongoose";

const purchaseOrderSchema = new mongoose.Schema(
  {
    poNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    supplier: {
      name: { type: String, required: true },
      contact: String,
      phone: String,
      email: String,
      address: String
    },
    items: [{
      inventoryItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InventoryItem",
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
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
      receivedQuantity: {
        type: Number,
        default: 0,
        min: 0
      }
    }],
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "ORDERED", "PARTIALLY_RECEIVED", "COMPLETED", "CANCELLED"],
      default: "PENDING"
    },
    orderDate: {
      type: Date,
      default: Date.now
    },
    expectedDelivery: {
      type: Date
    },
    actualDelivery: {
      type: Date
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
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

// Pre-save middleware to calculate totals
purchaseOrderSchema.pre("save", function (next) {
  this.totalAmount = this.items.reduce((total, item) => total + item.totalCost, 0);
  
  // Calculate received quantity status
  if (this.items.length > 0) {
    const totalOrdered = this.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalReceived = this.items.reduce((sum, item) => sum + item.receivedQuantity, 0);
    
    if (totalReceived === 0) {
      this.status = "ORDERED";
    } else if (totalReceived > 0 && totalReceived < totalOrdered) {
      this.status = "PARTIALLY_RECEIVED";
    } else if (totalReceived === totalOrdered) {
      this.status = "COMPLETED";
    }
  }
  
  next();
});

export default mongoose.model("PurchaseOrder", purchaseOrderSchema);
