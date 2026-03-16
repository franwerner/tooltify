import { defineConfig } from "tsup";
import { createTsupConfig } from "../tsup.base";

export default defineConfig(
  createTsupConfig({
    entry: {
      index: "./index.ts",
      "helpers/react-transform-source": "../helpers/react-transform-source.ts",
    },
    external: ["@rspack/core", "@tooltify/core", "react"],
  }),
);
