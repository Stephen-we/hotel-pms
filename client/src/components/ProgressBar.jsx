import React from "react";

export default function ProgressBar({ value, labelLeft, labelRight }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-slate-400">
        <span>{labelLeft}</span>
        <span>{labelRight}</span>
      </div>
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-primaryDark"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
