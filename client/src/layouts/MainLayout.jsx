import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function MainLayout({ user, logout }) {
  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col">
        <Topbar user={user} logout={logout} />
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 bg-slate-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
