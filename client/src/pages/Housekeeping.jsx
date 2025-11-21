import React from "react";

export default function Housekeeping() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Housekeeping</h1>
          <p className="text-sm text-slate-400">
            Room cleaning schedules, status updates, and staff management.
          </p>
        </div>
      </div>

      <div className="bg-cardBg border border-slate-800 rounded-2xl p-6">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🧹</div>
          <h2 className="text-lg font-semibold mb-2">Housekeeping Module</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Real-time housekeeping status, cleaning schedules, inspection reports,
            and staff assignment management.
          </p>
        </div>
      </div>
    </div>
  );
}
