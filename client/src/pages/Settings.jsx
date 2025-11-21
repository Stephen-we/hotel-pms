import React from "react";

export default function Settings() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-slate-400">
            System configuration, user management, and property settings.
          </p>
        </div>
      </div>

      <div className="bg-cardBg border border-slate-800 rounded-2xl p-6">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">⚙️</div>
          <h2 className="text-lg font-semibold mb-2">Settings Module</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            System configuration, user management, property settings,
            integration setup, and administrative controls.
          </p>
        </div>
      </div>
    </div>
  );
}
