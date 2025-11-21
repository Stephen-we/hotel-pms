import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { 
      type: String, 
      enum: ["FOOD", "BEVERAGE", "SERVICE", "AMENITY"],
      required: true 
    },
    price: { type: Number, required: true },
    description: { type: String },
    isAvailable: { type: Boolean, default: true },
    image: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
