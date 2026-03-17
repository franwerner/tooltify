import { defineConfig } from "tsup";
import { createTsupConfig } from "../tsup.base";

export default defineConfig(
  createTsupConfig({
    entry: {
      index: "./index.ts",
      "source-transformers/react": "./source-transformers/react.source-transformer.ts",
    },
    external: ["react"],
  }),
);
