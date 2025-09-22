
// // import React, { useState, useEffect } from 'react';
// // import Navbar from '../components/Navbar';

// // export default function Home() {
// //   const [blast, setBlast] = useState(false);

// //   // Auto-trigger the blast animation once on mount
// //   useEffect(() => {
// //     setTimeout(() => {
// //       setBlast(true);
// //       setTimeout(() => setBlast(false), 1000); // Reset after 2s
// //     }, 500); // Delay before first blast
// //   }, []);

// //   return (
// //     <>
// //       <Navbar />
// //       <marquee style={{ fontSize: "24px", fontWeight: "bold", color: "#1a6fee" }}>
// //         Employee Attendance Portal 
// //       </marquee>
// //       <main
// //         style={{
// //           display: "flex",
// //           flexDirection: "column",
// //           alignItems: "center",
// //           justifyContent: "center",
// //           minHeight: "80vh",
// //           // background: "linear-gradient(135deg, #e3f2fd, #bbdefb)",
// //           padding: "20px",
// //         }}
// //       >
// //         {/* Card */}
// //         <section
// //           style={{
// //             width: "400px",
// //             padding: "20px",
// //             borderRadius: "15px",
// //             boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
// //             backgroundColor: "#fff",
// //             textAlign: "center",
// //             transform: blast ? "scale(0.5)" : "scale(1)",
// //             opacity: blast ? 0 : 1,
// //             transition: "all 1s ease",
// //           }}
// //         >
// //           <h2 style={{ marginBottom: "10px", color: "#1a6fee" }}>Welcome</h2>
// //           <p style={{ fontSize: "16px", color: "#444" }}>
// //             Select an option from the top navigation to check-in/out, view history,
// //             request leave, or (if admin) open the dashboard.
// //           </p>
// //         </section>

// //         {/* Inline keyframes */}
// //         <style>
// //           {`
// //             @keyframes fly {
// //               0% { transform: translateY(0); opacity: 1; }
// //               100% { transform: translateY(-600px); opacity: 0; }
// //             }
// //           `}
// //         </style>
// //       </main>
// //     </>
// //   );
// // }



// import React, { useState, useEffect } from "react";
// import Navbar from "../components/Navbar";

// export default function Home() {
//   const [festivals, setFestivals] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [blast, setBlast] = useState(false);

//   useEffect(() => {
//     // Animation
//     setTimeout(() => {
//       setBlast(true);
//       setTimeout(() => setBlast(false), 1000);
//     }, 500);

//   //   fetch("/api/festivals")
//   // .then((res) => {
//   //   if (!res.ok) throw new Error("Failed to fetch festivals");
//   //   return res.json();
//   // })
//   // .then((data) => {
//   //   const today = new Date();
//   //   const upcoming = data.filter((fest) => new Date(fest.date) >= today);
//   //   setFestivals(upcoming);
//   //   setLoading(false);
//   // })
//   // .catch((err) => {
//   //   console.error("Error fetching festivals:", err);
//   //   setError("Could not load Indian Holiday Calendar.");
//   //   setLoading(false);
//   // });

//   fetch("/api/festivals")
//   .then((res) => {
//     if (!res.ok) throw new Error("Failed to fetch festivals");
//     return res.json();
//   })
//   .then((data) => {
//     const today = new Date();
//     const upcoming = data.filter((fest) => new Date(fest.date) >= today);
//     setFestivals(upcoming);
//     setLoading(false);
//   })
//   .catch((err) => {
//     console.error("Error fetching festivals:", err);
//     setError("Could not load Indian Holiday Calendar.");
//     setLoading(false);
//   });

//   }, []); 

//   return (
//     <>
//       <Navbar />
//       <main
//         style={{
//           display: "flex",
//           flexDirection: "column",
//           alignItems: "center",
//           justifyContent: "center",
//           minHeight: "80vh",
//           padding: "20px",
//         }}
//       >
//         {/* Welcome Card */}
//         <section
//           style={{
//             width: "400px",
//             padding: "20px",
//             borderRadius: "15px",
//             boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
//             backgroundColor: "#fff",
//             textAlign: "center",
//             transform: blast ? "scale(0.5)" : "scale(1)",
//             opacity: blast ? 0 : 1,
//             transition: "all 1s ease",
//           }}
//         >
//           <h2 style={{ marginBottom: "10px", color: "#1a6fee" }}>Welcome</h2>
//           <p style={{ fontSize: "16px", color: "#444" }}>
//             Select an option from the top navigation to check-in/out, view
//             history, request leave, or (if admin) open the dashboard.
//           </p>
//         </section>

//         {/* Festival Calendar */}
//         <section
//           style={{
//             marginTop: "40px",
//             width: "600px",
//             padding: "20px",
//             borderRadius: "15px",
//             boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
//             backgroundColor: "#f9f9f9",
//           }}
//         >
//           <h3
//             style={{ marginBottom: "15px", color: "#1a6fee", textAlign: "center" }}
//           >
//             📅 Indian Festival & Holiday Calendar {new Date().getFullYear()}
//           </h3>

//           {loading && <p style={{ textAlign: "center", color: "#777" }}>Loading...</p>}
//           {error && <p style={{ textAlign: "center", color: "red" }}>{error}</p>}

//           {!loading && !error && (
//             <ul style={{ listStyle: "none", padding: 0 }}>
//               {festivals.length === 0 ? (
//                 <p style={{ textAlign: "center", color: "#777" }}>
//                   No upcoming holidays found.
//                 </p>
//               ) : (
//                 festivals.map((fest, idx) => (
//                   <li
//                     key={idx}
//                     style={{
//                       marginBottom: "12px",
//                       padding: "10px 15px",
//                       background: "#fff",
//                       borderRadius: "10px",
//                       boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
//                       display: "flex",
//                       justifyContent: "space-between",
//                       alignItems: "center",
//                       fontSize: "16px",
//                       fontWeight: "500",
//                       color: "#333",
//                     }}
//                   >
//                     <span>{fest.localName}</span>
//                     <span style={{ color: "#1a6fee" }}>
//                       {new Date(fest.date).toLocaleDateString("en-IN", {
//                         day: "numeric",
//                         month: "long",
//                       })}
//                     </span>
//                   </li>
//                 ))
//               )}
//             </ul>
//           )}
//         </section>
//       </main>
//     </>
//   );
// }



// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

export default function Home() {
  const [festivals, setFestivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [blast, setBlast] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setBlast(true);
      setTimeout(() => setBlast(false), 1000);
    }, 500);

    fetch("/api/festivals")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch festivals");
        return res.json();
      })
      .then((data) => {
        const today = new Date();
        const upcoming = data.filter((fest) => new Date(fest.date) >= today);
        setFestivals(upcoming);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching festivals:", err);
        setError("Could not load Indian Holiday Calendar.");
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Navbar />
      <main className="container" style={{ textAlign: "center" }}>
        {/* Welcome Card */}
        <section
          className="card"
          style={{
            maxWidth: "400px",
            margin: "0 auto",
            transform: blast ? "scale(0.5)" : "scale(1)",
            opacity: blast ? 0 : 1,
            transition: "all 1s ease",
          }}
        >
          <h2>Welcome</h2>
          <p>
            Select an option from the top navigation to check-in/out, view history,
            request leave, or (if admin) open the dashboard.
          </p>
        </section>

        {/* Festival Calendar */}
        <section
          className="card"
          style={{
            marginTop: "30px",
            maxWidth: "100%",
            width: "600px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <h3>📅 Indian Festival & Holiday Calendar {new Date().getFullYear()}</h3>
          {loading && <p>Loading...</p>}
          {error && <p className="error">{error}</p>}
          {!loading && !error && (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {festivals.length === 0 ? (
                <p>No upcoming holidays found.</p>
              ) : (
                festivals.map((fest, idx) => (
                  <li
                    key={idx}
                    style={{
                      marginBottom: "10px",
                      padding: "10px",
                      borderRadius: "8px",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "15px",
                    }}
                  >
                    <span>{fest.localName}</span>
                    <span style={{ color: "#1a6fee" }}>
                      {new Date(fest.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                      })}
                    </span>
                  </li>
                ))
              )}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
