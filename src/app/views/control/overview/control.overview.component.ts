import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
import { ShapesCreator } from './shapes.creator';
import { atomCircle } from './shapes.parameters';
import { Atom } from '../atomhall/atom.model';
import { AtomService } from '../atomhall/atom.service';


type Location = { x: number; y: number };
type NodeEntry = { loc: Location; text: string };
type ArrowEntry = { locOrig: Location; locDest: Location; text: string };
type DiagramFormat = { nodesEntries: NodeEntry[]; arrowsEntries: ArrowEntry[] };

type InputElement = {
  text: string;
  id: string;
  connections: { id: string; text: string }[];
};

type PositionalAdjustments = {
  startLocation: Location;
  distBetweenConnections: number;
  distBetweenPeers: number;
  nodeRadius: number;
};

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
  atomsFeatures: any;

  constructor(private shapesCreator: ShapesCreator,
              private atomService: AtomService) {
    this.searchText = 'labels=';
  }

  retrieveAtomsFeatures() {
    this.atomService.readAtoms(this.parseSearchText()).subscribe({
      next: (data) => {
        let atomData = this.atomsDataToCamelCase(data['result']);
        this.atomsFeatures = this.atomsDataContentToString(atomData);
      },
      error: (error) => {
        console.error('There was an error searching for atoms:', error);
      }
    });
  }

  ngAfterViewInit(): void {
    // Example usage
    const elements = [
      {
        text: "Node A",
        id: "A",
        connections: [
          { id: "B", text: "Arrow AB" }
        ],
      },
      {
        text: "Node B",
        id: "B",
        connections: [
          { id: "C", text: "Arrow BC" },
          { id: "D", text: "Arrow BD" },
          { id: "E", text: "Arrow BE" }
        ],
      },
      {
        text: "Node C",
        id: "C",
        connections: [],
      },
      {
        text: "Node D",
        id: "D",
        connections: [],
      },
      {
        text: "Node E",
        id: "E",
        connections: [],
      }
    ];

    const adjustments = {
      startLocation: { x: 100, y: 100 },
      distBetweenConnections: 300,
      distBetweenPeers: 300,
      nodeRadius: atomCircle.radius,
    };

    const diagram = this.generateTreeDiagram(elements, adjustments);
    this.shapesCreator.draw(diagram.nodesEntries, diagram.arrowsEntries);
  }

  // Private methods
  generateTreeDiagram(
    elements: InputElement[],
    adjustments: PositionalAdjustments
  ): DiagramFormat {
    const { startLocation, distBetweenConnections, distBetweenPeers, nodeRadius } = adjustments;

    const nodesMap = new Map<string, NodeEntry>();
    const diagram: DiagramFormat = { nodesEntries: [], arrowsEntries: [] };
    const visited = new Set<string>();

    function calculateNodePosition(
      index: number,
      level: number
    ): Location {
      return {
        x: startLocation.x + index * distBetweenPeers,
        y: startLocation.y + level * distBetweenConnections,
      };
    }

    const positionNode = (
      element: InputElement,
      currentLevel: number,
      parentIndex: number
    ): void => {
      if (visited.has(element.id)) {
        return;
      }

      visited.add(element.id);

      if (!nodesMap.has(element.id)) {
        const nodePosition = calculateNodePosition(parentIndex, currentLevel);
        const nodeEntry: NodeEntry = { loc: nodePosition, text: element.text };
        nodesMap.set(element.id, nodeEntry);
        diagram.nodesEntries.push(nodeEntry);
      }

      const currentNodeEntry = nodesMap.get(element.id)!;

      element.connections.forEach((connection, connectionIndex) => {
        const targetNode = elements.find((el) => el.id === connection.id);
        if (targetNode) {
          positionNode(targetNode, currentLevel + 1, connectionIndex);

          const targetNodeEntry = nodesMap.get(connection.id)!;

          const arrowEntry: ArrowEntry = {
            locOrig: this.getEdgePoint(currentNodeEntry.loc, targetNodeEntry.loc, nodeRadius),
            locDest: this.getEdgePoint(targetNodeEntry.loc, currentNodeEntry.loc, nodeRadius),
            text: connection.text,
          };
          diagram.arrowsEntries.push(arrowEntry);
        }
      });
    }

    elements.forEach((element, index) => {
      positionNode(element, 0, index);
    });

    return diagram;
  }

  getEdgePoint(locOrig: Location, locDest: Location, radius: number): Location {
    const x1 = locOrig.x;
    const y1 = locOrig.y;
    const x2 = locDest.x;
    const y2 = locDest.y;
    const r = radius;
    const v = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    return {
      x: x1 + r * (x2 - x1) / v,
      y: y1 + r * (y2 - y1) / v
    };
  }

  // Private methods
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

  private parseSearchText() {
    const searchText = this.searchText;
    const result: {
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
      readout: 'retrieve_atoms_features',
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
        result.args.selector.labels = value ? value.split(',') : [];
      }
    });

    return result;
  }
}
