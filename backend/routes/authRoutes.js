
// // routes/authRoutes.js
// import { Router } from "express";
// import { loginWithPassword, forgotPassword, resetPassword } from "../controllers/authController.js";

// const router = Router();

// // Only relative paths here
// router.post("/login", loginWithPassword);
// router.post("/forgot-password", forgotPassword);
// router.post("/reset-password", resetPassword);

// export default router;


// routes/authRoutes.js
import { Router } from "express";
import { loginWithPassword, forgotPassword, resetPassword } from "../controllers/authController.js";

const router = Router();

router.post("/login", loginWithPassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
