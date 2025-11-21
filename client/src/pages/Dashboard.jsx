import React from "react";
import StatCard from "../components/StatCard";
import ProgressBar from "../components/ProgressBar";

export default function Dashboard() {
  // Later these will come from backend (Mongo)
  const today = {
    date: new Date().toLocaleDateString(),
    occupancy: 78,
    roomsTotal: 120,
    roomsOccupied: 94,
    arrivals: 32,
    departures: 28,
    inHouse: 89,
    revenue: "₹ 3,45,800",
    avgRate: "₹ 3,880",
    posRevenue: "₹ 96,400",
  };

  const roomTypes = [
    { name: "Deluxe Room", occ: 82 },
    { name: "Superior Room", occ: 76 },
    { name: "Suite", occ: 68 },
    { name: "Family Room", occ: 73 },
  ];

  const housekeepingSummary = [
    { status: "Dirty", count: 18 },
    { status: "Clean", count: 82 },
    { status: "Inspection", count: 12 },
    { status: "Out of Order", count: 8 },
  ];

  const frontDeskTimeline = [
    { time: "09:15", label: "Check-in", detail: "Mr. Sharma • 2N • 301" },
    { time: "10:05", label: "Room Move", detail: "Ms. Gupta • 214 → 315" },
    { time: "11:20", label: "Early Check-out", detail: "Corporate Guest • 508" },
    { time: "12:10", label: "Group Arrival", detail: "TechConf • 12 Rooms" },
  ];

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
            Today: <span className="font-medium text-slate-100">{today.date}</span>
          </div>
          <div className="hidden sm:block px-3 py-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-xs">
            Live PMS • In-House Guests: {today.inHouse}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Today's Occupancy"
          value={`${today.occupancy}%`}
          subLabel={`${today.roomsOccupied} of ${today.roomsTotal} rooms occupied`}
          trend="+5% vs last week"
          trendType="up"
        />
        <StatCard
          label="Today's Room Revenue"
          value={today.revenue}
          subLabel={`Average room rate ${today.avgRate}`}
          trend="+₹ 42,000 vs yesterday"
          trendType="up"
        />
        <StatCard
          label="Arrivals / Departures"
          value={`${today.arrivals} / ${today.departures}`}
          subLabel="Expected for today"
          trend="Moderate Day"
          trendType="neutral"
        />
        <StatCard
          label="POS & Buffet Revenue"
          value={today.posRevenue}
          subLabel="Restaurant • Room Service • Buffet"
          trend="+18% vs last week"
          trendType="up"
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
                  {today.roomsTotal}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Occupancy progress */}
              <div className="space-y-3">
                <ProgressBar
                  value={today.occupancy}
                  labelLeft="Overall Occupancy"
                  labelRight={`${today.occupancy}%`}
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
                  * Dirty & Inspection rooms to be prioritized before 14:00.
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
                  Arrivals: {today.arrivals}
                </span>
                <span className="px-2 py-1 rounded-full bg-slate-900/70 border border-slate-700 text-slate-300">
                  Departures: {today.departures}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-2">
              Later we will replace this with a live table (guest name, room,
              ETA/ETD, source, payment mode etc.).
            </p>
            <div className="text-xs text-slate-500">
              • Group check-in at 12:00  
              • Priority corporate guest to be upgraded if available  
            </div>
          </div>
        </div>

        {/* Right side - FrontDesk timeline & quick actions */}
        <div className="space-y-4">
          <div className="bg-cardBg border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold">Front Desk Activity</h2>
              <button className="text-[11px] px-2 py-1 rounded-full border border-primary/40 text-primary hover:bg-primary/10">
                View all
              </button>
            </div>
            <div className="space-y-3 text-xs">
              {frontDeskTimeline.map((item, idx) => (
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
              ))}
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
              Later we will connect these buttons to actual forms & APIs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
