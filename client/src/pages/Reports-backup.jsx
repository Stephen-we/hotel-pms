import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function Reports() {
  const [activeReport, setActiveReport] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  
  const [reportData, setReportData] = useState({
    dashboard: null,
    occupancy: null,
    revenue: null,
    guests: null
  });

  // Fetch report data
  useEffect(() => {
    if (activeReport === 'dashboard') {
      fetchDashboardReport();
    }
  }, [activeReport, dateRange]);

  const fetchDashboardReport = async () => {
    try {
      setLoading(true);
      const params = {};
      if (dateRange.startDate && dateRange.endDate) {
        params.startDate = dateRange.startDate;
        params.endDate = dateRange.endDate;
      }
      
      const res = await api.get('/reports/dashboard', { params });
      setReportData(prev => ({ ...prev, dashboard: res.data }));
    } catch (err) {
      console.error('Error fetching dashboard report:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOccupancyReport = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports/occupancy');
      setReportData(prev => ({ ...prev, occupancy: res.data }));
    } catch (err) {
      console.error('Error fetching occupancy report:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenueReport = async () => {
    try {
      setLoading(true);
      const params = {};
      if (dateRange.startDate && dateRange.endDate) {
        params.startDate = dateRange.startDate;
        params.endDate = dateRange.endDate;
      }
      
      const res = await api.get('/reports/revenue', { params });
      setReportData(prev => ({ ...prev, revenue: res.data }));
    } catch (err) {
      console.error('Error fetching revenue report:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGuestReport = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports/guests');
      setReportData(prev => ({ ...prev, guests: res.data }));
    } catch (err) {
      console.error('Error fetching guest report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReportChange = (report) => {
    setActiveReport(report);
    
    // Fetch data if not already loaded
    if (!reportData[report]) {
      switch (report) {
        case 'occupancy':
          fetchOccupancyReport();
          break;
        case 'revenue':
          fetchRevenueReport();
          break;
        case 'guests':
          fetchGuestReport();
          break;
        default:
          break;
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('en-IN').format(number);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reports & Analytics</h1>
          <p className="text-sm text-slate-400">
            Business intelligence and performance analytics
          </p>
        </div>
        
        {/* Date Range Filter */}
        <div className="flex gap-2 text-sm">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1 text-sm outline-none focus:border-primary"
          />
          <span className="text-slate-400 self-center">to</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Report Tabs */}
      <div className="flex border-b border-slate-800 overflow-x-auto">
        {[
          { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
          { id: 'occupancy', label: '🏨 Occupancy', icon: '🏨' },
          { id: 'revenue', label: '💰 Revenue', icon: '💰' },
          { id: 'guests', label: '👥 Guests', icon: '👥' }
        ].map(report => (
          <button
            key={report.id}
            onClick={() => handleReportChange(report.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition whitespace-nowrap ${
              activeReport === report.id
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>{report.icon}</span>
            {report.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8 text-slate-400">
          Loading report data...
        </div>
      )}

      {/* Dashboard Report */}
      {activeReport === 'dashboard' && reportData.dashboard && (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-cardBg border border-slate-800 rounded-2xl p-4 text-center">
              <div className="text-2xl font-semibold text-primary">
                {reportData.dashboard.overview.occupancyRate}%
              </div>
              <div className="text-sm text-slate-400">Occupancy Rate</div>
            </div>
            <div className="bg-cardBg border border-slate-800 rounded-2xl p-4 text-center">
              <div className="text-2xl font-semibold text-primary">
                {formatCurrency(reportData.dashboard.overview.totalRevenue)}
              </div>
              <div className="text-sm text-slate-400">Total Revenue</div>
            </div>
            <div className="bg-cardBg border border-slate-800 rounded-2xl p-4 text-center">
              <div className="text-2xl font-semibold text-primary">
                {reportData.dashboard.overview.todayArrivals}
              </div>
              <div className="text-sm text-slate-400">Today's Arrivals</div>
            </div>
            <div className="bg-cardBg border border-slate-800 rounded-2xl p-4 text-center">
              <div className="text-2xl font-semibold text-primary">
                {reportData.dashboard.overview.todayDepartures}
              </div>
              <div className="text-sm text-slate-400">Today's Departures</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Room Type Performance */}
            <div className="bg-cardBg border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Room Type Performance</h3>
              <div className="space-y-3">
                {reportData.dashboard.analytics.roomTypeStats.map(roomType => (
                  <div key={roomType.type} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium capitalize">{roomType.type.toLowerCase()}</div>
                      <div className="text-sm text-slate-400">
                        {roomType.occupied}/{roomType.total} rooms occupied
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{roomType.occupancyRate}%</div>
                      <div className="text-xs text-slate-400">occupancy</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue Sources */}
            <div className="bg-cardBg border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Booking Sources</h3>
              <div className="space-y-3">
                {reportData.dashboard.analytics.sourceAnalysis.map(source => (
                  <div key={source._id} className="flex items-center justify-between">
                    <div className="font-medium capitalize">{source._id.toLowerCase()}</div>
                    <div className="text-right">
                      <div className="font-semibold">{source.count} bookings</div>
                      <div className="text-xs text-slate-400">
                        {formatCurrency(source.revenue)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* POS Revenue by Category */}
          <div className="bg-cardBg border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">POS Revenue by Category</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {reportData.dashboard.analytics.posRevenue.map(category => (
                <div key={category._id} className="text-center">
                  <div className="text-2xl font-semibold text-primary">
                    {formatCurrency(category.revenue)}
                  </div>
                  <div className="text-sm text-slate-400 capitalize">{category._id.toLowerCase()}</div>
                  <div className="text-xs text-slate-500">{category.orders} orders</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Occupancy Report */}
      {activeReport === 'occupancy' && reportData.occupancy && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Occupancy Trend */}
            <div className="bg-cardBg border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Occupancy Trend</h3>
              <div className="space-y-3">
                {reportData.occupancy.occupancyTrend.slice(-10).map(period => (
                  <div key={period._id} className="flex items-center justify-between">
                    <div className="font-medium">
                      {period._id.year}-{period._id.month?.toString().padStart(2, '0')}
                      {period._id.week && ` Week ${period._id.week}`}
                      {period._id.day && `-${period._id.day.toString().padStart(2, '0')}`}
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{period.totalBookings} bookings</div>
                      <div className="text-xs text-slate-400">
                        {formatCurrency(period.totalRevenue)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Room Performance */}
            <div className="bg-cardBg border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Room Type Performance</h3>
              <div className="space-y-4">
                {reportData.occupancy.roomPerformance.map(room => (
                  <div key={room._id}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium capitalize">{room._id.toLowerCase()}</div>
                      <div className="text-sm text-slate-400">{room.occupancyRate}% occupancy</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="text-center">
                        <div className="font-semibold">{room.totalBookings}</div>
                        <div className="text-xs text-slate-400">Bookings</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{formatCurrency(room.totalRevenue)}</div>
                        <div className="text-xs text-slate-400">Revenue</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{formatCurrency(room.avgRoomRate)}</div>
                        <div className="text-xs text-slate-400">Avg Rate</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Report */}
      {activeReport === 'revenue' && reportData.revenue && (
        <div className="space-y-6">
          {/* Revenue Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-cardBg border border-slate-800 rounded-2xl p-4 text-center">
              <div className="text-2xl font-semibold text-primary">
                {formatCurrency(reportData.revenue.summary.totalRevenue)}
              </div>
              <div className="text-sm text-slate-400">Total Revenue</div>
            </div>
            <div className="bg-cardBg border border-slate-800 rounded-2xl p-4 text-center">
              <div className="text-2xl font-semibold text-primary">
                {formatCurrency(reportData.revenue.summary.roomRevenue)}
              </div>
              <div className="text-sm text-slate-400">Room Revenue</div>
            </div>
            <div className="bg-cardBg border border-slate-800 rounded-2xl p-4 text-center">
              <div className="text-2xl font-semibold text-primary">
                {formatCurrency(reportData.revenue.summary.posRevenue)}
              </div>
              <div className="text-sm text-slate-400">POS Revenue</div>
            </div>
            <div className="bg-cardBg border border-slate-800 rounded-2xl p-4 text-center">
              <div className="text-2xl font-semibold text-primary">
                {reportData.revenue.summary.revenueMix.room}% / {reportData.revenue.summary.revenueMix.pos}%
              </div>
              <div className="text-sm text-slate-400">Room/POS Mix</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue by Source */}
            <div className="bg-cardBg border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Revenue by Booking Source</h3>
              <div className="space-y-3">
                {reportData.revenue.bySource.map(source => (
                  <div key={source._id} className="flex items-center justify-between">
                    <div className="font-medium capitalize">{source._id.toLowerCase()}</div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(source.revenue)}</div>
                      <div className="text-xs text-slate-400">
                        {source.bookings} bookings • {formatCurrency(source.avgRate)} avg
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Trend */}
            <div className="bg-cardBg border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Monthly Revenue Trend</h3>
              <div className="space-y-3">
                {reportData.revenue.monthlyTrend.slice(-6).map(month => (
                  <div key={month.period} className="flex items-center justify-between">
                    <div className="font-medium">{month.period}</div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(month.revenue)}</div>
                      <div className="text-xs text-slate-400">
                        {month.bookings} bookings
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guest Report */}
      {activeReport === 'guests' && reportData.guests && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Guest Demographics */}
            <div className="bg-cardBg border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Guest Demographics</h3>
              <div className="space-y-3">
                {reportData.guests.demographics.map(demo => (
                  <div key={demo._id} className="flex items-center justify-between">
                    <div className="font-medium">{demo._id}</div>
                    <div className="text-right">
                      <div className="font-semibold">{demo.count} guests</div>
                      <div className="text-xs text-slate-400">
                        {formatCurrency(demo.avgSpent)} avg spent
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Loyalty Distribution */}
            <div className="bg-cardBg border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Loyalty Program</h3>
              <div className="space-y-3">
                {reportData.guests.loyalty.map(tier => (
                  <div key={tier._id} className="flex items-center justify-between">
                    <div className="font-medium">{tier._id}</div>
                    <div className="text-right">
                      <div className="font-semibold">{tier.count} guests</div>
                      <div className="text-xs text-slate-400">
                        {formatCurrency(tier.totalRevenue)} total
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Repeat Guest Analysis */}
          <div className="bg-cardBg border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Repeat Guest Analysis</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {reportData.guests.repeatGuests.map(analysis => (
                <div key={analysis._id} className="text-center">
                  <div className="text-2xl font-semibold text-primary">{analysis._id}</div>
                  <div className="text-sm text-slate-400">Stays</div>
                  <div className="text-xs text-slate-500">
                    {analysis.guestCount} guests
                  </div>
                  <div className="text-xs text-slate-500">
                    {formatCurrency(analysis.avgSpent)} avg spent
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !reportData[activeReport] && activeReport !== 'dashboard' && (
        <div className="text-center py-8 text-slate-400">
          No data available for this report
        </div>
      )}
    </div>
  );
}
