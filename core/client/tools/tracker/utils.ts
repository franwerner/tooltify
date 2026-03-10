import type { SourceNode, FlatNode } from "./types";

export const buildTree = (el: Element): SourceNode => {
  const children: SourceNode[] = [];
  for (let i = 0; i < el.children.length; i++) {
    const child = buildTree(el.children[i]);
    if (child.source || child.children.length > 0) {
      children.push(child);
    }
  }
  return {
    tag: el.tagName.toLowerCase(),
    source: el.getAttribute("data-source"),
    children,
  };
};

export const getParentChain = (el: Element): SourceNode[] => {
  const chain: SourceNode[] = [];
  let current = el.parentElement;
  while (current && current !== document.body) {
    chain.push({
      tag: current.tagName.toLowerCase(),
      source: current.getAttribute("data-source"),
      children: [],
    });
    current = current.parentElement;
  }
  return chain.reverse();
};

export const flattenTree = (nodes: SourceNode[], depth = 0): FlatNode[] => {
  const result: FlatNode[] = [];
  for (const node of nodes) {
    result.push({ tag: node.tag, source: node.source, depth });
    if (node.children.length > 0) {
      result.push(...flattenTree(node.children, depth + 1));
    }
  }
  return result;
};