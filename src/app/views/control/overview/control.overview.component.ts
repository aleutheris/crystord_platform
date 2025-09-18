import { CommonModule } from '@angular/common';
import { Component, inject, Injector } from '@angular/core';
import {
  RowComponent,
  ColComponent,
  CardComponent,
  CardHeaderComponent,
  CardBodyComponent,
  FormControlDirective,
  TextColorDirective,
  ButtonDirective,
  TableDirective,
} from '@coreui/angular';
import { FormsModule } from '@angular/forms';
import { Atom, Bond } from '../atomhall/atom.model';
import { AtomService } from '../atomhall/atom.service';

// Rete.js imports
import { NodeEditor, GetSchemes, ClassicPreset } from 'rete';
import { AreaPlugin, AreaExtensions } from 'rete-area-plugin';
import { ConnectionPlugin, Presets as ConnectionPresets } from 'rete-connection-plugin';
import { AngularPlugin, Presets, AngularArea2D } from 'rete-angular-plugin/18';

type Schemes = GetSchemes<
  ClassicPreset.Node,
  ClassicPreset.Connection<ClassicPreset.Node, ClassicPreset.Node>
>;

type AreaExtra = AngularArea2D<Schemes>;

// Keep NodeElement interface for getIndexedAtoms method
interface NodeElement {
  uuid: string;
  children: NodeElement[];
  data: Atom;
}


interface AtomTexted {
  labels: string[],
  bonds: string,
  properties: {
    shellies: {
      uuid: string
    },
    nuclearies: {
      title: string,
      description: string,
      content: string,
      constants: string,
      operation: string
    }
  }
}


@Component({
  selector: 'app-control',
  templateUrl: './control.overview.component.html',
  styleUrls: ['./control.overview.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RowComponent,
    ColComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    FormControlDirective,
    FormsModule,
    TextColorDirective,
    ButtonDirective,
    TableDirective
  ]
})
export class ControlOverviewComponent {
  searchText: string;
  isSearchTextValid: boolean | undefined = undefined;
  searchKey: string;
  atomsFeatures: Atom[];
  atomsIndexed: Record<string, NodeElement>;
  atomsFeaturesTexted: AtomTexted[];

  // Rete.js properties
  private editor!: NodeEditor<Schemes>;
  private area!: AreaPlugin<Schemes, AreaExtra>;
  private injector = inject(Injector);

  constructor(private atomService: AtomService) {
    // this.searchText = 'uuid=cc249313-1d09-4614-ae53-e8d7826b0ba2';
    this.searchText = 'labels=groceries';
    this.isSearchTextValid = undefined;
    this.searchKey = '';
    this.atomsFeatures = [];
    this.atomsIndexed = {};
    this.atomsFeaturesTexted = [];
  }

  searchClickedAtom(atom: AtomTexted) {
    this.searchText = 'uuid=' + atom.properties.shellies.uuid;
    this.retrieveAtomsFeatures();
  }

  retrieveAtomsFeatures() {
    this.updateSearchKey();
    const retrievalInteraction = this.chooseRetrievalInteraction();
    this.atomService.readAtoms(
      this.parseSearchTextIntoQuery(
        this.searchText, retrievalInteraction)).subscribe({
      next: (data) => {
        this.atomsFeatures = data['result'];
        this.handleRetrievedData();
        this.isSearchTextValid = true;
      },
      error: (error) => {
        console.error('There was an error searching for atoms:', error);
        this.isSearchTextValid = false;
      }
    });
  }

  updateSearchKey(): void {
    this.searchKey = this.searchText.split('=')[0];
  }

  chooseRetrievalInteraction(): string {
    let output = '';
    if (this.searchKey === 'labels') {
      output = 'retrieve_atoms_features';
    } else if (this.searchKey === 'uuid') {
      output = 'retrieve_atom_features_nested';
    }
    return output;
  }

  handleRetrievedData() {
    this.atomsIndexed = this.getIndexedAtoms(this.atomsFeatures);
    this.atomsFeaturesTexted = this.atomsContentToString(this.atomsFeatures);
    this.createReteGraph();
  }

  private async initializeReteEditor() {
    const container = document.getElementById('rete-container');
    if (!container) {
      console.error('Rete container not found');
      return;
    }

    if (this.area) {
      try {
        this.area.destroy();
      } catch { /* noop */ }
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
  }

  private async createReteGraph() {
    await this.initializeReteEditor();

    if (!this.atomsFeatures || this.atomsFeatures.length === 0) {
      return;
    }

    // Clear existing nodes
    this.editor.clear();

    // Create nodes for each atom
    const nodeMap = new Map<string, ClassicPreset.Node>();
    const socket = new ClassicPreset.Socket('socket');

    for (let i = 0; i < this.atomsFeatures.length; i++) {
      const atom = this.atomsFeatures[i];
      const node = new ClassicPreset.Node(atom.properties.nuclearies.title || `Atom ${i}`);

      // Add input and output sockets for connections
      node.addOutput('output', new ClassicPreset.Output(socket));
      node.addInput('input', new ClassicPreset.Input(socket));

      await this.editor.addNode(node);
      nodeMap.set(atom.properties.shellies.uuid, node);

      // Position nodes in a grid layout
      const x = (i % 5) * 250;
      const y = Math.floor(i / 5) * 150;
      await this.area.translate(node.id, { x, y });
    }

    // Create connections based on bonds
    for (const atom of this.atomsFeatures) {
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

    // Auto-arrange the layout
    setTimeout(() => {
      if (this.area && this.editor) {
        AreaExtensions.zoomAt(this.area, this.editor.getNodes());
      }
    }, 0);
  }

  updateAtomFeatures(index: number): void {
    let mq: {
      modification: string,
      args: {
        selector: {
          properties: {
            shellies: {
              uuid: string
            }
          }
        },
        inputs: {
          properties: {
            nuclearies: any
          }
        }
      }
    } = {
      modification: 'update_atom_features',
      args: {
        selector: {
          properties: {
            shellies: {
              uuid: this.atomsFeaturesTexted[index].properties.shellies.uuid
            }
          }
        },
        inputs: {
          properties: {
            nuclearies: {
              operation: this.convertOperationFromTitled(this.atomsFeaturesTexted[index].properties.nuclearies.operation)
            }
          }
        }
      }
    };

    this.atomService.modifyAtoms(mq).subscribe({
      next: (data) => {
        console.log('Atom data updated successfully:', data);
      },
      error: (error) => {
        console.error('There was an error updating the atom data:', error);
      }
    });
  }

  // Private methods
  private getIndexedAtoms(atoms: Atom[]): Record<string, NodeElement> {
    const atomTree: Record<string, NodeElement> = {};

    function addAtomNode(atom: Atom) {
      const uuid = atom.properties.shellies.uuid;
      if(!atomTree[uuid]) {
        atomTree[uuid] = { uuid, children: [], data: atom };
      }
    }

    function addChildren(parentUuid: string, childUuids: string[]) {
      const parentNode = atomTree[parentUuid];

      childUuids.forEach(childUuid => {
        let childNode = atomTree[childUuid];

        if(!parentNode.children.some(child => child.uuid === childUuid)) {
          parentNode.children.push(childNode);
        }
      });
    }

    function buildHybridTree(atoms: Atom[]): string {
      atoms.forEach(addAtomNode);
      atoms.forEach(atom => {
        const parentUuid = atom.properties.shellies.uuid;
        const childUuids = atom.bonds.map(bond => bond.uuid);
        addChildren(parentUuid, childUuids);
      });

      return atoms.length > 0 ? atoms[0].properties.shellies.uuid : '';
    }

    buildHybridTree(atoms);

    return atomTree;
  }

  private atomsContentToString(data: Atom[]): AtomTexted[] {
    let atomsTexted: AtomTexted[] = [];
    data.forEach((atom: Atom) => {
      atom.properties.nuclearies.content =
        this.convertContentToString(atom.properties.nuclearies.content);
      let operation = atom.properties.nuclearies.operation;

      let atomTexted = {
        labels: atom.labels,
        bonds: this.getBondsUuidsString(atom.bonds),
        properties: {
          shellies: {
            uuid: atom.properties.shellies.uuid
          },
          nuclearies: {
            title: atom.properties.nuclearies.title,
            description: atom.properties.nuclearies.description,
            content: atom.properties.nuclearies.content,
            constants: JSON.stringify(atom.properties.nuclearies.constants),
            operation: this.convertOperationToTitled(operation, atom.bonds)
          }
        }
      };
      atomsTexted.push(atomTexted);
    });
    return atomsTexted;
  }

  private convertContentToString(content: any): string {
    let output = content;
    if (typeof content !== 'string') {
      output = JSON.stringify(content);
    }
    return output;
  }

  private getBondsUuidsString(bonds: Bond[]): string {
    let bondsText = '';
    bonds.forEach((bond: Bond) => {
      bondsText += bond.uuid + ', ';
    });
    return bondsText;
  }

  private convertOperationToTitled(operation: string, bonds: Bond[]): string {
    let titledOperation = operation;
    bonds.forEach((bond: Bond) => {
      titledOperation = titledOperation.replace(bond.uuid, this.atomsIndexed[bond.uuid].data.properties.nuclearies.title);
    });
    return titledOperation;
  }

  private convertOperationFromTitled(operation: string): string {
    let uuids = Object.keys(this.atomsIndexed);
    let uuidOperation = operation;
    uuids.forEach((uuid: string) => {
      uuidOperation = uuidOperation.replace(this.atomsIndexed[uuid].data.properties.nuclearies.title, uuid);
    });
    return uuidOperation;
  }

  private parseSearchTextIntoQuery(searchText: string, readout: string) {
    const query: {
      readout: string,
      args: {
        selector: {
          bonds: string[]
          labels: string[],
          properties: {
            shellies: {
              uuid: string
            },
            nuclearies: {
              title: string,
              description: string,
              content: number,
              constants: string[],
              operation: string
            }
          }
        }
      }
    } = {
      readout: readout,
      args: {
        selector: {
          bonds: [],
          labels: [],
          properties: {
            shellies: {
              uuid: ''
            },
            nuclearies: {
              title: '',
              description: '',
              content: 0.0,
              constants: [],
              operation: ''
            }
          }
        }
      }
    };

    const pairs = searchText.split(' ');

    pairs.forEach(pair => {
      const [key, value] = pair.split('=');

      if (key === 'labels') {
        query.args.selector.labels = value ? value.split(',') : [];
      }

      if (key === 'uuid') {
        query.args.selector.properties.shellies.uuid = value;
      }
    });

    return query;
  }
}
