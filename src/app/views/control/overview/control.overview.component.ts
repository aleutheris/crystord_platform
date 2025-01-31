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
import { ShapesCreator } from './shapes.creator';
import { Atom, Bond } from '../atomhall/atom.model';
import { AtomService } from '../atomhall/atom.service';


interface AtomNode {
  uuid: string;
  children: AtomNode[];
  data: Atom;
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

  constructor(private shapesCreator: ShapesCreator,
              private atomService: AtomService) {
    this.searchText = '';
    this.atomsFeatures = [];
  }

  retrieveAtomsFeatures() {
    this.atomService.readAtoms(
      this.parseSearchTextIntoQuery(
        this.searchText,
        'retrieve_atom_features')).subscribe({

      next: (data) => {
        let atomData = this.atomsDataToCamelCase(data['result']);
        this.atomsFeatures = this.atomsDataContentToString(atomData);
        this.drawTree(this.atomsFeatures);
      },
      error: (error) => {
        console.error('There was an error searching for atoms:', error);
      }
    });
  }

  drawTree(atoms: Atom[]): void {
    const atomTree: Record<string, AtomNode> = {};

    function addAtomNode(atom: Atom) {
      const uuid = atom.properties.shellies.uuid;
      if (!atomTree[uuid]) {
        atomTree[uuid] = { uuid, children: [], data: atom,
        };
      }
    }

    function addChildren(parentUuid: string, childUuids: string[]) {
      const parentNode = atomTree[parentUuid];

      if (!parentNode) {
        console.error(`Parent node with uuid ${parentUuid} not found.`);
        return;
      }

      childUuids.forEach(childUuid => {
        let childNode = atomTree[childUuid];

        if (!childNode) {
          console.error(`Child node with uuid ${childUuid} not found.`);
          return;
        }

        if (!parentNode.children.some(child => child.uuid === childUuid)) {
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

    const rootAtomUuid = buildHybridTree(atoms);

    this.shapesCreator.draw(atomTree, rootAtomUuid);
  }

  // Private methods
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

  private atomsDataToCamelCase(data: any) {
    data.forEach((atom: any) => {
      atom.properties.shellies.changeHistory = atom.properties.shellies.change_history;
      delete atom.properties.shellies.change_history;
    });
    return data;
  }

  private atomsDataContentToString(data: any) {
    data.forEach((atom: any) => {
      atom = this.convertAtomContentToString(atom);
    });
    return data;
  }

  private convertAtomContentToString(atom: Atom) {
    if (typeof atom.properties.nuclearies.content !== 'string') {
      atom.properties.nuclearies.content = JSON.stringify(atom.properties.nuclearies.content);
    }
    return atom;
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
