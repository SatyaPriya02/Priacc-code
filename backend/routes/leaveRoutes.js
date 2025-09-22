
// routes/leaveRoutes.js
import { Router } from "express";
import { auth, requireRole } from "../middlewares/authMiddleware.js";
import {
  createLeaveRequest,
  getMyLeaveRequests,
  hrInboxForEmployeeLeaves,
  hrDecideEmployeeLeave,
} from "../controllers/leaveController.js";

const router = Router();

/**
 * Employee/HR/Manager/Boss can:
 * - Create leave request
 * - View their own leave requests
 */
router.post("/request", auth, createLeaveRequest);      // POST /api/leave/request
router.get("/requests", auth, getMyLeaveRequests);      // GET  /api/leave/requests

/**
 * HR/Manager inbox & actions for EMPLOYEE requests
 */
router.get("/inbox", auth, requireRole("hr", "manager"), hrInboxForEmployeeLeaves); // GET /api/leave/inbox

router.post("/:id/approve", auth, requireRole("hr", "manager"), (req, res) =>
  hrDecideEmployeeLeave(req, res, "Approved") // POST /api/leave/:id/approve
);

router.post("/:id/reject", auth, requireRole("hr", "manager"), (req, res) =>
  hrDecideEmployeeLeave(req, res, "Rejected") // POST /api/leave/:id/reject
);

export default router;
