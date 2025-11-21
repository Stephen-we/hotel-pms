import React from "react";

export default function Reservations() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reservations</h1>
          <p className="text-sm text-slate-400">
            Manage bookings, room availability, and reservation calendar.
          </p>
        </div>
      </div>

      <div className="bg-cardBg border border-slate-800 rounded-2xl p-6">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📅</div>
          <h2 className="text-lg font-semibold mb-2">Reservations Module</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Complete reservation management system with calendar view,
            booking engine integration, and guest communication tools.
          </p>
        </div>
      </div>
    </div>
  );
}
