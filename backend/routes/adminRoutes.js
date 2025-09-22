
// routes/adminRoutes.js
import { Router } from "express";
import { auth, requireRole } from "../middlewares/authMiddleware.js";

import {
  getAllEmployees,
  updateEmployee,
  deleteEmployee,
  getAllLeaveRequests,   // boss -> view HR/Manager leave requests
  createEmployee,
} from "../controllers/adminController.js";

import { updateLeaveRequestStatus } from "../controllers/leaveController.js"; // boss -> approve/reject
import { listAllAttendance } from "../controllers/attendanceController.js";
import { employeePhotoUpload } from "../middlewares/upload.js";

const router = Router();

/**
 * Employee CRUD - accessible to boss, hr, manager
 * Endpoints remain /api/admin/employees...
 */
router.get(
  "/employees",
  auth,
  requireRole("boss", "hr", "manager"),
  getAllEmployees
);

router.post(
  "/employees",
  auth,
  requireRole("boss", "hr", "manager"),
  employeePhotoUpload.single("photo"),
  createEmployee
);

router.put(
  "/employees/:empId",
  auth,
  requireRole("boss", "hr", "manager"),
  employeePhotoUpload.single("photo"),
  updateEmployee
);

router.delete(
  "/employees/:empId",
  auth,
  requireRole("boss", "hr", "manager"),
  deleteEmployee
);

/**
 * Leave management - boss only
 * GET  /api/admin/leave-requests  -> list only HR/Manager requests
 * PUT  /api/admin/leave-request   -> approve/reject one
 */
router.get(
  "/leave-requests",
  auth,
  requireRole("boss"),
  getAllLeaveRequests
);

router.put(
  "/leave-request",
  auth,
  requireRole("boss"),
  updateLeaveRequestStatus
);

/**
 * Attendance - boss/hr/manager
 */
router.get(
  "/attendance",
  auth,
  requireRole("boss", "hr", "manager"),
  listAllAttendance
);

export default router;










