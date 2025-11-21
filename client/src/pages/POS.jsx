import React from "react";

export default function POS() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">POS / Buffet</h1>
          <p className="text-sm text-slate-400">
            Point of Sale, restaurant, buffet, and additional services billing.
          </p>
        </div>
      </div>

      <div className="bg-cardBg border border-slate-800 rounded-2xl p-6">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">💳</div>
          <h2 className="text-lg font-semibold mb-2">POS & Buffet Module</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Integrated Point of Sale system for restaurants, room service,
            buffet management, and additional guest charges.
          </p>
        </div>
      </div>
    </div>
  );
}
