// // src/pages/Attendance.jsx
// import React, { useEffect, useMemo, useState } from "react";
// import Navbar from "../components/Navbar";
// import api from "../services/axiosInstance";
// import { useAuth } from "../context/AuthContext";
// import WebcamCapture from "../components/WebcamCapture";
// import { msToHMS } from "../utils/time";
// import { io } from "socket.io-client";

// function rangeFromFilter(filter) {
//   const now = new Date();
//   let from;

//   if (filter === "daily") {
//     from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//   } else if (filter === "weekly") {
//     from = new Date(now);
//     from.setDate(now.getDate() - 7);
//   } else if (filter === "monthly") {
//     from = new Date(now);
//     from.setDate(now.getDate() - 30);
//   } else if (filter === "yearly") {
//     from = new Date(now);
//     from.setDate(now.getDate() - 365);
//   } else {
//     from = new Date(0);
//   }

//   return { from: from.toISOString(), to: now.toISOString() };
// }

// export default function Attendance() {
//   const { user } = useAuth();
//   const isBoss = user?.role === "boss";

//   const [bossFilter, setBossFilter] = useState("daily");
//   const [bossEmpId, setBossEmpId] = useState("");
//   const [allRows, setAllRows] = useState([]);

//   const [action, setAction] = useState("checkin");
//   const [captured, setCaptured] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [mineRows, setMineRows] = useState([]);

//   // ⏱ Timer states
//   const [workTimer, setWorkTimer] = useState(null);
//   const [checkInTime, setCheckInTime] = useState(null);

//   // ✅ New states for inline messages
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");

//   // Load employee's last 7 days of attendance
//   async function loadMine() {
//     const now = new Date();
//     const from = new Date(now);
//     from.setDate(now.getDate() - 7);
//     const res = await api.get(`/employee/${user.empId}/attendance`, {
//       params: { from: from.toISOString(), to: now.toISOString() },
//     });
//     setMineRows(res.data || []);

//     if (res.data?.length) {
//       const latest = res.data[0];
//       if (latest.checkInTime && !latest.checkOutTime) {
//         setCheckInTime(new Date(latest.checkInTime));
//       } else {
//         setCheckInTime(null);
//         setWorkTimer(null);
//       }
//     }
//   }

//   useEffect(() => {
//     if (!isBoss) loadMine(); // employee only
//   }, [isBoss, user?.empId]);

//   const socket = useMemo(
//     () =>
//       io(import.meta.env.VITE_API_URL, {
//         path: "/socket.io",
//         transports: ["websocket", "polling"],
//       }),
//     []
//   );

//   useEffect(() => {
//     if (!isBoss) return;

//     const load = async () => {
//       const { from, to } = rangeFromFilter(bossFilter);
//       const params = { from, to };
//       if (bossEmpId) params.empId = bossEmpId;
//       const res = await api.get("/admin/attendance", { params });

//       // ✅ Filter Managers + HR
//       const managersAndHr = (res.data || []).filter((r) => {
//         const role = (r.employee?.role || "").toLowerCase().trim();
//         return role === "manager" || role === "hr";
//       });

//       setAllRows(managersAndHr);
//     };

//     load();
//     socket.on("attendanceUpdated", load);

//     return () => socket.off("attendanceUpdated", load);
//   }, [isBoss, bossFilter, bossEmpId, socket]);

//   const totalMsAll = useMemo(
//     () =>
//       (allRows || []).reduce((acc, r) => {
//         if (r.checkInTime && r.checkOutTime) {
//           acc += Math.max(0, new Date(r.checkOutTime) - new Date(r.checkInTime));
//         }
//         return acc;
//       }, 0),
//     [allRows]
//   );

//   // ⏱ Timer effect
//   useEffect(() => {
//     if (!checkInTime) return;
//     const interval = setInterval(() => {
//       const diff = new Date() - new Date(checkInTime);
//       const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
//       const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
//       const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
//       setWorkTimer(`${h}:${m}:${s}`);
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [checkInTime]);

//   async function submitPhoto(base64) {
//     try {
//       setLoading(true);
//       setMessage("");
//       setError("");

//       const blob = await (await fetch(base64)).blob();
//       const fd = new FormData();
//       fd.append("photo", blob, "capture.jpg");
//       const url = `/employee/${user.empId}/${action === "checkin" ? "checkin" : "checkout"}`;

//       const res = await api.post(url, fd);

//       // ✅ Inline success message instead of alert
//       setMessage(
//         res.data?.message ||
//           (action === "checkin"
//             ? "Checked in successfully ✅"
//             : "Checked out successfully ✅")
//       );

//       if (action === "checkin") {
//         setCheckInTime(new Date()); // start timer
//       } else {
//         setCheckInTime(null); // stop timer
//         setWorkTimer(null);
//       }

//       if (!isBoss) await loadMine();
//     } catch (err) {
//       setError(err?.response?.data?.message || "Failed ❌");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <>
//       <Navbar />
//       <main
//         style={{
//           maxWidth: "1100px",
//           margin: "30px auto",
//           padding: "0 16px",
//           fontFamily: "Arial, sans-serif",
//           color: "#333",
//         }}
//       >
//         {isBoss ? (
//           // ================= Boss Section =================
//           <section
//             style={{
//               background: "#fff",
//               padding: "20px",
//               borderRadius: "16px",
//               boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
//               marginBottom: "30px",
//             }}
//           >
//             <div
//               style={{
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//                 marginBottom: "16px",
//               }}
//             >
//               <h2 style={{ margin: 0, fontSize: "20px", color: "#2c3e50" }}>
//                 📊 HR Attendance
//               </h2>
//               <div style={{ display: "flex", gap: "10px" }}>
//                 <input
//                   placeholder="Filter by Emp ID"
//                   value={bossEmpId}
//                   onChange={(e) => setBossEmpId(e.target.value)}
//                   style={{
//                     padding: "8px 12px",
//                     borderRadius: "8px",
//                     border: "1px solid #ccc",
//                     fontSize: "14px",
//                   }}
//                 />
//                 <select
//                   value={bossFilter}
//                   onChange={(e) => setBossFilter(e.target.value)}
//                   style={{
//                     padding: "8px 12px",
//                     borderRadius: "8px",
//                     border: "1px solid #ccc",
//                     fontSize: "14px",
//                   }}
//                 >
//                   <option value="daily">Daily</option>
//                   <option value="weekly">Weekly</option>
//                   <option value="monthly">Monthly</option>
//                   <option value="yearly">Yearly</option>
//                   <option value="all">All</option>
//                 </select>
//               </div>
//             </div>
//             <table
//               style={{
//                 width: "100%",
//                 borderCollapse: "collapse",
//                 marginTop: "12px",
//                 fontSize: "14px",
//               }}
//             >
//               <thead>
//                 <tr style={{ background: "#f0f4f8" }}>
//                   {["#", "Emp ID", "Name", "Role", "Check-In", "Check-Out", "Worked"].map(
//                     (h, idx) => (
//                       <th
//                         key={idx}
//                         style={{
//                           border: "1px solid #ddd",
//                           padding: "10px",
//                           textAlign: "center",
//                         }}
//                       >
//                         {h}
//                       </th>
//                     )
//                   )}
//                 </tr>
//               </thead>
//               <tbody>
//                 {allRows.map((r, i) => {
//                   const worked =
//                     r.checkInTime && r.checkOutTime
//                       ? msToHMS(new Date(r.checkOutTime) - new Date(r.checkInTime))
//                       : "-";
//                   return (
//                     <tr
//                       key={r._id || i}
//                       style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}
//                     >
//                       <td
//                         style={{
//                           border: "1px solid #ddd",
//                           padding: "8px",
//                           textAlign: "center",
//                         }}
//                       >
//                         {i + 1}
//                       </td>
//                       <td
//                         style={{
//                           border: "1px solid #ddd",
//                           padding: "8px",
//                           textAlign: "center",
//                         }}
//                       >
//                         {r.employee?.empId}
//                       </td>
//                       <td style={{ border: "1px solid #ddd", padding: "8px" }}>
//                         {r.employee?.name}
//                       </td>
//                       <td
//                         style={{
//                           border: "1px solid #ddd",
//                           padding: "8px",
//                           textAlign: "center",
//                         }}
//                       >
//                         {r.employee?.role}
//                       </td>
//                       <td style={{ border: "1px solid #ddd", padding: "8px" }}>
//                         {r.checkInTime ? new Date(r.checkInTime).toLocaleString() : "-"}
//                       </td>
//                       <td style={{ border: "1px solid #ddd", padding: "8px" }}>
//                         {r.checkOutTime ? new Date(r.checkOutTime).toLocaleString() : "-"}
//                       </td>
//                       <td
//                         style={{
//                           border: "1px solid #ddd",
//                           padding: "8px",
//                           textAlign: "center",
//                           fontWeight: "bold",
//                         }}
//                       >
//                         {worked}
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//             <div style={{ marginTop: "12px", fontSize: "15px" }}>
//               <strong>Total Worked:</strong>{" "}
//               <span style={{ color: "#2e7d32" }}>{msToHMS(totalMsAll)}</span>
//             </div>
//           </section>
//         ) : (
//           // ================= Employee Section =================
//           <>
//             <section
//               style={{
//                 background: "#fff",
//                 padding: "20px",
//                 borderRadius: "16px",
//                 boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
//                 marginBottom: "30px",
//                 textAlign: "center",
//               }}
//             >
//               <h2 style={{ fontSize: "18px", marginBottom: "15px", color: "#2c3e50" }}>
//                 🕒 Check In / Check Out
//               </h2>

//               {/* Camera Section */}
//               <div
//                 style={{
//                   display: "flex",
//                   flexDirection: "column",
//                   alignItems: "center",
//                   gap: "16px",
//                   marginTop: "12px",
//                 }}
//               >
//                 <WebcamCapture
//                   onCapture={(b64) => setCaptured(b64)}
//                   style={{
//                     width: "500px",
//                     height: "350px",
//                     borderRadius: "12px",
//                     border: "3px solid #2e7d32",
//                   }}
//                 />

//                 {/* Action + Button Row */}
//                 <div
//                   style={{
//                     display: "grid",
//                     gridTemplateColumns: "150px auto",
//                     gap: "20px",
//                     alignItems: "center",
//                     marginTop: "10px",
//                   }}
//                 >
//                   <select
//                     value={action}
//                     onChange={(e) => {
//                       setAction(e.target.value);
//                       setCaptured(null); // 🔥 force new capture if user switches
//                       setMessage("");
//                       setError("");
//                     }}
//                     style={{
//                       padding: "10px 12px",
//                       borderRadius: "8px",
//                       border: "1px solid #ccc",
//                       fontSize: "14px",
//                       textAlign: "center",
//                     }}
//                   >
//                     <option value="checkin">Check In</option>
//                     <option value="checkout">Check Out</option>
//                   </select>
//                   <button
//                     disabled={!captured || loading}
//                     onClick={() => submitPhoto(captured)}
//                     style={{
//                       padding: "12px 24px",
//                       border: "none",
//                       borderRadius: "10px",
//                       background: "linear-gradient(135deg,#43a047,#2e7d32)",
//                       color: "#fff",
//                       cursor: captured && !loading ? "pointer" : "not-allowed",
//                       fontSize: "16px",
//                       fontWeight: "bold",
//                       opacity: !captured || loading ? 0.6 : 1,
//                       transform: "scale(1)",
//                       transition: "all 0.3s ease",
//                     }}
//                     onMouseOver={(e) =>
//                       (e.currentTarget.style.transform = "scale(1.05)")
//                     }
//                     onMouseOut={(e) =>
//                       (e.currentTarget.style.transform = "scale(1)")
//                     }
//                   >
//                     {loading ? "Processing…" : `🚀 Submit ${action}`}
//                   </button>
//                 </div>

//                 {/* ✅ Inline success / error messages */}
//                 {message && (
//                   <div
//                     style={{
//                       color: "green",
//                       marginTop: "10px",
//                       fontWeight: "bold",
//                     }}
//                   >
//                     {message}
//                   </div>
//                 )}
//                 {error && (
//                   <div
//                     style={{
//                       color: "red",
//                       marginTop: "10px",
//                       fontWeight: "bold",
//                     }}
//                   >
//                     {error}
//                   </div>
//                 )}
//               </div>

//               {/* ⏱ Live Timer */}
//               {checkInTime && (
//                 <div
//                   style={{
//                     marginTop: "15px",
//                     fontSize: "20px",
//                     fontWeight: "bold",
//                     color: "#2e7d32",
//                   }}
//                 >
//                   ⏱ Worked: {workTimer}
//                 </div>
//               )}
//             </section>

//             {/* Recent Attendance Table */}
//             <section
//               style={{
//                 background: "#fff",
//                 padding: "20px",
//                 borderRadius: "16px",
//                 boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
//                 marginBottom: "30px",
//               }}
//             >
//               <h3
//                 style={{
//                   fontSize: "18px",
//                   marginBottom: "10px",
//                   color: "#2c3e50",
//                 }}
//               >
//                 📅 My Recent Attendance
//               </h3>
//               <table
//                 style={{
//                   width: "100%",
//                   borderCollapse: "collapse",
//                   marginTop: "12px",
//                   fontSize: "14px",
//                 }}
//               >
//                 <thead>
//                   <tr style={{ background: "#f0f4f8" }}>
//                     {["#", "Check-In", "Check-Out", "Worked"].map((h, idx) => (
//                       <th
//                         key={idx}
//                         style={{
//                           border: "1px solid #ddd",
//                           padding: "10px",
//                           textAlign: "center",
//                         }}
//                       >
//                         {h}
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {mineRows.map((r, i) => {
//                     const worked =
//                       r.checkInTime && r.checkOutTime
//                         ? msToHMS(
//                             new Date(r.checkOutTime) - new Date(r.checkInTime)
//                           )
//                         : "-";
//                     return (
//                       <tr
//                         key={r._id || i}
//                         style={{
//                           background: i % 2 === 0 ? "#fff" : "#fafafa",
//                         }}
//                       >
//                         <td
//                           style={{
//                             border: "1px solid #ddd",
//                             padding: "8px",
//                             textAlign: "center",
//                           }}
//                         >
//                           {i + 1}
//                         </td>
//                         <td style={{ border: "1px solid #ddd", padding: "8px" }}>
//                           {r.checkInTime
//                             ? new Date(r.checkInTime).toLocaleString()
//                             : "-"}
//                         </td>
//                         <td style={{ border: "1px solid #ddd", padding: "8px" }}>
//                           {r.checkOutTime
//                             ? new Date(r.checkOutTime).toLocaleString()
//                             : "-"}
//                         </td>
//                         <td
//                           style={{
//                             border: "1px solid #ddd",
//                             padding: "8px",
//                             textAlign: "center",
//                             fontWeight: "bold",
//                           }}
//                         >
//                           {worked}
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </section>
//           </>
//         )}
//       </main>
//     </>
//   );
// }


// src/pages/Attendance.jsx
import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/axiosInstance";
import { useAuth } from "../context/AuthContext";
import WebcamCapture from "../components/WebcamCapture";
import { msToHMS } from "../utils/time";
import { io } from "socket.io-client";

function rangeFromFilter(filter) {
  const now = new Date();
  let from;
  if (filter === "daily") {
    from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (filter === "weekly") {
    from = new Date(now);
    from.setDate(now.getDate() - 7);
  } else if (filter === "monthly") {
    from = new Date(now);
    from.setDate(now.getDate() - 30);
  } else if (filter === "yearly") {
    from = new Date(now);
    from.setDate(now.getDate() - 365);
  } else {
    from = new Date(0);
  }
  return { from: from.toISOString(), to: now.toISOString() };
}

export default function Attendance() {
  const { user } = useAuth();
  const isBoss = user?.role === "boss";

  const [bossFilter, setBossFilter] = useState("daily");
  const [bossEmpId, setBossEmpId] = useState("");
  const [allRows, setAllRows] = useState([]);

  const [action, setAction] = useState("checkin");
  const [captured, setCaptured] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mineRows, setMineRows] = useState([]);

  const [workTimer, setWorkTimer] = useState(null);
  const [checkInTime, setCheckInTime] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadMine() {
    const now = new Date();
    const from = new Date(now);
    from.setDate(now.getDate() - 7);
    const res = await api.get(`/employee/${user.empId}/attendance`, {
      params: { from: from.toISOString(), to: now.toISOString() },
    });
    setMineRows(res.data || []);
    if (res.data?.length) {
      const latest = res.data[0];
      if (latest.checkInTime && !latest.checkOutTime) {
        setCheckInTime(new Date(latest.checkInTime));
      } else {
        setCheckInTime(null);
        setWorkTimer(null);
      }
    }
  }

  useEffect(() => {
    if (!isBoss) loadMine();
  }, [isBoss, user?.empId]);

  const socket = useMemo(
    () =>
      io(import.meta.env.VITE_API_URL, {
        path: "/socket.io",
        transports: ["websocket", "polling"],
      }),
    []
  );

  useEffect(() => {
    if (!isBoss) return;
    const load = async () => {
      const { from, to } = rangeFromFilter(bossFilter);
      const params = { from, to };
      if (bossEmpId) params.empId = bossEmpId;
      const res = await api.get("/admin/attendance", { params });
      const managersAndHr = (res.data || []).filter((r) => {
        const role = (r.employee?.role || "").toLowerCase().trim();
        return role === "manager" || role === "hr";
      });
      setAllRows(managersAndHr);
    };
    load();
    socket.on("attendanceUpdated", load);
    return () => socket.off("attendanceUpdated", load);
  }, [isBoss, bossFilter, bossEmpId, socket]);

  const totalMsAll = useMemo(
    () =>
      (allRows || []).reduce((acc, r) => {
        if (r.checkInTime && r.checkOutTime) {
          acc += Math.max(0, new Date(r.checkOutTime) - new Date(r.checkInTime));
        }
        return acc;
      }, 0),
    [allRows]
  );

  useEffect(() => {
    if (!checkInTime) return;
    const interval = setInterval(() => {
      const diff = new Date() - new Date(checkInTime);
      const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
      setWorkTimer(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [checkInTime]);

  async function submitPhoto(base64) {
    try {
      setLoading(true);
      setMessage("");
      setError("");
      if (!base64) {
        setError("Please capture a photo first.");
        setLoading(false);
        return;
      }
      const blob = await (await fetch(base64)).blob();
      const fd = new FormData();
      fd.append("photo", blob, "capture.jpg");
      const url = `/employee/${user.empId}/${
        action === "checkin" ? "checkin" : "checkout"
      }`;
      const res = await api.post(url, fd);
      setMessage(
        res.data?.message ||
          (action === "checkin"
            ? "Checked in successfully ✅"
            : "Checked out successfully ✅")
      );
      if (action === "checkin") {
        setCheckInTime(new Date());
      } else {
        setCheckInTime(null);
        setWorkTimer(null);
      }
      if (!isBoss) await loadMine();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed ❌");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="container">
        {isBoss ? (
          <section className="card">
            <div className="row between" style={{ marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
              <h2>📊 HR Attendance</h2>
              <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
                <input
                  placeholder="Filter by Emp ID"
                  value={bossEmpId}
                  onChange={(e) => setBossEmpId(e.target.value)}
                  style={{marginBottom:10,marginTop:10}}
                />
                <select
                  value={bossFilter}
                  onChange={(e) => setBossFilter(e.target.value)}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="all">All</option>
                </select>
              </div>
            </div>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Emp ID</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Check-In</th>
                    <th>Check-Out</th>
                    <th>Worked</th>
                  </tr>
                </thead>
                <tbody>
                  {allRows.map((r, i) => {
                    const worked =
                      r.checkInTime && r.checkOutTime
                        ? msToHMS(
                            new Date(r.checkOutTime) - new Date(r.checkInTime)
                          )
                        : "-";
                    return (
                      <tr key={r._id || i}>
                        <td>{i + 1}</td>
                        <td>{r.employee?.empId}</td>
                        <td>{r.employee?.name}</td>
                        <td>{r.employee?.role}</td>
                        <td>
                          {r.checkInTime
                            ? new Date(r.checkInTime).toLocaleString()
                            : "-"}
                        </td>
                        <td>
                          {r.checkOutTime
                            ? new Date(r.checkOutTime).toLocaleString()
                            : "-"}
                        </td>
                        <td>{worked}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 8 }}>
              <strong>Total Worked:</strong> {msToHMS(totalMsAll)}
            </div>
          </section>
        ) : (
          <>
            <section className="card" style={{ textAlign: "center"}}>
              <h2>🕒 Check In / Check Out</h2>

              <WebcamCapture
                onCapture={(b64) => setCaptured(b64)}
                style={{
                  maxWidth: "100%",
                  borderRadius: "12px",
                  border: "3px solid #2e7d32",
                }}
              />

              <div className="row" style={{ flexWrap: "wrap", gap: 12, marginTop: 12 }}>
                <select
                  value={action}
                  onChange={(e) => {
                    setAction(e.target.value);
                    setCaptured(null); // reset capture
                    setMessage("");
                    setError("");
                  }}
                  style={{ flex: "1 1 120px",width:150,marginRight:10,marginBottom:10 }}
                >
                  <option value="checkin">Check In</option>
                  <option value="checkout">Check Out</option>
                </select>

                <button
                  type="button" // ✅ prevents form reload
                  disabled={!captured || loading}
                  onClick={() => {
                    if (captured) {
                      submitPhoto(captured);
                    } else {
                      setError("Please capture a photo first.");
                    }
                  }}
                  className="btn btn-primary"
                  style={{ flex: "2 1 180px" }}
                >
                  {loading ? "Processing…" : `🚀 Submit ${action}`}
                </button>
              </div>

              {message && <div style={{ color: "green" }}>{message}</div>}
              {error && <div style={{ color: "red" }}>{error}</div>}

              {checkInTime && (
                <div style={{ marginTop: 12, color: "#2e7d32" }}>
                  ⏱ Worked: {workTimer}
                </div>
              )}
            </section>

            <section className="card" style={{ marginTop: 30,marginBottom: 30 }}>
              <h3>📅 My Recent Attendance</h3>
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Check-In</th>
                      <th>Check-Out</th>
                      <th>Worked</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mineRows.map((r, i) => {
                      const worked =
                        r.checkInTime && r.checkOutTime
                          ? msToHMS(
                              new Date(r.checkOutTime) -
                                new Date(r.checkInTime)
                            )
                          : "-";
                      return (
                        <tr key={r._id || i}>
                          <td>{i + 1}</td>
                          <td>
                            {r.checkInTime
                              ? new Date(r.checkInTime).toLocaleString()
                              : "-"}
                          </td>
                          <td>
                            {r.checkOutTime
                              ? new Date(r.checkOutTime).toLocaleString()
                              : "-"}
                          </td>
                          <td>{worked}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </>
  );
}
