// routes/attendanceRoutes.js
import { Router } from "express";
import { auth } from "../middlewares/authMiddleware.js";
import { checkIn, checkOut, listEmployeeAttendance } from "../controllers/attendanceController.js";
import { attendancePhotoUpload } from "../middlewares/upload.js";

const router = Router();

router.post("/employee/:empId/checkin", auth, attendancePhotoUpload.single("photo"), checkIn);
router.post("/employee/:empId/checkout", auth, attendancePhotoUpload.single("photo"), checkOut);
router.get("/employee/:empId/attendance", auth, listEmployeeAttendance);

export default router;



