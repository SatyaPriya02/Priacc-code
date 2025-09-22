// utils/cleanup.js
import fs from "fs";
import path from "path";
import Attendance from "../models/Attendance.js";
import dotenv from "dotenv";

dotenv.config();

const RETENTION_DAYS = parseInt(process.env.RETENTION_DAYS || "30", 10);

export async function cleanupOldAttendancePhotos() {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);

    // find old records
    const oldRecords = await Attendance.find({
      checkInTime: { $lt: cutoffDate },
    });

    for (const record of oldRecords) {
      // delete check-in photo
      if (record.checkInPhoto) {
        const filePath = path.join(process.cwd(), record.checkInPhoto);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log("🗑 Deleted check-in photo:", filePath);
        }
      }

      // delete check-out photo
      if (record.checkOutPhoto) {
        const filePath = path.join(process.cwd(), record.checkOutPhoto);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log("🗑 Deleted check-out photo:", filePath);
        }
      }

      // Option A: delete whole record
      await Attendance.deleteOne({ _id: record._id });

      // Option B: keep record, only clear photos
      // record.checkInPhoto = null;
      // record.checkOutPhoto = null;
      // await record.save();
    }

    console.log(`✅ Cleanup finished, removed ${oldRecords.length} old records/photos`);
  } catch (err) {
    console.error("❌ Cleanup error:", err);
  }
}
