// import React, { useState } from "react";
// import { useAuth } from "../context/AuthContext";
// import { useNavigate } from "react-router-dom";

// export default function ForgotPassword() {
//   const { forgotPassword } = useAuth();
//   const [login, setLogin] = useState("");
//   const [info, setInfo] = useState("");
//   const [err, setErr] = useState("");
//   const navigate = useNavigate();

//   const submit = async (e) => {
//     e.preventDefault();
//     setErr(""); setInfo("");
//     try {
//       await forgotPassword({ login });
//       setInfo("OTP sent to your registered email.");
//       setTimeout(()=>navigate(`/reset-password?login=${encodeURIComponent(login)}`), 600);
//     } catch (e) {
//       setErr(e?.response?.data?.message || "Failed to send OTP");
//     }
//   };

//    return (
//     <div 
//       style={{
//         minHeight: "100vh",
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         // background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
//         backgroundImage: "url('/forgotbg.jpg')",
//         backgroundRepeat:"no-repeat",
//         backgroundSize:"cover"
//       }}
//     >
//       <form 
//         onSubmit={submit} 
//         style={{
//           background: "#fff",
//           padding: "40px",
//           borderRadius: "12px",
//           boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
//           width: "350px",
//           textAlign: "center"
//         }}
//       >
//         <h2 style={{ marginBottom: "20px", color: "#333" }}>Forgot Password</h2>

//         <label style={{ display: "block", marginBottom: "15px", textAlign: "left", color: "#444", fontWeight: "500" }}>
//           Emp ID or Email
//           <input 
//             value={login}
//             onChange={(e)=>setLogin(e.target.value)}
//             required
//             style={{
//               width: "100%",
//               padding: "10px",
//               marginTop: "6px",
//               borderRadius: "6px",
//               border: "1px solid #ccc",
//               outline: "none",
//               fontSize: "14px"
//             }}
//           />
//         </label>

//         <button 
//           type="submit" 
//           style={{
//             width: "100%",
//             padding: "12px",
//             background: "#667eea",
//             color: "#fff",
//             border: "none",
//             borderRadius: "6px",
//             cursor: "pointer",
//             fontWeight: "600",
//             fontSize: "15px"
//           }}
//         >
//           Send OTP
//         </button>

//         {info && <div style={{ marginTop: "15px", color: "green", fontWeight: "500" }}>{info}</div>}
//         {err && <div style={{ marginTop: "15px", color: "red", fontWeight: "500" }}>{err}</div>}
//       </form>
//     </div>
//   );
// }



// src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [login, setLogin] = useState("");
  const [info, setInfo] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); 
    setInfo("");
    try {
      await forgotPassword({ login });
      setInfo("OTP sent to your registered email.");
      setTimeout(() => navigate(`/reset-password?login=${encodeURIComponent(login)}`), 600);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to send OTP");
    }
  };

  return (
    <div className="auth-container" style={{ backgroundImage: "url('/forgotbg.jpg')", backgroundSize: "cover", backgroundRepeat: "no-repeat" }}>
      <form className="card auth-form" onSubmit={submit}>
        <h2>Forgot Password</h2>
        <label>
          Emp ID or Email
          <input 
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            required
            placeholder="e.g. EMP123 or email"
          />
        </label>
        <button className="btn btn-primary" type="submit">Send OTP</button>
        {info && <div className="success">{info}</div>}
        {err && <div className="error">{err}</div>}
      </form>
    </div>
  );
}
