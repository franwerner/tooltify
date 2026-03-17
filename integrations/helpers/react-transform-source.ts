import { jsx as _jsx, jsxs as _jsxs, Fragment } from "react/jsx-runtime";


declare const __TOOLTIFY_PACKAGES_DIR__: string
export function jsxDEV(
  type: any,
  props: any,
  key: any,
  isStaticChildren: boolean,
  source?: { fileName?: string; lineNumber?: number; columnNumber?: number },
) {
  if (type !== Fragment && source?.fileName) {
    const filePath = source.fileName;
    const line = source.lineNumber || 0;
    const idx = filePath.indexOf(__TOOLTIFY_PACKAGES_DIR__);
    if (idx >= 0) {
      /**
       * Si es -1 significa que no esta dentro del packagesDir configurado.
       */
      const relative = filePath.slice(idx + __TOOLTIFY_PACKAGES_DIR__.length)
      props = { ...props, "data-source": `${relative}:${line}` };
    }
  }
  const fn = isStaticChildren ? _jsxs : _jsx;
  return fn(type, props, key);
}

export { Fragment };
