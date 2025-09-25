import { GetSchemes, ClassicPreset } from 'rete';
import { AngularArea2D } from 'rete-angular-plugin/18';

// Rete.js type definitions
export type Schemes = GetSchemes<
  ClassicPreset.Node,
  ClassicPreset.Connection<ClassicPreset.Node, ClassicPreset.Node>
>;

export type AreaExtra = AngularArea2D<Schemes>;

// Layout constants
export const LAYOUT_CONSTANTS = {
  LEVEL_WIDTH: 300,
  NODE_HEIGHT: 120,
  NODE_WIDTH: 250,
  GRID_NODE_WIDTH: 250,
  GRID_NODE_HEIGHT: 150,
  INITIAL_OFFSET: 100,
  GRID_COLS_CALC: (nodeCount: number) => Math.ceil(Math.sqrt(nodeCount)),
  REARRANGE_DELAY: 100
} as const;

// Node positioning interface
export interface NodePosition {
  x: number;
  y: number;
}

export interface LevelInfo {
  nodeIds: string[];
  level: number;
}
