
// middlewares/upload.js
import multer from "multer";

const imageOnly = (req, file, cb) => {
  if (/^image\//.test(file.mimetype)) cb(null, true);
  else cb(new Error("Only image uploads are allowed"), false);
};

// ✅ registered employee photos → memory (we will put into GridFS in controller)
export const employeePhotoUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: imageOnly,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ✅ attendance photos already used memory + GridFS in your code (keep as-is)
export const attendancePhotoUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: imageOnly,
  limits: { fileSize: 5 * 1024 * 1024 },
});


