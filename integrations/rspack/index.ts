import fs from "fs";
import type { Compiler, RspackPluginInstance } from "@rspack/core";
import { startServer, CLIENT_BUNDLE } from "@tooltify/core";
import { StartOptions } from "@tooltify/integration-shared"

const CUSTOM_JSX_RUNTIME = "@tooltify/integration-shared/source-transformers/react";

export function rspackTooltify({ publicUrl }: StartOptions = {}): RspackPluginInstance {
    return {
        apply(compiler: Compiler) {
            const { config, port, buildTracker, cleanDeps } = startServer();

            const TOOLTIFY_URL = publicUrl ? publicUrl : `http://localhost:${port}`

            new compiler.rspack.NormalModuleReplacementPlugin(
                /^react\/jsx-dev-runtime$/,
                CUSTOM_JSX_RUNTIME,
            ).apply(compiler);

            new compiler.rspack.DefinePlugin({
                __TOOLTIFY_PACKAGES_DIR__: JSON.stringify(config.packagesDir),
            }).apply(compiler);

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
