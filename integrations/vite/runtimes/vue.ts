import { createRequire } from "node:module";
import type { Plugin } from "vite";
import { createVueSourceTransform } from "@tooltify/integration-shared/source-transformers/vue";
import type { VueRuntimeOptions } from "@tooltify/integration-shared";
import type { RuntimeContext } from "./react";

const _require = createRequire(import.meta.url);

export function createVueRuntime(
    options: VueRuntimeOptions,
    ctx: RuntimeContext,
): Plugin[] {
    let vuePluginFactory: any;
    try {
        vuePluginFactory = _require("@vitejs/plugin-vue").default;
    } catch {
        throw new Error(
            "@tooltify/integration-vite: missing peer dependency '@vitejs/plugin-vue'. Install it to use runtime: vue.",
        );
    }

    const sourceTransform = createVueSourceTransform({
        packagesDir: ctx.packagesDir,
        shouldInjectSource: options.shouldInjectSource,
    });

    return [
        vuePluginFactory({
            template: {
                compilerOptions: {
                    nodeTransforms: [sourceTransform],
                },
            },
        }),
    ];
}
