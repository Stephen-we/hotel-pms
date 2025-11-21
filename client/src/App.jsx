import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";

import Dashboard from "./pages/Dashboard";
import FrontDesk from "./pages/FrontDesk";
import Reservations from "./pages/Reservations";
import Rooms from "./pages/Rooms";
import Housekeeping from "./pages/Housekeeping";
import POS from "./pages/POS";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
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
