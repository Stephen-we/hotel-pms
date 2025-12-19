import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Login from "./pages/Login";

import Dashboard from "./pages/Dashboard";
import FrontDesk from "./pages/FrontDesk";
import Reservations from "./pages/Reservations";
import Rooms from "./pages/Rooms";
import Housekeeping from "./pages/Housekeeping";
import POS from "./pages/POS";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

import VerifyOtp from "./pages/auth/VerifyOtp";
import AdminDevices from "./pages/admin/AdminDevices";
import UserDevices from "./pages/profile/UserDevices";

import api from "./services/api";

// 🔐 Protected Route
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const res = await api.post("/auth/verify");
        setUser(res.data.user);
        console.log("✅ Auth verified:", res.data.user);
      } catch (err) {
        console.error("❌ Token invalid");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        delete api.defaults.headers.common["Authorization"];
      }
    }
    setLoading(false);
  };

  const logout = () => {
    localStorage.clear();
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <Routes>

      {/* 🌐 PUBLIC ROUTES */}
      <Route path="/login" element={<Login />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />

      {/* 🔐 PROTECTED ROUTES */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout user={user} logout={logout} />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="frontdesk" element={<FrontDesk />} />
        <Route path="reservations" element={<Reservations />} />
        <Route path="rooms" element={<Rooms />} />
        <Route path="housekeeping" element={<Housekeeping />} />
        <Route path="pos" element={<POS />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="admin/devices" element={<AdminDevices />} />
        <Route path="profile/devices" element={<UserDevices />} />
      </Route>

      {/* ❌ FALLBACK */}
      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>
  );
}
