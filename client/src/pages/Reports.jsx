import React from "react";

export default function Reports() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reports & Analytics</h1>
          <p className="text-sm text-slate-400">
            Business intelligence, occupancy reports, and financial analytics.
          </p>
        </div>
      </div>

      <div className="bg-cardBg border border-slate-800 rounded-2xl p-6">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📊</div>
          <h2 className="text-lg font-semibold mb-2">Reports Module</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Comprehensive reporting and analytics including occupancy reports,
            revenue analysis, guest statistics, and business intelligence.
          </p>
        </div>
      </div>
    </div>
  );
}
