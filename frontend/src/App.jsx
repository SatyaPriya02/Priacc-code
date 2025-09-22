
// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import Home from "./pages/Home";
import Attendance from "./pages/Attendance";
import AttendanceHistory from "./pages/AttendanceHistory";
import Leave from "./pages/Leave";
import AdminDashboard from "./pages/AdminDashboard";
import HrManagerAttendance from "./pages/HrManagerAttendance";
import EmployeeLeaveApprovals from "./pages/EmployeeLeaveApprovals";

import ProtectedRoute from "./routes/ProtectedRoute";
import Layout from "./components/Layout"; // make sure this has `export default`

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected area: everything inside Layout (background + navbar) */}
      <Route element={<Layout />}>
        {/* Employee + HR + Manager + Boss */}
        <Route
          path="/home"
          element={
            <ProtectedRoute roles={["employee", "boss", "hr", "manager"]}>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute roles={["employee", "boss", "hr", "manager"]}>
              <Attendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute roles={["employee", "boss", "hr", "manager"]}>
              <AttendanceHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leave"
          element={
            <ProtectedRoute roles={["employee", "boss", "hr", "manager"]}>
              <Leave />
            </ProtectedRoute>
          }
        />

        {/* Boss/HR/Manager only (matches Navbar -> "Manage Employees") */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["boss", "hr", "manager"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Boss/HR/Manager for All Attendance (Navbar shows for hr/manager too) */}
        <Route
          path="/attendance/all"
          element={
            <ProtectedRoute roles={["boss", "hr", "manager"]}>
              <HrManagerAttendance />
            </ProtectedRoute>
          }
        />

        {/* HR/Manager only (matches Navbar -> "Leave Approvals") */}
        <Route
          path="/leave-approvals"
          element={
            <ProtectedRoute roles={["hr", "manager"]}>
              <EmployeeLeaveApprovals />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}
