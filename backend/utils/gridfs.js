// utils/gridfs.js
import mongoose from "mongoose";

export async function saveBufferToGridFS({ buffer, filename, mimetype, bucketName }) {
  const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName,
  });
  return new Promise((resolve, reject) => {
    const upload = bucket.openUploadStream(filename || "file", { contentType: mimetype });
    upload.end(buffer);
    upload.on("finish", () => resolve(upload.id.toString()));
    upload.on("error", reject);
  });
}

export function streamFromGridFS(fileId, bucketName) {
  const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName,
  });
  return bucket.openDownloadStream(mongoose.Types.ObjectId.createFromHexString(fileId));
}
