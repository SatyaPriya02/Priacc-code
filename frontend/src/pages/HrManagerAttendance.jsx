
// // src/pages/HrManagerAttendance.jsx
// import React, { useEffect, useMemo, useState } from "react";
// import Navbar from "../components/Navbar"; // If Layout already renders Navbar, remove this line + <Navbar />
// import api from "../services/axiosInstance";
// import { useAuth } from "../context/AuthContext";
// import { msToHMS } from "../utils/time";
// import * as XLSX from "xlsx";
// import { io } from "socket.io-client";


// function rangeFromFilter(filter) {
//   const now = new Date();
//   let from;

//   if (filter === "daily") {
//     // Start of today
//     from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//   } else if (filter === "weekly") {
//     // Last 7 days
//     from = new Date(now);
//     from.setDate(now.getDate() - 7);
//   } else if (filter === "monthly") {
//     // Last 30 days
//     from = new Date(now);
//     from.setDate(now.getDate() - 30);
//   } else if (filter === "yearly") {
//     // Last 365 days
//     from = new Date(now);
//     from.setDate(now.getDate() - 365);
//   } else {
//     // Default: from the beginning of time
//     from = new Date(0);
//   }

//   return { from: from.toISOString(), to: now.toISOString() };
// }


// export default function HrManagerAttendance() {
//   const { user } = useAuth();
//   const [filter, setFilter] = useState("weekly");
//   const [empId, setEmpId] = useState("");
//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(false);


//   const socket = useMemo(
//   () =>
//     io(import.meta.env.VITE_API_URL, {
//       path: "/socket.io",
//       transports: ["websocket", "polling"],
//     }),
//   []
// );


//   // 🔥 Extract loadData so we can reuse
//   async function loadData() {
//     if (!["hr", "manager"].includes((user?.role || "").toLowerCase())) return;
//     setLoading(true);
//     try {
//       const { from, to } = rangeFromFilter(filter);
//       const res = await api.get("/admin/attendance", {
//         params: { from, to, empId: empId || undefined },
//       });
//       setRows(res.data || []);
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//   loadData();

//   // 🔥 Listen for live updates
//   socket.on("attendanceUpdated", loadData);

//   return () => socket.off("attendanceUpdated", loadData);
//   }, [filter, empId, user?.role]);

//   useEffect(() => {
//     if (!["hr", "manager"].includes((user?.role || "").toLowerCase())) return;
//     const load = async () => {
//       setLoading(true);
//       try {
//         const { from, to } = rangeFromFilter(filter);
//         const res = await api.get("/admin/attendance", {
//           params: { from, to, empId: empId || undefined },
//         });
//         setRows(res.data || []);
//       } finally {
//         setLoading(false);
//       }
//     };
//     load();
//   }, [filter, empId, user?.role]);

//   const totalMs = useMemo(
//     () =>
//       (rows || []).reduce((acc, r) => {
//         if (r.checkInTime && r.checkOutTime) {
//           acc += Math.max(0, new Date(r.checkOutTime) - new Date(r.checkInTime));
//         }
//         return acc;
//       }, 0),
//     [rows]
//   );

//   function toLocalDateTime(d) {
//     if (!d) return "";
//     const dt = new Date(d);
//     return Number.isNaN(dt.getTime()) ? "" : dt.toLocaleString("en-IN");
//   }

//   function downloadCSV() {
//     const header = [
//       "Emp ID",
//       "Name",
//       "Role",
//       "Check-In Time",
//       "Check-Out Time",
//       "Worked (H:M:S)",
//     ];
//     const body = (rows || []).map((r) => {
//       const worked =
//         r.checkInTime && r.checkOutTime
//           ? msToHMS(new Date(r.checkOutTime) - new Date(r.checkInTime))
//           : "-";
//       return [
//         r.employee?.empId || "",
//         r.employee?.name || "",
//         r.employee?.role || "",
//         r.checkInTime ? new Date(r.checkInTime).toLocaleString() : "",
//         r.checkOutTime ? new Date(r.checkOutTime).toLocaleString() : "",
//         worked,
//       ];
//     });

//     const csv = [header, ...body]
//       .map((row) =>
//         row
//           .map((cell) => {
//             const s = String(cell ?? "");
//             if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
//             return s;
//           })
//           .join(",")
//       )
//       .join("\n");

//     const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     const stamp = new Date().toISOString().replace(/[:.]/g, "-");
//     a.download = `attendance_${filter}${empId ? `_${empId}` : ""}_${stamp}.csv`;
//     a.click();
//     URL.revokeObjectURL(url);
//   }

//   // 🔧 Flatten each row for Excel (no nested objects)
//   function flattenRow(r, idx) {
//     const worked =
//       r.checkInTime && r.checkOutTime
//         ? msToHMS(new Date(r.checkOutTime) - new Date(r.checkInTime))
//         : "-";
//     return {
//       SNo: idx + 1,
//       EmpID: r.employee?.empId || "",
//       Name: r.employee?.name || "",
//       Role: r.employee?.role || "",
//       CheckIn: toLocalDateTime(r.checkInTime),
//       CheckOut: toLocalDateTime(r.checkOutTime),
//       Worked: worked,
//     };
//   }

//   function downloadXLSX() {
//     if (!rows?.length) {
//       alert("No data to export.");
//       return;
//     }

//     // 1) Prepare flat data
//     const data = rows.map((r, i) => flattenRow(r, i));

//     // 2) Create worksheet & set column widths
//     const ws = XLSX.utils.json_to_sheet(data);
//     ws["!cols"] = [
//       { wch: 6 },  // SNo
//       { wch: 12 }, // EmpID
//       { wch: 20 }, // Name
//       { wch: 12 }, // Role
//       { wch: 22 }, // CheckIn
//       { wch: 22 }, // CheckOut
//       { wch: 14 }, // Worked
//     ];

//     // 3) Workbook + save
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Attendance");
//     const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
//     XLSX.writeFile(wb, `attendance_${filter}${empId ? `_${empId}` : ""}_${stamp}.xlsx`);
//   }

//   return (
//     <>
//       <Navbar />
//       <main className="container" style={{ padding: 16 }}>
//         <section className="card" style={{ padding: 16 }}>
//           <div className="row between" style={{ alignItems: "center", gap: 8 }}>
//             <h2 style={{ margin: 0 }}>All Employees — Attendance</h2>
//             <div className="row" style={{ gap: 8 }}>
//               <input
//                 placeholder="Filter by Emp ID"
//                 value={empId}
//                 onChange={(e) => setEmpId(e.target.value)}
//               />
//               <select value={filter} onChange={(e) => setFilter(e.target.value)}>
//                 <option value="daily">Daily</option>
//                 <option value="weekly">Weekly</option>
//                 <option value="monthly">Monthly</option>
//                 <option value="yearly">Yearly</option>
//                 <option value="all">All</option>
//               </select>
//               <button className="btn" onClick={downloadCSV}>Download CSV</button>
//               <button className="btn btn-secondary" onClick={downloadXLSX} disabled={loading || !rows.length}>
//                 {loading ? "Preparing…" : "Download Excel"}
//               </button>
//             </div>
//           </div>

//           {loading && <div style={{ marginTop: 8 }}>Loading…</div>}

//           <table className="table" style={{ marginTop: 12, width: "100%" }}>
//             <thead>
//               <tr>
//                 <th>#</th>
//                 <th>Emp ID</th>
//                 <th>Name</th>
//                 <th>Role</th>
//                 <th>Check-In</th>
//                 <th>Check-Out</th>
//                 <th>Worked</th>
//               </tr>
//             </thead>
//             <tbody>
//               {(rows || []).map((r, i) => {
//                 const worked =
//                   r.checkInTime && r.checkOutTime
//                     ? msToHMS(new Date(r.checkOutTime) - new Date(r.checkInTime))
//                     : "-";
//                 return (
//                   <tr key={r._id || i}>
//                     <td>{i + 1}</td>
//                     <td>{r.employee?.empId}</td>
//                     <td>{r.employee?.name}</td>
//                     <td>{r.employee?.role}</td>
//                     <td>{r.checkInTime ? new Date(r.checkInTime).toLocaleString() : "-"}</td>
//                     <td>{r.checkOutTime ? new Date(r.checkOutTime).toLocaleString() : "-"}</td>
//                     <td>{worked}</td>
//                   </tr>
//                 );
//               })}
//               {!loading && rows.length === 0 && (
//                 <tr>
//                   <td colSpan={7} style={{ textAlign: "center", padding: 12 }}>
//                     No records.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>

//           <div className="total" style={{ marginTop: 8 }}>
//             Total Worked (filtered): <strong>{msToHMS(totalMs)}</strong>
//           </div>
//         </section>
//       </main>
//     </>
//   );
// }

// src/pages/HrManagerAttendance.jsx
import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { msToHMS } from "../utils/time";
import * as XLSX from "xlsx";
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

export default function HrManagerAttendance() {
  const { user } = useAuth();
  const [filter, setFilter] = useState("weekly");
  const [empId, setEmpId] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const socket = useMemo(
    () =>
      io(import.meta.env.VITE_API_URL, {
        path: "/socket.io",
        transports: ["websocket", "polling"],
      }),
    []
  );

  async function loadData() {
    if (!["hr", "manager"].includes((user?.role || "").toLowerCase())) return;
    setLoading(true);
    try {
      const { from, to } = rangeFromFilter(filter);
      const res = await api.get("/admin/attendance", {
        params: { from, to, empId: empId || undefined },
      });
      setRows(res.data || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    socket.on("attendanceUpdated", loadData);
    return () => socket.off("attendanceUpdated", loadData);
  }, [filter, empId, user?.role]);

  const totalMs = useMemo(
    () =>
      (rows || []).reduce((acc, r) => {
        if (r.checkInTime && r.checkOutTime) {
          acc += Math.max(0, new Date(r.checkOutTime) - new Date(r.checkInTime));
        }
        return acc;
      }, 0),
    [rows]
  );

  function toLocalDateTime(d) {
    if (!d) return "";
    const dt = new Date(d);
    return Number.isNaN(dt.getTime()) ? "" : dt.toLocaleString("en-IN");
  }

  function downloadCSV() {
    const header = ["Emp ID", "Name", "Role", "Check-In", "Check-Out", "Worked"];
    const body = (rows || []).map((r) => [
      r.employee?.empId || "",
      r.employee?.name || "",
      r.employee?.role || "",
      r.checkInTime ? new Date(r.checkInTime).toLocaleString() : "",
      r.checkOutTime ? new Date(r.checkOutTime).toLocaleString() : "",
      r.checkInTime && r.checkOutTime
        ? msToHMS(new Date(r.checkOutTime) - new Date(r.checkInTime))
        : "-",
    ]);
    const csv = [header, ...body].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_${filter}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadXLSX() {
    if (!rows?.length) return alert("No data to export.");
    const data = rows.map((r, i) => ({
      SNo: i + 1,
      EmpID: r.employee?.empId || "",
      Name: r.employee?.name || "",
      Role: r.employee?.role || "",
      CheckIn: toLocalDateTime(r.checkInTime),
      CheckOut: toLocalDateTime(r.checkOutTime),
      Worked:
        r.checkInTime && r.checkOutTime
          ? msToHMS(new Date(r.checkOutTime) - new Date(r.checkInTime))
          : "-",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, `attendance_${filter}.xlsx`);
  }

  return (
    <>
      <Navbar />
      <main className="container">
        <section className="card">
          <div className="row between" style={{ flexWrap: "wrap", gap: 8 }}>
            <h2>All Employees — Attendance</h2>
            <div className="row" style={{flexWrap:"wrap",gap: 8,width:250}}>
              <input
                placeholder="Filter by Emp ID"
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                style={{marginBottom:10,marginTop:10}}
              />
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="all">All</option>
              </select>
              <button className="btn" onClick={downloadCSV} style={{marginRight:10,marginTop:10}}>CSV</button>
              <button className="btn btn-secondary" onClick={downloadXLSX}>
                Excel
              </button>
            </div>
          </div>

          {loading && <div>Loading…</div>}

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
                {(rows || []).map((r, i) => {
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
                      <td>{r.checkInTime ? new Date(r.checkInTime).toLocaleString() : "-"}</td>
                      <td>{r.checkOutTime ? new Date(r.checkOutTime).toLocaleString() : "-"}</td>
                      <td>{worked}</td>
                    </tr>
                  );
                })}
                {!loading && rows.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center" }}>No records.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 8 }}>
            Total Worked: <strong>{msToHMS(totalMs)}</strong>
          </div>
        </section>
      </main>
    </>
  );
}
