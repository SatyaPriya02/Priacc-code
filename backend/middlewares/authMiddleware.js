
// middlewares/authMiddleware.js
import jwt from "jsonwebtoken";
import Employee from "../models/Employee.js";

/**
 * Verifies the Bearer token and loads req.user from the DB.
 * Returns 401 on missing/invalid/expired token or unknown user.
 */
export async function auth(req, res, next) {
  try {
    const hdr = req.headers.authorization || "";
    const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
    if (!token) return res.status(401).json({ message: "No token provided" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Primary: by Mongo _id in payload.sub
    let user = payload?.sub ? await Employee.findById(payload.sub) : null;

    // Back-compat: allow empId if your older tokens used it
    if (!user && payload?.empId) {
      user = await Employee.findOne({ empId: payload.empId });
    }

    if (!user) return res.status(401).json({ message: "Invalid token user" });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

/**
 * Role guard. Usage: requireRole('boss', 'hr') or requireRole(['boss','manager'])
 * - 401 if not authenticated
 * - 403 if authenticated but role not allowed
 */
export function requireRole(...allowed) {
  // allow both requireRole('a','b') and requireRole(['a','b'])
  const flat = allowed.flat().map((r) => String(r).toLowerCase());
  const allowedSet = new Set(flat);

  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const role = String(req.user.role ?? "").toLowerCase();
    if (allowedSet.size > 0 && !allowedSet.has(role)) {
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }
    next();
  };
}
