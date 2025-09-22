// // src/pages/AdminLogin.jsx
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// export default function AdminLogin() {
//   const [empId, setEmpId] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const navigate = useNavigate();
//   const { loginAdmin } = useAuth();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     try {
//       await loginAdmin({ empId, password });
//       navigate("/admin");
//     } catch (err) {
//       setError(err?.response?.data?.message || "Login failed");
//     }
//   };

//   return (
//     <div className="auth-container">
//       <form className="card" onSubmit={handleSubmit}>
//         <h2>Boss Login</h2>
//         <label>
//           Employee ID
//           <input value={empId} onChange={(e) => setEmpId(e.target.value)} placeholder="e.g. BOSS" />
//         </label>
//         <label>
//           Password
//           <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
//         </label>
//         <button className="btn" type="submit">Login</button>
//         {error && <div className="error">{error}</div>}
//       </form>
//     </div>
//   );
// }



// src/pages/AdminLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminLogin() {
  const [empId, setEmpId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { loginAdmin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await loginAdmin({ empId, password });
      navigate("/admin");
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-container">
      <form className="card auth-form" onSubmit={handleSubmit}>
        <h2>Boss Login</h2>
        <label>
          Employee ID
          <input
            value={empId}
            onChange={(e) => setEmpId(e.target.value)}
            placeholder="e.g. BOSS"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button className="btn" type="submit">
          Login
        </button>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
}
