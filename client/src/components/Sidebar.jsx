import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  FiHome,
  FiUsers,
  FiCalendar,
  FiKey,
  FiRefreshCw,
  FiShoppingCart,
  FiBarChart2,
  FiSettings,
} from "react-icons/fi";

const menuItems = [
  { path: "/", icon: FiHome, label: "Dashboard" },
  { path: "/frontdesk", icon: FiKey, label: "Front Desk" },
  { path: "/reservations", icon: FiCalendar, label: "Reservations" },
  { path: "/rooms", icon: FiHome, label: "Rooms" },
  { path: "/housekeeping", icon: FiRefreshCw, label: "Housekeeping" },
  { path: "/pos", icon: FiShoppingCart, label: "POS & Billing" },
  { path: "/reports", icon: FiBarChart2, label: "Reports" },
  { path: "/settings", icon: FiSettings, label: "Settings" },
];

export default function Sidebar({ user }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const getRoleColor = (role) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'from-purple-500 to-purple-600';
      case 'MANAGER': return 'from-blue-500 to-blue-600';
      case 'RECEPTIONIST': return 'from-green-500 to-green-600';
      case 'HOUSEKEEPING': return 'from-amber-500 to-amber-600';
      case 'RESTAURANT': return 'from-red-500 to-red-600';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  return (
    <div
      className={`bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className={`bg-gradient-to-r ${getRoleColor(user?.role)} w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg`}>
            H
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold tracking-tight">Hotel PMS</h1>
              {user && (
                <p className="text-xs text-slate-400 capitalize">
                  {user.role?.replace('_', ' ').toLowerCase()}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User info at bottom */}
      {user && !collapsed && (
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${getRoleColor(user.role).replace('from-', 'bg-').replace(' to-', '')}`}>
              {user.firstName?.[0]}{user.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-200 truncate">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-xs text-slate-400 capitalize truncate">
                {user.role?.replace('_', ' ').toLowerCase()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="m-4 p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
      >
        {collapsed ? "→" : "←"}
      </button>
    </div>
  );
}
