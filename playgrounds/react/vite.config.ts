import { defineConfig } from "vite";
import { viteTooltify } from "@tooltify/integration-vite";
import { Runtime } from "@tooltify/integration-shared";

export default defineConfig(({ command }) => {

  return {
    plugins: [
      viteTooltify({
        runtime: {
          type: Runtime.REACT,
          shouldInjectSource: (type: any) => {
            return typeof type === "object" && typeof type?.target === "string";
          },
        },
        enabled: command === "serve"
      }),
    ],
    resolve: {
      dedupe: ["react", "react-dom"],
    },
    server: {
      port: 5173,
    },
  }
});
