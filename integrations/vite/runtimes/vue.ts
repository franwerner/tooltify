import { createRequire } from "node:module";
import type { Plugin } from "vite";
import { createVueSourceTransform } from "@tooltify/integration-shared/source-transformers/vue";
import type { RuntimeContext, ViteVueRuntimeOptions } from "../types";

const _require = createRequire(import.meta.url);

export function createVueRuntime(
    options: ViteVueRuntimeOptions,
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

    if (!ctx.enabled) return vuePluginFactory(options.vueOptions)

    const sourceTransform = createVueSourceTransform({
        packagesDir: ctx.packagesDir,
        shouldInjectSource: options.shouldInjectSource,
    });

    const userVueOptions = options.vueOptions ?? {};
    const userTemplate = userVueOptions.template ?? {};
    const userCompilerOptions = userTemplate.compilerOptions ?? {};
    const userNodeTransforms = userCompilerOptions.nodeTransforms ?? [];

    return [
        vuePluginFactory({
            ...userVueOptions,
            template: {
                ...userTemplate,
                compilerOptions: {
                    ...userCompilerOptions,
                    nodeTransforms: [sourceTransform, ...userNodeTransforms],
                },
            },
        }),
    ];
}
