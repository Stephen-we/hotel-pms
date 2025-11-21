import express from "express";
import Guest from "../models/Guest.js";
import Reservation from "../models/Reservation.js";

const router = express.Router();

/**
 * GET /api/guests
 * Search and filter guests
 */
router.get("/", async (req, res) => {
  try {
    const { search, phone, email, page = 1, limit = 20 } = req.query;
    const query = {};

    // Search functionality
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    if (phone) query.phone = phone;
    if (email) query.email = email;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 }
    };

    const guests = await Guest.find(query)
      .limit(options.limit * 1)
      .skip((options.page - 1) * options.limit)
      .sort(options.sort);

    const total = await Guest.countDocuments(query);

    res.json({
      guests,
      totalPages: Math.ceil(total / options.limit),
      currentPage: options.page,
      total
    });
  } catch (err) {
    console.error("Error fetching guests:", err);
    res.status(500).json({ message: "Failed to fetch guests" });
  }
});

/**
 * GET /api/guests/:id
 * Get guest with full details and history
 */
router.get("/:id", async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.id);
    if (!guest) {
      return res.status(404).json({ message: "Guest not found" });
    }

    // Get guest reservation history
    const reservations = await Reservation.find({ guest: req.params.id })
      .populate("room")
      .sort({ checkInDate: -1 });

    // Calculate guest statistics
    const totalStays = reservations.length;
    const totalNights = reservations.reduce((sum, res) => {
      const checkIn = new Date(res.checkInDate);
      const checkOut = new Date(res.checkOutDate);
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      return sum + nights;
    }, 0);

    const totalSpent = reservations.reduce((sum, res) => sum + (res.totalAmount || 0), 0);

    // Update guest statistics
    guest.totalStays = totalStays;
    guest.totalNights = totalNights;
    guest.totalSpent = totalSpent;

    // Determine loyalty tier based on stays
    if (totalStays >= 20) guest.loyaltyTier = "PLATINUM";
    else if (totalStays >= 10) guest.loyaltyTier = "GOLD";
    else if (totalStays >= 5) guest.loyaltyTier = "SILVER";
    else guest.loyaltyTier = "STANDARD";

    await guest.save();

    res.json({
      guest,
      reservations,
      statistics: {
        totalStays,
        totalNights,
        totalSpent,
        averageStay: totalStays > 0 ? (totalNights / totalStays).toFixed(1) : 0
      }
    });
  } catch (err) {
    console.error("Error fetching guest details:", err);
    res.status(500).json({ message: "Failed to fetch guest details" });
  }
});

/**
 * POST /api/guests
 * Create new guest
 */
router.post("/", async (req, res) => {
  try {
    // Check if guest with same phone already exists
    const existingGuest = await Guest.findOne({ phone: req.body.phone });
    if (existingGuest) {
      return res.status(400).json({ 
        message: "Guest with this phone number already exists",
        guest: existingGuest 
      });
    }

    const guest = await Guest.create(req.body);
    res.status(201).json(guest);
  } catch (err) {
    console.error("Error creating guest:", err);
    res.status(500).json({ message: "Failed to create guest" });
  }
});

/**
 * PATCH /api/guests/:id
 * Update guest information
 */
router.patch("/:id", async (req, res) => {
  try {
    const guest = await Guest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!guest) {
      return res.status(404).json({ message: "Guest not found" });
    }
    
    res.json(guest);
  } catch (err) {
    console.error("Error updating guest:", err);
    res.status(500).json({ message: "Failed to update guest" });
  }
});

/**
 * POST /api/guests/:id/blacklist
 * Blacklist a guest
 */
router.post("/:id/blacklist", async (req, res) => {
  try {
    const { reason } = req.body;
    const guest = await Guest.findByIdAndUpdate(
      req.params.id,
      { 
        isBlacklisted: true,
        blacklistReason: reason 
      },
      { new: true }
    );
    
    if (!guest) {
      return res.status(404).json({ message: "Guest not found" });
    }
    
    res.json({ message: "Guest blacklisted successfully", guest });
  } catch (err) {
    console.error("Error blacklisting guest:", err);
    res.status(500).json({ message: "Failed to blacklist guest" });
  }
});

/**
 * POST /api/guests/:id/remove-blacklist
 * Remove guest from blacklist
 */
router.post("/:id/remove-blacklist", async (req, res) => {
  try {
    const guest = await Guest.findByIdAndUpdate(
      req.params.id,
      { 
        isBlacklisted: false,
        blacklistReason: "" 
      },
      { new: true }
    );
    
    if (!guest) {
      return res.status(404).json({ message: "Guest not found" });
    }
    
    res.json({ message: "Guest removed from blacklist", guest });
  } catch (err) {
    console.error("Error removing blacklist:", err);
    res.status(500).json({ message: "Failed to remove blacklist" });
  }
});

/**
 * GET /api/guests/:id/folio
 * Get guest folio (reservations + orders)
 */
router.get("/:id/folio", async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.id);
    if (!guest) {
      return res.status(404).json({ message: "Guest not found" });
    }

    // Get reservations
    const reservations = await Reservation.find({ guest: req.params.id })
      .populate("room")
      .sort({ checkInDate: -1 });

    // Get orders (we'll implement this when we have the Order model)
    const orders = []; // Placeholder for now

    const folio = {
      guest,
      reservations: reservations.map(res => ({
        _id: res._id,
        type: 'RESERVATION',
        date: res.checkInDate,
        description: `Room ${res.room?.number} - ${res.status}`,
        amount: res.totalAmount || 0,
        status: res.status
      })),
      orders: orders.map(order => ({
        _id: order._id,
        type: 'ORDER',
        date: order.createdAt,
        description: `${order.type} - ${order.items.length} items`,
        amount: order.total || 0,
        status: order.paymentStatus
      })),
      summary: {
        totalReservations: reservations.length,
        totalOrders: orders.length,
        totalAmount: reservations.reduce((sum, res) => sum + (res.totalAmount || 0), 0) +
                     orders.reduce((sum, order) => sum + (order.total || 0), 0)
      }
    };

    res.json(folio);
  } catch (err) {
    console.error("Error fetching guest folio:", err);
    res.status(500).json({ message: "Failed to fetch guest folio" });
  }
});

export default router;
