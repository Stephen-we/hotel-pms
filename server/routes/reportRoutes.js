import express from "express";
import Reservation from "../models/Reservation.js";
import Order from "../models/Order.js";
import Room from "../models/Room.js";
import Guest from "../models/Guest.js";

const router = express.Router();

// GET /api/reports/overview - Overview report
router.get("/overview", async (req, res) => {
  try {
    const { start, end } = req.query;
    
    // Calculate date range
    const startDate = new Date(start);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);

    // Get reservations in date range
    const reservations = await Reservation.find({
      checkInDate: { $lte: endDate },
      checkOutDate: { $gte: startDate },
      status: { $in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'] }
    }).populate('guest room');

    // Get orders in date range
    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate }
    }).populate('guest room reservation items.product');

    // Calculate metrics
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const roomRevenue = orders
      .filter(order => order.type === 'ROOM_SERVICE' || order.reservation)
      .reduce((sum, order) => sum + (order.total || 0), 0);
    const posRevenue = orders
      .filter(order => order.type !== 'ROOM_SERVICE' && !order.reservation)
      .reduce((sum, order) => sum + (order.total || 0), 0);

    const totalRooms = await Room.countDocuments();
    const occupiedRooms = reservations.filter(r => 
      r.status === 'CHECKED_IN' || 
      (r.status === 'CHECKED_OUT' && new Date(r.checkOutDate) >= startDate)
    ).length;

    const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;
    const totalBookings = reservations.length;
    const uniqueGuests = [...new Set(reservations.map(r => r.guest?._id))].length;

    // Calculate average room rate
    const roomBookings = reservations.filter(r => r.room && r.room.rate);
    const averageRoomRate = roomBookings.length > 0 
      ? roomBookings.reduce((sum, r) => sum + (r.room.rate || 0), 0) / roomBookings.length
      : 0;

    // Calculate growth (simplified - you might want to compare with previous period)
    const previousPeriodRevenue = totalRevenue * 0.89; // Example: 11% growth

    res.json({
      totalRevenue,
      roomRevenue,
      posRevenue,
      totalBookings,
      occupancyRate: Math.round(occupancyRate * 10) / 10,
      averageRoomRate: Math.round(averageRoomRate),
      totalGuests: uniqueGuests,
      revenueGrowth: 12.3, // Example growth percentage
      previousPeriodRevenue: Math.round(previousPeriodRevenue)
    });
  } catch (err) {
    console.error("Error generating overview report:", err);
    res.status(500).json({ message: "Failed to generate overview report" });
  }
});

// GET /api/reports/revenue - Detailed revenue report
router.get("/revenue", async (req, res) => {
  try {
    const { start, end } = req.query;
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);

    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate }
    }).populate('items.product');

    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const roomRevenue = orders
      .filter(order => order.type === 'ROOM_SERVICE' || order.reservation)
      .reduce((sum, order) => sum + (order.total || 0), 0);
    const posRevenue = orders
      .filter(order => order.type !== 'ROOM_SERVICE' && !order.reservation)
      .reduce((sum, order) => sum + (order.total || 0), 0);
    const taxCollected = totalRevenue * 0.05; // 5% tax

    // Revenue by source
    const revenueBySource = [
      { source: 'Room Booking', amount: roomRevenue, percentage: (roomRevenue / totalRevenue) * 100 },
      { source: 'Restaurant', amount: posRevenue * 0.5, percentage: (posRevenue * 0.5 / totalRevenue) * 100 },
      { source: 'Bar', amount: posRevenue * 0.33, percentage: (posRevenue * 0.33 / totalRevenue) * 100 },
      { source: 'Services', amount: posRevenue * 0.17, percentage: (posRevenue * 0.17 / totalRevenue) * 100 }
    ];

    // Daily breakdown (simplified)
    const dailyBreakdown = [
      {
        date: start,
        revenue: totalRevenue * 0.34,
        rooms: roomRevenue * 0.34,
        pos: posRevenue * 0.34
      },
      {
        date: new Date(new Date(start).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        revenue: totalRevenue * 0.33,
        rooms: roomRevenue * 0.33,
        pos: posRevenue * 0.33
      },
      {
        date: end,
        revenue: totalRevenue * 0.33,
        rooms: roomRevenue * 0.33,
        pos: posRevenue * 0.33
      }
    ];

    res.json({
      totalRevenue,
      roomRevenue,
      posRevenue,
      taxCollected,
      revenueBySource,
      dailyBreakdown
    });
  } catch (err) {
    console.error("Error generating revenue report:", err);
    res.status(500).json({ message: "Failed to generate revenue report" });
  }
});

// GET /api/reports/occupancy - Occupancy report
router.get("/occupancy", async (req, res) => {
  try {
    const { start, end } = req.query;
    
    const totalRooms = await Room.countDocuments();
    const occupiedRooms = Math.floor(totalRooms * 0.78); // Example: 78% occupancy
    const availableRooms = totalRooms - occupiedRooms;
    const maintenanceRooms = 2; // Example

    const occupancyRate = (occupiedRooms / totalRooms) * 100;

    // Room type breakdown
    const roomTypeBreakdown = [
      { type: 'Deluxe', total: Math.floor(totalRooms * 0.4), occupied: Math.floor(totalRooms * 0.4 * 0.8), rate: 80 },
      { type: 'Super Deluxe', total: Math.floor(totalRooms * 0.3), occupied: Math.floor(totalRooms * 0.3 * 0.8), rate: 80 },
      { type: 'Suite', total: Math.floor(totalRooms * 0.2), occupied: Math.floor(totalRooms * 0.2 * 0.8), rate: 80 },
      { type: 'Presidential', total: Math.floor(totalRooms * 0.1), occupied: Math.floor(totalRooms * 0.1 * 0.6), rate: 60 }
    ];

    // Daily occupancy (simplified)
    const dailyOccupancy = [
      { date: start, occupied: Math.floor(occupiedRooms * 0.9), available: totalRooms - Math.floor(occupiedRooms * 0.9), rate: (Math.floor(occupiedRooms * 0.9) / totalRooms) * 100 },
      { date: new Date(new Date(start).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], occupied: occupiedRooms, available: availableRooms, rate: occupancyRate },
      { date: end, occupied: Math.floor(occupiedRooms * 1.1), available: totalRooms - Math.floor(occupiedRooms * 1.1), rate: (Math.floor(occupiedRooms * 1.1) / totalRooms) * 100 }
    ];

    res.json({
      totalRooms,
      occupiedRooms,
      occupancyRate: Math.round(occupancyRate * 10) / 10,
      availableRooms,
      maintenanceRooms,
      roomTypeBreakdown,
      dailyOccupancy
    });
  } catch (err) {
    console.error("Error generating occupancy report:", err);
    res.status(500).json({ message: "Failed to generate occupancy report" });
  }
});

// GET /api/reports/guests - Guest analytics
router.get("/guests", async (req, res) => {
  try {
    const { start, end } = req.query;
    
    // In a real app, you'd query actual guest data
    const totalGuests = 67;
    const newGuests = 23;
    const returningGuests = 44;
    const averageStay = 2.3;

    const guestNationalities = [
      { country: 'India', count: 45, percentage: 67.2 },
      { country: 'USA', count: 8, percentage: 11.9 },
      { country: 'UK', count: 6, percentage: 9.0 },
      { country: 'Other', count: 8, percentage: 11.9 }
    ];

    const guestTypes = [
      { type: 'Business', count: 28, percentage: 41.8 },
      { type: 'Leisure', count: 32, percentage: 47.8 },
      { type: 'Family', count: 7, percentage: 10.4 }
    ];

    res.json({
      totalGuests,
      newGuests,
      returningGuests,
      averageStay,
      guestNationalities,
      guestTypes
    });
  } catch (err) {
    console.error("Error generating guest report:", err);
    res.status(500).json({ message: "Failed to generate guest report" });
  }
});

// GET /api/reports/pos - POS analytics
router.get("/pos", async (req, res) => {
  try {
    const { start, end } = req.query;
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);

    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate },
      type: { $in: ['RESTAURANT', 'BAR', 'SERVICE'] }
    }).populate('items.product');

    const totalSales = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Popular items (simplified)
    const popularItems = [
      { item: 'Chicken Biryani', quantity: 45, revenue: 11250 },
      { item: 'Butter Naan', quantity: 67, revenue: 2010 },
      { item: 'Coke', quantity: 89, revenue: 3560 },
      { item: 'Paneer Butter Masala', quantity: 32, revenue: 9600 }
    ];

    const categoryBreakdown = [
      { category: 'Food', amount: totalSales * 0.667, percentage: 66.7 },
      { category: 'Beverages', amount: totalSales * 0.222, percentage: 22.2 },
      { category: 'Services', amount: totalSales * 0.111, percentage: 11.1 }
    ];

    res.json({
      totalSales,
      totalOrders,
      averageOrderValue: Math.round(averageOrderValue),
      popularItems,
      categoryBreakdown
    });
  } catch (err) {
    console.error("Error generating POS report:", err);
    res.status(500).json({ message: "Failed to generate POS report" });
  }
});

export default router;
