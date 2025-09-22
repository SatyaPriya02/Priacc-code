// models/EmailOTP.js
import mongoose from "mongoose";

const emailOtpSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  code: { type: String, required: true },
  purpose: { type: String, enum: ["reset"], default: "reset" },
  createdAt: { type: Date, default: Date.now, expires: 300 } // 5 min TTL
}, { timestamps: true });

// ✅ Export as default
const EmailOTP = mongoose.model("EmailOTP", emailOtpSchema);
export default EmailOTP;
