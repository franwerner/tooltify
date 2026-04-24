import { defineConfig } from "vite";
import { viteTooltify } from "@tooltify/integration-vite";
import { Runtime } from "@tooltify/integration-shared";

export default defineConfig({
  plugins: [
    viteTooltify({
      runtime: {
        type: Runtime.VUE,
      },
    }),
  ],
  server: {
    port: 5173,
  },
});
