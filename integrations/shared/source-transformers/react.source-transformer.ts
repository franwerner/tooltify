import { jsx as _jsx, jsxs as _jsxs, Fragment } from "react/jsx-runtime";
import { SOURCE_PROPERTY_NAME } from "../constants/sourceProperyName.constant"
const SymbolForwardRef = Symbol.for("react.forward_ref")

const isForwardRef = (type: any): boolean =>
  /**
   * Este check solo sera aplicado apartir de react < 16.3
   */
  typeof type === "object" && type !== null && type?.["$$typeof"] === SymbolForwardRef

declare const __TOOLTIFY_PACKAGES_DIR__: string
export function jsxDEV(
  type: any,
  props: any,
  key: any,
  isStaticChildren: boolean,
  source?: { fileName?: string; lineNumber?: number; columnNumber?: number },
) {
  if ((typeof type === "string" || isForwardRef(type)) && source?.fileName) {
    const idx = source.fileName.indexOf(__TOOLTIFY_PACKAGES_DIR__);
    if (idx >= 0) {
      const relative = source.fileName.slice(idx + __TOOLTIFY_PACKAGES_DIR__.length)
      const sourceValue = `${relative}:${source.lineNumber ?? 0}`
      const originalRef = props.ref
      /**
       * Esto maneja todos los casos, independientemente de la libreria.
       * Ya que inyecta a todos los HTML nativos de REACT una funcion ref, esta funcion
       * REACT la ejecuta siempre, por lo que abarcaria todos los casos.
       * Extra el .ref antes de que REACT 
       */
      props.ref = (el: any) => {
        if (el) el.setAttribute(SOURCE_PROPERTY_NAME, sourceValue)
        if (typeof originalRef === "function") originalRef(el)
        else if (originalRef && "current" in originalRef) originalRef.current = el
      }
    }
  }
  const fn = isStaticChildren ? _jsxs : _jsx;
  return fn(type, props, key);
}

export { Fragment };
