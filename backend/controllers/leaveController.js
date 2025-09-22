// controllers/leaveController.js
import LeaveRequest from "../models/LeaveRequest.js";
import Employee from "../models/Employee.js";

export async function updateLeaveRequestStatus(req, res) {
  try {
    if (req.user?.role !== "boss") return res.status(403).json({ message: "Forbidden" });

    const { leaveRequestId, status } = req.body;
    if (!leaveRequestId || !status) return res.status(400).json({ message: "Missing fields" });

    const leave = await LeaveRequest.findByIdAndUpdate(
      leaveRequestId,
      { status },
      { new: true }
    );
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    const io = req.app.get("io");
    io.emit("leaveUpdated", { id: leave._id, status: leave.status });

    res.json({ message: "Status updated", leave });
  } catch (error) {
    console.error("updateLeaveRequestStatus error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getMyLeaveRequests(req, res) {
  try {
    const userId = req.user?._id;
    const rows = await LeaveRequest.find({ employeeId: userId })
      .sort({ createdAt: -1 });
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}


export async function createLeaveRequest(req, res) {
  try {
    const userId = req.user?._id;
    const { fromDate, toDate, reason } = req.body || {};

    if (!fromDate || !toDate || !reason?.trim()) {
      return res.status(400).json({ message: "fromDate, toDate and reason are required" });
    }

    const doc = await LeaveRequest.create({
      employeeId: userId,
      fromDate,
      toDate,
      reason: String(reason).trim(),
      status: "Pending",
      createdAt: new Date(),
    });

    const populated = await doc.populate("employeeId", "empId name role");

    // ✅ Emit to all connected clients (HR/Boss dashboards will listen)
    const io = req.app.get("io");
    io.emit("leaveCreated", populated);

    res.status(201).json(populated);
  } catch (e) {
    console.error("createLeaveRequest error:", e);
    res.status(500).json({ message: "Server error" });
  }
}


/**
 * HR/Manager inbox: show only EMPLOYEE requests
 * Query: ?status=Pending|Approved|Rejected  (optional)
 */
export async function hrInboxForEmployeeLeaves(req, res) {
  try {
    const { status } = req.query;

    const employeeIds = await Employee.find({ role: "employee" }).distinct("_id");
    const q = { employeeId: { $in: employeeIds } };
    if (status) q.status = status;

    const rows = await LeaveRequest.find(q)
      .populate("employeeId", "empId name role")
      .sort({ createdAt: -1 });

    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}

// controllers/leaveController.js
export async function hrDecideEmployeeLeave(req, res, decision) {
  try {
    const { id } = req.params;
    const note = (req.body?.note || "").trim();

    const lr = await LeaveRequest.findById(id).populate("employeeId", "role name empId");
    if (!lr) return res.status(404).json({ message: "Leave request not found" });

    if (!lr.employeeId || lr.employeeId.role !== "employee") {
      return res.status(403).json({ message: "Only EMPLOYEE requests can be actioned by HR/Manager" });
    }

    lr.status = decision;
    lr.decisionNote = note || undefined;
    lr.decidedBy = req.user._id;
    lr.decidedAt = new Date();

    await lr.save();

    // ✅ Notify all clients in real-time
    const io = req.app.get("io");
    io.emit("leaveUpdated", { id: lr._id, status: lr.status });

    res.json({ message: `Leave ${decision.toLowerCase()}`, leave: lr });
  } catch (e) {
    console.error("hrDecideEmployeeLeave error:", e);
    res.status(500).json({ message: "Server error" });
  }
}
