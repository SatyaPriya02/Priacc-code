
// // controllers/attendanceController.js
// import mongoose from "mongoose";
// import Employee from "../models/Employee.js";
// import Attendance from "../models/Attendance.js";
// import { verifyFaces } from "../utils/faceVerification.js";
// import { pushAttendanceToSAP } from "../services/sapService.js";

// /**
//  * Save file buffer to GridFS bucket "attendancePhotos"
//  * returns the fileId as string
//  */
// async function saveToGridFS(file) {
//   if (!file) throw new Error("No file provided");

//   const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
//     bucketName: "attendancePhotos",
//   });

//   return new Promise((resolve, reject) => {
//     const uploadStream = bucket.openUploadStream(file.originalname, {
//       contentType: file.mimetype,
//     });

//     uploadStream.end(file.buffer);

//     uploadStream.on("finish", () => {
//       console.log("✅ Stored in GridFS:", uploadStream.id);
//       resolve(uploadStream.id.toString());
//     });

//     uploadStream.on("error", (err) => {
//       console.error("❌ GridFS upload error:", err);
//       reject(err);
//     });
//   });
// }

// /** helper to construct public file URL served by fileRoutes (GET /api/file/:id) */
// function fileUrl(req, fileId) {
//   return `${req.protocol}://${req.get("host")}/api/file/${fileId}`;
// }

// function canAccessEmployee(req, empId) {
//   // boss has access to any employee record, otherwise only self
//   return req.user?.role === "boss" || req.user?.empId === empId;
// }

// /** CHECK-IN */
// export async function checkIn(req, res) {
//   try {
//     const { empId } = req.params;
//     if (!canAccessEmployee(req, empId))
//       return res.status(403).json({ message: "Forbidden" });

//     if (!req.file) return res.status(400).json({ message: "Photo is required" });

//     const employee = await Employee.findOne({ empId });
//     if (!employee) return res.status(404).json({ message: "Employee not found" });
//     if (!employee.photo)
//       return res.status(400).json({ message: "No registered photo on file" });

//     // prevent duplicate open check-in
//     const open = await Attendance.findOne({
//       employee: employee._id,
//       checkOutTime: { $exists: false },
//     });
//     if (open)
//       return res.status(400).json({ message: "Already checked in. Please check out first." });

//     // Save photo to GridFS
//     const fileId = await saveToGridFS(req.file);

//     // ✅ FIX: registered photo is now in GridFS
//     const regUrl = employee.photo ? fileUrl(req, employee.photo) : null;
//     const liveUrl = fileUrl(req, fileId);

//     // const { ok, score } = await verifyFaces(regUrl, liveUrl);
//     // if (!ok) {
//     //   return res.status(400).json({
//     //     message: "Face verification failed on check-in",
//     //     ...(score != null ? { score } : {}),
//     //   });
//     // }

//     const result = await verifyFaces(regUrl, liveUrl);
// if (!result.ok) {
//   return res.status(400).json({
//     message: "Face verification failed on check-in",
//     ...(result.score != null ? { score: result.score } : {}),
//     ...(result.source ? { source: result.source } : {}),
//     ...(result.detail ? { detail: result.detail } : {}),
//   });
// }

//     const record = await Attendance.create({
//       employee: employee._id,
//       checkInTime: new Date(),
//       checkInPhoto: fileId, // store GridFS file id string
//     });

//     await pushAttendanceToSAP(record, employee);

//     return res.json({ message: "Checked in successfully", attendanceId: record._id, score });
//   } catch (err) {
//     console.error("Check-in error:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// }

// /** CHECK-OUT */
// export async function checkOut(req, res) {
//   try {
//     const { empId } = req.params;
//     if (!canAccessEmployee(req, empId))
//       return res.status(403).json({ message: "Forbidden" });

//     if (!req.file) return res.status(400).json({ message: "Photo is required" });

//     const employee = await Employee.findOne({ empId });
//     if (!employee) return res.status(404).json({ message: "Employee not found" });

//     const open = await Attendance.findOne({
//       employee: employee._id,
//       checkOutTime: { $exists: false },
//     }).sort({ createdAt: -1 });

//     if (!open) return res.status(400).json({ message: "No open check-in found" });

//     // Save to GridFS
//     const fileId = await saveToGridFS(req.file);

//     // ✅ FIX: use GridFS for registered photo
//     const regUrl = employee.photo ? fileUrl(req, employee.photo) : null;
//     const liveUrl = fileUrl(req, fileId);

//     // const primary = await verifyFaces(regUrl, liveUrl);
//     // if (!primary.ok) {
//     //   return res.status(400).json({
//     //     message: "Face verification failed on check-out",
//     //     ...(primary.score != null ? { score: primary.score } : {}),
//     //   });
//     // }

//     const result = await verifyFaces(regUrl, liveUrl);
// if (!result.ok) {
//   return res.status(400).json({
//     message: "Face verification failed on check-in",
//     ...(result.score != null ? { score: result.score } : {}),
//     ...(result.source ? { source: result.source } : {}),
//     ...(result.detail ? { detail: result.detail } : {}),
//   });
// }

//     // Optional: compare with check-in photo (GridFS id stored in open.checkInPhoto)
//     if (open.checkInPhoto) {
//       const checkInUrl = fileUrl(req, open.checkInPhoto);
//       const secondary = await verifyFaces(checkInUrl, liveUrl);
//       if (!secondary.ok) {
//         return res.status(400).json({
//           message: "Face mismatch with original check-in photo",
//           ...(secondary.score != null ? { score: secondary.score } : {}),
//         });
//       }
//     }

//     open.checkOutTime = new Date();
//     open.checkOutPhoto = fileId;
//     open.totalMs = Math.max(0, open.checkOutTime - open.checkInTime);
//     await open.save();

//     await pushAttendanceToSAP(open, employee);

//     return res.json({
//       message: "Checked out successfully",
//       workedMs: open.totalMs,
//       score: primary.score,
//     });
//   } catch (err) {
//     console.error("Check-out error:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// }

// /** LIST ATTENDANCE FOR AN EMPLOYEE (employee or admin) */
// export async function listEmployeeAttendance(req, res) {
//   try {
//     const { empId } = req.params;
//     const { from, to } = req.query;

//     if (!canAccessEmployee(req, empId)) return res.status(403).json({ message: "Forbidden" });

//     const employee = await Employee.findOne({ empId });
//     if (!employee) return res.status(404).json({ message: "Employee not found" });

//     const q = { employee: employee._id };
//     if (from || to) {
//       q.createdAt = {};
//       if (from) q.createdAt.$gte = new Date(from);
//       if (to) q.createdAt.$lte = new Date(to);
//     }

//     const rows = await Attendance.find(q).sort({ createdAt: -1 });
//     res.json(rows);
//   } catch (err) {
//     console.error("listEmployeeAttendance error:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// }

// /** LIST ALL ATTENDANCE (admin only) */
// export async function listAllAttendance(req, res) {
//   try {
//     if (!["boss", "hr", "manager"].includes(req.user?.role)) {
//       return res.status(403).json({ message: "Forbidden" });
//     }

//     const { from, to, empId } = req.query || {};
//     const timeFilter = {};
//     if (from) timeFilter.$gte = new Date(from);
//     if (to) timeFilter.$lte = new Date(to);

//     const empFilter = {};
//     if (empId) empFilter.empId = empId;

//     // Map empId -> _id for filter if provided
//     let empIds = undefined;
//     if (empId) {
//       const match = await Employee.find(empFilter).select("_id");
//       empIds = match.map((m) => m._id);
//     }

//     const q = {};
//     if (Object.keys(timeFilter).length) {
//       q.checkInTime = timeFilter;
//     }
//     if (empIds) {
//       q.employeeId = { $in: empIds };
//     }

//     const rows = await Attendance.find(q)
//       .populate("employeeId", "empId name role")
//       .sort({ checkInTime: -1 });

//     const mapped = rows.map((r) => ({
//       _id: r._id,
//       employee: {
//         empId: r.employeeId?.empId,
//         name: r.employeeId?.name,
//         role: r.employeeId?.role,
//       },
//       checkInTime: r.checkInTime,
//       checkOutTime: r.checkOutTime,
//     }));

//     res.json(mapped);
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ message: "Server error" });
//   }
// }



// controllers/attendanceController.js
import mongoose from "mongoose";
import Employee from "../models/Employee.js";
import Attendance from "../models/Attendance.js";
import { pushAttendanceToSAP } from "../services/sapService.js";

/**
 * Save file buffer to GridFS bucket "attendancePhotos"
 * returns the fileId as string
 */
async function saveToGridFS(file) {
  if (!file) throw new Error("No file provided");

  const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: "attendancePhotos",
  });

  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(file.originalname, {
      contentType: file.mimetype,
    });

    uploadStream.end(file.buffer);

    uploadStream.on("finish", () => {
      console.log("✅ Stored in GridFS:", uploadStream.id);
      resolve(uploadStream.id.toString());
    });

    uploadStream.on("error", (err) => {
      console.error("❌ GridFS upload error:", err);
      reject(err);
    });
  });
}

function canAccessEmployee(req, empId) {
  // boss has access to any employee record, otherwise only self
  return req.user?.role === "boss" || req.user?.empId === empId;
}

/** CHECK-IN */
export async function checkIn(req, res) {
  try {
    const { empId } = req.params;
    if (!canAccessEmployee(req, empId))
      return res.status(403).json({ message: "Forbidden" });

    if (!req.file) return res.status(400).json({ message: "Photo is required" });

    const employee = await Employee.findOne({ empId });
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    // prevent duplicate open check-in
    const open = await Attendance.findOne({
      employee: employee._id,
      checkOutTime: { $exists: false },
    });
    if (open)
      return res.status(400).json({ message: "Already checked in. Please check out first." });

    // Save photo to GridFS
    const fileId = await saveToGridFS(req.file);

    const record = await Attendance.create({
      employee: employee._id,
      checkInTime: new Date(),
      checkInPhoto: fileId,
    });

    await pushAttendanceToSAP(record, employee);

    // 🔥 notify clients
req.app.get("io").emit("attendanceUpdated", { empId: employee.empId });

    return res.json({ message: "Checked in successfully", attendanceId: record._id });
  } catch (err) {
    console.error("Check-in error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

/** CHECK-OUT */
export async function checkOut(req, res) {
  try {
    const { empId } = req.params;
    if (!canAccessEmployee(req, empId))
      return res.status(403).json({ message: "Forbidden" });

    if (!req.file) return res.status(400).json({ message: "Photo is required" });

    const employee = await Employee.findOne({ empId });
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const open = await Attendance.findOne({
      employee: employee._id,
      checkOutTime: { $exists: false },
    }).sort({ createdAt: -1 });

    if (!open) return res.status(400).json({ message: "No open check-in found" });

    // Save checkout photo to GridFS
    const fileId = await saveToGridFS(req.file);

    open.checkOutTime = new Date();
    open.checkOutPhoto = fileId;
    open.totalMs = Math.max(0, open.checkOutTime - open.checkInTime);
    await open.save();

    await pushAttendanceToSAP(open, employee);

    // 🔥 notify clients
req.app.get("io").emit("attendanceUpdated", { empId: employee.empId });


    return res.json({
      message: "Checked out successfully",
      workedMs: open.totalMs,
    });
  } catch (err) {
    console.error("Check-out error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

/** LIST ATTENDANCE FOR AN EMPLOYEE (employee or admin) */
export async function listEmployeeAttendance(req, res) {
  try {
    const { empId } = req.params;
    const { from, to } = req.query;

    if (!canAccessEmployee(req, empId)) return res.status(403).json({ message: "Forbidden" });

    const employee = await Employee.findOne({ empId });
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const q = { employee: employee._id };
    if (from || to) {
      q.createdAt = {};
      if (from) q.createdAt.$gte = new Date(from);
      if (to) q.createdAt.$lte = new Date(to);
    }

    const rows = await Attendance.find(q).sort({ createdAt: -1 });
    res.json(rows);
  } catch (err) {
    console.error("listEmployeeAttendance error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

/** LIST ALL ATTENDANCE (admin only) */
export async function listAllAttendance(req, res) {
  try {
    const userRole = req.user?.role?.toLowerCase(); // role from JWT or session
    const q = {};

    // Apply date filters if given
    if (req.query.from && req.query.to) {
      q.checkInTime = { $gte: new Date(req.query.from), $lte: new Date(req.query.to) };
    }

    // If empId filter passed (manual search), still allow
    if (req.query.empId) {
      const emp = await Employee.findOne({ empId: req.query.empId });
      if (emp) q.employee = emp._id;
    }

    if (userRole === "boss") {
  // ✅ Show HR + Managers
  const hrAndManagers = await Employee.find({
    role: { $in: ["hr", "manager"] },
  }).select("_id");
  q.employee = { $in: hrAndManagers.map((u) => u._id) };
} else if (userRole === "hr") {
  // Show only Employees
  const empUsers = await Employee.find({ role: "employee" }).select("_id");
  q.employee = { $in: empUsers.map((u) => u._id) };
}
    // managers can see all employees by default

    const rows = await Attendance.find(q)
      .populate("employee", "empId name role") // ✅ ensure we load empId, name, role
      .sort({ checkInTime: -1 });

    const mapped = rows.map((r) => ({
      _id: r._id,
      employee: {
        empId: r.employee?.empId,
        name: r.employee?.name,
        role: r.employee?.role,
      },
      checkInTime: r.checkInTime,
      checkOutTime: r.checkOutTime,
      totalMs: r.totalMs,
    }));

    res.json(mapped);
  } catch (err) {
    console.error("listAllAttendance error:", err);
    res.status(500).json({ message: "Server error" });
  }
}
