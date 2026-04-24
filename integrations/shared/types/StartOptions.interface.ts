
export enum Runtime {
  REACT = "react",
  VUE = "vue"
}

export interface ReactRuntimeOptions {
  type: Runtime.REACT
  shouldInjectSource?: (type: any) => boolean
}

export interface VueRuntimeOptions {
  type: Runtime.VUE
  shouldInjectSource?: (tag: string, isComponent: boolean) => boolean
}

export type RuntimeOptions = ReactRuntimeOptions | VueRuntimeOptions

export interface BaseStartOptions {
  publicUrl?: string
  runtime?: RuntimeOptions
}
