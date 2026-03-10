import { jsx as _jsx, jsxs as _jsxs, Fragment } from "react/jsx-runtime";

/**
 * Custom jsx-dev-runtime that injects data-source attributes.
 *
 * SWC with development:true calls jsxDEV(type, props, key, isStaticChildren, source, self)
 * where `source` is { fileName, lineNumber, columnNumber }.
 * We intercept this, add data-source to props for intrinsic elements, then
 * delegate to the real jsx/jsxs from react/jsx-runtime (non-dev, not aliased).
 */
export function jsxDEV(
  type: any,
  props: any,
  key: any,
  isStaticChildren: boolean,
  source?: { fileName?: string; lineNumber?: number; columnNumber?: number },
  self?: any,
) {
  console.log("HGOLA")
  if (typeof type === "string" && source?.fileName) {
    const filePath = source.fileName;
    const line = source.lineNumber || 0;
    const idx = filePath.indexOf("/packages/");
    const relative = idx !== -1 ? filePath.slice(idx + "/packages/".length) : filePath;
    props = { ...props, "data-source": `${relative}:${line}` };
  }
  const fn = isStaticChildren ? _jsxs : _jsx;
  return fn(type, props, key);
}

export { Fragment };
