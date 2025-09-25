



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

export async function listAllAttendance(req, res) {
  try {
    const userRole = req.user?.role?.toLowerCase(); // role from JWT or session
    const q = {};

    // Apply date filters if given
    if (req.query.from || req.query.to) {
      q.checkInTime = {};
      if (req.query.from) q.checkInTime.$gte = new Date(req.query.from);
      if (req.query.to) q.checkInTime.$lte = new Date(req.query.to);
    }

    // If empId filter passed (manual search), resolve to ObjectId
    let empFilterId = null;
    if (req.query.empId) {
      const emp = await Employee.findOne({ empId: req.query.empId }).select("_id");
      if (!emp) {
        return res.json([]); // no match → return empty
      }
      empFilterId = emp._id;
    }

    // Role-based filtering
    if (userRole === "boss") {
      // ✅ Show HR + Managers
      const hrAndManagers = await Employee.find({
        role: { $in: ["hr", "manager"] },
      }).select("_id");

      const allowedIds = hrAndManagers.map((u) => u._id);

      // combine with empId filter if present
      if (empFilterId) {
        if (!allowedIds.some((id) => id.equals(empFilterId))) {
          return res.json([]); // empId not in boss-allowed list
        }
        q.employee = empFilterId;
      } else {
        q.employee = { $in: allowedIds };
      }
    } else if (userRole === "hr") {
      // Show only Employees
      const empUsers = await Employee.find({ role: "employee" }).select("_id");
      const allowedIds = empUsers.map((u) => u._id);

      if (empFilterId) {
        if (!allowedIds.some((id) => id.equals(empFilterId))) {
          return res.json([]); // empId not an employee → HR can’t see it
        }
        q.employee = empFilterId;
      } else {
        q.employee = { $in: allowedIds };
      }
    } else if (userRole === "manager") {
      // Managers → see all, just apply empId if provided
      if (empFilterId) {
        q.employee = empFilterId;
      }
    }

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
