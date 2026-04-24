import fs from "node:fs";
import type { Plugin } from "vite";
import { startServer, CLIENT_BUNDLE } from "@tooltify/core";
import { Runtime } from "@tooltify/integration-shared";
import type { ViteRuntimeOptions, ViteStartOptions } from "./types";
import { createReactRuntime } from "./runtimes/react";
import { createVueRuntime } from "./runtimes/vue";

export function viteTooltify({ publicUrl, runtime }: ViteStartOptions = {}): Plugin[] {
    const { config, port, buildTracker, cleanDeps } = startServer();

    const TOOLTIFY_URL = publicUrl ? publicUrl : `http://localhost:${port}`;

    let isBuild = false;

    const corePlugin: Plugin = {
        name: "tooltify",
        enforce: "pre",

        config(_userConfig, env) {
            isBuild = env.command === "build";
        },

        configureServer(server) {
            server.middlewares.use("/tooltify.js", (_req, res, next) => {
                try {
                    const code = fs.readFileSync(CLIENT_BUNDLE);
                    res.setHeader("Content-Type", "application/javascript");
                    res.end(code);
                } catch (err) {
                    next(err);
                }
            });

            server.httpServer?.once("close", () => cleanDeps());
        },

        transformIndexHtml: {
            order: "pre",
            handler(html) {
                return html.replace(
                    "</head>",
                    `<script>window.__TOOLTIFY_URL__ = "${TOOLTIFY_URL}";</script>
<script src="/tooltify.js"></script>
</head>`,
                );
            },
        },

        generateBundle() {
            if (!isBuild) return;
            const code = fs.readFileSync(CLIENT_BUNDLE);
            this.emitFile({
                type: "asset",
                fileName: "tooltify.js",
                source: code,
            });
        },

        handleHotUpdate(ctx) {
            buildTracker.onFilesChanged([ctx.file]);
            const hash = Date.now().toString(36);
            buildTracker.onBuildDone(hash, false, []);
        },

        buildEnd(err) {
            if (!isBuild) return;
            const hash = Date.now().toString(36);
            buildTracker.onBuildDone(hash, !!err, err ? [err.message] : []);
        },

        closeBundle() {
            if (isBuild) cleanDeps();
        },
    };

    const runtimePlugins = runtime
        ? resolveRuntime(runtime, { packagesDir: config.packagesDir })
        : [];

    return [...runtimePlugins, corePlugin];
}

function resolveRuntime(
    runtime: ViteRuntimeOptions,
    ctx: { packagesDir: string },
): Plugin[] {
    switch (runtime.type) {
        case Runtime.REACT:
            return createReactRuntime(runtime, ctx);
        case Runtime.VUE:
            return createVueRuntime(runtime, ctx);
        default: {
            const unknownType = (runtime as { type?: unknown }).type;
            throw new Error(
                `@tooltify/integration-vite: unknown runtime type "${String(unknownType)}". Expected "react" or "vue".`,
            );
        }
    }
}
