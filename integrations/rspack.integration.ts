import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import type { Compiler, RspackPluginInstance } from "@rspack/core";
import { startServer, type StartOptions } from "../core/server";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLIENT_PATH = path.resolve(__dirname, "../core/client/dist/devtools.iife.js");
const CUSTOM_JSX_RUNTIME = path.resolve(__dirname, "helpers/react-transform-source.js");

export function rsDevTools(opts: StartOptions = {}): RspackPluginInstance {
    return {
        apply(compiler: Compiler) {
            const { config, port, buildTracker, cleanDeps } = startServer(opts);
            const clientScript = readFileSync(CLIENT_PATH, "utf-8");

            // 1. Alias jsx-dev-runtime to our wrapper that injects data-source
            compiler.options.resolve = compiler.options.resolve || {};
            compiler.options.resolve.alias = compiler.options.resolve.alias || {};
            const alias = compiler.options.resolve.alias as Record<string, any>;

            // The broad "react" alias (without $) also captures react/jsx-dev-runtime.
            // Convert it to exact match + explicit subpath so our override takes effect.
            if (alias["react"] && !alias["react$"]) {
                const reactPath = alias["react"];
                alias["react$"] = reactPath;
                alias["react/jsx-runtime"] = path.resolve(reactPath, "jsx-runtime");
                delete alias["react"];
            }
            alias["react/jsx-dev-runtime"] = CUSTOM_JSX_RUNTIME;

            // Expose packagesDir so the runtime can strip the absolute prefix
            new compiler.rspack.DefinePlugin({
                __DEVTOOLS_PACKAGES_DIR__: JSON.stringify(config.packagesDir),
            }).apply(compiler);

            // 2. Enable development mode in SWC so it emits __source and uses jsx-dev-runtime
            for (const rule of compiler.options.module.rules) {
                if (typeof rule !== "object" || !rule) continue;
                const uses = Array.isArray(rule.use) ? rule.use : rule.use ? [rule.use] : [];
                for (const u of uses) {
                    const entry = typeof u === "object" && u !== null ? u : null;
                    if (entry?.loader === "builtin:swc-loader" && entry.options) {
                        const opts = entry.options as any;
                        if (opts.jsc?.transform?.react) {
                            opts.jsc.transform.react.development = true;
                        }
                    }
                }
            }

            // 3. Emit devtools client script and inject into index.html
            compiler.hooks.compilation.tap("Devtools", (compilation) => {
                compilation.hooks.processAssets.tap(
                    { name: "Devtools", stage: compiler.rspack.Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE },
                    (assets) => {
                        compilation.emitAsset(
                            "devtools.js",
                            new compiler.rspack.sources.RawSource(clientScript),
                        );

                        for (const name of Object.keys(assets)) {
                            if (name !== "index.html") continue;
                            const html = assets[name].source().toString();
                            const injected = html.replace(
                                "</head>",
                                `<script>window.__DEVTOOLS_URL__="/devtools-api"</script>\n<script src="/devtools.js" defer></script>\n</head>`,
                            );
                            compilation.updateAsset(
                                name,
                                new compiler.rspack.sources.RawSource(injected),
                            );
                        }
                    },
                );
            });

            // 4. Build tracking hooks
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
