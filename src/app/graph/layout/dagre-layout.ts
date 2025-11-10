import dagre from 'dagre';

export type DagreRankdir = 'TB' | 'BT' | 'LR' | 'RL';

export interface LayoutNode {
  id: string;
  width: number;
  height: number;
}

export interface LayoutEdge {
  from: string;
  to: string;
}

export interface LayoutOptions {
  rankdir?: DagreRankdir; // TB: top-bottom, LR: left-right
  nodesep?: number;
  ranksep?: number;
  marginx?: number;
  marginy?: number;
}

export interface PositionedNode {
  id: string;
  x: number;
  y: number;
}

export function computeDagreLayout(nodes: LayoutNode[], edges: LayoutEdge[], options: LayoutOptions = {}): PositionedNode[] {
  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: options.rankdir ?? 'LR',
    nodesep: options.nodesep ?? 40,
    ranksep: options.ranksep ?? 100,
    marginx: options.marginx ?? 40,
    marginy: options.marginy ?? 40
  });
  g.setDefaultEdgeLabel(() => ({}));

  // set nodes
  for (const n of nodes) {
    g.setNode(n.id, { width: n.width, height: n.height });
  }

  // set edges
  for (const e of edges) {
    if (e.from && e.to && e.from !== e.to) {
      g.setEdge(e.from, e.to);
    }
  }

  dagre.layout(g);

  // extract positions
  const result: PositionedNode[] = [];
  for (const n of nodes) {
    const gn = g.node(n.id);
    if (gn && typeof gn.x === 'number' && typeof gn.y === 'number') {
      result.push({ id: n.id, x: gn.x, y: gn.y });
    }
  }
  return result;
}
