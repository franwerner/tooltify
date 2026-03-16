type BoolListener = (has: boolean) => void
type CountListener = (count: number) => void

let compileErrorListeners: BoolListener[] = []
let compileErrorCountListeners: CountListener[] = []
let currentHasError = false
let currentErrorCount = 0

export const onCompileErrorChange = (cb: BoolListener) => {
  compileErrorListeners.push(cb)
  cb(currentHasError)
  return () => {
    compileErrorListeners = compileErrorListeners.filter((l) => l !== cb)
  }
}

export const onCompileErrorCountChange = (cb: CountListener) => {
  compileErrorCountListeners.push(cb)
  cb(currentErrorCount)
  return () => {
    compileErrorCountListeners = compileErrorCountListeners.filter((l) => l !== cb)
  }
}

export const notifyCompileError = (has: boolean, count: number) => {
  currentHasError = has
  currentErrorCount = count
  compileErrorListeners.forEach((cb) => cb(has))
  compileErrorCountListeners.forEach((cb) => cb(count))
}

export const hasActiveCompileError = () => currentHasError

let openOverlayFn: (() => void) | null = null

export const registerOpenOverlay = (fn: () => void) => {
  openOverlayFn = fn
}

export const unregisterOpenOverlay = () => {
  openOverlayFn = null
}

export const openCompileErrorOverlay = () => openOverlayFn?.()
