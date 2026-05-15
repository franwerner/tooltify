import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

// Backend levantado por `dev:server` (core/server/dev.ts -> dev-fixtures/tooltify.config.json).
const SERVER_TARGET = "http://localhost:6100";

const proxyToServer = {
  target: SERVER_TARGET,
  changeOrigin: true,
};

export default defineConfig({
  root: __dirname,
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
  server: {
    port: 6200,
    proxy: {
      "/auth": proxyToServer,
      "/editor": proxyToServer,
      "/build": proxyToServer,
      "/socket.io": { ...proxyToServer, ws: true },
    },
  },
});
