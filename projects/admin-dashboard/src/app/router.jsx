import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../pages/MainLayout.jsx";
import DashboardPage from "../pages/DashboardPage.jsx";
import UsersPage from "../pages/UsersPage.jsx";
import SettingsPage from "../pages/SettingsPage.jsx";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
