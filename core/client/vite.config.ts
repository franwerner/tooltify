import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        tailwindcss(path.resolve(__dirname, "./tailwind.config.js")),
        autoprefixer(),
      ],
    },
  },
  resolve: {
    alias: [
      {
        find: "#common/",
        replacement: path.resolve(__dirname, "../common") + "/",
      },
    ],
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    outDir: path.resolve(__dirname, "./dist"),
    emptyOutDir: true,
    lib: {
      entry: path.resolve(__dirname, "entry.tsx"),
      name: "client",
      fileName: "client",
      formats: ["iife"],
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
