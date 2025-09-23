// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })


// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   server: {
//     proxy: {
//       "/api": {
//         target: "https://date.nager.at",  // target API server
//         changeOrigin: true,
//         rewrite: (path) => path.replace(/^\/api/, ""), // remove "/api" prefix
//       },
//     },
//   },
// })


import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Change this to wherever your backend runs in dev
const backendURL = "http://172.0.29.206:2000/";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/auth": {
        target: backendURL,
        changeOrigin: true,
      },
      "/employee": {
        target: backendURL,
        changeOrigin: true,
      },
      "/admin": {
        target: backendURL,
        changeOrigin: true,
      },
      "/leave": {
        target: backendURL,
        changeOrigin: true,
      },
      // 🔥 Important: Socket.IO proxy
      "/socket.io": {
        target: backendURL,
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
