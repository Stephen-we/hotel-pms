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
      } catch (err) {
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
        <Route index element={<Dashboard />} />
        <Route path="frontdesk" element={<FrontDesk />} />
        <Route path="reservations" element={<Reservations />} />
        <Route path="rooms" element={<Rooms />} />
        <Route path="housekeeping" element={<Housekeeping />} />
        <Route path="pos" element={<POS />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
