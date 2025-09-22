// import React, { useEffect, useState } from "react";
// import Navbar from "../components/Navbar";
// import api from "../services/axiosInstance";
// import { useAuth } from "../context/AuthContext";

// export default function AdminDashboard() {
//   const { user } = useAuth();
//   const role = (user?.role || "").toLowerCase();
//   const canEditRole = role === "boss";

//   const [employees, setEmployees] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const [showForm, setShowForm] = useState(false);
//   const [editing, setEditing] = useState(null); // empId when editing
//   const [form, setForm] = useState({
//     empId: "",
//     name: "",
//     email: "",
//     mobile: "",
//     role: "employee",
//     photo: null,
//   });

//   const fetchEmployees = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const res = await api.get("/admin/employees");
//       let list = Array.isArray(res.data) ? res.data : [];

//       // 🔑 Sort employees numerically by empId (EMP001 → 1, EMP12 → 12)
//       list.sort((a, b) => {
//         const numA = parseInt((a.empId || "").replace(/\D/g, ""), 10) || 0;
//         const numB = parseInt((b.empId || "").replace(/\D/g, ""), 10) || 0;
//         return numA - numB;
//       });

//       setEmployees(list);
//     } catch (e) {
//       setError(e?.response?.data?.message || "Failed to load employees");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchEmployees();
//   }, []);

//   const hrManagers = employees.filter((e) =>
//     ["hr", "manager"].includes((e.role || "").toLowerCase())
//   );
//   const onlyEmployees = employees.filter(
//     (e) => (e.role || "").toLowerCase() === "employee"
//   );

//   const openAdd = () => {
//     setEditing(null);
//     setForm({
//       empId: "",
//       name: "",
//       email: "",
//       mobile: "",
//       role: "employee",
//       photo: null,
//     });
//     setShowForm(true);
//   };

//   const openEdit = (emp) => {
//     setEditing(emp.empId);
//     setForm({
//       empId: emp.empId,
//       name: emp.name || "",
//       email: emp.email || "",
//       mobile: emp.mobile || "",
//       role: emp.role || "employee",
//       photo: null,
//     });
//     setShowForm(true);
//   };

//   const handleFile = (e) =>
//     setForm((f) => ({ ...f, photo: e.target.files?.[0] || null }));

//   // === VALIDATION ===
//   const validateForm = () => {
//     if (!editing && !/^EMP\d*$/i.test(form.empId)) {
//       return "Employee ID must start with EMP followed by digits (e.g., EMP0013).";
//     }
//     if (!/^[A-Za-z\s]+$/.test(form.name)) {
//       return "Name must contain only letters (no digits or special chars).";
//     }
//     if (!/^\d{10}$/.test(form.mobile)) {
//       return "Mobile number must be exactly 10 digits.";
//     }
//     if (!form.email.includes("@") || form.email !== form.email.toLowerCase()) {
//       return "Email must be lowercase and contain @.";
//     }
//     return null;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     const validationError = validateForm();
//     if (validationError) {
//       setError(validationError);
//       setLoading(false); // ✅ reset here
//       return;
//     }

//     try {
//       const fd = new FormData();
//       if (!editing) fd.append("empId", form.empId);
//       fd.append("name", form.name);
//       fd.append("email", form.email);
//       fd.append("mobile", form.mobile);
//       fd.append("role", canEditRole ? form.role : "employee");
//       if (form.photo) fd.append("photo", form.photo);

//       if (editing) {
//         await api.put(`/admin/employees/${editing}`, fd);
//       } else {
//         await api.post(`/admin/employees`, fd);
//       }
//       setShowForm(false);
//       await fetchEmployees();
//     } catch (e) {
//       setError(e?.response?.data?.message || "Save failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const remove = async (empId) => {
//     if (!window.confirm("Delete employee?")) return;
//     try {
//       await api.delete(`/admin/employees/${empId}`);
//       await fetchEmployees();
//     } catch (e) {
//       setError(e?.response?.data?.message || "Delete failed");
//     }
//   };

//   const DisabledHint = ({ children, disabled }) => (
//     <span title={disabled ? "Only Boss can modify HR/Manager" : ""}>
//       {children}
//     </span>
//   );

//   const Table = ({ title, data }) => (
//     <section className="card">
//       <div className="row between">
//         <h2>{title}</h2>
//         <button className="btn" onClick={openAdd}>
//           Add
//         </button>
//       </div>

//       {loading && <div>Loading…</div>}
//       {error && <div className="error" style={{ marginTop: 8 }}>{error}</div>}

//       <table className="table">
//         <thead>
//           <tr>
//             <th>#</th>
//             <th>Emp ID</th>
//             <th>Name</th>
//             <th>Email</th>
//             <th>Mobile</th>
//             <th>Role</th>
//             <th>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {data.map((e, i) => {
//             const rowRole = (e.role || "").toLowerCase();
//             const restrict = rowRole !== "employee" && !canEditRole;
//             return (
//               <tr key={e._id || e.empId || i}>
//                 <td>{i + 1}</td>
//                 <td>{e.empId}</td>
//                 <td>{e.name}</td>
//                 <td>{e.email}</td>
//                 <td>{e.mobile || "-"}</td>
//                 <td>{e.role}</td>
//                 <td className="actions">
//                   <DisabledHint disabled={restrict}>
//                     <button
//                       className="btn"
//                       onClick={() => !restrict && openEdit(e)}
//                       disabled={restrict}
//                     >
//                       Edit
//                     </button>
//                   </DisabledHint>
//                   <DisabledHint disabled={restrict}>
//                     <button
//                       className="btn btn-danger"
//                       onClick={() => !restrict && remove(e.empId)}
//                       disabled={restrict}
//                     >
//                       Delete
//                     </button>
//                   </DisabledHint>
//                 </td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//     </section>
//   );

//   return (
//     <>
//       <Navbar />
//       <main className="container">
//         <Table title="HR & Managers" data={hrManagers} />
//         <Table title="Employees" data={onlyEmployees} />

//         {showForm && (
//           <div className="modal-overlay">
//             <div className="modal">
//               <h3>{editing ? "Edit Employee" : "Add Employee"}</h3>
//               <form onSubmit={handleSubmit}>
//                 {!editing && (
//                   <label>
//                     Employee ID
//                     <input
//                       value={form.empId}
//                       onChange={(e) =>
//                         setForm({ ...form, empId: e.target.value })
//                       }
//                       required
//                     />
//                   </label>
//                 )}

//                 <label>
//                   Name
//                   <input
//                     value={form.name}
//                     onChange={(e) => setForm({ ...form, name: e.target.value })}
//                     required
//                   />
//                 </label>

//                 <label>
//                   Email
//                   <input
//                     type="email"
//                     value={form.email}
//                     onChange={(e) =>
//                       setForm({ ...form, email: e.target.value })
//                     }
//                     required
//                   />
//                 </label>

//                 <label>
//                   Mobile
//                   <input
//                     value={form.mobile}
//                     onChange={(e) =>
//                       setForm({ ...form, mobile: e.target.value })
//                     }
//                   />
//                 </label>

//                 {canEditRole ? (
//                   <label>
//                     Role
//                     <select
//                       value={form.role}
//                       onChange={(e) =>
//                         setForm({ ...form, role: e.target.value })
//                       }
//                     >
//                       <option value="employee">Employee</option>
//                       <option value="hr">HR</option>
//                       <option value="manager">Manager</option>
//                       {/* <option value="boss">Boss</option> */}
//                     </select>
//                   </label>
//                 ) : (
//                   <input type="hidden" value="employee" />
//                 )}

//                 <label>
//                   {editing ? "Replace Photo (optional)" : "Photo (optional)"}
//                   <input
//                     type="file"
//                     accept="image/*"
//                     onChange={handleFile}
//                   />
//                 </label>

//                 {error && (
//                   <div className="error" style={{ marginTop: 8 }}>{error}</div>
//                 )}

//                 <div className="actions">
//                   <button className="btn" type="submit" disabled={loading}>
//                     {loading ? "Saving…" : "Save"}
//                   </button>
//                   <button
//                     className="btn btn-secondary"
//                     type="button"
//                     onClick={() => setShowForm(false)}
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}
//       </main>
//     </>
//   );
// }





import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/axiosInstance";
import { useAuth } from "../context/AuthContext";

export default function AdminDashboard() {
  const { user } = useAuth();
  const role = (user?.role || "").toLowerCase();
  const canEditRole = role === "boss";

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    empId: "",
    name: "",
    email: "",
    mobile: "",
    role: "employee",
    photo: null,
  });

  const fetchEmployees = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/employees");
      let list = Array.isArray(res.data) ? res.data : [];

      list.sort((a, b) => {
        const numA = parseInt((a.empId || "").replace(/\D/g, ""), 10) || 0;
        const numB = parseInt((b.empId || "").replace(/\D/g, ""), 10) || 0;
        return numA - numB;
      });

      setEmployees(list);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const hrManagers = employees.filter((e) =>
    ["hr", "manager"].includes((e.role || "").toLowerCase())
  );
  const onlyEmployees = employees.filter(
    (e) => (e.role || "").toLowerCase() === "employee"
  );

  const openAdd = () => {
    setEditing(null);
    setForm({
      empId: "",
      name: "",
      email: "",
      mobile: "",
      role: "employee",
      photo: null,
    });
    setShowForm(true);
  };

  const openEdit = (emp) => {
    setEditing(emp.empId);
    setForm({
      empId: emp.empId,
      name: emp.name || "",
      email: emp.email || "",
      mobile: emp.mobile || "",
      role: emp.role || "employee",
      photo: null,
    });
    setShowForm(true);
  };

  const handleFile = (e) =>
    setForm((f) => ({ ...f, photo: e.target.files?.[0] || null }));

  const validateForm = () => {
    if (!editing && !/^EMP\d*$/i.test(form.empId)) {
      return "Employee ID must start with EMP followed by digits (e.g., EMP0013).";
    }
    if (!/^[A-Za-z\s]+$/.test(form.name)) {
      return "Name must contain only letters.";
    }
    if (!/^\d{10}$/.test(form.mobile)) {
      return "Mobile number must be exactly 10 digits.";
    }
    if (!form.email.includes("@") || form.email !== form.email.toLowerCase()) {
      return "Email must be lowercase and contain @.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      const fd = new FormData();
      if (!editing) fd.append("empId", form.empId);
      fd.append("name", form.name);
      fd.append("email", form.email);
      fd.append("mobile", form.mobile);
      fd.append("role", canEditRole ? form.role : "employee");
      if (form.photo) fd.append("photo", form.photo);

      if (editing) {
        await api.put(`/admin/employees/${editing}`, fd);
      } else {
        await api.post(`/admin/employees`, fd);
      }
      setShowForm(false);
      await fetchEmployees();
    } catch (e) {
      setError(e?.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (empId) => {
    if (!window.confirm("Delete employee?")) return;
    try {
      await api.delete(`/admin/employees/${empId}`);
      await fetchEmployees();
    } catch (e) {
      setError(e?.response?.data?.message || "Delete failed");
    }
  };

  const DisabledHint = ({ children, disabled }) => (
    <span title={disabled ? "Only Boss can modify HR/Manager" : ""}>
      {children}
    </span>
  );

  const Table = ({ title, data }) => (
    <section className="card">
      <div className="row between" style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <h2>{title}</h2>
        <button className="btn" onClick={openAdd}>
          Add
        </button>
      </div>

      {loading && <div>Loading…</div>}
      {error && <div className="error" style={{ marginTop: 8 }}>{error}</div>}

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Emp ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((e, i) => {
              const rowRole = (e.role || "").toLowerCase();
              const restrict = rowRole !== "employee" && !canEditRole;
              return (
                <tr key={e._id || e.empId || i}>
                  <td>{i + 1}</td>
                  <td>{e.empId}</td>
                  <td>{e.name}</td>
                  <td>{e.email}</td>
                  <td>{e.mobile || "-"}</td>
                  <td>{e.role}</td>
                  <td className="actions">
                    <DisabledHint disabled={restrict}>
                      <button
                        className="btn"
                        onClick={() => !restrict && openEdit(e)}
                        disabled={restrict}
                        style={{marginRight:10}}
                      >
                        Edit
                      </button>
                    </DisabledHint>
                    <DisabledHint disabled={restrict}>
                      <button
                        className="btn btn-danger"
                        onClick={() => !restrict && remove(e.empId)}
                        disabled={restrict}
                      >
                        Delete
                      </button>
                    </DisabledHint>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );

  return (
    <>
      <Navbar />
      <main className="container">
        <Table title="HR & Managers" data={hrManagers} />
        <Table title="Employees" data={onlyEmployees} />

        {showForm && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>{editing ? "Edit Employee" : "Add Employee"}</h3>
              <form onSubmit={handleSubmit}>
                {!editing && (
                  <label>
                    Employee ID
                    <input
                      value={form.empId}
                      onChange={(e) =>
                        setForm({ ...form, empId: e.target.value })
                      }
                      required
                    />
                  </label>
                )}

                <label>
                  Name
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </label>

                <label>
                  Email
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    required
                  />
                </label>

                <label>
                  Mobile
                  <input
                    value={form.mobile}
                    onChange={(e) =>
                      setForm({ ...form, mobile: e.target.value })
                    }
                  />
                </label>

                {canEditRole ? (
                  <label>
                    Role
                    <select
                      value={form.role}
                      onChange={(e) =>
                        setForm({ ...form, role: e.target.value })
                      }
                    >
                      <option value="employee">Employee</option>
                      <option value="hr">HR</option>
                      <option value="manager">Manager</option>
                    </select>
                  </label>
                ) : (
                  <input type="hidden" value="employee" />
                )}

                <label>
                  {editing ? "Replace Photo (optional)" : "Photo (optional)"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFile}
                  />
                </label>

                {error && (
                  <div className="error" style={{ marginTop: 8 }}>{error}</div>
                )}

                <div className="actions">
                  <button className="btn" type="submit" disabled={loading}>
                    {loading ? "Saving…" : "Save"}
                  </button>
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => setShowForm(false)}
                    style={{marginLeft:10}}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
