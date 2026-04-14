
export enum Runtime {
  REACT = "react"
}

export interface ReactRuntimeOptions {
  type: Runtime.REACT
  shouldInjectSource?: (type: any) => boolean
}

export type RuntimeOptions = ReactRuntimeOptions

export interface BaseStartOptions {
  publicUrl?: string
  runtime?: RuntimeOptions
}
