import { Injectable, Injector } from '@angular/core';
import { NodeEditor, ClassicPreset } from 'rete';
import { AreaPlugin, AreaExtensions } from 'rete-area-plugin';
import { Schemes, Node, Connection } from '../graph/rete-schemes';
import { ConnectionPlugin, Presets as ConnectionPresets } from 'rete-connection-plugin';
import { AngularPlugin, Presets, AngularArea2D } from 'rete-angular-plugin/18';
import { DockPlugin, DockPresets } from 'rete-dock-plugin';
import { AreaExtra, LAYOUT_CONSTANTS } from '../config/rete-config';
import { Atom } from '../atomhall/atom.model';
import { NodeAtomMappingService } from './node-atom-mapping.service';
import { AtomStoreService } from './atom-store.service';
import { AtomSelectionService } from './atom-selection.service';

@Injectable({
  providedIn: 'root'
})
export class ReteGraphManagerService {
  private dock?: DockPlugin<Schemes>;
  // Use unified Schemes type for plugin setup
  private editor!: NodeEditor<Schemes>;
  private area!: AreaPlugin<Schemes, AreaExtra>;
  private selector!: any;
  private connectionPlugin?: ConnectionPlugin<Schemes, AreaExtra>;
  private suppressConnectionHandlers = false;

  private extractNodeId(endpoint: any): string | null {
    if (!endpoint) {
      return null;
    }

    if (typeof endpoint === 'string' || typeof endpoint === 'number') {
      return String(endpoint);
    }

    if (typeof endpoint.nodeId === 'string' || typeof endpoint.nodeId === 'number') {
      return String(endpoint.nodeId);
    }

    if (typeof endpoint.id === 'string' || typeof endpoint.id === 'number') {
      return String(endpoint.id);
    }

    return null;
  }

  private processConnectionAdded(connection: any): void {
    if (this.suppressConnectionHandlers || !this.editor) {
      return;
    }

    const sourceId = this.extractNodeId(connection?.source);
    const targetId = this.extractNodeId(connection?.target);

    if (sourceId == null || targetId == null || sourceId === targetId) {
      return;
    }

  const sourceNode = this.editor.getNode(sourceId);
  const targetNode = this.editor.getNode(targetId);

    if (!sourceNode || !targetNode) {
      return;
    }

  const sourceUuid = this.nodeAtomMapping.getUuidByNodeId(sourceNode.id) ?? (sourceNode as any)?.atomUuid;
  const targetUuid = this.nodeAtomMapping.getUuidByNodeId(targetNode.id) ?? (targetNode as any)?.atomUuid;

    if (!sourceUuid || !targetUuid || sourceUuid === targetUuid) {
      return;
    }

    const targetAtom = this.atomStore.getAtomByUuid(targetUuid);
    const sourceAtom = this.atomStore.getAtomByUuid(sourceUuid);
    const targetName = targetAtom?.properties?.nuclearies?.title ?? '';
    const sourceName = sourceAtom?.properties?.nuclearies?.title ?? '';

    this.atomStore.addBond(sourceUuid, targetUuid, 'to', targetName);
    this.atomStore.addBond(targetUuid, sourceUuid, 'from', sourceName);
  }

  private processConnectionRemoved(connection: any): void {
    if (this.suppressConnectionHandlers || !this.editor) {
      return;
    }

    const sourceId = this.extractNodeId(connection?.source);
    const targetId = this.extractNodeId(connection?.target);

    if (sourceId == null || targetId == null || sourceId === targetId) {
      return;
    }

  const sourceNode = this.editor.getNode(sourceId);
  const targetNode = this.editor.getNode(targetId);

    if (!sourceNode || !targetNode) {
      return;
    }

    const sourceUuid = this.nodeAtomMapping.getUuidByNodeId(sourceNode.id) ?? (sourceNode as any)?.atomUuid;
    const targetUuid = this.nodeAtomMapping.getUuidByNodeId(targetNode.id) ?? (targetNode as any)?.atomUuid;

    if (!sourceUuid || !targetUuid || sourceUuid === targetUuid) {
      return;
    }

    this.atomStore.removeBond(sourceUuid, targetUuid, 'to');
    this.atomStore.removeBond(targetUuid, sourceUuid, 'from');
  }

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
    this.connectionPlugin = connection;
    this.editor.use(this.area);
    this.area.use(render);
    this.area.use(connection);

    this.registerConnectionHandlers();

    // Expose instances on window for manual inspection in DevTools
    try {
      (window as any).__RETE_EDITOR__ = this.editor;
      (window as any).__RETE_AREA__ = this.area;
      (window as any).__RETE_CONNECTION_PLUGIN__ = this.connectionPlugin;
    } catch (e) {}

    // Editor-level event listeners as a fallback for connection events
    // Some builds of Rete emit connection events on the editor instance
    if (this.editor && typeof (this.editor as any).on === 'function') {
      const ed = this.editor as any;
      const listenEvents = ['connectioncreate', 'connectioncreated', 'connectionremove', 'connectionremoved'];
      listenEvents.forEach(ev => {
        try {
          ed.on(ev, () => {});
        } catch (e) {
          // ignore if the event isn't supported
        }
      });
    }

    // Initialize dock plugin and add preset
    this.dock = new DockPlugin<Schemes>();
    this.dock.addPreset(DockPresets.classic.setup({ area: this.area, size: 100, scale: 0.6 }));
    this.area.use(this.dock);

    // Register node factories for drag-and-drop creation
    this.dock.add(() => {
      const uuid = crypto.randomUUID();
      const atom: Atom = {
        labels: ['label1'],
        bonds: [],
        properties: {
          shellies: { uuid, changeHistory: [] },
          nuclearies: {
            title: 'New Atom',
            description: '',
            content: '',
            constants: '',
            operation: ''
          },
          ionies: {}
        },
        isDockTemplate: true // Mark as dock template initially
      };

      // Don't add to store yet - wait for node to be placed
      // const existing = this.atomStore.getAtomsValue();
      // if (!existing.some(a => a.properties.shellies.uuid === uuid)) {
      //   this.atomStore.setAtoms([...existing, atom]);
      // }

      const node = new Node(atom.properties.nuclearies.title);
      const contentCtrl = this.createContentControl(atom.properties.nuclearies.content, uuid);
      node.addControl('content', contentCtrl);

      const socket = new ClassicPreset.Socket('socket');
      node.addOutput('output', new ClassicPreset.Output(socket));
      node.addInput('input', new ClassicPreset.Input(socket, '', true));
      node.width = LAYOUT_CONSTANTS.NODE_WIDTH;
      node.height = LAYOUT_CONSTANTS.NODE_HEIGHT + 40;
      (node as any).atomUuid = uuid;
      (node as any).atom = atom; // Store atom on node temporarily

      this.nodeAtomMapping.register(node.id, uuid);
      return node;
    });

    // Override the editor's addConnection/removeConnection methods to ensure we catch all
    try {
      const originalAddConnection = (this.editor as any).addConnection?.bind(this.editor);
      if (originalAddConnection) {
        (this.editor as any).addConnection = async (connection: any) => {
          const res = await originalAddConnection(connection);
          this.processConnectionAdded(connection);
          return res;
        };
      }

      const originalRemoveConnection = (this.editor as any).removeConnection?.bind(this.editor);
      if (originalRemoveConnection) {
        (this.editor as any).removeConnection = async (connection: any) => {
          const res = await originalRemoveConnection(connection);
          this.processConnectionRemoved(connection);
          return res;
        };
      }
    } catch (e) {
      // Swallow failures from optional editor overrides
    }

    // Setup node selection with logging
    this.selector = AreaExtensions.selector();
    const accumulating = AreaExtensions.accumulateOnCtrl();

    AreaExtensions.selectableNodes(this.area, this.selector, { accumulating });

    // Add logging by overriding the selector methods
    const originalAdd = this.selector.add.bind(this.selector);
    const originalRemove = this.selector.remove.bind(this.selector);

    this.selector.add = (entity: any, accumulate?: boolean) => {
      originalAdd(entity, accumulate);

      // ...existing code...

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
    };

    // Keep node labels in sync with atom titles in the store
    this.atomStore.getAtoms$().subscribe(atoms => {
      this.editor.getNodes().forEach(node => {
        const uuid = (node as any).atomUuid;
        const atom = this.atomStore.getAtomByUuid(uuid);
        if (!atom) return;
        if (node.label !== atom.properties.nuclearies.title) {
          node.label = atom.properties.nuclearies.title;
        }

        const controlsMap = (node as any).controls;
        if (controlsMap && typeof controlsMap.get === 'function') {
          const control = controlsMap.get('content');
          if (control) {
            const desired = atom.properties.nuclearies.content;
            // Prefer setValue if available
            if (typeof (control as any).setValue === 'function') {
              (control as any).setValue(desired);
            } else if ('value' in (control as any)) {
              // Fallback: directly assign value
              (control as any).value = desired;
            } else if ((control as any).props && 'initial' in (control as any).props) {
              // Last resort mutate initial (some presets read from props.initial on re-render)
              (control as any).props.initial = desired;
            }
            // Attempt to trigger control-specific update API
            if (typeof (control as any).update === 'function') {
              (control as any).update();
            }
            // Force node re-render so Angular plugin redraws the control
            try {
              (this.area as any).update && (this.area as any).update('node', node.id);
            } catch {}
          }
        }
      });
    });
    return true;
  }

  private registerConnectionHandlers(): void {
    if (!this.editor) {
      return;
    }

    this.editor.addPipe((context: any) => {
      if (!context) {
        return context;
      }

      if (context.type === 'nodecreated') {
        this.handleNodeCreated(context.data as Node);
      } else if (context.type === 'noderemoved') {
        this.handleNodeRemoved(context.data as Node);
      }

      return context;
    });

    if (this.connectionPlugin) {
      this.connectionPlugin.addPipe((context: any) => {
        if (!context) {
          return context;
        }

        if (context.type === 'connectioncreated') {
          this.handleConnectionCreated(context.data as Connection);
        } else if (context.type === 'connectionremoved') {
          this.handleConnectionRemoved(context.data as Connection);
        }

        return context;
      });
    }
  }

  private handleConnectionCreated(connection: Connection): void {
    this.processConnectionAdded(connection);
  }

  private handleConnectionRemoved(connection: Connection): void {
    this.processConnectionRemoved(connection);
  }

  private handleNodeCreated(node: Node): void {
    const atom = (node as any).atom;
    if (atom && atom.isDockTemplate) {
      // Remove the template flag and add to store
      delete atom.isDockTemplate;
      const existing = this.atomStore.getAtomsValue();
      this.atomStore.setAtoms([...existing, atom]);
    }
  }

  private handleNodeRemoved(node: Node): void {
    const uuid = (node as any)?.atomUuid;
    if (uuid) {
      // Remove the atom from store when node is removed
      const existing = this.atomStore.getAtomsValue();
      const filtered = existing.filter(atom => atom.properties.shellies.uuid !== uuid);
      this.atomStore.setAtoms(filtered);
    }
  }

  /**
   * Creates a Rete graph from atoms data
   */
  async createReteGraph(atomsFeatures: Atom[]): Promise<void> {
    if (!atomsFeatures || atomsFeatures.length === 0) {
      return;
    }

    this.suppressConnectionHandlers = true;
    try {
      // Clear existing nodes
      this.editor.clear();

      // Create nodes for each atom
      const nodeMap = new Map<string, Node>();
      const socket = new ClassicPreset.Socket('socket');

      for (let i = 0; i < atomsFeatures.length; i++) {
        const atom = atomsFeatures[i];
        const initialTitle = atom.properties.nuclearies.title || `Atom ${i}`;
        const node = new Node(initialTitle);
        const contentCtrl = this.createContentControl(
          atom.properties.nuclearies.content,
          atom.properties.shellies.uuid
        );
        node.addControl('content', contentCtrl);

        node.addOutput('output', new ClassicPreset.Output(socket));
        node.addInput('input', new ClassicPreset.Input(socket, '', true));
        node.width = LAYOUT_CONSTANTS.NODE_WIDTH;
        node.height = LAYOUT_CONSTANTS.NODE_HEIGHT + 40;

        await this.editor.addNode(node);
        nodeMap.set(atom.properties.shellies.uuid, node);
        (node as any).atomUuid = atom.properties.shellies.uuid;
        this.nodeAtomMapping.register(node.id, atom.properties.shellies.uuid);

        // Position nodes in a grid layout initially
        const x = (i % 5) * LAYOUT_CONSTANTS.GRID_NODE_WIDTH;
        const y = Math.floor(i / 5) * LAYOUT_CONSTANTS.GRID_NODE_HEIGHT;
        await this.area.translate(node.id, { x, y });
      }

      // Create connections based on bonds
      await this.createConnections(atomsFeatures, nodeMap);
    } finally {
      this.suppressConnectionHandlers = false;
    }

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
      const currentNode = nodeMap.get(atom.properties.shellies.uuid);
      if (!currentNode) continue;

      for (const bond of atom.bonds) {
        const bondedNode = nodeMap.get(bond.uuid);
        if (bondedNode && currentNode !== bondedNode) {
          let sourceNode: Node;
          let targetNode: Node;

          if (bond.direction === 'to') {
            // From current atom to bonded atom
            sourceNode = currentNode;
            targetNode = bondedNode;
          } else if (bond.direction === 'from') {
            // From bonded atom to current atom
            sourceNode = bondedNode;
            targetNode = currentNode;
          } else {
            // Fallback, though directions are always provided
            continue;
          }

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
      this.suppressConnectionHandlers = true;
      try {
        this.editor.clear();
      } finally {
        this.suppressConnectionHandlers = false;
      }
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

  private createContentControl(initialContent: string, atomUuid: string): ClassicPreset.InputControl<'text'> {
    const control = new ClassicPreset.InputControl('text', {
      initial: initialContent ?? '',
      change: (val: string) => this.updateAtomContent(atomUuid, val ?? '')
    });
    if (typeof (control as any).setValue === 'function') {
      (control as any).setValue(initialContent ?? '');
    }
    return control;
  }

  private updateAtomContent(atomUuid: string, content: string): void {
    const atoms = this.atomStore.getAtomsValue();
    let changed = false;

    const updatedAtoms = atoms.map(atom => {
      if (atom.properties.shellies.uuid !== atomUuid) {
        return atom;
      }

      if (atom.properties.nuclearies.content === content) {
        return atom;
      }

      changed = true;
      return {
        ...atom,
        properties: {
          ...atom.properties,
          nuclearies: {
            ...atom.properties.nuclearies,
            content
          }
        }
      };
    });

    if (changed) {
      this.atomStore.setAtoms(updatedAtoms);
    }
  }
}
