import { Injectable, Injector } from '@angular/core';
import { NodeEditor, ClassicPreset } from 'rete';
import { AreaPlugin, AreaExtensions } from 'rete-area-plugin';
import { ConnectionPlugin, Presets as ConnectionPresets } from 'rete-connection-plugin';
import { AngularPlugin, Presets } from 'rete-angular-plugin/18';
import { Schemes, AreaExtra, LAYOUT_CONSTANTS } from '../config/rete-config';
import { Atom } from '../atomhall/atom.model';

@Injectable({
  providedIn: 'root'
})
export class ReteGraphManagerService {
  private editor!: NodeEditor<Schemes>;
  private area!: AreaPlugin<Schemes, AreaExtra>;

  constructor(private injector: Injector) { }

  /**
   * Gets the current editor instance
   */
  getEditor(): NodeEditor<Schemes> {
    return this.editor;
  }

  /**
   * Gets the current area instance
   */
  getArea(): AreaPlugin<Schemes, AreaExtra> {
    return this.area;
  }

  /**
   * Initializes the Rete editor
   */
  async initializeReteEditor(containerId: string = 'rete-container'): Promise<boolean> {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error('Rete container not found');
      return false;
    }

    if (this.area) {
      try {
        this.area.destroy();
      } catch {
        // Ignore destruction errors
      }
    }

    // Initialize editor and rendering area
    this.editor = new NodeEditor<Schemes>();
    this.area = new AreaPlugin<Schemes, AreaExtra>(container);

    const render = new AngularPlugin<Schemes, AreaExtra>({ injector: this.injector });
    render.addPreset(Presets.classic.setup());

    const connection = new ConnectionPlugin<Schemes, AreaExtra>();
    connection.addPreset(ConnectionPresets.classic.setup());

    this.editor.use(this.area);
    this.area.use(render);
    this.area.use(connection);

    AreaExtensions.selectableNodes(this.area, AreaExtensions.selector(), {
      accumulating: AreaExtensions.accumulateOnCtrl()
    });

    return true;
  }

  /**
   * Creates a Rete graph from atoms data
   */
  async createReteGraph(atomsFeatures: Atom[]): Promise<void> {
    if (!atomsFeatures || atomsFeatures.length === 0) {
      return;
    }

    // Clear existing nodes
    this.editor.clear();

    // Create nodes for each atom
    const nodeMap = new Map<string, ClassicPreset.Node>();
    const socket = new ClassicPreset.Socket('socket');

    for (let i = 0; i < atomsFeatures.length; i++) {
      const atom = atomsFeatures[i];
      const node = new ClassicPreset.Node(atom.properties.nuclearies.title || `Atom ${i}`);

      // Add input and output sockets for connections
      node.addOutput('output', new ClassicPreset.Output(socket));
      node.addInput('input', new ClassicPreset.Input(socket));

      await this.editor.addNode(node);
      nodeMap.set(atom.properties.shellies.uuid, node);

      // Position nodes in a grid layout initially
      const x = (i % 5) * LAYOUT_CONSTANTS.GRID_NODE_WIDTH;
      const y = Math.floor(i / 5) * LAYOUT_CONSTANTS.GRID_NODE_HEIGHT;
      await this.area.translate(node.id, { x, y });
    }

    // Create connections based on bonds
    await this.createConnections(atomsFeatures, nodeMap);

    // Auto-arrange the layout
    setTimeout(() => {
      if (this.area && this.editor) {
        AreaExtensions.zoomAt(this.area, this.editor.getNodes());
      }
    }, 0);
  }

  /**
   * Creates connections between nodes based on atom bonds
   */
  private async createConnections(
    atomsFeatures: Atom[],
    nodeMap: Map<string, ClassicPreset.Node>
  ): Promise<void> {
    for (const atom of atomsFeatures) {
      const sourceNode = nodeMap.get(atom.properties.shellies.uuid);
      if (!sourceNode) continue;

      for (const bond of atom.bonds) {
        const targetNode = nodeMap.get(bond.uuid);
        if (targetNode && sourceNode !== targetNode) {
          const connection = new ClassicPreset.Connection(
            sourceNode,
            'output',
            targetNode,
            'input'
          );
          await this.editor.addConnection(connection);
        }
      }
    }
  }

  /**
   * Clears the current graph
   */
  clearGraph(): void {
    if (this.editor) {
      this.editor.clear();
    }
  }

  /**
   * Destroys the current editor and area
   */
  destroy(): void {
    if (this.area) {
      try {
        this.area.destroy();
      } catch {
        // Ignore destruction errors
      }
    }
  }

  /**
   * Checks if editor is initialized
   */
  isInitialized(): boolean {
    return !!(this.editor && this.area);
  }

  /**
   * Gets all nodes from the editor
   */
  getNodes(): any[] {
    return this.editor ? this.editor.getNodes() : [];
  }

  /**
   * Gets all connections from the editor
   */
  getConnections(): any[] {
    return this.editor ? this.editor.getConnections() : [];
  }
}
