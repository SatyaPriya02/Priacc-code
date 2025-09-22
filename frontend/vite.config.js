// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://date.nager.at",  // target API server
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""), // remove "/api" prefix
      },
    },
  },
})
