import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API requests
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
      // Proxy WebSocket connections
      "/ws": {
        target: "ws://localhost:8080",
        ws: true,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
    },
  },
});
