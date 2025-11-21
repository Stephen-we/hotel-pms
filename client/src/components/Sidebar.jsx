import React from "react";
import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiUsers,
  FiKey,
  FiGrid,
  FiClipboard,
  FiTrendingUp,
  FiSettings,
} from "react-icons/fi";

const links = [
  { to: "/", label: "Dashboard", icon: <FiHome /> },
  { to: "/frontdesk", label: "Front Desk", icon: <FiKey /> },
  { to: "/reservations", label: "Reservations", icon: <FiUsers /> },
  { to: "/rooms", label: "Rooms", icon: <FiGrid /> },
  { to: "/housekeeping", label: "Housekeeping", icon: <FiClipboard /> },
  { to: "/pos", label: "POS / Buffet", icon: <FiTrendingUp /> },
  { to: "/reports", label: "Reports", icon: <FiTrendingUp /> },
  { to: "/settings", label: "Settings", icon: <FiSettings /> },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-sidebar border-r border-slate-800">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <div className="flex flex-col">
          <span className="text-lg font-semibold tracking-wide">
            Hotel PMS
          </span>
          <span className="text-xs text-slate-400">
            Property Management System
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition 
              ${
                isActive
                  ? "bg-primary text-white shadow-md"
                  : "text-slate-300 hover:bg-slate-900 hover:text-white"
              }`
            }
          >
            <span className="text-lg">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-slate-800 text-xs text-slate-400">
        © {new Date().getFullYear()} Your Hotel
      </div>
    </aside>
  );
}
