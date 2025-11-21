import React from "react";
import { FiBell, FiSearch, FiUser } from "react-icons/fi";

export default function Topbar() {
  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="flex items-center gap-3">
        {/* For mobile, small title */}
        <span className="md:hidden text-lg font-semibold">Hotel PMS</span>
        <div className="hidden md:flex items-center gap-2 text-sm text-slate-400">
          <span className="font-medium text-slate-100">Welcome back,</span>
          <span>Front Office Manager</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center bg-slate-900 border border-slate-800 rounded-full px-3 py-1.5 text-sm">
          <FiSearch className="mr-2 text-slate-500" />
          <input
            type="text"
            placeholder="Search guest, room, reservation..."
            className="bg-transparent outline-none text-slate-200 placeholder-slate-500 w-56"
          />
        </div>

        <button className="relative p-2 rounded-full border border-slate-800 hover:bg-slate-900">
          <FiBell />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-800 bg-slate-900 cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primaryDark flex items-center justify-center text-xs font-bold">
            FM
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-xs text-slate-400">Logged in as</span>
            <span className="text-sm font-semibold text-slate-100">
              Front Manager
            </span>
          </div>
          <FiUser className="hidden sm:block text-slate-500 ml-1" />
        </div>
      </div>
    </header>
  );
}
