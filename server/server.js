// server.js (CLEAN FINAL VERSION)

import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

// --------------------------------------------------
// ✅ FIX __dirname for ES Modules
// --------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --------------------------------------------------
// ✅ LOAD ENV (ABSOLUTE & SAFE)
// --------------------------------------------------
dotenv.config({
  path: path.join(__dirname, ".env"),
});

// 🔍 DEBUG (KEEP FOR NOW)
console.log("📧 Email ENV Check:", {
  USER: process.env.EMAIL_USER,
  PASS: process.env.EMAIL_PASS ? "PASS_OK" : "NO_PASS",
});

// --------------------------------------------------
// ROUTES
// --------------------------------------------------
import roomRoutes from "./routes/roomRoutes.js";
import guestRoutes from "./routes/guestRoutes.js";
import reservationRoutes from "./routes/reservationRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import purchaseOrderRoutes from "./routes/purchaseOrderRoutes.js";

// --------------------------------------------------
// APP INIT
// --------------------------------------------------
const app = express();

// --------------------------------------------------
// CORS (Cloudflare + Local + Mobile)
// --------------------------------------------------
app.use(cors({
  origin: [
    "https://hotel.stephenweb.space",
    "https://api.hotel.stephenweb.space",
    "http://localhost:5173",
    "http://localhost:3000",
    /\.stephenweb\.space$/,
  ],
  credentials: true,
}));

app.use(express.json());

// --------------------------------------------------
// MONGODB
// --------------------------------------------------
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ Mongo error:", err.message));

// --------------------------------------------------
// ROUTES
// --------------------------------------------------
app.get("/", (_, res) => res.send("Hotel PMS API running"));

app.use("/api/rooms", roomRoutes);
app.use("/api/guests", guestRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);

// --------------------------------------------------
// START SERVER
// --------------------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
