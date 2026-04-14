import fs from "fs";
import type { Compiler, RspackPluginInstance } from "@rspack/core";
import { startServer, CLIENT_BUNDLE } from "@tooltify/core";
import { createReactJsxRuntimeFile } from "@tooltify/integration-shared";
import type { RspackStartOptions } from "./types";

export function rspackTooltify({ publicUrl, runtime }: RspackStartOptions = {}): RspackPluginInstance {
    return {
        apply(compiler: Compiler) {
            const { config, port, buildTracker, cleanDeps } = startServer();

            const TOOLTIFY_URL = publicUrl ? publicUrl : `http://localhost:${port}`

            const reactOptions = runtime?.type === "react" ? runtime : undefined
            const content = createReactJsxRuntimeFile(config.packagesDir, reactOptions?.shouldInjectSource)

            new compiler.rspack.NormalModuleReplacementPlugin(
                /^react\/jsx-dev-runtime$/,
                `data:text/javascript,${encodeURIComponent(content)}`,
            ).apply(compiler);

            compiler.hooks.compilation.tap("tooltify", (compilation) => {
                compilation.hooks.processAssets.tap(
                    { name: "tooltify", stage: compiler.rspack.Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE },
                    (assets) => {
                        const clientCode = fs.readFileSync(CLIENT_BUNDLE);
                        compilation.emitAsset(
                            "tooltify.js",
                            new compiler.rspack.sources.RawSource(clientCode),
                        );

                        for (const name of Object.keys(assets)) {
                            if (name !== "index.html") continue;
                            const html = assets[name].source().toString();
                            const injected = html.replace(
                                "</head>",
                                `<script>window.__TOOLTIFY_URL__ = "${TOOLTIFY_URL}";</script>
<script src="/tooltify.js"></script>
</head>`
                            );
                            compilation.updateAsset(
                                name,
                                new compiler.rspack.sources.RawSource(injected),
                            );
                        }
                    },
                );
            });

            compiler.hooks.shutdown.tap("tooltify", () => cleanDeps());

            compiler.hooks.watchRun.tap("tooltify", (comp) => {
                const changed: string[] = comp.modifiedFiles ? [...comp.modifiedFiles] : [];
                if (changed.length === 0) return;
                buildTracker.onFilesChanged(changed);
            });

            compiler.hooks.done.tap("tooltify", (stats) => {
                const hash = stats.hash || Date.now().toString(36);
                const errors = stats.hasErrors()
                    ? stats.compilation.errors.map((e: any) => e.message)
                    : [];
                buildTracker.onBuildDone(hash, stats.hasErrors(), errors);
            });
        },
    };
}
