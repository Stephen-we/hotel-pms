import React, { useEffect, useState } from "react";
import api from "../services/api";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Status" },
  { value: "VACANT_CLEAN", label: "Vacant • Clean" },
  { value: "VACANT_DIRTY", label: "Vacant • Dirty" },
  { value: "OCCUPIED", label: "Occupied" },
  { value: "OUT_OF_ORDER", label: "Out of Order" },
];

const TYPE_OPTIONS = [
  { value: "ALL", label: "All Types" },
  { value: "DELUXE", label: "Deluxe" },
  { value: "SUPERIOR", label: "Superior" },
  { value: "SUITE", label: "Suite" },
  { value: "FAMILY", label: "Family" },
];

function getStatusClasses(status) {
  switch (status) {
    case "VACANT_CLEAN":
      return "bg-emerald-500/10 border-emerald-500/60 text-emerald-200";
    case "VACANT_DIRTY":
      return "bg-amber-500/10 border-amber-500/60 text-amber-200";
    case "OCCUPIED":
      return "bg-sky-500/10 border-sky-500/60 text-sky-200";
    case "OUT_OF_ORDER":
      return "bg-red-500/10 border-red-500/60 text-red-200";
    default:
      return "bg-slate-700/40 border-slate-600 text-slate-200";
  }
}

function formatStatus(status) {
  return status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [floorFilter, setFloorFilter] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError("");
      const params = {};
      if (statusFilter && statusFilter !== "ALL") params.status = statusFilter;
      if (typeFilter && typeFilter !== "ALL") params.type = typeFilter;
      if (floorFilter) params.floor = floorFilter;
      if (search) params.search = search;

      const res = await api.get("/rooms", { params });
      setRooms(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load rooms. Please check backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const uniqueFloors = [...new Set(rooms.map((r) => r.floor))].sort((a, b) => a - b);

  const handleFilterChange = (fn) => (e) => {
    fn(e.target.value);
  };

  const handleApplyFilters = () => {
    fetchRooms();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">Rooms Overview</h1>
          <p className="text-sm text-slate-400">
            Live grid of all rooms with color-coded status for Front Office & Housekeeping.
          </p>
        </div>
        <button
          onClick={fetchRooms}
          className="self-start sm:self-auto px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900 text-xs text-slate-200 hover:border-primary/60 hover:bg-slate-900/80"
        >
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-cardBg border border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col gap-3">
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {/* Status */}
          <div className="flex flex-col gap-1 text-xs">
            <span className="text-slate-400">Status</span>
            <select
              value={statusFilter}
              onChange={handleFilterChange(setStatusFilter)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs sm:text-sm outline-none"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div className="flex flex-col gap-1 text-xs">
            <span className="text-slate-400">Room Type</span>
            <select
              value={typeFilter}
              onChange={handleFilterChange(setTypeFilter)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs sm:text-sm outline-none"
            >
              {TYPE_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Floor */}
          <div className="flex flex-col gap-1 text-xs">
            <span className="text-slate-400">Floor</span>
            <select
              value={floorFilter}
              onChange={handleFilterChange(setFloorFilter)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs sm:text-sm outline-none min-w-[80px]"
            >
              <option value="">All Floors</option>
              {uniqueFloors.map((f) => (
                <option key={f} value={f}>
                  Floor {f}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="flex flex-col gap-1 text-xs flex-1 min-w-[140px]">
            <span className="text-slate-400">Room No.</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search room number"
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs sm:text-sm outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleApplyFilters}
            className="px-4 py-1.5 rounded-xl bg-primary text-xs sm:text-sm font-medium hover:bg-primaryDark transition"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {error && (
        <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/40 rounded-xl px-3 py-2">
          {error}
        </div>
      )}

      {/* Rooms Grid */}
      <div className="bg-cardBg border border-slate-800 rounded-2xl p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold">
            Total Rooms:{" "}
            <span className="text-slate-100">{rooms.length}</span>
          </div>
          <div className="hidden sm:flex gap-2 text-[11px] text-slate-400">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/40">
              Vacant Clean
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/40">
              Vacant Dirty
            </span>
            <span className="px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/40">
              Occupied
            </span>
            <span className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/40">
              Out of Order
            </span>
          </div>
        </div>

        {loading ? (
          <div className="py-10 text-center text-sm text-slate-400">
            Loading rooms…
          </div>
        ) : rooms.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-400">
            No rooms found. Make sure backend is running and rooms are seeded.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
            {rooms.map((room) => (
              <div
                key={room._id}
                className={`rounded-2xl border px-3 py-2.5 text-xs sm:text-sm flex flex-col gap-1 shadow-sm ${getStatusClasses(
                  room.status
                )}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wide opacity-80">
                    Room
                  </span>
                  <span className="text-[11px]">
                    Floor {room.floor ?? "-"}
                  </span>
                </div>
                <div className="text-lg sm:text-xl font-semibold leading-none">
                  {room.number}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[11px] opacity-80">
                    {room.type || "-"}
                  </span>
                  <span className="text-[11px] font-medium">
                    {formatStatus(room.status)}
                  </span>
                </div>
                {room.rate ? (
                  <div className="text-[11px] mt-1 opacity-90">
                    Avg Rate: <span className="font-semibold">₹ {room.rate}</span>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
