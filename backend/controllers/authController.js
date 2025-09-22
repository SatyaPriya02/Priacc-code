
// import Employee from "../models/Employee.js";
// import EmailOTP from "../models/EmailOTP.js";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import { sendMail } from "../utils/email.js";

// export async function loginWithPassword(req, res) {
//   try {
//     const { login, password } = req.body;
//     if (!login || !password) {
//       return res.status(400).json({ message: "login and password are required" });
//     }

//     const q = login.includes("@") ? { email: login } : { empId: login };
//     const user = await Employee.findOne(q);
//     if (!user?.passwordHash) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     const ok = await bcrypt.compare(password, user.passwordHash);
//     if (!ok) return res.status(401).json({ message: "Invalid credentials" });

//     const token = jwt.sign(
//       { sub: user._id, empId: user.empId, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "12h" }
//     );

//     res.json({
//       token,
//       employee: {
//         _id: user._id,
//         empId: user.empId,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       },
//     });
//   } catch (e) {
//     console.error("Login error:", e);
//     res.status(500).json({ message: "Server error" });
//   }
// }

// export async function forgotPassword(req, res) {
//   try {
//     const { login } = req.body;
//     if (!login) return res.status(400).json({ message: "login is required" });

//     const q = login.includes("@") ? { email: login } : { empId: login };
//     const user = await Employee.findOne(q);
//     if (!user?.email) return res.status(404).json({ message: "User/email not found" });

//     // Generate OTP
//     const code = String(Math.floor(100000 + Math.random() * 900000));
//     await EmailOTP.create({ email: user.email, code, purpose: "reset" });

//     // Send email with OAuth2 Gmail
//     await sendMail({
//       to: user.email,
//       subject: "Your password reset code",
//       text: `Your OTP is ${code}. It expires in 5 minutes.`,
//       html: `<p>Your OTP is <b>${code}</b>. It expires in 5 minutes.</p>`,
//     });

//     res.json({ message: "OTP sent to registered email" });
//   } catch (e) {
//     console.error("Forgot password error:", e);
//     res.status(500).json({ message: "Server error" });
//   }
// }

// export async function resetPassword(req, res) {
//   try {
//     const { login, otp, newPassword } = req.body;
//     if (!login || !otp || !newPassword) {
//       return res.status(400).json({ message: "login, otp, newPassword are required" });
//     }

//     const q = login.includes("@") ? { email: login } : { empId: login };
//     const user = await Employee.findOne(q);
//     if (!user?.email) return res.status(404).json({ message: "User/email not found" });

//     // Get latest OTP
//     const latest = await EmailOTP.findOne({ email: user.email, purpose: "reset" }).sort({ createdAt: -1 });
//     if (!latest) return res.status(400).json({ message: "OTP not found or expired" });
//     if (latest.code !== otp) return res.status(400).json({ message: "Invalid OTP" });

//     // Update password
//     user.passwordHash = await bcrypt.hash(newPassword, 10);
//     await user.save();

//     // Cleanup OTPs
//     await EmailOTP.deleteMany({ email: user.email, purpose: "reset" });

//     res.json({ message: "Password updated. You can login now." });
//   } catch (e) {
//     console.error("Reset password error:", e);
//     res.status(500).json({ message: "Server error" });
//   }
// }


// controllers/authController.js
import Employee from "../models/Employee.js";
import EmailOTP from "../models/EmailOTP.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendMail } from "../utils/email.js";

// Login with Employee ID or Email
export async function loginWithPassword(req, res) {
  try {
    const { login, password } = req.body;
    if (!login || !password) {
      return res.status(400).json({ message: "login and password are required" });
    }

    const q = login.includes("@") ? { email: login } : { empId: login };
    const user = await Employee.findOne(q);
    if (!user?.passwordHash) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check against DB passwordHash only
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    // Generate JWT
    const token = jwt.sign(
      { sub: user._id, empId: user.empId, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.json({
      token,
      employee: {
        _id: user._id,
        empId: user.empId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    console.error("Login error:", e);
    res.status(500).json({ message: "Server error" });
  }
}

// Forgot password - sends OTP
export async function forgotPassword(req, res) {
  try {
    const { login } = req.body;
    if (!login) return res.status(400).json({ message: "login is required" });

    const q = login.includes("@") ? { email: login } : { empId: login };
    const user = await Employee.findOne(q);
    if (!user?.email) return res.status(404).json({ message: "User/email not found" });

    // Generate OTP
    const code = String(Math.floor(100000 + Math.random() * 900000));
    await EmailOTP.create({ email: user.email, code, purpose: "reset" });

    // Send OTP mail
    await sendMail({
      to: user.email,
      subject: "Your password reset code",
      text: `Your OTP is ${code}. It expires in 5 minutes.`,
      html: `<p>Your OTP is <b>${code}</b>. It expires in 5 minutes.</p>`,
    });

    res.json({ message: "OTP sent to registered email" });
  } catch (e) {
    console.error("Forgot password error:", e);
    res.status(500).json({ message: "Server error" });
  }
}

// Reset password with OTP
export async function resetPassword(req, res) {
  try {
    const { login, otp, newPassword } = req.body;
    if (!login || !otp || !newPassword) {
      return res.status(400).json({ message: "login, otp, newPassword are required" });
    }

    const q = login.includes("@") ? { email: login } : { empId: login };
    const user = await Employee.findOne(q);
    if (!user?.email) return res.status(404).json({ message: "User/email not found" });

    // Get latest OTP
    const latest = await EmailOTP.findOne({ email: user.email, purpose: "reset" }).sort({ createdAt: -1 });
    if (!latest) return res.status(400).json({ message: "OTP not found or expired" });
    if (latest.code !== otp) return res.status(400).json({ message: "Invalid OTP" });

    // Update password
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    // Cleanup OTPs
    await EmailOTP.deleteMany({ email: user.email, purpose: "reset" });

    res.json({ message: "Password updated. You can login now." });
  } catch (e) {
    console.error("Reset password error:", e);
    res.status(500).json({ message: "Server error" });
  }
}
