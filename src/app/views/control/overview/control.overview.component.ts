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
    const atomsLocations = [
      { loc: { x: 200, y: 200 }, text: 'Atom 1' },
      { loc: { x: 200+400, y: 200 }, text: 'Atom 2' },
      { loc: { x: 200+2*400, y: 200 }, text: 'Atom 3' },
    ];

    const arrowsLocations = [
      { locOrig: atomsLocations[0].loc, locDest: atomsLocations[1].loc, text: 'Arrow 1' },
      { locOrig: atomsLocations[1].loc, locDest: atomsLocations[2].loc, text: 'Arrow 2' },
    ];

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
    };

    const diagram = this.generateTreeDiagram(elements, adjustments);
    console.log(diagram);

    this.shapesCreator.draw(diagram.nodesEntries, diagram.arrowsEntries);
  }

  generateTreeDiagram(
    elements: InputElement[],
    adjustments: PositionalAdjustments
  ): DiagramFormat {
    const { startLocation, distBetweenConnections, distBetweenPeers } = adjustments;

    const nodesMap = new Map<string, NodeEntry>(); // To store nodes and prevent duplicates
    const diagram: DiagramFormat = { nodesEntries: [], arrowsEntries: [] };
    const visited = new Set<string>(); // To track visited nodes and prevent infinite recursion

    // Function to calculate the position of a node based on its level and index
    function calculateNodePosition(
      index: number,
      level: number
    ): Location {
      return {
        x: startLocation.x + index * distBetweenPeers,
        y: startLocation.y + level * distBetweenConnections,
      };
    }

    // Helper function to traverse the nodes and determine their positions dynamically
    function positionNode(
      element: InputElement,
      currentLevel: number,
      parentIndex: number
    ): void {
      if (visited.has(element.id)) {
        // If node is already visited, avoid reprocessing it
        return;
      }

      visited.add(element.id); // Mark node as visited

      if (!nodesMap.has(element.id)) {
        const nodePosition = calculateNodePosition(parentIndex, currentLevel);
        const nodeEntry: NodeEntry = { loc: nodePosition, text: element.text };
        nodesMap.set(element.id, nodeEntry);
        diagram.nodesEntries.push(nodeEntry);
      }

      const currentNodeEntry = nodesMap.get(element.id)!;

      // Add arrow entries for each connection
      element.connections.forEach((connection, connectionIndex) => {
        const targetNode = elements.find((el) => el.id === connection.id);
        if (targetNode) {
          // Recursively position the target node based on its level
          positionNode(targetNode, currentLevel + 1, connectionIndex);

          const targetNodeEntry = nodesMap.get(connection.id)!;

          const arrowEntry: ArrowEntry = {
            locOrig: currentNodeEntry.loc,
            locDest: targetNodeEntry.loc,
            text: connection.text,
          };
          diagram.arrowsEntries.push(arrowEntry);
        }
      });
    }

    // Start positioning from the root nodes (those without any parent)
    elements.forEach((element, index) => {
      positionNode(element, 0, index);
    });

    return diagram;
  }
}
