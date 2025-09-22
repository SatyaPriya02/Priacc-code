// import React, { useEffect, useState } from "react";
// import Navbar from "../components/Navbar";
// import api from "../services/axiosInstance";
// import { useAuth } from "../context/AuthContext";
// import { msToHMS } from "../utils/time";

// function rangeFromFilter(filter) {
//   const now = new Date();
//   let from;
//   if (filter === "weekly") {
//     const day = now.getDay();
//     const diff = day === 0 ? 6 : day - 1; // Monday start
//     from = new Date(now);
//     from.setDate(now.getDate() - diff);
//   } else if (filter === "monthly") {
//     from = new Date(now.getFullYear(), now.getMonth(), 1);
//   } else if (filter === "yearly") {
//     from = new Date(now.getFullYear(), 0, 1);
//   } else {
//     from = new Date(0);
//   }
//   return { from: from.toISOString(), to: now.toISOString() };
// }

// export default function AttendanceHistory() {
//   const { user } = useAuth();
//   const [filter, setFilter] = useState("weekly");
//   const [rows, setRows] = useState([]);
//   const [totalMs, setTotalMs] = useState(0);

//   useEffect(() => {
//     const load = async () => {
//       const { from, to } = rangeFromFilter(filter);
//       const res = await api.get(`/employee/${user.empId}/attendance`, {
//         params: { from, to },
//       });
//       const data = res.data || [];
//       setRows(data);
//       const sum = data.reduce((acc, r) => {
//         if (r.checkInTime && r.checkOutTime) {
//           acc += Math.max(
//             0,
//             new Date(r.checkOutTime) - new Date(r.checkInTime)
//           );
//         }
//         return acc;
//       }, 0);
//       setTotalMs(sum);
//     };
//     load();
//   }, [filter, user.empId]);

//   return (
//     <>
//       <Navbar />
//       <main className="container">
//         <section className="card">
//           <div className="row between">
//             <h2>Attendance History</h2>
//             <select value={filter} onChange={(e) => setFilter(e.target.value)}>
//               <option value="weekly">Weekly</option>
//               <option value="monthly">Monthly</option>
//               <option value="yearly">Yearly</option>
//               <option value="all">All</option>
//             </select>
//           </div>

//           <table className="table">
//             <thead>
//               <tr>
//                 <th>#</th>
//                 <th>Check-In Time</th>
//                 <th>Check-Out Time</th>
//                 <th>Check-In Photo</th>
//                 <th>Check-Out Photo</th>
//                 <th>Worked</th>
//               </tr>
//             </thead>
//             <tbody>
//               {rows.map((r, i) => {
//                 const worked =
//                   r.checkInTime && r.checkOutTime
//                     ? msToHMS(
//                         new Date(r.checkOutTime) - new Date(r.checkInTime)
//                       )
//                     : "-";
//                 return (
//                   <tr key={r._id || i}>
//                     <td>{i + 1}</td>
//                     <td>
//                       {r.checkInTime
//                         ? new Date(r.checkInTime).toLocaleString()
//                         : "-"}
//                     </td>
//                     <td>
//                       {r.checkOutTime
//                         ? new Date(r.checkOutTime).toLocaleString()
//                         : "-"}
//                     </td>
//                     <td>
//                       {r.checkInPhoto && (
//                         <img
//                           src={`${
//                             import.meta.env.VITE_API_URL
//                           }/file/${r.checkInPhoto}`}
//                           alt="Check-In"
//                           style={{
//                             width: 70,
//                             height: 70,
//                             objectFit: "cover",
//                             borderRadius: 6,
//                           }}
//                         />
//                       )}
//                     </td>
//                     <td>
//                       {r.checkOutPhoto && (
//                         <img
//                           src={`${
//                             import.meta.env.VITE_API_URL
//                           }/file/${r.checkOutPhoto}`}
//                           alt="Check-Out"
//                           style={{
//                             width: 70,
//                             height: 70,
//                             objectFit: "cover",
//                             borderRadius: 6,
//                           }}
//                         />
//                       )}
//                     </td>
//                     <td>{worked}</td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>

//           <div className="total">
//             Total Worked: <strong>{msToHMS(totalMs)}</strong>
//           </div>
//         </section>
//       </main>
//     </>
//   );
// }


// src/pages/AttendanceHistory.jsx
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { msToHMS } from "../utils/time";

function rangeFromFilter(filter) {
  const now = new Date();
  let from;
  if (filter === "weekly") {
    const day = now.getDay();
    const diff = day === 0 ? 6 : day - 1;
    from = new Date(now);
    from.setDate(now.getDate() - diff);
  } else if (filter === "monthly") {
    from = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (filter === "yearly") {
    from = new Date(now.getFullYear(), 0, 1);
  } else {
    from = new Date(0);
  }
  return { from: from.toISOString(), to: now.toISOString() };
}

export default function AttendanceHistory() {
  const { user } = useAuth();
  const [filter, setFilter] = useState("weekly");
  const [rows, setRows] = useState([]);
  const [totalMs, setTotalMs] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { from, to } = rangeFromFilter(filter);
      const res = await api.get(`/employee/${user.empId}/attendance`, {
        params: { from, to },
      });
      const data = res.data || [];
      setRows(data);
      const sum = data.reduce((acc, r) => {
        if (r.checkInTime && r.checkOutTime) {
          acc += Math.max(
            0,
            new Date(r.checkOutTime) - new Date(r.checkInTime)
          );
        }
        return acc;
      }, 0);
      setTotalMs(sum);
    };
    load();
  }, [filter, user.empId]);

  return (
    <>
      <Navbar />
      <main className="container">
        <section className="card">
          <div className="row between" style={{ flexWrap: "wrap", gap: 8 }}>
            <h2>Attendance History</h2>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="all">All</option>
            </select>
          </div>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Check-In Time</th>
                  <th>Check-Out Time</th>
                  <th>Check-In Photo</th>
                  <th>Check-Out Photo</th>
                  <th>Worked</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const worked =
                    r.checkInTime && r.checkOutTime
                      ? msToHMS(
                          new Date(r.checkOutTime) - new Date(r.checkInTime)
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
                      <td>
                        {r.checkInPhoto && (
                          <img
                            src={`${import.meta.env.VITE_API_URL}/file/${
                              r.checkInPhoto
                            }`}
                            alt="Check-In"
                            style={{
                              width: 60,
                              height: 60,
                              objectFit: "cover",
                              borderRadius: 6,
                            }}
                          />
                        )}
                      </td>
                      <td>
                        {r.checkOutPhoto && (
                          <img
                            src={`${import.meta.env.VITE_API_URL}/file/${
                              r.checkOutPhoto
                            }`}
                            alt="Check-Out"
                            style={{
                              width: 60,
                              height: 60,
                              objectFit: "cover",
                              borderRadius: 6,
                            }}
                          />
                        )}
                      </td>
                      <td>{worked}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="total">
            Total Worked: <strong>{msToHMS(totalMs)}</strong>
          </div>
        </section>
      </main>
    </>
  );
}

