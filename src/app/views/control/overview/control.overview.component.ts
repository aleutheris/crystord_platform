import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  RowComponent,
  ColComponent,
  CardComponent,
  CardHeaderComponent,
  CardBodyComponent,
  FormControlDirective,
  TextColorDirective,
  TableDirective,
} from '@coreui/angular';
import { FormsModule } from '@angular/forms';
import { ShapesCreator, TreeConfiguration, NodeElement } from './shapes.creator';
import { Atom, Bond } from '../atomhall/atom.model';
import { AtomService } from '../atomhall/atom.service';


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
      constants: string[],
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
    TableDirective
  ]
})
export class ControlOverviewComponent {
  searchText: string;
  atomsFeatures: Atom[];
  atomsIndexed: Record<string, NodeElement>;
  atomsFeaturesTexted: AtomTexted[];
  treeConfiguration: TreeConfiguration;

  constructor(private shapesCreator: ShapesCreator,
              private atomService: AtomService) {
    this.searchText = 'labels=experiment';
    this.atomsFeatures = [];
    this.atomsIndexed = {};
    this.atomsFeaturesTexted = [];
    this.treeConfiguration = {
      marginWidth: 10,
      marginHeight: 10,
      width: 800, //window.innerWidth,
      height: 800 //window.innerHeight,
    }
  }

  retrieveAtomsFeatures() {
    this.atomService.readAtoms(
      this.parseSearchTextIntoQuery(
        this.searchText,
        'retrieve_atoms_features')).subscribe({

      next: (data) => {
        this.atomsFeatures = this.atomsDataToCamelCase(data['result']);
        this.atomsIndexed = this.getIndexedAtoms(this.atomsFeatures);
        this.atomsFeaturesTexted = this.atomsDataContentToString(this.atomsFeatures);
        // this.drawTree(this.atomsFeatures );
        this.drawAtoms(this.atomsIndexed);
      },
      error: (error) => {
        console.error('There was an error searching for atoms:', error);
      }
    });
  }

  drawAtoms(atomsIndexed: Record<string, NodeElement>): void {
    this.shapesCreator.create_shapes(atomsIndexed);
  }

  drawTree(atoms: Atom[]): void {
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

    this.shapesCreator.create_tree(atomTree, this.treeConfiguration);
  }

  // Private methods
  private getIndexedAtoms(atoms: Atom[]) {
    const atomIndexed: Record<string, NodeElement> = {};
    atoms.forEach((atom: Atom) => {
      const uuid = atom.properties.shellies.uuid;
      atomIndexed[uuid] = { uuid, children: [], data: atom };
    });
    return atomIndexed;
  }

  private getAtomByUuid(uuid: string) {
    return this.atomsFeatures.find((atom: Atom) => atom.properties.shellies.uuid === uuid);
  }

  private atomDataToCamelCase(data: any) {
    data.properties.shellies.changeHistory = data.properties.shellies.change_history;
    delete data.properties.shellies.change_history;
    return data;
  }

  private atomDataToSnakeCase(data: any) {
    data.properties.shellies.change_history = data.properties.shellies.changeHistory;
    delete data.properties.shellies.changeHistory;
    return data;
  }

  private atomsDataToCamelCase(data: any): Atom[] {
    data.forEach((atom: any) => {
      atom.properties.shellies.changeHistory = atom.properties.shellies.change_history;
      delete atom.properties.shellies.change_history;
    });
    return data;
  }

  private atomsDataContentToString(data: Atom[]): AtomTexted[] {
    let atomsTexted: AtomTexted[] = [];
    data.forEach((atom: Atom) => {
      atom.properties.nuclearies.content =
        this.convertContentToString(atom.properties.nuclearies.content);

      let atomTexted = {
        labels: atom.labels,
        bonds: this.convertBondsToString(atom.bonds),
        properties: {
          shellies: {
            uuid: atom.properties.shellies.uuid
          },
          nuclearies: {
            title: atom.properties.nuclearies.title,
            description: atom.properties.nuclearies.description,
            content: atom.properties.nuclearies.content,
            constants: atom.properties.nuclearies.constants,
            operation: atom.properties.nuclearies.operation
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

  private convertBondsToString(bonds: Bond[]): string {
    let bond_text = '';
    bonds.forEach((bond: Bond) => {
      bond_text += this.atomsIndexed[bond.uuid].data.properties.nuclearies.title + ' ';
    });
    return bond_text;
  }

  private parseValue(value: any) {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
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
