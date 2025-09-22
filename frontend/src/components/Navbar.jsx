
// // src/components/Navbar.jsx
// import React from "react";
// import { NavLink } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// export default function Navbar() {
//   const { user, logout } = useAuth();
//   const role = (user?.role || "").toLowerCase();

//   const getActiveClass = ({ isActive }) => (isActive ? "active-link" : "");

//   return (
//     <header className="navbar">
//       <div className="brand">{user?.companyName || "Your Company Name"}</div>
//       <nav className="nav-links">
//         {/* Use `end` so these don't highlight on nested paths */}
//         <NavLink to="/home" className={getActiveClass} end>Home</NavLink>
//         <NavLink to="/attendance" className={getActiveClass} end>Attendance</NavLink>
//         <NavLink to="/leave" className={getActiveClass} end>Leave</NavLink>

//         {["hr","manager"].includes(role) && (
//           <>
//             {/* No `end` here; this is a distinct route */}
//             <NavLink to="/attendance/all" className={getActiveClass}>All Attendance</NavLink>
//             <NavLink to="/leave-approvals" className={getActiveClass}>Leave Approvals</NavLink>
//           </>
//         )}

//         {["boss","hr","manager"].includes(role) && (
//           <NavLink to="/admin" className={getActiveClass} end>Manage Employees</NavLink>
//         )}
//       </nav>
//       <div className="nav-right">
//         <span style={{ marginRight: 8 }}>
//           {user?.name} ({role || "guest"})
//         </span>
//         <button className="btn btn-outline" onClick={logout}>Logout</button>
//       </div>
//     </header>
//   );
// }



// src/components/Navbar.jsx
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const role = (user?.role || "").toLowerCase();

  const [isOpen, setIsOpen] = useState(false);

  const getActiveClass = ({ isActive }) => (isActive ? "active-link" : "");

  return (
    <header className="navbar">
      
      {/* Mobile toggle button */}
      <button
        className="menu-toggle"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {isOpen ? "✖" : "☰"}
      </button>
      <div className="brand">{user?.companyName || "Your Company Name"}</div>


      {/* Nav links */}
      <nav className={`nav-links ${isOpen ? "open" : ""}`} style={{width:isOpen ? "40%":""}}>
        <NavLink to="/home" className={getActiveClass} end>
          Home
        </NavLink>
        <NavLink to="/attendance" className={getActiveClass} end>
          Attendance
        </NavLink>
        <NavLink to="/leave" className={getActiveClass} end>
          Leave
        </NavLink>

        {["hr", "manager"].includes(role) && (
          <>
            <NavLink to="/attendance/all" className={getActiveClass}>
              All Attendance
            </NavLink>
            <NavLink to="/leave-approvals" className={getActiveClass}>
              Leave Approvals
            </NavLink>
          </>
        )}

        {["boss", "hr", "manager"].includes(role) && (
          <NavLink to="/admin" className={getActiveClass} end>
            Manage Employees
          </NavLink>
        )}
      </nav>

      <div className="nav-right">
        <span style={{ marginRight: 8 ,color: "black"}}>
          {user?.name} ({role || "guest"})
        </span>
        <button className="btn btn-outline" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
}
