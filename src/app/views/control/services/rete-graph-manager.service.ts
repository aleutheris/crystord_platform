import { Injectable, Injector } from '@angular/core';
import { NodeEditor, ClassicPreset } from 'rete';
import { AreaPlugin, AreaExtensions } from 'rete-area-plugin';
import { Schemes, Node, Connection } from '../graph/rete-schemes';
import { ConnectionPlugin, Presets as ConnectionPresets } from 'rete-connection-plugin';
import { AngularPlugin, Presets } from 'rete-angular-plugin/18';
import { AngularArea2D } from 'rete-angular-plugin/18';
import { AreaExtra, LAYOUT_CONSTANTS } from '../config/rete-config';
import { Atom } from '../atomhall/atom.model';
import { NodeAtomMappingService } from './node-atom-mapping.service';
import { AtomStoreService } from './atom-store.service';
import { AtomSelectionService } from './atom-selection.service';
import { DockPlugin, DockPresets } from 'rete-dock-plugin';

@Injectable({
  providedIn: 'root'
})
export class ReteGraphManagerService {
  private dock?: DockPlugin<Schemes>;
  // Use unified Schemes type for plugin setup
  private editor!: NodeEditor<Schemes>;
  private area!: AreaPlugin<Schemes, AreaExtra>;
  private selector!: any;

  constructor(
    private injector: Injector,
    private nodeAtomMapping: NodeAtomMappingService,
    private atomSelection: AtomSelectionService,
    private atomStore: AtomStoreService
  ) {}

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

    this.editor = new NodeEditor<Schemes>();
    this.area = new AreaPlugin<Schemes, AreaExtra>(container);

    // Use AngularArea2D<Schemes> for plugin and preset generics
    const render = new AngularPlugin<Schemes, AngularArea2D<Schemes>>({ injector: this.injector });
    render.addPreset(Presets.classic.setup<Schemes, AngularArea2D<Schemes>>());

    const connection = new ConnectionPlugin<Schemes, AreaExtra>();
    connection.addPreset(ConnectionPresets.classic.setup());

  this.editor.use(this.area);
  this.area.use(render);
  this.area.use(connection);

  // Initialize dock plugin and add preset
  this.dock = new DockPlugin<Schemes>();
  this.dock.addPreset(DockPresets.classic.setup({ area: this.area, size: 100, scale: 0.6 }));
  this.area.use(this.dock);

  // Register node factories for drag-and-drop creation
  this.dock.add(() => {
    // 1. Create a new Atom object with the same structure as database-fetched Atoms
    const uuid = crypto.randomUUID();
    const atom: Atom = {
      labels: ['label1'], // Always a single label for dock-created atoms
      bonds: [],
      properties: {
        shellies: { uuid, changeHistory: [] },
        nuclearies: {
          title: 'New Atom', // Always 'New Atom' for dock-created atoms
          description: '',
          content: '',
          constants: '',
          operation: ''
        },
        ionies: {}
      }
    };

    // 2. Add Atom to the atom store
    const existing: Atom[] = this.atomStore.getAtomsValue();
    if (!existing.some((a: Atom) => a.properties.shellies.uuid === uuid)) {
      const updated: Atom[] = [...existing, atom];
      this.atomStore.setAtoms(updated);
      console.log('[STORE] Atom added via AtomStoreService:', atom);
      console.log('[STORE] Current atoms in AtomStoreService:', updated);
    }

    // 3. Create a node and reference the Atom by UUID
    const node = new Node(atom.properties.nuclearies.title); // Use Atom title for node label
    const socket = new ClassicPreset.Socket('socket');
    node.addOutput('output', new ClassicPreset.Output(socket));
    node.addInput('input', new ClassicPreset.Input(socket, '', true));
    node.width = LAYOUT_CONSTANTS.NODE_WIDTH;
    node.height = LAYOUT_CONSTANTS.NODE_HEIGHT;
  (node as any).atomUuid = uuid;
  // Register node-to-atom mapping for dock-created node
  this.nodeAtomMapping.register(node.id, uuid);
  // LOGGING: Node created and linked to Atom
  console.log('[DOCK] Atom node created via drag-and-drop:', node, '-> UUID:', uuid);
    return node;
  });

    // Override the editor's addConnection method without logging
    const originalAddConnection = this.editor.addConnection.bind(this.editor);
    this.editor.addConnection = async (connection: any) => {
      return await originalAddConnection(connection);
    };

    // Setup node selection with logging
    this.selector = AreaExtensions.selector();
    const accumulating = AreaExtensions.accumulateOnCtrl();

    AreaExtensions.selectableNodes(this.area, this.selector, { accumulating });

    // Add logging by overriding the selector methods
    const originalAdd = this.selector.add.bind(this.selector);
    const originalRemove = this.selector.remove.bind(this.selector);

    this.selector.add = (entity: any, accumulate?: boolean) => {
      originalAdd(entity, accumulate);

      // Log selection
      console.log('Node selected:', entity);
      const selectedNodes = this.getSelectedNodes();
      console.log('Currently selected nodes:', selectedNodes);

      if (selectedNodes.length > 0) {
        console.log('Selected node details:');
        selectedNodes.forEach((node, index) => {
          console.log(`Node ${index + 1}:`, {
            id: node.id,
            label: node.label,
            position: node.position,
            inputs: node.inputs,
            outputs: node.outputs,
            controls: node.controls
          });
        });
      }

      if (entity && entity.id) {
        const uuid = this.nodeAtomMapping.getUuidByNodeId(entity.id);
        if (uuid) {
          this.atomSelection.selectAtom(uuid);
        } else {
          this.atomSelection.selectAtom(null);
        }
      }
    };

    this.selector.remove = (entity: any) => {
      originalRemove(entity);
      console.log('Node unselected:', entity);
      console.log('Remaining selected nodes:', this.getSelectedNodes());
    };

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
    const nodeMap = new Map<string, Node>();
    const socket = new ClassicPreset.Socket('socket');

    for (let i = 0; i < atomsFeatures.length; i++) {
      const atom = atomsFeatures[i];
      // Create node using extended Node class
      const node = new Node(atom.properties.nuclearies.title || `Atom ${i}`);

      // Add input and output sockets for connections
      node.addOutput('output', new ClassicPreset.Output(socket));
      node.addInput('input', new ClassicPreset.Input(socket, "", true));

      // Set required width/height properties for plugin compatibility
      node.width = LAYOUT_CONSTANTS.NODE_WIDTH;
      node.height = LAYOUT_CONSTANTS.NODE_HEIGHT;

      await this.editor.addNode(node);
      nodeMap.set(atom.properties.shellies.uuid, node);
      this.nodeAtomMapping.register(node.id, atom.properties.shellies.uuid);

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
  nodeMap: Map<string, Node>
  ): Promise<void> {
    for (const atom of atomsFeatures) {
      const sourceNode = nodeMap.get(atom.properties.shellies.uuid);
      if (!sourceNode) continue;

      for (const bond of atom.bonds) {
        const targetNode = nodeMap.get(bond.uuid);
        if (targetNode && sourceNode !== targetNode) {
          const connection = new Connection(
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
   * Gets currently selected nodes
   */
  getSelectedNodes(): any[] {
    if (!this.editor) return [];
    return this.editor.getNodes().filter(node => node.selected);
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
