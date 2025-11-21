import React from "react";

export default function StatCard({
  label,
  value,
  subLabel,
  trend,
  trendType = "up", // 'up' | 'down' | 'neutral'
}) {
  const trendColor =
    trendType === "up"
      ? "text-emerald-400"
      : trendType === "down"
      ? "text-red-400"
      : "text-slate-400";

  return (
    <div className="bg-cardBg border border-slate-800 rounded-2xl p-4 flex flex-col gap-2 shadow-sm hover:border-primary/60 transition">
      <div className="text-xs uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="flex items-baseline justify-between">
        <div className="text-2xl font-semibold">{value}</div>
        {trend && <div className={`text-xs font-medium ${trendColor}`}>{trend}</div>}
      </div>
      {subLabel && (
        <div className="text-xs text-slate-500 mt-1">{subLabel}</div>
      )}
    </div>
  );
}
