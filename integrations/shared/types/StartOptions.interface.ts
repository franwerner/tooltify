export interface ReactOptions {
  shouldInjectSource?: (type: any) => boolean
}

export interface BaseStartOptions {
  publicUrl?: string
  react?: ReactOptions
}
