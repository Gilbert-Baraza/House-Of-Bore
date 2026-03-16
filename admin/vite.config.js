import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return;
          }

          if (id.includes("recharts")) {
            return "charts";
          }

          if (
            id.includes("/react/") ||
            id.includes("\\react\\") ||
            id.includes("/react-dom/") ||
            id.includes("\\react-dom\\") ||
            id.includes("/scheduler/") ||
            id.includes("\\scheduler\\") ||
            id.includes("/react-router/") ||
            id.includes("\\react-router\\") ||
            id.includes("/react-router-dom/") ||
            id.includes("\\react-router-dom\\") ||
            id.includes("/history/") ||
            id.includes("\\history\\")
          ) {
            return "react-vendor";
          }

          return "vendor";
        }
      }
    }
  }
});
