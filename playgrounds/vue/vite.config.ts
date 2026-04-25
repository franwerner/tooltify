import { defineConfig } from "vite";
import { viteTooltify } from "@tooltify/integration-vite";
import { Runtime } from "@tooltify/integration-shared";

export default defineConfig(({ command }) => {
  return {
    plugins: [
      viteTooltify({
        runtime: {
          type: Runtime.VUE,
        },
        enabled: command === "serve"
      }),
    ],
    server: {
      port: 5173,
    },
  }
});
