import React, { useState, useEffect } from "react";
import StatCard from "../components/StatCard";
import ProgressBar from "../components/ProgressBar";
import api from "../services/api";

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    rooms: [],
    reservations: [],
    loading: true
  });

  // Fetch live data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [roomsRes, reservationsRes] = await Promise.all([
        api.get('/rooms'),
        api.get('/reservations')
      ]);

      const rooms = roomsRes.data;
      const reservations = reservationsRes.data;

      // Calculate metrics
      const totalRooms = rooms.length;
      const occupiedRooms = rooms.filter(r => r.status === 'OCCUPIED').length;
      const vacantCleanRooms = rooms.filter(r => r.status === 'VACANT_CLEAN').length;
      const vacantDirtyRooms = rooms.filter(r => r.status === 'VACANT_DIRTY').length;
      
      const occupancyRate = Math.round((occupiedRooms / totalRooms) * 100);
      
      const today = new Date().toISOString().split('T')[0];
      const todayArrivals = reservations.filter(r => 
        r.checkInDate.split('T')[0] === today && r.status === 'BOOKED'
      ).length;
      const todayDepartures = reservations.filter(r => 
        r.checkOutDate.split('T')[0] === today && r.status === 'CHECKED_IN'
      ).length;
      
      const inHouseGuests = reservations.filter(r => 
        r.status === 'CHECKED_IN'
      ).length;

      // Calculate revenue (simplified - in real app, this would come from transactions)
      const totalRevenue = reservations
        .filter(r => r.status === 'CHECKED_OUT')
        .reduce((sum, r) => sum + (r.totalAmount || 0), 0);
      
      const todaysRevenue = reservations
        .filter(r => r.checkOutDate.split('T')[0] === today)
        .reduce((sum, r) => sum + (r.totalAmount || 0), 0);

      setDashboardData({
        rooms,
        reservations,
        metrics: {
          date: new Date().toLocaleDateString(),
          occupancy: occupancyRate,
          roomsTotal: totalRooms,
          roomsOccupied: occupiedRooms,
          roomsVacantClean: vacantCleanRooms,
          roomsVacantDirty: vacantDirtyRooms,
          arrivals: todayArrivals,
          departures: todayDepartures,
          inHouse: inHouseGuests,
          revenue: `₹ ${todaysRevenue.toLocaleString()}`,
          totalRevenue: `₹ ${totalRevenue.toLocaleString()}`,
          avgRate: occupiedRooms > 0 ? `₹ ${Math.round(totalRevenue / occupiedRooms)}` : '₹ 0',
          posRevenue: '₹ 0' // Would come from POS system
        },
        loading: false
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setDashboardData(prev => ({ ...prev, loading: false }));
    }
  };

  const { metrics, rooms, reservations, loading } = dashboardData;

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8 text-slate-400">Loading dashboard data...</div>
      </div>
    );
  }

  const roomTypes = [
    { name: "Deluxe Room", occ: Math.round((rooms.filter(r => r.type === 'DELUXE' && r.status === 'OCCUPIED').length / rooms.filter(r => r.type === 'DELUXE').length) * 100) || 0 },
    { name: "Superior Room", occ: Math.round((rooms.filter(r => r.type === 'SUPERIOR' && r.status === 'OCCUPIED').length / rooms.filter(r => r.type === 'SUPERIOR').length) * 100) || 0 },
    { name: "Suite", occ: Math.round((rooms.filter(r => r.type === 'SUITE' && r.status === 'OCCUPIED').length / rooms.filter(r => r.type === 'SUITE').length) * 100) || 0 },
    { name: "Family Room", occ: Math.round((rooms.filter(r => r.type === 'FAMILY' && r.status === 'OCCUPIED').length / rooms.filter(r => r.type === 'FAMILY').length) * 100) || 0 },
  ];

  const housekeepingSummary = [
    { status: "Dirty", count: rooms.filter(r => r.status === 'VACANT_DIRTY').length },
    { status: "Clean", count: rooms.filter(r => r.status === 'VACANT_CLEAN').length },
    { status: "Inspection", count: rooms.filter(r => r.status === 'OUT_OF_ORDER').length },
    { status: "Out of Order", count: rooms.filter(r => r.status === 'OUT_OF_ORDER').length },
  ];

  const frontDeskTimeline = reservations
    .filter(r => r.status === 'CHECKED_IN')
    .slice(0, 4)
    .map(reservation => ({
      time: new Date(reservation.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      label: "Checked-in",
      detail: `${reservation.guest?.firstName} • Room ${reservation.room?.number}`
    }));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Front Office Overview
          </h1>
          <p className="text-sm text-slate-400">
            Live status of rooms, guests, revenue and housekeeping.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <div className="px-3 py-1 rounded-full border border-slate-700 bg-slate-900/40">
            Today: <span className="font-medium text-slate-100">{metrics?.date}</span>
          </div>
          <div className="hidden sm:block px-3 py-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-xs">
            Live PMS • In-House Guests: {metrics?.inHouse}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Today's Occupancy"
          value={`${metrics?.occupancy || 0}%`}
          subLabel={`${metrics?.roomsOccupied} of ${metrics?.roomsTotal} rooms occupied`}
          trend={metrics?.occupancy > 70 ? "High Season" : "Moderate"}
          trendType={metrics?.occupancy > 70 ? "up" : "neutral"}
        />
        <StatCard
          label="Today's Revenue"
          value={metrics?.revenue || '₹ 0'}
          subLabel={`Total revenue: ${metrics?.totalRevenue}`}
          trend="Live from check-outs"
          trendType="up"
        />
        <StatCard
          label="Arrivals / Departures"
          value={`${metrics?.arrivals || 0} / ${metrics?.departures || 0}`}
          subLabel="Expected for today"
          trend={metrics?.arrivals > 5 ? "Busy Day" : "Quiet Day"}
          trendType={metrics?.arrivals > 5 ? "up" : "neutral"}
        />
        <StatCard
          label="Available Rooms"
          value={metrics?.roomsVacantClean || 0}
          subLabel={`${metrics?.roomsVacantDirty || 0} rooms need cleaning`}
          trend="Ready for check-in"
          trendType="neutral"
        />
      </div>

      {/* Middle section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Rooms Overview */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-cardBg border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-semibold">Rooms & Occupancy</h2>
                <p className="text-xs text-slate-400">
                  Breakdown by room type and overall occupancy.
                </p>
              </div>
              <div className="text-xs text-slate-400">
                Total Rooms:{" "}
                <span className="font-medium text-slate-100">
                  {metrics?.roomsTotal}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Occupancy progress */}
              <div className="space-y-3">
                <ProgressBar
                  value={metrics?.occupancy || 0}
                  labelLeft="Overall Occupancy"
                  labelRight={`${metrics?.occupancy || 0}%`}
                />
                {roomTypes.map((rt) => (
                  <ProgressBar
                    key={rt.name}
                    value={rt.occ}
                    labelLeft={rt.name}
                    labelRight={`${rt.occ}%`}
                  />
                ))}
              </div>

              {/* Housekeeping small summary */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-slate-200">
                    Housekeeping Status
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Auto-sync with HK module
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {housekeepingSummary.map((item) => (
                    <div
                      key={item.status}
                      className="flex items-center justify-between bg-slate-950/60 border border-slate-800 rounded-lg px-2.5 py-2"
                    >
                      <span className="text-slate-300">{item.status}</span>
                      <span className="font-semibold text-slate-100">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="text-[11px] text-slate-500">
                  * Dirty rooms to be prioritized before 14:00.
                </div>
              </div>
            </div>
          </div>

          {/* Arrivals / Departures small panel */}
          <div className="bg-cardBg border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold">Arrivals & Departures</h2>
              <div className="flex gap-2 text-xs">
                <span className="px-2 py-1 rounded-full bg-slate-900/70 border border-slate-700 text-slate-300">
                  Arrivals: {metrics?.arrivals}
                </span>
                <span className="px-2 py-1 rounded-full bg-slate-900/70 border border-slate-700 text-slate-300">
                  Departures: {metrics?.departures}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-2">
              Real-time data from reservation system.
            </p>
            <div className="text-xs text-slate-500">
              • Monitor front desk for guest arrivals<br/>
              • Prepare rooms for incoming guests
            </div>
          </div>
        </div>

        {/* Right side - FrontDesk timeline & quick actions */}
        <div className="space-y-4">
          <div className="bg-cardBg border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold">Recent Activity</h2>
              <button 
                onClick={fetchDashboardData}
                className="text-[11px] px-2 py-1 rounded-full border border-primary/40 text-primary hover:bg-primary/10"
              >
                Refresh
              </button>
            </div>
            <div className="space-y-3 text-xs">
              {frontDeskTimeline.length > 0 ? (
                frontDeskTimeline.map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="pt-0.5">
                      <div className="w-8 text-[11px] text-slate-500">
                        {item.time}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-slate-200">
                        {item.label}
                      </div>
                      <div className="text-slate-400">{item.detail}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-400 py-2">
                  No recent activity
                </div>
              )}
            </div>
          </div>

          <div className="bg-cardBg border border-slate-800 rounded-2xl p-4 space-y-3">
            <h2 className="text-sm font-semibold">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                "New Walk-in Check-in",
                "Create Reservation",
                "Assign Housekeeping",
                "Post Buffet Charge",
                "Mark Room Out-of-Order",
                "Early Check-in Request",
              ].map((action) => (
                <button
                  key={action}
                  className="px-2.5 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-left hover:border-primary/60 hover:bg-slate-900 transition"
                >
                  {action}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">
              Quick access to common front desk operations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
