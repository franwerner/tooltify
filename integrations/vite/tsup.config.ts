import { defineConfig } from "tsup";
import { createTsupConfig } from "../tsup.base";

export default defineConfig(
  createTsupConfig({
    entry: {
      index: "./index.ts",
    },
    external: [
      "vite",
      "@tooltify/core",
      "@tooltify/integration-shared",
      "@tooltify/integration-shared/source-transformers/vue",
      "@vitejs/plugin-react",
      "@vitejs/plugin-vue",
    ],
  }),
);
