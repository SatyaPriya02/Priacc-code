
// import React, { useState } from "react";
// import { useAuth } from "../context/AuthContext";
// import { Link, useNavigate } from "react-router-dom";
// import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

// export default function Login() {
//   const { login } = useAuth();
//   const [form, setForm] = useState({ login: "", password: "" });
//   const [err, setErr] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const navigate = useNavigate();

//   const submit = async (e) => {
//     e.preventDefault();
//     setErr("");
//     try {
//       await login(form);
//       navigate("/home");
//     } catch (e) {
//       setErr(e?.response?.data?.message || "Login failed");
//     }
//   };

//   return (
//     <div
//       style={{
//         display: "flex",
//         justifyContent: "center", // center horizontally on mobile
//         alignItems: "center",
//         height: "100vh",
//         fontFamily: "Arial, sans-serif",
//         backgroundImage: "url('/loginbg1.jpg')",
//         backgroundRepeat: "no-repeat",
//         backgroundSize: "cover",
//       }}
//     >
//       <form
//         onSubmit={submit}
//         style={{
//           padding: "30px",
//           background: "rgba(229, 222, 222, 0.95)",
//           borderRadius: "12px",
//           width: "320px",
//           maxWidth: "90%", // responsive width
//           boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
//         }}
//       >
//         <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#333" }}>
//           Sign in
//         </h2>

//         {/* Login Field */}
//         <label style={{ display: "block", marginBottom: "15px", color: "#444" }}>
//           Emp ID or Email
//           <input
//             value={form.login}
//             onChange={(e) => setForm({ ...form, login: e.target.value })}
//             required
//             style={{
//               width: "100%",
//               padding: "10px",
//               marginTop: "6px",
//               border: "1px solid #ccc",
//               borderRadius: "6px",
//               outline: "none",
//               fontSize: "14px",
//             }}
//           />
//         </label>

//         {/* Password Field with Eye Toggle */}
//         <label style={{ display: "block", marginBottom: "15px", color: "#444" }}>
//           Password
//           <div style={{ position: "relative" }}>
//             <input
//               type={showPassword ? "text" : "password"}
//               value={form.password}
//               onChange={(e) => setForm({ ...form, password: e.target.value })}
//               required
//               style={{
//                 width: "100%",
//                 padding: "10px",
//                 marginTop: "6px",
//                 border: "1px solid #ccc",
//                 borderRadius: "6px",
//                 outline: "none",
//                 fontSize: "14px",
//               }}
//             />
//             <span
//               onClick={() => setShowPassword(!showPassword)}
//               style={{
//                 position: "absolute",
//                 right: "10px",
//                 top: "50%",
//                 padding: "5px",
//                 transform: "translateY(-50%)",
//                 cursor: "pointer",
//                 fontSize: "18px",
//                 color: "#444",
//               }}
//             >
//               {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
//             </span>
//           </div>
//         </label>

//         {/* Login Button */}
//         <button
//           type="submit"
//           style={{
//             width: "100%",
//             padding: "12px",
//             background: "#2575fc",
//             color: "#fff",
//             border: "none",
//             borderRadius: "6px",
//             fontSize: "16px",
//             cursor: "pointer",
//             transition: "0.3s",
//           }}
//           onMouseOver={(e) => (e.target.style.background = "#1a5edb")}
//           onMouseOut={(e) => (e.target.style.background = "#2575fc")}
//         >
//           Login
//         </button>

//         {/* Forgot Password */}
//         <div style={{ marginTop: "12px", textAlign: "center" }}>
//           <Link to="/forgot-password" style={{ color: "#2575fc", fontSize: "14px" }}>
//             Forgot password?
//           </Link>
//         </div>

//         {/* Error Message */}
//         {err && (
//           <div
//             style={{
//               marginTop: "15px",
//               padding: "10px",
//               background: "#ffdddd",
//               color: "#d8000c",
//               borderRadius: "6px",
//               textAlign: "center",
//               fontSize: "14px",
//             }}
//           >
//             {err}
//           </div>
//         )}
//       </form>
//     </div>
//   );
// }


import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ login: "", password: "" });
  const [err, setErr] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await login(form);
      navigate("/home");
    } catch (e) {
      setErr(e?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontFamily: "Arial, sans-serif",
        backgroundImage: "url('/loginbg1.jpg')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <form
        onSubmit={submit}
        style={{
          padding: "30px",
          background: "rgba(229, 222, 222, 0.95)",
          borderRadius: "12px",
          width: "320px",
          maxWidth: "90%",
          boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#333" }}>
          Sign in
        </h2>

        <label style={{ display: "block", marginBottom: "15px", color: "#444" }}>
          Emp ID or Email
          <input
            value={form.login}
            onChange={(e) => setForm({ ...form, login: e.target.value })}
            required
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "6px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              outline: "none",
              fontSize: "14px",
            }}
          />
        </label>

        <label style={{ display: "block", marginBottom: "15px", color: "#444" }}>
          Password
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "6px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                outline: "none",
                fontSize: "14px",
              }}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                padding: "5px",
                transform: "translateY(-50%)",
                cursor: "pointer",
                fontSize: "18px",
                color: "#444",
              }}
            >
              {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </span>
          </div>
        </label>

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "12px",
            background: "#2575fc",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontSize: "16px",
            cursor: "pointer",
            transition: "0.3s",
          }}
          onMouseOver={(e) => (e.target.style.background = "#1a5edb")}
          onMouseOut={(e) => (e.target.style.background = "#2575fc")}
        >
          Login
        </button>

        <div style={{ marginTop: "12px", textAlign: "center" }}>
          <Link to="/forgot-password" style={{ color: "#2575fc", fontSize: "14px" }}>
            Forgot password?
          </Link>
        </div>

        {err && (
          <div
            style={{
              marginTop: "15px",
              padding: "10px",
              background: "#ffdddd",
              color: "#d8000c",
              borderRadius: "6px",
              textAlign: "center",
              fontSize: "14px",
            }}
          >
            {err}
          </div>
        )}
      </form>
    </div>
  );
}
