// controllers/adminController.js
import Employee from "../models/Employee.js";
import LeaveRequest from "../models/LeaveRequest.js";
import { saveBufferToGridFS } from "../utils/gridfs.js"; // ✅ utility to save buffer → GridFS

// =========================
// GET ALL EMPLOYEES
// =========================
export async function getAllEmployees(req, res) {
  try {
    const rows = await Employee.find().sort({ createdAt: -1 });
    res.json(rows);
  } catch (e) {
    console.error("getAllEmployees error:", e);
    res.status(500).json({ message: "Server error" });
  }
}

// // =========================
// // CREATE EMPLOYEE (with GridFS photo)
// // =========================
// export async function createEmployee(req, res) {
//   try {
//     const { empId, name, email, role: requestedRole, mobile } = req.body;

//     if (!empId || !name || !email) {
//       return res.status(400).json({ message: "empId, name and email are required" });
//     }

//     const exists = await Employee.findOne({ empId });
//     if (exists) {
//       return res.status(400).json({ message: "Employee with this ID already exists" });
//     }

//     // Determine final role
//     let finalRole = requestedRole || "employee";
//     if (["hr", "manager"].includes(req.user.role)) finalRole = "employee";
//     if (req.user.role === "boss" && !["boss", "hr", "manager", "employee"].includes(finalRole)) {
//       finalRole = "employee";
//     }

//     // ✅ Save photo to GridFS (if provided)
//     let photoId;
//     if (req.file?.buffer) {
//       photoId = await saveBufferToGridFS({
//         buffer: req.file.buffer,
//         filename: req.file.originalname,
//         mimetype: req.file.mimetype,
//         bucketName: "employeePhotos", // dedicated bucket for employee photos
//       });
//     }

//     const employee = new Employee({
//       empId,
//       name,
//       email,
//       role: finalRole,
//       mobile,
//       photo: photoId || undefined, // store GridFS ID reference
//     });
//     await employee.save();

//     res.status(201).json({ message: "Employee created successfully", employee });
//   } catch (e) {
//     console.error("createEmployee error:", e);
//     res.status(500).json({ message: "Error creating employee", error: e.message });
//   }
// }

// =========================
// CREATE EMPLOYEE (with GridFS photo + seeded password)
// =========================
export async function createEmployee(req, res) {
  try {
    const { empId, name, email, role: requestedRole, mobile, password } = req.body;

    if (!empId || !name || !email) {
      return res.status(400).json({ message: "empId, name and email are required" });
    }

    const exists = await Employee.findOne({ empId });
    if (exists) {
      return res.status(400).json({ message: "Employee with this ID already exists" });
    }

    // Determine final role
    let finalRole = requestedRole || "employee";
    if (["hr", "manager"].includes(req.user.role)) finalRole = "employee";
    if (req.user.role === "boss" && !["boss", "hr", "manager", "employee"].includes(finalRole)) {
      finalRole = "employee";
    }

    // ✅ Save photo to GridFS (if provided)
    let photoId;
    if (req.file?.buffer) {
      photoId = await saveBufferToGridFS({
        buffer: req.file.buffer,
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        bucketName: "employeePhotos",
      });
    }

    // ✅ Hash password (either provided or GLOBAL_PASSWORD as default)
    const plainPassword = password || process.env.GLOBAL_PASSWORD;
    const bcrypt = await import("bcryptjs");
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    const employee = new Employee({
      empId,
      name,
      email,
      role: finalRole,
      mobile,
      photo: photoId || undefined,
      passwordHash, // ✅ ensure login will work
    });
    await employee.save();

    res.status(201).json({ 
      message: "Employee created successfully", 
      employee: { empId: employee.empId, name: employee.name, email: employee.email, role: employee.role }
    });
  } catch (e) {
    console.error("createEmployee error:", e);
    res.status(500).json({ message: "Error creating employee", error: e.message });
  }
}


// controllers/adminController.js
export async function updateEmployee(req, res) {
  try {
    const { empId } = req.params;
    const target = await Employee.findOne({ empId });
    if (!target) return res.status(404).json({ message: "Employee not found" });

    const callerRole = (req.user?.role || "").toLowerCase();

    // HR/Manager can only edit plain employees
    if (["hr", "manager"].includes(callerRole) && (target.role || "").toLowerCase() !== "employee") {
      return res.status(403).json({ message: "Forbidden: you can edit only 'employee' users" });
    }

    // Build payload from allowed fields only
    const body = req.body || {};
    const allowed = {};
    if (typeof body.name === "string") allowed.name = body.name;
    if (typeof body.email === "string") allowed.email = body.email;
    if (typeof body.mobile === "string") allowed.mobile = body.mobile;

    // Role change rules
    if ("role" in body) {
      const reqRole = String(body.role || "").toLowerCase();
      if (callerRole === "boss") {
        if (["boss", "hr", "manager", "employee"].includes(reqRole)) {
          allowed.role = reqRole;
        }
      } else {
        // HR/Manager can only set employee
        if (reqRole !== "employee") {
          return res.status(403).json({ message: "Forbidden: cannot change role" });
        }
        allowed.role = "employee";
      }
    }

    // New photo → GridFS
    if (req.file?.buffer) {
      const photoId = await saveBufferToGridFS({
        buffer: req.file.buffer,
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        bucketName: "employeePhotos",
      });
      allowed.photo = photoId;
    }

    Object.assign(target, allowed);
    await target.save();

    res.json({ message: "Employee updated", employee: target });
  } catch (e) {
    // Duplicate key (likely: old unique index on email)
    if (e && e.code === 11000) {
      return res.status(400).json({ message: "Duplicate value for a unique field (likely email). If you want only empId unique, drop the unique index on email." });
    }
    console.error("updateEmployee error:", e);
    res.status(500).json({ message: "Server error" });
  }
}


// =========================
// DELETE EMPLOYEE
// =========================
export async function deleteEmployee(req, res) {
  try {
    const { empId } = req.params;
    const doc = await Employee.findOne({ empId });
    if (!doc) return res.status(404).json({ message: "Employee not found" });

    // HR/Manager restriction
    if (["hr", "manager"].includes(req.user.role) && doc.role !== "employee") {
      return res.status(403).json({ message: "Forbidden: you can only delete employees" });
    }

    // boss cannot delete themselves
    if (req.user.role === "boss" && String(doc._id) === String(req.user._id)) {
      return res.status(400).json({ message: "Cannot delete your own boss account" });
    }

    await Employee.deleteOne({ _id: doc._id });
    res.json({ message: "Employee deleted" });
  } catch (err) {
    console.error("deleteEmployee error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// =========================
// GET ALL LEAVE REQUESTS (Boss only)
// =========================
export async function getAllLeaveRequests(req, res) {
  try {
    if (req.user?.role !== "boss") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const hrMgr = await Employee.find({ role: { $in: ["hr", "manager"] } }).select("_id");
    const ids = hrMgr.map((d) => d._id);

    const { status } = req.query;
    const query = { employeeId: { $in: ids } };
    if (status) query.status = status;

    const leaves = await LeaveRequest.find(query)
      .populate("employeeId", "empId name role")
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    console.error("getAllLeaveRequests error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// =========================
// UPDATE LEAVE STATUS (Boss approves HR/Manager requests)
// =========================
export async function adminUpdateLeaveStatus(req, res) {
  const { leaveRequestId, status } = req.body;
  if (!leaveRequestId || !["Approved", "Rejected", "Pending"].includes(status)) {
    return res.status(400).json({ message: "Invalid leaveRequestId or status" });
  }
  const doc = await LeaveRequest.findByIdAndUpdate(
    leaveRequestId,
    { status },
    { new: true }
  ).populate("employeeId", "empId name");
  if (!doc) return res.status(404).json({ message: "Leave request not found" });
  res.json({ message: `Leave ${status.toLowerCase()}`, leaveRequest: doc });
}

