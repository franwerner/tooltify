import path from "path";
import { fileURLToPath } from "url";
import type { Compiler, RspackPluginInstance } from "@rspack/core";
import { startServer, StartOptions } from "@tooltify/core";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
/**
 * Inyecta el build
 */
const CUSTOM_JSX_RUNTIME = path.resolve(__dirname, "./helpers/react-transform-source");

export function rspackTooltify(opts: StartOptions = {}): RspackPluginInstance {
    return {
        apply(compiler: Compiler) {
            const { config, port, buildTracker, cleanDeps } = startServer(opts);

            new compiler.rspack.NormalModuleReplacementPlugin(
                /^react\/jsx-dev-runtime$/,
                CUSTOM_JSX_RUNTIME,
            ).apply(compiler);

            new compiler.rspack.DefinePlugin({
                __DEVTOOLS_PACKAGES_DIR__: JSON.stringify(config.packagesDir),
            }).apply(compiler);

            compiler.hooks.compilation.tap("Devtools", (compilation) => {
                compilation.hooks.processAssets.tap(
                    { name: "Devtools", stage: compiler.rspack.Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE },
                    (assets) => {
                        for (const name of Object.keys(assets)) {
                            if (name !== "index.html") continue;
                            const html = assets[name].source().toString();
                            const injected = html.replace(
                                "</head>",
                                `<script>window.__DEVTOOLS_URL__="http://localhost:${port}"</script>\n<script src="http://localhost:${port}/tooltify.js" defer></script>\n</head>`,
                            );
                            compilation.updateAsset(
                                name,
                                new compiler.rspack.sources.RawSource(injected),
                            );
                        }
                    },
                );
            });

            compiler.hooks.shutdown.tap("Devtools", () => cleanDeps());

            compiler.hooks.watchRun.tap("Devtools", (comp) => {
                const changed: string[] = comp.modifiedFiles ? [...comp.modifiedFiles] : [];
                if (changed.length === 0) return;
                buildTracker.onFilesChanged(changed);
            });

            compiler.hooks.done.tap("Devtools", (stats) => {
                const hash = stats.hash || Date.now().toString(36);
                const errors = stats.hasErrors()
                    ? stats.compilation.errors.map((e: any) => e.message)
                    : [];
                buildTracker.onBuildDone(hash, stats.hasErrors(), errors);
            });
        },
    };
}
