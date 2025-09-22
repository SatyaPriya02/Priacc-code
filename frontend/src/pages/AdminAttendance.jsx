
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/axiosInstance";
import { useAuth } from "../context/AuthContext";

function List({ title, group }) {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    (async () => {
      const res = await api.get(`/employees/list?group=${group}`); // backend groups: employees | staff
      setRows(res.data || []);
    })();
  }, [group]);

  return (
    <div className="card">
      <h3>{title}</h3>
      <table className="table">
        <thead><tr><th>Emp ID</th><th>Name</th><th>Email</th><th>Role</th><th>Mobile</th></tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r._id}>
              <td>{r.empId}</td><td>{r.name}</td><td>{r.email}</td><td>{r.role}</td><td>{r.mobile || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const isBossOrStaff = ["boss","hr","manager"].includes(user?.role);

  return (
    <>
      <Navbar />
      <main className="container">
        {!isBossOrStaff ? (
          <section className="card"><h2>Forbidden</h2></section>
        ) : (
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <List title="Employees" group="employees" />
            <List title="HR & Managers" group="staff" />
          </div>
        )}
      </main>
    </>
  );
}

