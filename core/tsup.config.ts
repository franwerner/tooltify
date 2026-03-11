import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "./index.ts",
  },
  format: ["esm"],
  dts: true,
  splitting: false,
  clean: true,
  outDir: "dist",
  external: [
    "socket.io",
    "express",
    "jsonwebtoken",
    "cors"
  ],
});
