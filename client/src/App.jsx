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
import api from "./services/api";
import VerifyOtp from "./pages/auth/VerifyOtp";
import AdminDevices from "./pages/admin/AdminDevices";
import UserDevices from "./pages/profile/UserDevices";


// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      try {
        // Set authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Verify token with server
        const response = await api.post('/auth/verify');
        setUser(response.data.user);
        console.log("✅ User loaded:", response.data.user);
      } catch (err) {
        console.error("❌ Auth verification failed:", err);
        // Token invalid, clear storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
      }
    }
    
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    console.log("✅ User logged out");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={!user ? <Login /> : <Navigate to="/" replace />} 
      />
      
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <MainLayout user={user} logout={logout} />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard user={user} />} />
        <Route path="frontdesk" element={<FrontDesk user={user} />} />
        <Route path="reservations" element={<Reservations user={user} />} />
        <Route path="rooms" element={<Rooms user={user} />} />
        <Route path="housekeeping" element={<Housekeeping user={user} />} />
        <Route path="pos" element={<POS user={user} />} />
        <Route path="reports" element={<Reports user={user} />} />
        <Route path="settings" element={<Settings user={user} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/admin/devices" element={<AdminDevices />} />
        <Route path="/profile/devices" element={<UserDevices />} />
        </Route>
    </Routes>
  );
}
