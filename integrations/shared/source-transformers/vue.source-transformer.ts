import type { NodeTransform, ElementNode } from "@vue/compiler-core"
import { SOURCE_PROPERTY_NAME } from "../constants/sourceProperyName.constant"

export interface VueSourceTransformOptions {
  packagesDir: string
  shouldInjectSource?: (tag: string, isComponent: boolean) => boolean
}

const NODE_TYPE_ELEMENT = 1
const NODE_TYPE_ATTRIBUTE = 6
const NODE_TYPE_TEXT = 2
const TAG_TYPE_ELEMENT = 0

/**
 * Inyecta el atributo tooltify_source en cada elemento del template de un SFC de Vue
 * durante la compilacion. Es el analogo compile-time del jsxDEV wrapper que usamos en React.
 */
export function createVueSourceTransform({
  packagesDir,
  shouldInjectSource,
}: VueSourceTransformOptions): NodeTransform {
  return (node, context) => {
    if (node.type !== NODE_TYPE_ELEMENT) return

    const elementNode = node as ElementNode
    const isComponent = elementNode.tagType !== TAG_TYPE_ELEMENT

    const shouldInject = shouldInjectSource
      ? shouldInjectSource(elementNode.tag, isComponent)
      : !isComponent

    if (!shouldInject) return

    const filename = context.filename
    if (!filename) return

    const idx = filename.indexOf(packagesDir)
    if (idx < 0) return

    const relative = filename.slice(idx + packagesDir.length)
    const sourceValue = `${relative}:${elementNode.loc.start.line}`

    elementNode.props.push({
      type: NODE_TYPE_ATTRIBUTE,
      name: SOURCE_PROPERTY_NAME,
      nameLoc: elementNode.loc,
      value: {
        type: NODE_TYPE_TEXT,
        content: sourceValue,
        loc: elementNode.loc,
      },
      loc: elementNode.loc,
    } as any)
  }
}
