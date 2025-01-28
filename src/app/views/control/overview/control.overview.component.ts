import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  RowComponent,
  ColComponent,
  TextColorDirective,
  CardComponent,
  CardHeaderComponent,
  CardBodyComponent,
} from '@coreui/angular';
import { ShapesCreator } from './shapes.creator';


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
      TextColorDirective,
      CardComponent,
      CardHeaderComponent,
      CardBodyComponent,
    ]
  })
export class ControlOverviewComponent {
  constructor(private shapesCreator: ShapesCreator) {
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
      nodeRadius: 75,
    };

    const diagram = this.generateTreeDiagram(elements, adjustments);
    console.log(diagram);

    this.shapesCreator.draw(diagram.nodesEntries, diagram.arrowsEntries);
  }

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
}
