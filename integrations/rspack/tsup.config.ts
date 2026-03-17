import { defineConfig } from "tsup";
import { createTsupConfig } from "../tsup.base";

export default defineConfig(
  createTsupConfig({
    entry: {
      index: "./index.ts",
    },
    external: ["@rspack/core", "@tooltify/core", "@tooltify/integration-shared"],
  }),
);
