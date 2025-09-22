// src/components/Layout.jsx
import React from "react";
import { Outlet } from "react-router-dom";

export default function Layout() {   // ✅ must have export default
  return (
    <div
      style={{
        backgroundImage: "url('/forgotbg.jpg')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh" 
      }}
    >
      <Outlet />
    </div>
  );
}
