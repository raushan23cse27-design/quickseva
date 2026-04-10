import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { mockupPreviewPlugin } from "./mockupPreviewPlugin";

export default defineConfig({
  // ✅ VERY IMPORTANT for GitHub Pages
  base: "/quickseva/",

  plugins: [
    mockupPreviewPlugin(),
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  root: path.resolve(__dirname),

  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
  },

  server: {
    port: 3000,
    host: "0.0.0.0",
  },

  preview: {
    port: 3000,
    host: "0.0.0.0",
  },
});
