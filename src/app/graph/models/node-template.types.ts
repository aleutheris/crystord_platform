import { Type } from '@angular/core';

export interface PortSpec {
  name: string;
  type: string; // semantic type, e.g., 'number', 'string', 'any'
}

export interface NodeRendererAngular {
  type: 'angular';
  component: Type<any>;
}

export type NodeRenderer = NodeRendererAngular; // extend later if HTML renderers are added

export interface NodeTemplate {
  id: string; // unique template id (e.g., 'arithmetic:add')
  label: string; // human-readable name
  category: string; // e.g., 'arithmetic'
  inputs: PortSpec[];
  outputs: PortSpec[];
  defaults?: Record<string, unknown>;
  renderer: NodeRenderer;
  rules?: {
    validateConnection?: (fromType: string, toType: string) => boolean;
    beforeAdd?: (data?: unknown) => void | Promise<void>;
    beforeRemove?: (nodeId: string) => void | Promise<void>;
  };
}

export interface CategoryManifest {
  id: string; // e.g., 'arithmetic'
  label: string; // e.g., 'Arithmetic'
}
