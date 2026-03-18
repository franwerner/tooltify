export interface ReactOptions {
  shouldInjectSource?: (type: any, props: any) => boolean
}

export interface BaseStartOptions {
  publicUrl?: string
  react?: ReactOptions
}
