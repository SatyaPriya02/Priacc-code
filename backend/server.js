
// // server.js
// import "dotenv/config";
// import express from "express";
// import cors from "cors";
// import { connectDB } from "./config/db.js";
// import path from "path";
// import { fileURLToPath } from "url";
// import cron from "node-cron";
// import { cleanupOldAttendancePhotos } from "./utils/cleanup.js";
// import bcrypt from "bcryptjs";
// import Employee from "./models/Employee.js";
// import http from "http";
// import { Server } from "socket.io";

// // routes
// import authRoutes from "./routes/authRoutes.js";
// import attendanceRoutes from "./routes/attendanceRoutes.js";
// import leaveRoutes from "./routes/leaveRoutes.js";
// import adminRoutes from "./routes/adminRoutes.js";
// import fileRoutes from "./routes/fileRoutes.js";

// import { notFound, errorHandler } from "./middlewares/errorMiddleware.js";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const app = express();
// const server = http.createServer(app);

// // ✅ Allowed origins
// const allowedOrigins = [
//   "http://localhost:5173",       // Vite dev
//   "http://54.193.241.233",       // server IP
//   "https://priaccinnovations.online" // your domain
// ];

// // ✅ CORS for APIs
// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     credentials: true,
//   })
// );

// app.use(express.json({ limit: "1mb" }));
// app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// // ✅ Socket.IO setup (mounted at /api/socket.io)
// const io = new Server(server, {
//   cors: {
//     origin: allowedOrigins,
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
//   path: "/api/socket.io",
// });
// app.set("io", io);

// io.on("connection", (socket) => {
//   console.log("🔌 Client connected:", socket.id);
//   socket.on("disconnect", () =>
//     console.log("❌ Client disconnected:", socket.id)
//   );
// });

// // ✅ Routes
// app.get("/", (req, res) =>
//   res.send("Employee Attendance API is running 🚀")
// );

// app.use("/api/auth", authRoutes);
// app.use("/api/admin", adminRoutes);
// app.use("/api", attendanceRoutes);
// app.use("/api/leave", leaveRoutes);
// app.use("/api/file", fileRoutes);

// // ✅ Error handlers
// app.use(notFound);
// app.use(errorHandler);

// // ✅ Serve frontend build (single server setup)
// app.use(express.static(path.join(__dirname, "../frontend/dist")));
// app.get("*", (req, res) => {
//   res.sendFile(path.resolve(__dirname, "../frontend/dist", "index.html"));
// });

// const PORT = process.env.PORT || 2000;

// connectDB(process.env.MONGO_URI)
//   .then(async () => {
//     // --- Seed boss user if not exists ---
//     const ADMIN_EMP_ID = process.env.ADMIN_EMP_ID || "BOSS";
//     const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "ChangeMe123!";
//     const ADMIN_NAME = process.env.ADMIN_NAME || "Company Boss";
//     const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "boss@example.com";

//     try {
//       const existing = await Employee.findOne({ empId: ADMIN_EMP_ID });
//       if (!existing) {
//         const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
//         await Employee.create({
//           empId: ADMIN_EMP_ID,
//           name: ADMIN_NAME,
//           email: ADMIN_EMAIL,
//           role: "boss",
//           passwordHash: hash,
//         });
//         console.log(`✅ Boss user created (${ADMIN_EMP_ID}).`);
//       }
//     } catch (seedErr) {
//       console.error("❌ Error seeding boss user:", seedErr);
//     }

//     server.listen(PORT, () =>
//       console.log(`🚀 Server running on port ${PORT}`)
//     );
//   })
//   .catch((err) => {
//     console.error("❌ DB connection failed:", err);
//     process.exit(1);
//   });

// // ✅ Daily cleanup
// cron.schedule("0 2 * * *", () => {
//   console.log("🕑 Running daily cleanup job...");
//   cleanupOldAttendancePhotos();
// });



// server.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import path from "path";
import { fileURLToPath } from "url";
import cron from "node-cron";
import { cleanupOldAttendancePhotos } from "./utils/cleanup.js";
import bcrypt from "bcryptjs";
import Employee from "./models/Employee.js";
import http from "http";
import { Server } from "socket.io";
import fetch from "node-fetch"; // ✅ required for API proxy

// routes
import authRoutes from "./routes/authRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";

import { notFound, errorHandler } from "./middlewares/errorMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// ✅ Allowed origins
const allowedOrigins = [
           
  "http://172.0.29.206", // server IP
   "http://172.0.20.187",// Vite dev
         
  "https://priaccinnovations.online" // your domain
];

// ✅ CORS for APIs
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ✅ Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  path: "/api/socket.io",
});
app.set("io", io);

io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);
  socket.on("disconnect", () =>
    console.log("❌ Client disconnected:", socket.id)
  );
});

// ✅ Routes
app.get("/", (req, res) =>
  res.send("Employee Attendance API is running 🚀")
);

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", attendanceRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/file", fileRoutes);

app.get("/api/festivals", async (req, res) => {
  const apiKey = process.env.GOOGLE_API_KEY;
  const calendarId = "en.indian%23holiday@group.v.calendar.google.com";
  const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${apiKey}&singleEvents=true&orderBy=startTime&timeMin=${new Date().toISOString()}`;

  console.log("📡 Fetching from Google Calendar API:", url);

  try {
    const response = await fetch(url);
    console.log("✅ Google API status:", response.status);

    if (!response.ok) {
      const text = await response.text();
      console.error("❌ API Error Response:", text);
      return res.status(response.status).json({ error: "Google API error" });
    }

    const data = await response.json();
    console.log("✅ Events received:", data.items?.length);

    const holidays = data.items.map((event) => ({
      date: event.start.date || event.start.dateTime,
      localName: event.summary,
    }));

    res.json(holidays);
  } catch (err) {
    console.error("❌ Error fetching Google Calendar holidays:", err.message);
    res.status(500).json({ error: "Failed to load Indian Holiday Calendar" });
  }
});


// ✅ Error handlers
app.use(notFound);
app.use(errorHandler);

// ✅ Serve frontend build (single server setup)
app.use(express.static(path.join(__dirname, "../frontend/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../frontend/dist", "index.html"));
});

const PORT = process.env.PORT || 2000;

connectDB(process.env.MONGO_URI)
  .then(async () => {
    // --- Seed boss user if not exists ---
    const ADMIN_EMP_ID = process.env.ADMIN_EMP_ID || "BOSS";
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "ChangeMe123!";
    const ADMIN_NAME = process.env.ADMIN_NAME || "Company Boss";
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "boss@example.com";

    try {
      const existing = await Employee.findOne({ empId: ADMIN_EMP_ID });
      if (!existing) {
        const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
        await Employee.create({
          empId: ADMIN_EMP_ID,
          name: ADMIN_NAME,
          email: ADMIN_EMAIL,
          role: "boss",
          passwordHash: hash,
        });
        console.log(`✅ Boss user created (${ADMIN_EMP_ID}).`);
      }
    } catch (seedErr) {
      console.error("❌ Error seeding boss user:", seedErr);
    }

    server.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err);
    process.exit(1);
  });

// ✅ Daily cleanup
cron.schedule("0 2 * * *", () => {
  console.log("🕑 Running daily cleanup job...");
  cleanupOldAttendancePhotos();
});
