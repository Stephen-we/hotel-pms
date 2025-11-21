import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, required: true },
    reservation: { type: mongoose.Schema.Types.ObjectId, ref: "Reservation" },
    guest: { type: mongoose.Schema.Types.ObjectId, ref: "Guest" },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
    
    type: {
      type: String,
      enum: ["RESTAURANT", "ROOM_SERVICE", "BAR", "SERVICE", "OTHER"],
      default: "RESTAURANT"
    },
    
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "PREPARING", "COMPLETED", "CANCELLED"],
      default: "PENDING"
    },
    
    items: [{
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true },
      notes: { type: String }
    }],
    
    subtotal: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "REFUNDED", "PARTIALLY_PAID"],
      default: "PENDING"
    },
    
    paymentMethod: {
      type: String,
      enum: ["CASH", "CARD", "UPI", "WALLET", "ROOM_CHARGE"],
      default: "CASH"
    },
    
    servedBy: { type: String }, // Staff member name
    notes: { type: String }
  },
  { timestamps: true }
);

// Generate order number before saving
orderSchema.pre("save", async function (next) {
  if (this.isNew) {
    const date = new Date();
    const dateStr = date.toISOString().slice(2, 10).replace(/-/g, '');
    const count = await mongoose.model("Order").countDocuments();
    this.orderNumber = `ORD${dateStr}${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

export default mongoose.model("Order", orderSchema);
