import express from "express";
import Reservation from "../models/Reservation.js";
import Room from "../models/Room.js";
import Guest from "../models/Guest.js";
import Order from "../models/Order.js";

const router = express.Router();

/**
 * GET /api/reports/dashboard
 * Get dashboard overview statistics
 */
router.get("/dashboard", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Date range filtering
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get current date for today's calculations
    const today = new Date();
    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    const todayEnd = new Date(today.setHours(23, 59, 59, 999));

    // Parallel data fetching for performance
    const [
      totalRooms,
      occupiedRooms,
      todayArrivals,
      todayDepartures,
      totalGuests,
      totalReservations,
      totalRevenue,
      monthlyRevenue
    ] = await Promise.all([
      // Room statistics
      Room.countDocuments(),
      Room.countDocuments({ status: 'OCCUPIED' }),
      
      // Today's activities
      Reservation.countDocuments({ 
        checkInDate: { $gte: todayStart, $lte: todayEnd },
        status: { $in: ['BOOKED', 'CHECKED_IN'] }
      }),
      Reservation.countDocuments({ 
        checkOutDate: { $gte: todayStart, $lte: todayEnd },
        status: { $in: ['CHECKED_IN', 'CHECKED_OUT'] }
      }),
      
      // Guest statistics
      Guest.countDocuments(),
      Reservation.countDocuments(),
      
      // Revenue calculations
      Reservation.aggregate([
        { $match: { status: 'CHECKED_OUT', ...dateFilter } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      
      // Monthly revenue trend (last 6 months)
      Reservation.aggregate([
        {
          $match: {
            status: 'CHECKED_OUT',
            checkOutDate: {
              $gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
            }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$checkOutDate' },
              month: { $month: '$checkOutDate' }
            },
            revenue: { $sum: '$totalAmount' },
            bookings: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    ]);

    // Room type occupancy
    const roomTypeStats = await Room.aggregate([
      {
        $group: {
          _id: '$type',
          total: { $sum: 1 },
          occupied: {
            $sum: { $cond: [{ $eq: ['$status', 'OCCUPIED'] }, 1, 0] }
          },
          available: {
            $sum: { $cond: [{ $eq: ['$status', 'VACANT_CLEAN'] }, 1, 0] }
          }
        }
      }
    ]);

    // Reservation source analysis
    const sourceAnalysis = await Reservation.aggregate([
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Guest loyalty analysis
    const loyaltyAnalysis = await Guest.aggregate([
      {
        $group: {
          _id: '$loyaltyTier',
          count: { $sum: 1 },
          avgStays: { $avg: '$totalStays' },
          avgNights: { $avg: '$totalNights' },
          avgSpent: { $avg: '$totalSpent' }
        }
      }
    ]);

    // POS revenue by category
    const posRevenue = await Order.aggregate([
      {
        $match: { paymentStatus: 'PAID', ...dateFilter }
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
          orders: { $sum: 1 }
        }
      }
    ]);

    const dashboardData = {
      overview: {
        totalRooms,
        occupiedRooms,
        occupancyRate: Math.round((occupiedRooms / totalRooms) * 100) || 0,
        todayArrivals,
        todayDepartures,
        totalGuests,
        totalReservations,
        totalRevenue: totalRevenue[0]?.total || 0
      },
      trends: {
        monthlyRevenue: monthlyRevenue.map(item => ({
          month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
          revenue: item.revenue,
          bookings: item.bookings
        }))
      },
      analytics: {
        roomTypeStats: roomTypeStats.map(stat => ({
          type: stat._id,
          total: stat.total,
          occupied: stat.occupied,
          available: stat.available,
          occupancyRate: Math.round((stat.occupied / stat.total) * 100) || 0
        })),
        sourceAnalysis,
        loyaltyAnalysis,
        posRevenue
      }
    };

    res.json(dashboardData);
  } catch (err) {
    console.error("Error generating dashboard report:", err);
    res.status(500).json({ message: "Failed to generate dashboard report" });
  }
});

/**
 * GET /api/reports/occupancy
 * Detailed occupancy analysis
 */
router.get("/occupancy", async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    
    let groupBy;
    switch (period) {
      case 'daily':
        groupBy = { 
          year: { $year: '$checkInDate' },
          month: { $month: '$checkInDate' },
          day: { $dayOfMonth: '$checkInDate' }
        };
        break;
      case 'weekly':
        groupBy = { 
          year: { $year: '$checkInDate' },
          week: { $week: '$checkInDate' }
        };
        break;
      default: // monthly
        groupBy = { 
          year: { $year: '$checkInDate' },
          month: { $month: '$checkInDate' }
        };
    }

    const occupancyReport = await Reservation.aggregate([
      {
        $match: {
          status: { $in: ['CHECKED_IN', 'CHECKED_OUT'] }
        }
      },
      {
        $group: {
          _id: groupBy,
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          totalNights: {
            $sum: {
              $divide: [
                { $subtract: ['$checkOutDate', '$checkInDate'] },
                1000 * 60 * 60 * 24 // Convert milliseconds to days
              ]
            }
          },
          avgRoomRate: { $avg: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } }
    ]);

    // Room type performance
    const roomPerformance = await Reservation.aggregate([
      {
        $match: {
          status: { $in: ['CHECKED_IN', 'CHECKED_OUT'] }
        }
      },
      {
        $lookup: {
          from: 'rooms',
          localField: 'room',
          foreignField: '_id',
          as: 'room'
        }
      },
      { $unwind: '$room' },
      {
        $group: {
          _id: '$room.type',
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          avgRoomRate: { $avg: '$totalAmount' },
          occupancyRate: {
            $avg: {
              $cond: [{ $eq: ['$status', 'CHECKED_IN'] }, 1, 0]
            }
          }
        }
      }
    ]);

    res.json({
      occupancyTrend: occupancyReport,
      roomPerformance: roomPerformance.map(room => ({
        ...room,
        occupancyRate: Math.round(room.occupancyRate * 100)
      }))
    });
  } catch (err) {
    console.error("Error generating occupancy report:", err);
    res.status(500).json({ message: "Failed to generate occupancy report" });
  }
});

/**
 * GET /api/reports/revenue
 * Detailed revenue analysis
 */
router.get("/revenue", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.checkOutDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Room revenue vs POS revenue
    const revenueBreakdown = await Promise.all([
      // Room revenue
      Reservation.aggregate([
        {
          $match: {
            status: 'CHECKED_OUT',
            ...dateFilter
          }
        },
        {
          $group: {
            _id: null,
            roomRevenue: { $sum: '$totalAmount' },
            roomBookings: { $sum: 1 },
            avgDailyRate: { $avg: '$totalAmount' }
          }
        }
      ]),
      // POS revenue
      Order.aggregate([
        {
          $match: {
            paymentStatus: 'PAID',
            ...dateFilter
          }
        },
        {
          $group: {
            _id: null,
            posRevenue: { $sum: '$total' },
            posOrders: { $sum: 1 },
            avgOrderValue: { $avg: '$total' }
          }
        }
      ])
    ]);

    // Revenue by source
    const revenueBySource = await Reservation.aggregate([
      {
        $match: {
          status: 'CHECKED_OUT',
          ...dateFilter
        }
      },
      {
        $group: {
          _id: '$source',
          revenue: { $sum: '$totalAmount' },
          bookings: { $sum: 1 },
          avgRate: { $avg: '$totalAmount' }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    // Monthly revenue comparison
    const monthlyComparison = await Reservation.aggregate([
      {
        $match: {
          status: 'CHECKED_OUT',
          checkOutDate: {
            $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$checkOutDate' },
            month: { $month: '$checkOutDate' }
          },
          revenue: { $sum: '$totalAmount' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const roomRevenue = revenueBreakdown[0][0] || { roomRevenue: 0, roomBookings: 0, avgDailyRate: 0 };
    const posRevenue = revenueBreakdown[1][0] || { posRevenue: 0, posOrders: 0, avgOrderValue: 0 };
    const totalRevenue = roomRevenue.roomRevenue + posRevenue.posRevenue;

    res.json({
      summary: {
        totalRevenue,
        roomRevenue: roomRevenue.roomRevenue,
        posRevenue: posRevenue.posRevenue,
        roomBookings: roomRevenue.roomBookings,
        posOrders: posRevenue.posOrders,
        avgDailyRate: roomRevenue.avgDailyRate,
        avgOrderValue: posRevenue.avgOrderValue,
        revenueMix: {
          room: Math.round((roomRevenue.roomRevenue / totalRevenue) * 100) || 0,
          pos: Math.round((posRevenue.posRevenue / totalRevenue) * 100) || 0
        }
      },
      bySource: revenueBySource,
      monthlyTrend: monthlyComparison.map(item => ({
        period: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
        revenue: item.revenue,
        bookings: item.bookings
      }))
    });
  } catch (err) {
    console.error("Error generating revenue report:", err);
    res.status(500).json({ message: "Failed to generate revenue report" });
  }
});

/**
 * GET /api/reports/guests
 * Guest analytics and demographics
 */
router.get("/guests", async (req, res) => {
  try {
    // Guest demographics
    const guestDemographics = await Guest.aggregate([
      {
        $group: {
          _id: '$nationality',
          count: { $sum: 1 },
          avgStays: { $avg: '$totalStays' },
          avgSpent: { $avg: '$totalSpent' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Loyalty distribution
    const loyaltyDistribution = await Guest.aggregate([
      {
        $group: {
          _id: '$loyaltyTier',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalSpent' }
        }
      }
    ]);

    // Repeat guest analysis
    const repeatGuestAnalysis = await Reservation.aggregate([
      {
        $group: {
          _id: '$guest',
          stayCount: { $sum: 1 },
          totalNights: {
            $sum: {
              $divide: [
                { $subtract: ['$checkOutDate', '$checkInDate'] },
                1000 * 60 * 60 * 24
              ]
            }
          },
          totalSpent: { $sum: '$totalAmount' }
        }
      },
      {
        $group: {
          _id: '$stayCount',
          guestCount: { $sum: 1 },
          avgNights: { $avg: '$totalNights' },
          avgSpent: { $avg: '$totalSpent' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      demographics: guestDemographics,
      loyalty: loyaltyDistribution,
      repeatGuests: repeatGuestAnalysis
    });
  } catch (err) {
    console.error("Error generating guest report:", err);
    res.status(500).json({ message: "Failed to generate guest report" });
  }
});

export default router;
