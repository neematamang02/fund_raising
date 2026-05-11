import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react({ jsxRuntime: "automatic" }), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Don't split React/ReactDOM - keep them in main bundle
          if (
            id.includes("node_modules/react") ||
            id.includes("node_modules/scheduler")
          ) {
            return;
          }

          // Split other vendor chunks
          if (id.includes("node_modules")) {
            if (id.includes("@paypal")) return "paypal-vendor";
            if (id.includes("@tanstack/react-query")) return "query-vendor";
            if (id.includes("react-router")) return "router-vendor";
            return "vendor";
          }
        },
      },
    },
    chunkSizeWarningLimit: 1500,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: process.env.VITE_BACKEND_URL || "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
