// // utils/faceVerification.js
// import dotenv from "dotenv";
// dotenv.config();

// // If Node < 18, uncomment next line and install node-fetch
// // import fetch from "node-fetch";

// const DS_VERIFY_URL = process.env.DS_VERIFY_URL;
// const DS_API_KEY = process.env.DS_API_KEY || "";
// const FACE_MATCH_THRESHOLD = Number(process.env.FACE_MATCH_THRESHOLD || 0.8);

// // Accepts two images (data URLs or raw base64/urls). DS can decide how to handle.
// export async function verifyFaces(imageA, imageB) {
//   if (!DS_VERIFY_URL) {
//     // Safety fallback: block if DS is not configured
//     return { ok: false, score: null, source: "fallback-no-ds" };
//   }

//   try {
//     const res = await fetch(DS_VERIFY_URL, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         ...(DS_API_KEY ? { "Authorization": `Bearer ${DS_API_KEY}` } : {})
//       },
//       body: JSON.stringify({
//         imageA,
//         imageB
//       })
//     });

//     if (!res.ok) {
//       return { ok: false, score: null, source: "http-error" };
//     }

//     // DS could return: { match: true/false } OR { score: 0..1 } OR { percentage: 0..100 }
//     const data = await res.json();

//     let ok = false;
//     let score = null;

//     if (typeof data === "boolean") {
//       ok = data;
//     } else if (typeof data?.match === "boolean") {
//       ok = data.match;
//       score = data.score ?? null;
//     } else if (typeof data?.score === "number") {
//       score = data.score; // 0..1
//       ok = score >= FACE_MATCH_THRESHOLD;
//     } else if (typeof data?.percentage === "number") {
//       score = data.percentage / 100; // convert 0..100 -> 0..1
//       ok = score >= FACE_MATCH_THRESHOLD;
//     }

//     return { ok: !!ok, score };
//   } catch (e) {
//     return { ok: false, score: null, source: "exception" };
//   }
// }



// utils/faceVerification.js
import dotenv from "dotenv";
dotenv.config();

const DS_URL = process.env.DS_VERIFY_URL;
const DS_API_KEY = process.env.DS_API_KEY || "";
const FACE_MATCH_THRESHOLD = Number(process.env.FACE_MATCH_THRESHOLD || 0.8);
const DS_TIMEOUT = Number(process.env.DS_VERIFY_TIMEOUT_MS || 5000);

function withTimeout(ms, promise) {
  return Promise.race([
    promise,
    new Promise((_, rej) => setTimeout(() => rej(Object.assign(new Error("ds-timeout"), { code: "ETIMEDOUT" })), ms)),
  ]);
}

export async function verifyFaces(imageA, imageB) {
  if (!DS_URL) return { ok: false, score: null, source: "no-ds-url" };

  try {
    const res = await withTimeout(
      DS_TIMEOUT,
      fetch(DS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(DS_API_KEY ? { Authorization: `Bearer ${DS_API_KEY}`} : {}),
        },
        body: JSON.stringify({
          imageA, imageB,
          imageAUrl: imageA, imageBUrl: imageB, // extra keys for compatibility
        }),
      })
    );

    if (!res.ok) {
      let detail = null;
      try { detail = await res.json(); } catch {}
      return { ok: false, score: null, source: `http-${res.status}`, detail };
    }

    const data = await res.json();
    let ok = false, score = null;
    if (typeof data === "boolean") ok = data;
    else if (typeof data?.match === "boolean") { ok = data.match; score = data.score ?? null; }
    else if (typeof data?.score === "number") { score = data.score; ok = score >= FACE_MATCH_THRESHOLD; }
    else if (typeof data?.percentage === "number") { score = data.percentage / 100; ok = score >= FACE_MATCH_THRESHOLD; }

    return { ok: !!ok, score };
  } catch (e) {
    // Surface Node fetch/network/TLS error clearly
    const info = {
      message: e?.message,
      name: e?.name,
      code: e?.code,               // e.g. 'ECONNREFUSED', 'ENOTFOUND'
      cause: e?.cause?.code,       // Node >=18 sometimes sets this
      urlTried: DS_URL,
    };
    console.error("[verifyFaces] fetch failed:", info);
    return { ok: false, score: null, source: "fetch-failed", detail: info };
  }
}