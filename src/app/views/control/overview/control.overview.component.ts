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
import { Atom } from '../atomhall/atom.model';
import { AtomService } from '../atomhall/atom.service';


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
  treeConfiguration: TreeConfiguration;

  constructor(private shapesCreator: ShapesCreator,
              private atomService: AtomService) {
    this.searchText = 'uuid=cc249313-1d09-4614-ae53-e8d7826b0ba2';
    this.atomsFeatures = [];
    this.treeConfiguration = {
      marginWidth: 10,
      marginHeight: 10,
      width: 1250, //window.innerWidth,
      height: 800, //window.innerHeight,
      depthSizes: []
    }
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
    const atomTree: Record<string, NodeElement> = {};
    let atomNodePositions: number[] = [0];

    function addAtomNode(atom: Atom) {
      const uuid = atom.properties.shellies.uuid;
      if(!atomTree[uuid]) {
        atomTree[uuid] = { uuid, children: [], depth: 0, position: 0, data: atom };
      }
    }

    function addChildren(parentUuid: string, childUuids: string[], parentDepth: number) {
      const parentNode = atomTree[parentUuid];
      const childrenDepth = parentDepth + 1;

      if(atomNodePositions[childrenDepth] === undefined) {
        atomNodePositions[childrenDepth] = -1;
      }

      childUuids.forEach(childUuid => {
        let childNode = atomTree[childUuid];
        childNode.depth = childrenDepth;
        atomNodePositions[childNode.depth]++;
        childNode.position = atomNodePositions[childNode.depth];

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
        const parentDepth = atomTree[parentUuid].depth;
        addChildren(parentUuid, childUuids, parentDepth);
      });

      return atoms.length > 0 ? atoms[0].properties.shellies.uuid : '';
    }

    buildHybridTree(atoms);
    this.treeConfiguration.depthSizes = atomNodePositions.map(position => position + 1);

    this.shapesCreator.draw(atomTree, this.treeConfiguration);
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
