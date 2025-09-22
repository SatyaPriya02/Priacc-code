// // models/Attendance.js
// import mongoose from "mongoose";

// const attendanceSchema = new mongoose.Schema(
//   {
//     employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
//     checkInTime: { type: Date },
//     checkOutTime: { type: Date },
//     checkInPhoto: { type: String },  // base64 string from webcam
//     checkOutPhoto: { type: String },
//     totalMs: { type: Number }        // computed on checkout
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Attendance", attendanceSchema);



// models/Attendance.js
import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    checkInTime: { type: Date },
    checkOutTime: { type: Date },
    checkInPhoto: { type: String },   // GridFS ID
    checkOutPhoto: { type: String },  // GridFS ID
    totalMs: { type: Number }         // computed on checkout
  },
  { timestamps: true }
);

// ✅ Index to quickly find "open" attendance records
attendanceSchema.index({ employee: 1, checkOutTime: 1 });

// ✅ Optional: prevent duplicate open check-ins
// This partial index ensures only ONE document per employee where checkOutTime is missing
attendanceSchema.index(
  { employee: 1 },
  { unique: true, partialFilterExpression: { checkOutTime: { $exists: false } } }
);

export default mongoose.model("Attendance", attendanceSchema);
