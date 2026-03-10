import { jsx as _jsx, jsxs as _jsxs, Fragment } from "react/jsx-runtime";

/* global __DEVTOOLS_PACKAGES_DIR__ */
var prefix = (typeof __DEVTOOLS_PACKAGES_DIR__ !== "undefined" ? __DEVTOOLS_PACKAGES_DIR__ : "")
  .replace(/\/$/, "") + "/";

export function jsxDEV(type, props, key, isStaticChildren, source, self) {
  if (type && type !== Fragment && source && source.fileName) {
    var filePath = source.fileName;
    var line = source.lineNumber || 0;
    var relative = prefix && filePath.startsWith(prefix)
      ? filePath.slice(prefix.length)
      : filePath;
    props = Object.assign({}, props, { "data-source": relative + ":" + line });
  }
  var fn = isStaticChildren ? _jsxs : _jsx;
  return fn(type, props, key);
}

export { Fragment };
