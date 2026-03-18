import { createRequire } from "module"

const _require = createRequire(import.meta.url)
/**
 * Necesita estar separado del transformer,ya que se ejecutan en entornos distintos.
 * Es decir al momento en el que se ejecuta el trasnformer lo hace en el browser,
 * en cambio este lo hace en el proceso de buildeo, por lo tanto es en node.
 */
const REACT_TRANSFORMER_PATH = _require.resolve("@tooltify/integration-shared/source-transformers/react")
export function createReactJsxRuntimeFile(
  packagesDir: string,
  shouldInjectSource?: (type: any) => boolean,
): string {
  const shouldInjectSourceCode = shouldInjectSource ? shouldInjectSource.toString() : "undefined"
  const isShortMethodDefinition = shouldInjectSourceCode.startsWith("shouldInjectSource")
  return `import { createJsxRuntime } from ${JSON.stringify(REACT_TRANSFORMER_PATH)}
export const { jsxDEV, Fragment } = createJsxRuntime({
  packagesDir: ${JSON.stringify(packagesDir)},
  ${isShortMethodDefinition ? "" : "shouldInjectSource:"}${shouldInjectSourceCode}
})
`
}
