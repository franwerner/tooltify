import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    outDir: path.resolve(__dirname, "./dist"),
    emptyOutDir: true,
    lib: {
      entry: path.resolve(__dirname, "entry.tsx"),
      name: "Devtools",
      fileName: "devtools",
      formats: ["iife"],
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
