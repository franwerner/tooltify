import { jsx as _jsx, jsxs as _jsxs, Fragment } from "react/jsx-runtime";
import { SOURCE_PROPERTY_NAME } from "../constants/sourceProperyName.constant"

export interface JsxRuntimeOptions {
  packagesDir: string
  shouldInjectSource?: (type: any) => boolean
}

/**
 * Esto reescribe la libreria de JSXRuntime agregando un wrapper para poder inyectar el data-source.
 */
export function createJsxRuntime({ packagesDir, shouldInjectSource }: JsxRuntimeOptions) {
  const shouldInject = (type: any): boolean => {
    if (typeof type === "string") return true
    return shouldInjectSource?.(type) ?? false
  }

  function jsxDEV(
    type: any,
    props: any,
    key: any,
    isStaticChildren: boolean,
    source?: { fileName?: string; lineNumber?: number; columnNumber?: number },
  ) {
    if (shouldInject(type) && source?.fileName) {
      const idx = source.fileName.indexOf(packagesDir)
      if (idx >= 0) {
        const relative = source.fileName.slice(idx + packagesDir.length)
        const sourceValue = `${relative}:${source.lineNumber ?? 0}`
        const originalRef = props.ref
        props.ref = (el: any) => {
          if (el && typeof el.setAttribute === "function") el.setAttribute(SOURCE_PROPERTY_NAME, sourceValue)
          if (typeof originalRef === "function") originalRef(el)
          else if (originalRef && "current" in originalRef) originalRef.current = el
        }
      }
    }
    const fn = isStaticChildren ? _jsxs : _jsx
    return fn(type, props, key)
  }

  return { jsxDEV, Fragment }
}
