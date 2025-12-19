import React, { useEffect, useState } from "react";
import api from "../services/api";

/* ---------------------------------------
   UI STATUS OPTIONS (UNCHANGED)
--------------------------------------- */
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

/* ---------------------------------------
   HELPERS
--------------------------------------- */

// Convert backend status → UI status
function deriveUIStatus(room) {
  if (room.maintenanceStatus === "OUT_OF_ORDER") return "OUT_OF_ORDER";
  if (room.occupancyStatus === "OCCUPIED") return "OCCUPIED";
  if (room.housekeepingStatus === "DIRTY") return "VACANT_DIRTY";
  return "VACANT_CLEAN";
}

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
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatBed(room) {
  if (!room.baseBedType) return "-";
  return room.currentBedMode === "SPLIT"
    ? `${room.baseBedType} (Split)`
    : `${room.baseBedType} (Large)`;
}

/* ---------------------------------------
   MAIN COMPONENT
--------------------------------------- */
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
      if (statusFilter !== "ALL") params.status = statusFilter;
      if (typeFilter !== "ALL") params.type = typeFilter;
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

  const uniqueFloors = [...new Set(rooms.map((r) => r.floor))].sort(
    (a, b) => a - b
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">Rooms Overview</h1>
          <p className="text-sm text-slate-400">
            Live grid of rooms for Front Desk & Housekeeping.
          </p>
        </div>
        <button
          onClick={fetchRooms}
          className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900 text-xs hover:border-primary/60"
        >
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-cardBg border border-slate-800 rounded-2xl p-3 sm:p-4">
        <div className="flex flex-wrap gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs"
          >
            {TYPE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          <select
            value={floorFilter}
            onChange={(e) => setFloorFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs"
          >
            <option value="">All Floors</option>
            {uniqueFloors.map((f) => (
              <option key={f} value={f}>
                Floor {f}
              </option>
            ))}
          </select>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Room no."
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs flex-1 min-w-[140px]"
          />

          <button
            onClick={fetchRooms}
            className="px-4 py-1.5 rounded-xl bg-primary text-xs font-medium"
          >
            Apply
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
        {loading ? (
          <div className="py-10 text-center text-sm text-slate-400">
            Loading rooms…
          </div>
        ) : rooms.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-400">
            No rooms found
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
            {rooms.map((room) => {
              const uiStatus = deriveUIStatus(room);

              return (
                <div
                  key={room._id}
                  className={`rounded-2xl border px-3 py-2.5 text-xs flex flex-col gap-1 ${getStatusClasses(
                    uiStatus
                  )}`}
                >
                  <div className="flex justify-between text-[11px] opacity-80">
                    <span>Room</span>
                    <span>Floor {room.floor}</span>
                  </div>

                  <div className="text-lg font-semibold">{room.number}</div>

                  <div className="flex justify-between text-[11px]">
                    <span>{room.type}</span>
                    <span>{formatStatus(uiStatus)}</span>
                  </div>

                  <div className="text-[11px] opacity-90">
                    Guests:{" "}
                    <span className="font-semibold">
                      {room.currentOccupancy ?? 0}
                    </span>{" "}
                    / {room.maxOccupancy}
                  </div>

                  <div className="text-[11px] opacity-80">
                    Bed: <span className="font-medium">{formatBed(room)}</span>
                  </div>

                  {room.rate ? (
                    <div className="text-[11px] opacity-90">
                      ₹ <span className="font-semibold">{room.rate}</span>
                    </div>
                  ) : null}

                  {room.maintenanceStatus === "OUT_OF_ORDER" && (
                    <div className="text-[11px] text-red-300 font-medium">
                      ⚠ Maintenance
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
