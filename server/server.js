import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

import roomRoutes from "./routes/roomRoutes.js";
import guestRoutes from "./routes/guestRoutes.js";
import reservationRoutes from "./routes/reservationRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mongo connection
const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/hotel_pms";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });

app.get("/", (req, res) => {
  res.send("Hotel PMS API running");
});

// Routes
app.use("/api/rooms", roomRoutes);
app.use("/api/guests", guestRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);
app.use("/api/settings", settingsRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
