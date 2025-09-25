import { Injectable } from '@angular/core';
import { AreaPlugin, AreaExtensions } from 'rete-area-plugin';
import { NodeEditor } from 'rete';
import { Schemes, AreaExtra, LAYOUT_CONSTANTS, NodePosition } from '../config/rete-config';

@Injectable({
  providedIn: 'root'
})
export class GraphLayoutService {

  constructor() { }

  /**
   * Rearranges the graph with hierarchical layout
   */
  async rearrangeGraph(
    editor: NodeEditor<Schemes>,
    area: AreaPlugin<Schemes, AreaExtra>
  ): Promise<void> {
    if (!editor || !area) {
      return;
    }

    const nodes = editor.getNodes();
    const connections = editor.getConnections();

    if (nodes.length === 0) {
      return;
    }

    await this.arrangeNodesHierarchically(nodes, connections, area, editor);
  }

  /**
   * Arranges nodes in hierarchical layout
   */
  private async arrangeNodesHierarchically(
    nodes: any[],
    connections: any[],
    area: AreaPlugin<Schemes, AreaExtra>,
    editor: NodeEditor<Schemes>
  ): Promise<void> {
    // Build adjacency lists for proper level calculation
    const outgoing = new Map<string, string[]>();
    const incoming = new Map<string, string[]>();

    // Initialize maps
    nodes.forEach(node => {
      outgoing.set(node.id, []);
      incoming.set(node.id, []);
    });

    // Build connection maps
    connections.forEach(conn => {
      outgoing.get(conn.source)?.push(conn.target);
      incoming.get(conn.target)?.push(conn.source);
    });

    // Calculate levels using topological sort approach
    const levels: string[][] = [];
    const nodeToLevel = new Map<string, number>();
    const visited = new Set<string>();

    // Find root nodes (no incoming connections)
    const rootNodes = nodes.filter(node => incoming.get(node.id)?.length === 0);

    if (rootNodes.length === 0) {
      // No clear hierarchy - arrange in simple grid
      await this.arrangeInGrid(nodes, area);
      return;
    }

    // BFS to assign levels
    const queue: Array<{nodeId: string, level: number}> = [];

    rootNodes.forEach(node => {
      queue.push({nodeId: node.id, level: 0});
      nodeToLevel.set(node.id, 0);
    });

    while (queue.length > 0) {
      const {nodeId, level} = queue.shift()!;

      if (visited.has(nodeId)) continue;
      visited.add(nodeId);

      // Ensure level array exists
      while (levels.length <= level) {
        levels.push([]);
      }
      levels[level].push(nodeId);

      // Add children to next level
      const children = outgoing.get(nodeId) || [];
      children.forEach(childId => {
        if (!visited.has(childId)) {
          const childLevel = level + 1;
          const existingLevel = nodeToLevel.get(childId);
          if (existingLevel === undefined || childLevel > existingLevel) {
            nodeToLevel.set(childId, childLevel);
            queue.push({nodeId: childId, level: childLevel});
          }
        }
      });
    }

    // Position nodes by levels
    await this.positionNodesByLevels(levels, nodes, area);

    // Fit view to show all nodes
    setTimeout(() => {
      if (area && editor) {
        AreaExtensions.zoomAt(area, editor.getNodes());
      }
    }, LAYOUT_CONSTANTS.REARRANGE_DELAY);
  }

  /**
   * Positions nodes by their calculated levels
   */
  private async positionNodesByLevels(
    levels: string[][],
    nodes: any[],
    area: AreaPlugin<Schemes, AreaExtra>
  ): Promise<void> {
    for (let levelIndex = 0; levelIndex < levels.length; levelIndex++) {
      const levelNodes = levels[levelIndex];
      const x = levelIndex * LAYOUT_CONSTANTS.LEVEL_WIDTH + LAYOUT_CONSTANTS.INITIAL_OFFSET;

      for (let nodeIndex = 0; nodeIndex < levelNodes.length; nodeIndex++) {
        const nodeId = levelNodes[nodeIndex];
        const node = nodes.find(n => n.id === nodeId);
        if (node) {
          const y = nodeIndex * LAYOUT_CONSTANTS.NODE_HEIGHT + LAYOUT_CONSTANTS.INITIAL_OFFSET;
          await area.translate(node.id, { x, y });
        }
      }
    }
  }

  /**
   * Arranges nodes in a simple grid layout
   */
  private async arrangeInGrid(
    nodes: any[],
    area: AreaPlugin<Schemes, AreaExtra>
  ): Promise<void> {
    const cols = LAYOUT_CONSTANTS.GRID_COLS_CALC(nodes.length);

    for (let i = 0; i < nodes.length; i++) {
      const x = (i % cols) * LAYOUT_CONSTANTS.GRID_NODE_WIDTH + LAYOUT_CONSTANTS.INITIAL_OFFSET;
      const y = Math.floor(i / cols) * LAYOUT_CONSTANTS.GRID_NODE_HEIGHT + LAYOUT_CONSTANTS.INITIAL_OFFSET;
      await area.translate(nodes[i].id, { x, y });
    }
  }

  /**
   * Calculates initial grid positions for nodes
   */
  calculateGridPositions(nodeCount: number): NodePosition[] {
    const positions: NodePosition[] = [];
    const cols = LAYOUT_CONSTANTS.GRID_COLS_CALC(nodeCount);

    for (let i = 0; i < nodeCount; i++) {
      const x = (i % cols) * LAYOUT_CONSTANTS.GRID_NODE_WIDTH + LAYOUT_CONSTANTS.INITIAL_OFFSET;
      const y = Math.floor(i / cols) * LAYOUT_CONSTANTS.GRID_NODE_HEIGHT + LAYOUT_CONSTANTS.INITIAL_OFFSET;
      positions.push({ x, y });
    }

    return positions;
  }
}
