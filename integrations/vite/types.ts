import type {
    BaseStartOptions,
    ReactRuntimeOptions,
    VueRuntimeOptions,
} from "@tooltify/integration-shared"
import type { Options as ReactPluginOptions } from "@vitejs/plugin-react"
import type { Options as VuePluginOptions } from "@vitejs/plugin-vue"

export interface ViteReactRuntimeOptions extends ReactRuntimeOptions {
    reactOptions?: ReactPluginOptions
}

export interface ViteVueRuntimeOptions extends VueRuntimeOptions {
    vueOptions?: VuePluginOptions
}

export interface RuntimeContext {
    packagesDir: string;
    enabled?: boolean
}

export type ViteRuntimeOptions = ViteReactRuntimeOptions | ViteVueRuntimeOptions

export interface ViteStartOptions extends Omit<BaseStartOptions, "runtime"> {
    runtime: ViteRuntimeOptions
}
