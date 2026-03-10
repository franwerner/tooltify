export interface SourceNode {
  tag: string;
  source: string | null;
  children: SourceNode[];
}

export interface FlatNode {
  tag: string;
  source: string | null;
  depth: number;
}

export interface CapturedTree {
  clicked: SourceNode;
  parents: SourceNode[];
}
