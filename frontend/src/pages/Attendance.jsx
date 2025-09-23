


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
        path: "/api/socket.io",
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
