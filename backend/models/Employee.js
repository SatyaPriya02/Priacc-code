// models/Employee.js
import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
  empId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  role: {
    type: String,
    enum: ["boss", "hr", "manager", "employee"],
    required: true,
    default: "employee",
  },
  mobile: { type: String },

  // ✅ now stores GridFS file id (string). Use /api/file/:id to serve.
  photo: { type: String },

  // password-based auth
  passwordHash: { type: String }, // bcrypt hash
}, { timestamps: true });

export default mongoose.model("Employee", employeeSchema);




