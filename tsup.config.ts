import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    core: "core/server/index.ts",
    rspack: "integrations/rspack.integration.ts",
  },
  format: ["esm"],
  dts: true,
  splitting: true,
  clean: true,
  outDir: "dist",
  external: [
    "@rspack/core",
    "express",
    "socket.io",
  ],
});
