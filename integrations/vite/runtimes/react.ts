import { createRequire } from "node:module";
import type { Plugin } from "vite";
import { createReactJsxRuntimeFile } from "@tooltify/integration-shared";
import type { RuntimeContext, ViteReactRuntimeOptions } from "../types";

const _require = createRequire(import.meta.url);

const REACT_JSX_DEV_RUNTIME = "react/jsx-dev-runtime";
const VIRTUAL_REACT_JSX_RUNTIME = "virtual:tooltify-react-jsx-runtime";
const RESOLVED_VIRTUAL_REACT_JSX_RUNTIME = "\0" + VIRTUAL_REACT_JSX_RUNTIME;

export function createReactRuntime(
    options: ViteReactRuntimeOptions,
    ctx: RuntimeContext,
): Plugin[] {
    let reactPluginFactory: any;
    try {
        reactPluginFactory = _require("@vitejs/plugin-react").default;
    } catch {
        throw new Error(
            "@tooltify/integration-vite: missing peer dependency '@vitejs/plugin-react'. Install it to use runtime: react.",
        );
    }

    if (!ctx.enabled) return [reactPluginFactory(options.reactOptions)]

    const jsxRuntimeContent = createReactJsxRuntimeFile(
        ctx.packagesDir,
        options.shouldInjectSource,
    );

    const virtualModulePlugin: Plugin = {
        name: "tooltify:react-runtime",
        enforce: "pre",
        config() {
            return {
                optimizeDeps: {
                    exclude: [REACT_JSX_DEV_RUNTIME],
                },
            };
        },
        resolveId(source) {
            if (source === REACT_JSX_DEV_RUNTIME) {
                return RESOLVED_VIRTUAL_REACT_JSX_RUNTIME;
            }
        },
        load(id) {
            if (id === RESOLVED_VIRTUAL_REACT_JSX_RUNTIME) {
                return jsxRuntimeContent;
            }
        },
    };

    return [reactPluginFactory(options.reactOptions), virtualModulePlugin];
}
