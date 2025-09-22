// import React, { useState, useMemo } from "react";
// import { useAuth } from "../context/AuthContext";
// import { useNavigate, useLocation } from "react-router-dom";

// export default function ResetPassword() {
//   const { resetPassword } = useAuth();
//   const qs = new URLSearchParams(useLocation().search);
//   const initialLogin = useMemo(()=>qs.get("login") || "", [qs]);
//   const [login, setLogin] = useState(initialLogin);
//   const [otp, setOtp] = useState("");
//   const [p1, setP1] = useState("");
//   const [p2, setP2] = useState("");
//   const [err, setErr] = useState("");
//   const [ok, setOk] = useState("");
//   const navigate = useNavigate();

//   const submit = async (e) => {
//     e.preventDefault();
//     setErr(""); setOk("");
//     if (p1 !== p2) { setErr("Passwords do not match"); return; }
//     try {
//       await resetPassword({ login, otp, newPassword: p1 });
//       setOk("Password updated. Please login.");
//       setTimeout(()=>navigate("/login"), 600);
//     } catch (e) {
//       setErr(e?.response?.data?.message || "Reset failed");
//     }
//   };

//   return (
//     <div className="auth-container">
//       <form className="card" onSubmit={submit}>
//         <h2>Reset Password</h2>
//         <label>
//           Emp ID or Email
//           <input value={login} onChange={(e)=>setLogin(e.target.value)} required />
//         </label>
//         <label>
//           OTP (from email)
//           <input value={otp} onChange={(e)=>setOtp(e.target.value)} required />
//         </label>
//         <label>
//           New Password
//           <input type="password" value={p1} onChange={(e)=>setP1(e.target.value)} required />
//         </label>
//         <label>
//           Confirm Password
//           <input type="password" value={p2} onChange={(e)=>setP2(e.target.value)} required />
//         </label>
//         <button className="btn" type="submit">Update Password</button>
//         {ok && <div className="success">{ok}</div>}
//         {err && <div className="error">{err}</div>}
//       </form>
//     </div>
//   );
// }


// import React, { useState, useMemo } from "react";
// import { useAuth } from "../context/AuthContext";
// import { useNavigate, useLocation } from "react-router-dom";

// export default function ResetPassword() {
//   const { resetPassword } = useAuth();
//   const qs = new URLSearchParams(useLocation().search);
//   const initialLogin = useMemo(()=>qs.get("login") || "", [qs]);
//   const [login, setLogin] = useState(initialLogin);
//   const [otp, setOtp] = useState("");
//   const [p1, setP1] = useState("");
//   const [p2, setP2] = useState("");
//   const [err, setErr] = useState("");
//   const [ok, setOk] = useState("");
//   const navigate = useNavigate();

//   const submit = async (e) => {
//     e.preventDefault();
//     setErr(""); setOk("");
//     if (p1 !== p2) { setErr("Passwords do not match"); return; }
//     try {
//       await resetPassword({ login, otp, newPassword: p1 });
//       setOk("Password updated. Please login.");
//       setTimeout(()=>navigate("/login"), 600);
//     } catch (e) {
//       setErr(e?.response?.data?.message || "Reset failed");
//     }
//   };

//   return (
//     <div className="auth-container">
//       <form className="card" onSubmit={submit}>
//         <h2>Reset Password</h2>
//         <label>
//           Emp ID or Email
//           <input value={login} onChange={(e)=>setLogin(e.target.value)} required />
//         </label>
//         <label>
//           OTP (from email)
//           <input value={otp} onChange={(e)=>setOtp(e.target.value)} required />
//         </label>
//         <label>
//           New Password
//           <input type="password" value={p1} onChange={(e)=>setP1(e.target.value)} required />
//         </label>
//         <label>
//           Confirm Password
//           <input type="password" value={p2} onChange={(e)=>setP2(e.target.value)} required />
//         </label>
//         <button className="btn" type="submit">Update Password</button>
//         {ok && <div className="success">{ok}</div>}
//         {err && <div className="error">{err}</div>}
//       </form>
//     </div>
//   );
// }



import React, { useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const qs = new URLSearchParams(useLocation().search);
  const initialLogin = useMemo(() => qs.get("login") || "", [qs]);
  const [login, setLogin] = useState(initialLogin);
  const [otp, setOtp] = useState("");
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");
    if (p1 !== p2) {
      setErr("Passwords do not match");
      return;
    }
    try {
      await resetPassword({ login, otp, newPassword: p1 });
      setOk("Password updated. Please login.");
      setTimeout(() => navigate("/login"), 600);
    } catch (e) {
      setErr(e?.response?.data?.message || "Reset failed");
    }
  };

  return (
    <div className="auth-container">
      <form className="card" onSubmit={submit}>
        <h2>Reset Password</h2>
        <label>
          Emp ID or Email
          <input value={login} onChange={(e) => setLogin(e.target.value)} required />
        </label>
        <label>
          OTP (from email)
          <input value={otp} onChange={(e) => setOtp(e.target.value)} required />
        </label>
        <label>
          New Password
          <input type="password" value={p1} onChange={(e) => setP1(e.target.value)} required />
        </label>
        <label>
          Confirm Password
          <input type="password" value={p2} onChange={(e) => setP2(e.target.value)} required />
        </label>
        <button className="btn" type="submit">
          Update Password
        </button>
        {ok && <div className="success">{ok}</div>}
        {err && <div className="error">{err}</div>}
      </form>
    </div>
  );
}
