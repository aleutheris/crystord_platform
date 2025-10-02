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
        }
      };

      const existing = this.atomStore.getAtomsValue();
      if (!existing.some(a => a.properties.shellies.uuid === uuid)) {
        this.atomStore.setAtoms([...existing, atom]);
      }

      const node = new Node(atom.properties.nuclearies.title);
      const contentCtrl = this.createContentControl(atom.properties.nuclearies.content, uuid);
      node.addControl('content', contentCtrl);

      const socket = new ClassicPreset.Socket('socket');
      node.addOutput('output', new ClassicPreset.Output(socket));
      node.addInput('input', new ClassicPreset.Input(socket, '', true));
      node.width = LAYOUT_CONSTANTS.NODE_WIDTH;
      node.height = LAYOUT_CONSTANTS.NODE_HEIGHT + 40;
      (node as any).atomUuid = uuid;

      this.nodeAtomMapping.register(node.id, uuid);
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
