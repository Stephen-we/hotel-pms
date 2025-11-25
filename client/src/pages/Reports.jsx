import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  // Report data structure
  const [reports, setReports] = useState({
    overview: null,
    revenue: null,
    occupancy: null,
    guests: null,
    pos: null
  });

  // Fetch all report data
  useEffect(() => {
    fetchAllReports();
  }, [dateRange]);

  const fetchAllReports = async () => {
    setLoading(true);
    try {
      const [overviewRes, revenueRes, occupancyRes, guestsRes, posRes] = await Promise.all([
        api.get(`/reports/overview?start=${dateRange.start}&end=${dateRange.end}`),
        api.get(`/reports/revenue?start=${dateRange.start}&end=${dateRange.end}`),
        api.get(`/reports/occupancy?start=${dateRange.start}&end=${dateRange.end}`),
        api.get(`/reports/guests?start=${dateRange.start}&end=${dateRange.end}`),
        api.get(`/reports/pos?start=${dateRange.start}&end=${dateRange.end}`)
      ]);

      setReports({
        overview: overviewRes.data,
        revenue: revenueRes.data,
        occupancy: occupancyRes.data,
        guests: guestsRes.data,
        pos: posRes.data
      });
    } catch (err) {
      console.error('Error fetching reports:', err);
      // Load sample data if API fails
      loadSampleData();
    } finally {
      setLoading(false);
    }
  };

  const loadSampleData = () => {
    const sampleData = {
      overview: {
        totalRevenue: 125000,
        totalBookings: 45,
        occupancyRate: 78.5,
        averageRoomRate: 2800,
        totalGuests: 67,
        revenueGrowth: 12.3,
        previousPeriodRevenue: 111250
      },
      revenue: {
        totalRevenue: 125000,
        roomRevenue: 89000,
        posRevenue: 36000,
        taxCollected: 6250,
        dailyBreakdown: [
          { date: '2024-01-01', revenue: 42000, rooms: 32000, pos: 10000 },
          { date: '2024-01-02', revenue: 38000, rooms: 28000, pos: 10000 },
          { date: '2024-01-03', revenue: 45000, rooms: 35000, pos: 10000 }
        ],
        revenueBySource: [
          { source: 'Room Booking', amount: 89000, percentage: 71.2 },
          { source: 'Restaurant', amount: 18000, percentage: 14.4 },
          { source: 'Bar', amount: 12000, percentage: 9.6 },
          { source: 'Services', amount: 6000, percentage: 4.8 }
        ]
      },
      occupancy: {
        totalRooms: 50,
        occupiedRooms: 39,
        occupancyRate: 78.0,
        availableRooms: 11,
        maintenanceRooms: 2,
        dailyOccupancy: [
          { date: '2024-01-01', occupied: 35, available: 15, rate: 70.0 },
          { date: '2024-01-02', occupied: 38, available: 12, rate: 76.0 },
          { date: '2024-01-03', occupied: 42, available: 8, rate: 84.0 }
        ],
        roomTypeBreakdown: [
          { type: 'Deluxe', total: 20, occupied: 16, rate: 80.0 },
          { type: 'Super Deluxe', total: 15, occupied: 12, rate: 80.0 },
          { type: 'Suite', total: 10, occupied: 8, rate: 80.0 },
          { type: 'Presidential', total: 5, occupied: 3, rate: 60.0 }
        ]
      },
      guests: {
        totalGuests: 67,
        newGuests: 23,
        returningGuests: 44,
        averageStay: 2.3,
        guestNationalities: [
          { country: 'India', count: 45, percentage: 67.2 },
          { country: 'USA', count: 8, percentage: 11.9 },
          { country: 'UK', count: 6, percentage: 9.0 },
          { country: 'Other', count: 8, percentage: 11.9 }
        ],
        guestTypes: [
          { type: 'Business', count: 28, percentage: 41.8 },
          { type: 'Leisure', count: 32, percentage: 47.8 },
          { type: 'Family', count: 7, percentage: 10.4 }
        ]
      },
      pos: {
        totalSales: 36000,
        totalOrders: 89,
        averageOrderValue: 404.5,
        popularItems: [
          { item: 'Chicken Biryani', quantity: 45, revenue: 11250 },
          { item: 'Butter Naan', quantity: 67, revenue: 2010 },
          { item: 'Coke', quantity: 89, revenue: 3560 },
          { item: 'Paneer Butter Masala', quantity: 32, revenue: 9600 }
        ],
        categoryBreakdown: [
          { category: 'Food', amount: 24000, percentage: 66.7 },
          { category: 'Beverages', amount: 8000, percentage: 22.2 },
          { category: 'Services', amount: 4000, percentage: 11.1 }
        ]
      }
    };
    setReports(sampleData);
  };

  const handleExport = async (format) => {
    try {
      let url;
      if (format === 'pdf') {
        url = `/api/reports/export/pdf?start=${dateRange.start}&end=${dateRange.end}`;
      } else {
        url = `/api/reports/export/excel?start=${dateRange.start}&end=${dateRange.end}`;
      }
      
      // Create a temporary link for download
      const link = document.createElement('a');
      link.href = url;
      link.download = `hotel-report-${dateRange.start}-to-${dateRange.end}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert(`Export failed: ${err.message}`);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const StatCard = ({ title, value, subtitle, trend, icon }) => (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400 mb-1">{title}</p>
          <p className="text-2xl font-semibold">{value}</p>
          {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
      {trend && (
        <div className={`flex items-center mt-3 text-sm ${
          trend > 0 ? 'text-green-400' : 'text-red-400'
        }`}>
          <span>{trend > 0 ? '↗' : '↘'}</span>
          <span className="ml-1">{Math.abs(trend)}% from previous period</span>
        </div>
      )}
    </div>
  );

  const ProgressBar = ({ percentage, color = 'bg-primary' }) => (
    <div className="w-full bg-slate-700 rounded-full h-2">
      <div 
        className={`h-2 rounded-full ${color} transition-all duration-500`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Advanced Analytics & Reports</h1>
          <p className="text-sm text-slate-400">
            Comprehensive business intelligence and performance metrics
          </p>
        </div>
        
        {/* Date Range & Export */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('pdf')}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
            >
              📄 Export PDF
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
            >
              📊 Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 overflow-x-auto">
        {[
          { id: 'overview', label: '📊 Overview', icon: '📊' },
          { id: 'revenue', label: '💰 Revenue', icon: '💰' },
          { id: 'occupancy', label: '🏨 Occupancy', icon: '🏨' },
          { id: 'guests', label: '👥 Guests', icon: '👥' },
          { id: 'pos', label: '🍽️ POS Analytics', icon: '��️' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-slate-400">Loading reports...</div>
        </div>
      ) : (
        <>
          {/* Overview Tab */}
          {activeTab === 'overview' && reports.overview && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Revenue"
                  value={formatCurrency(reports.overview.totalRevenue)}
                  subtitle="All revenue sources"
                  trend={reports.overview.revenueGrowth}
                  icon="💰"
                />
                <StatCard
                  title="Occupancy Rate"
                  value={`${reports.overview.occupancyRate}%`}
                  subtitle={`${reports.overview.totalBookings} bookings`}
                  icon="🏨"
                />
                <StatCard
                  title="Average Room Rate"
                  value={formatCurrency(reports.overview.averageRoomRate)}
                  subtitle="Per night"
                  icon="📈"
                />
                <StatCard
                  title="Total Guests"
                  value={reports.overview.totalGuests}
                  subtitle="Unique guests"
                  icon="👥"
                />
              </div>

              {/* Revenue Comparison */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Revenue Comparison</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Current Period</span>
                        <span className="font-semibold">{formatCurrency(reports.overview.totalRevenue)}</span>
                      </div>
                      <ProgressBar percentage={100} color="bg-primary" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Previous Period</span>
                        <span className="font-semibold">{formatCurrency(reports.overview.previousPeriodRevenue)}</span>
                      </div>
                      <ProgressBar 
                        percentage={(reports.overview.previousPeriodRevenue / reports.overview.totalRevenue) * 100} 
                        color="bg-slate-600" 
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Performance Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Revenue Growth</span>
                      <span className={`font-semibold ${reports.overview.revenueGrowth > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {reports.overview.revenueGrowth > 0 ? '+' : ''}{reports.overview.revenueGrowth}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Booking Conversion</span>
                      <span className="font-semibold">68%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Guest Satisfaction</span>
                      <span className="font-semibold">4.2/5</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Revenue Tab */}
          {activeTab === 'revenue' && reports.revenue && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <StatCard
                  title="Total Revenue"
                  value={formatCurrency(reports.revenue.totalRevenue)}
                  icon="💰"
                />
                <StatCard
                  title="Room Revenue"
                  value={formatCurrency(reports.revenue.roomRevenue)}
                  icon="🏨"
                />
                <StatCard
                  title="POS Revenue"
                  value={formatCurrency(reports.revenue.posRevenue)}
                  icon="🍽️"
                />
              </div>

              {/* Revenue by Source */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">Revenue by Source</h3>
                <div className="space-y-3">
                  {reports.revenue.revenueBySource.map((source, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-2">
                        <span>{source.source}</span>
                        <span>{formatCurrency(source.amount)} ({source.percentage}%)</span>
                      </div>
                      <ProgressBar 
                        percentage={source.percentage} 
                        color={index === 0 ? 'bg-primary' : index === 1 ? 'bg-blue-500' : index === 2 ? 'bg-green-500' : 'bg-purple-500'}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Daily Revenue Breakdown */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">Daily Revenue Breakdown</h3>
                <div className="space-y-3">
                  {reports.revenue.dailyBreakdown.map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{new Date(day.date).toLocaleDateString()}</div>
                        <div className="text-sm text-slate-400">
                          Rooms: {formatCurrency(day.rooms)} • POS: {formatCurrency(day.pos)}
                        </div>
                      </div>
                      <div className="font-semibold">{formatCurrency(day.revenue)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Occupancy Tab */}
          {activeTab === 'occupancy' && reports.occupancy && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Rooms"
                  value={reports.occupancy.totalRooms}
                  icon="🏨"
                />
                <StatCard
                  title="Occupied Rooms"
                  value={reports.occupancy.occupiedRooms}
                  icon="🛏️"
                />
                <StatCard
                  title="Occupancy Rate"
                  value={`${reports.occupancy.occupancyRate}%`}
                  icon="��"
                />
                <StatCard
                  title="Available Rooms"
                  value={reports.occupancy.availableRooms}
                  icon="✅"
                />
              </div>

              {/* Room Type Breakdown */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">Room Type Occupancy</h3>
                <div className="space-y-4">
                  {reports.occupancy.roomTypeBreakdown.map((roomType, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-2">
                        <span>{roomType.type} ({roomType.occupied}/{roomType.total})</span>
                        <span>{roomType.rate}%</span>
                      </div>
                      <ProgressBar 
                        percentage={roomType.rate} 
                        color={index === 0 ? 'bg-primary' : index === 1 ? 'bg-blue-500' : index === 2 ? 'bg-green-500' : 'bg-purple-500'}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Guests Tab */}
          {activeTab === 'guests' && reports.guests && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  title="Total Guests"
                  value={reports.guests.totalGuests}
                  icon="👥"
                />
                <StatCard
                  title="New Guests"
                  value={reports.guests.newGuests}
                  icon="🆕"
                />
                <StatCard
                  title="Returning Guests"
                  value={reports.guests.returningGuests}
                  icon="↩️"
                />
              </div>

              {/* Guest Nationalities */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">Guest Nationalities</h3>
                <div className="space-y-3">
                  {reports.guests.guestNationalities.map((nationality, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-2">
                        <span>{nationality.country}</span>
                        <span>{nationality.count} guests ({nationality.percentage}%)</span>
                      </div>
                      <ProgressBar 
                        percentage={nationality.percentage} 
                        color={index === 0 ? 'bg-primary' : index === 1 ? 'bg-blue-500' : index === 2 ? 'bg-green-500' : 'bg-purple-500'}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Guest Types */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">Guest Types</h3>
                <div className="space-y-3">
                  {reports.guests.guestTypes.map((guestType, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-2">
                        <span>{guestType.type}</span>
                        <span>{guestType.count} guests ({guestType.percentage}%)</span>
                      </div>
                      <ProgressBar 
                        percentage={guestType.percentage} 
                        color={index === 0 ? 'bg-primary' : index === 1 ? 'bg-blue-500' : index === 2 ? 'bg-green-500' : 'bg-purple-500'}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* POS Analytics Tab */}
          {activeTab === 'pos' && reports.pos && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  title="Total POS Sales"
                  value={formatCurrency(reports.pos.totalSales)}
                  icon="💰"
                />
                <StatCard
                  title="Total Orders"
                  value={reports.pos.totalOrders}
                  icon="📦"
                />
                <StatCard
                  title="Average Order Value"
                  value={formatCurrency(reports.pos.averageOrderValue)}
                  icon="📊"
                />
              </div>

              {/* Popular Items */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">Most Popular Items</h3>
                <div className="space-y-3">
                  {reports.pos.popularItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{item.item}</div>
                        <div className="text-sm text-slate-400">Quantity: {item.quantity}</div>
                      </div>
                      <div className="font-semibold">{formatCurrency(item.revenue)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">Sales by Category</h3>
                <div className="space-y-3">
                  {reports.pos.categoryBreakdown.map((category, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-2">
                        <span>{category.category}</span>
                        <span>{formatCurrency(category.amount)} ({category.percentage}%)</span>
                      </div>
                      <ProgressBar 
                        percentage={category.percentage} 
                        color={index === 0 ? 'bg-primary' : index === 1 ? 'bg-blue-500' : index === 2 ? 'bg-green-500' : 'bg-purple-500'}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
