
// // src/pages/EmployeeLeaveApprovals.jsx
// import React, { useEffect, useState, useMemo } from "react";
// import Navbar from "../components/Navbar";
// import { useAuth } from "../context/AuthContext";
// import api from "../services/axiosInstance";
// import "./leave.css";
// import { io } from "socket.io-client";

// const socket = io(import.meta.env.VITE_API_URL, {
//   path: "/api/socket.io",
//   transports: ["websocket", "polling"],
// });

// export default function EmployeeLeaveApprovals() {
//   const { user } = useAuth();
//   const role = String(user?.role ?? "").trim().toLowerCase();
//   const isHRorManager = role === "hr" || role === "manager";

//   const [inbox, setInbox] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [actingId, setActingId] = useState(null);
//   const [err, setErr] = useState("");
//   const [notes, setNotes] = useState({});
//   const [showAll, setShowAll] = useState(false); // ✅ used consistently

//   const daysBetween = (f, t) => {
//     if (!f || !t) return "-";
//     const from = new Date(f);
//     const to = new Date(t);
//     const ms = to.setHours(0, 0, 0, 0) - from.setHours(0, 0, 0, 0);
//     if (isNaN(ms)) return "-";
//     return Math.floor(ms / (24 * 60 * 60 * 1000)) + 1;
//   };

//   const load = async () => {
//     if (!isHRorManager) return;
//     setLoading(true);
//     setErr("");
//     try {
//       const params = showAll ? {} : { status: "Pending" };
//       const { data } = await api.get("/leave/inbox", { params });
//       setInbox(Array.isArray(data) ? data : []);
//     } catch (e) {
//       setErr(e?.response?.data?.message || e?.message || "Failed to load requests");
//       setInbox([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const act = async (id, action) => {
//     const newStatus = action === "approve" ? "Approved" : "Rejected";
//     const note = (notes[id] || "").trim();

//     setActingId(id);
//     const prev = inbox;
//     setInbox((list) =>
//       list.map((r) =>
//         r._id === id
//           ? {
//               ...r,
//               status: newStatus,
//               _justDecided: true,
//             }
//           : r
//       )
//     );

//     try {
//       if (action === "approve") {
//         await api.post(`/leave/${id}/approve`, { note });
//       } else {
//         await api.post(`/leave/${id}/reject`, { note });
//       }
//       setNotes((n) => {
//         const c = { ...n };
//         delete c[id];
//         return c;
//       });
//     } catch (e) {
//       setInbox(prev);
//       alert(e?.response?.data?.message || "Action failed");
//     } finally {
//       setActingId(null);
//     }
//   };

//   useEffect(() => {
//     load();
//     socket.on("leaveUpdated", load);
//     socket.on("leaveCreated", load);
//     return () => {
//       socket.off("leaveUpdated", load);
//       socket.off("leaveCreated", load);
//     };
//   }, [role, showAll]);

//   const visibleRows = useMemo(() => {
//     if (showAll) return inbox || [];
//     return (inbox || []).filter((r) => (r.status || "Pending") === "Pending" || r._justDecided);
//   }, [inbox, showAll]);

//   return (
//     <>
//       <Navbar />
//       <main className="card" style={{ padding: 16 , marginLeft:150, marginRight:150, marginTop:20}}>
//         <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//           <h2 style={{ marginBottom: 12, marginTop: 0 }}>
//             {showAll ? "Processed Leave Requests" : "Pending Leave Requests"}
//           </h2>
//           <button
//             className="btn btn-outline"
//             style={{ marginLeft: "auto" }}
//             onClick={() => setShowAll((prev) => !prev)} // ✅ toggle
//           >
//             {showAll ? "Show Pending" : "Show Processed"}
//           </button>
//           <button className="btn btn-outline" onClick={load}>
//             Refresh
//           </button>
//         </div>

//         {!isHRorManager && (
//           <p style={{ color: "#a00" }}>
//             Forbidden: Only HR or Manager can access this page.
//           </p>
//         )}

//         {isHRorManager && (
//           <>
//             {loading && <div>Loading…</div>}
//             {err && <p className="error">{err}</p>}

//             <table className="leave-table">
//               <thead>
//                 <tr>
//                   <th>Employee ID</th>
//                   <th>Employee Name</th>
//                   <th>Requester Role</th>
//                   <th>From</th>
//                   <th>To</th>
//                   <th>Days</th>
//                   <th>Reason</th>
//                   <th>Status</th>
//                   <th>Applied On</th>
//                   <th style={{ minWidth: 220 }}>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {(visibleRows || []).map((r) => {
//                   const emp = r.employeeId || {};
//                   const status = r.status || "Pending";
//                   const isPending = status === "Pending";
//                   return (
//                     <tr key={r._id}>
//                       <td>{emp?.empId || "-"}</td>
//                       <td>{emp?.name || "-"}</td>
//                       <td>{emp?.role || "-"}</td>
//                       <td>{r.fromDate ? new Date(r.fromDate).toLocaleDateString() : "-"}</td>
//                       <td>{r.toDate ? new Date(r.toDate).toLocaleDateString() : "-"}</td>
//                       <td>{daysBetween(r.fromDate, r.toDate)}</td>
//                       <td>{r.reason || "-"}</td>
//                       <td>
//                         <span className={`status-badge status-${status.toLowerCase()}`}>
//                           {status}
//                         </span>
//                       </td>
//                       <td>{r.createdAt ? new Date(r.createdAt).toLocaleString() : "-"}</td>
//                       <td>
//                         {isPending ? (
//                           <>
//                             <button
//                               className="btn"
//                               disabled={actingId === r._id}
//                               onClick={() => act(r._id, "approve")}
//                             >
//                               {actingId === r._id ? "Approving…" : "Approve"}
//                             </button>{" "}
//                             <button
//                               className="btn btn-danger"
//                               disabled={actingId === r._id}
//                               onClick={() => act(r._id, "reject")}
//                             >
//                               {actingId === r._id ? "Rejecting…" : "Reject"}
//                             </button>
//                           </>
//                         ) : (
//                           <em style={{ opacity: 0.7 }}>No actions</em>
//                         )}
//                       </td>
//                     </tr>
//                   );
//                 })}

//                 {!loading && !err && (visibleRows?.length || 0) === 0 && (
//                   <tr>
//                     <td colSpan={11} style={{ textAlign: "center", padding: 16 }}>
//                       {showAll ? "No requests." : "No pending Employee requests. 🎉"}
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </>
//         )}
//       </main>
//     </>
//   );
// }



// src/pages/EmployeeLeaveApprovals.jsx
import React, { useEffect, useState, useMemo } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import api from "../services/axiosInstance";
import "./leave.css";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL, {
  path: "/api/socket.io",
  transports: ["websocket", "polling"],
});

export default function EmployeeLeaveApprovals() {
  const { user } = useAuth();
  const role = String(user?.role ?? "").trim().toLowerCase();
  const isHRorManager = role === "hr" || role === "manager";

  const [inbox, setInbox] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actingId, setActingId] = useState(null);
  const [err, setErr] = useState("");
  const [notes, setNotes] = useState({});
  const [showAll, setShowAll] = useState(false);

  const daysBetween = (f, t) => {
    if (!f || !t) return "-";
    const from = new Date(f);
    const to = new Date(t);
    const ms = to.setHours(0, 0, 0, 0) - from.setHours(0, 0, 0, 0);
    if (isNaN(ms)) return "-";
    return Math.floor(ms / (24 * 60 * 60 * 1000)) + 1;
  };

  const load = async () => {
    if (!isHRorManager) return;
    setLoading(true);
    setErr("");
    try {
      const params = showAll ? {} : { status: "Pending" };
      const { data } = await api.get("/leave/inbox", { params });
      setInbox(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Failed to load requests");
      setInbox([]);
    } finally {
      setLoading(false);
    }
  };

  const act = async (id, action) => {
    const newStatus = action === "approve" ? "Approved" : "Rejected";
    const note = (notes[id] || "").trim();
    setActingId(id);
    const prev = inbox;
    setInbox((list) =>
      list.map((r) =>
        r._id === id ? { ...r, status: newStatus, _justDecided: true } : r
      )
    );
    try {
      if (action === "approve") {
        await api.post(`/leave/${id}/approve`, { note });
      } else {
        await api.post(`/leave/${id}/reject`, { note });
      }
      setNotes((n) => {
        const c = { ...n };
        delete c[id];
        return c;
      });
    } catch (e) {
      setInbox(prev);
      alert(e?.response?.data?.message || "Action failed");
    } finally {
      setActingId(null);
    }
  };

  useEffect(() => {
    load();
    socket.on("leaveUpdated", load);
    socket.on("leaveCreated", load);
    return () => {
      socket.off("leaveUpdated", load);
      socket.off("leaveCreated", load);
    };
  }, [role, showAll]);

  const visibleRows = useMemo(() => {
    if (showAll) return inbox || [];
    return (inbox || []).filter(
      (r) => (r.status || "Pending") === "Pending" || r._justDecided
    );
  }, [inbox, showAll]);

  return (
    <>
      <Navbar />
      <main className="card card1">
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 8,
            marginBottom: 10,
          }}
        >
          <h2 style={{ margin: 0, flex: "1 1 auto" }}>
            {showAll ? "Processed Leave Requests" : "Pending Leave Requests"}
          </h2>
          <button
            className="btn btn-outline"
            onClick={() => setShowAll((prev) => !prev)}
          >
            {showAll ? "Show Pending" : "Show Processed"}
          </button>
          <button className="btn btn-outline" onClick={load}>
            Refresh
          </button>
        </div>

        {!isHRorManager && (
          <p style={{ color: "#a00" }}>
            Forbidden: Only HR or Manager can access this page.
          </p>
        )}

        {isHRorManager && (
          <>
            {loading && <div>Loading…</div>}
            {err && <p className="error">{err}</p>}

            <div className="table-wrapper">
              <table className="leave-table">
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Days</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Applied On</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(visibleRows || []).map((r) => {
                    const emp = r.employeeId || {};
                    const status = r.status || "Pending";
                    const isPending = status === "Pending";
                    return (
                      <tr key={r._id}>
                        <td>{emp?.empId || "-"}</td>
                        <td>{emp?.name || "-"}</td>
                        <td>{emp?.role || "-"}</td>
                        <td>
                          {r.fromDate
                            ? new Date(r.fromDate).toLocaleDateString()
                            : "-"}
                        </td>
                        <td>
                          {r.toDate
                            ? new Date(r.toDate).toLocaleDateString()
                            : "-"}
                        </td>
                        <td>{daysBetween(r.fromDate, r.toDate)}</td>
                        <td>{r.reason || "-"}</td>
                        <td>
                          <span className={`status-badge status-${status.toLowerCase()}`}>
                            {status}
                          </span>
                        </td>
                        <td>
                          {r.createdAt
                            ? new Date(r.createdAt).toLocaleString()
                            : "-"}
                        </td>
                        <td>
                          {isPending ? (
                            <>
                              <button
                                className="btn"
                                disabled={actingId === r._id}
                                onClick={() => act(r._id, "approve")}
                              >
                                {actingId === r._id ? "Approving…" : "Approve"}
                              </button>{" "}
                              <button
                                className="btn btn-danger"
                                disabled={actingId === r._id}
                                onClick={() => act(r._id, "reject")}
                              >
                                {actingId === r._id ? "Rejecting…" : "Reject"}
                              </button>
                            </>
                          ) : (
                            <em style={{ opacity: 0.7 }}>No actions</em>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {!loading && !err && (visibleRows?.length || 0) === 0 && (
                    <tr>
                      <td colSpan={10} style={{ textAlign: "center", padding: 12 }}>
                        {showAll ? "No requests." : "No pending requests 🎉"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              
            </div>
          </>
        )}
      </main>
    </>
  );
}
