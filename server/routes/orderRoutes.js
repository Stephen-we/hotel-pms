import express from "express";
import Order from "../models/Order.js";
import Reservation from "../models/Reservation.js";

const router = express.Router();

// GET /api/orders - Get all orders with filters
router.get("/", async (req, res) => {
  try {
    const { status, type, paymentStatus, reservation } = req.query;
    const query = {};
    
    if (status && status !== 'ALL') query.status = status;
    if (type && type !== 'ALL') query.type = type;
    if (paymentStatus && paymentStatus !== 'ALL') query.paymentStatus = paymentStatus;
    if (reservation) query.reservation = reservation;
    
    const orders = await Order.find(query)
      .populate("reservation")
      .populate("guest")
      .populate("room")
      .populate("items.product")
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// POST /api/orders - Create new order
router.post("/", async (req, res) => {
  try {
    const order = await Order.create(req.body);
    
    // Populate the response
    const populatedOrder = await Order.findById(order._id)
      .populate("reservation")
      .populate("guest")
      .populate("room")
      .populate("items.product");
    
    res.status(201).json(populatedOrder);
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ message: "Failed to create order" });
  }
});

// PATCH /api/orders/:id - Update order
router.patch("/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
      .populate("reservation")
      .populate("guest")
      .populate("room")
      .populate("items.product");
    
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    console.error("Error updating order:", err);
    res.status(500).json({ message: "Failed to update order" });
  }
});

// POST /api/orders/:id/status - Update order status
router.post("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate("reservation")
      .populate("guest")
      .populate("room")
      .populate("items.product");
    
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).json({ message: "Failed to update order status" });
  }
});

// POST /api/orders/:id/payment - Process payment
router.post("/:id/payment", async (req, res) => {
  try {
    const { paymentStatus, paymentMethod, amount } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        paymentStatus,
        paymentMethod,
        ...(amount && { total: amount })
      },
      { new: true }
    )
      .populate("reservation")
      .populate("guest")
      .populate("room")
      .populate("items.product");
    
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    console.error("Error processing payment:", err);
    res.status(500).json({ message: "Failed to process payment" });
  }
});

export default router;
