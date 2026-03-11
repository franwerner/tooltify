import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    rspack: "./src/index.ts",
    "helpers/react-transform-source": "./src/helpers/react-transform-source.ts",
  },
  format: ["esm"],
  dts: true,
  splitting: false,
  clean: true,
  outDir: "dist",
  external: [
    "@rspack/core",
    "@tooltify/core",
    "react",
  ],
});
