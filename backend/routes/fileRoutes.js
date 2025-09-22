// // routes/fileRoutes.js
// import { Router } from "express";
// import { streamFromGridFS } from "../utils/gridfs.js";

// const router = Router();

// /** GET /api/file/:id  (serves from BOTH buckets; we try attendance first, then employees) */
// router.get("/file/:id", async (req, res) => {
//   const { id } = req.params;

//   const tryBucket = async (bucketName) =>
//     new Promise((resolve, reject) => {
//       try {
//         const stream = streamFromGridFS(id, bucketName);
//         let sent = false;
//         stream.on("file", (f) => {
//           if (!sent && f?.contentType) res.setHeader("Content-Type", f.contentType);
//         });
//         stream.on("data", (c) => {
//           if (!sent) { sent = true; res.status(200); }
//           res.write(c);
//         });
//         stream.on("end", () => (sent ? res.end() : reject(new Error("notfound"))));
//         stream.on("error", reject);
//       } catch (e) {
//         reject(e);
//       }
//     });

//   try {
//     await tryBucket("attendancePhotos");           // existing bucket (check-in/out)
//   } catch {
//     try {
//       await tryBucket("employeePhotos");           // NEW bucket (registered pictures)
//     } catch {
//       res.status(404).json({ message: "File not found" });
//     }
//   }
// });

// export default router;




// routes/fileRoutes.js
import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

function streamFrom(bucketName, id) {
  const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName });
  return bucket.openDownloadStream(mongoose.Types.ObjectId.createFromHexString(id));
}

/** GET /api/file/:id */
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  console.log(`[FileRoute] DS (or client) requested photo: ${id}`);

  if (!id || !/^[a-f0-9]{24}$/i.test(id)) {
    return res.status(400).json({ message: "Invalid file id" });
  }

  const tryBucket = (name) =>
    new Promise((resolve, reject) => {
      const stream = streamFrom(name, id);
      let headersSent = false;

      stream.on("file", (file) => {
        if (!headersSent) {
          if (file.contentType) res.setHeader("Content-Type", file.contentType);
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
          headersSent = true;
        }
      });

      stream.on("error", reject);
      stream.on("end", resolve);

      // Pipe into the response but don't end it so we can try the next bucket if needed
      stream.pipe(res, { end: false });
    });

  try {
    await tryBucket("attendancePhotos");
    return res.end();
  } catch {
    // fall through to next bucket
  }

  try {
    await tryBucket("employeePhotos");
    return res.end();
  } catch {
    return res.status(404).json({ message: "File not found" });
  }
});

export default router;