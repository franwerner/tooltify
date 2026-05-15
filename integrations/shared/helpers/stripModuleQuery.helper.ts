/**
 * Vite/Rspack y plugins como TanStack Router (?tsr-split=...), workers (?worker)
 * o HMR (?t=...) exponen modulos virtuales con query strings en el module ID.
 * Babel propaga ese ID como `fileName` en el `__source` de JSX, lo que rompe
 * cualquier resolucion contra el filesystem real. Stripeamos antes de operar.
 */
export function stripModuleQuery(fileName: string): string {
  const queryIdx = fileName.indexOf("?")
  return queryIdx === -1 ? fileName : fileName.slice(0, queryIdx)
}
