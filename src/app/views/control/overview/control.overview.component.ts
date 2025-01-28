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
type ArrowEntry = { locOrig: Location; locDest: Location; name: string };
type DiagramFormat = { nodesEntries: NodeEntry[]; arrowsEntries: ArrowEntry[] };

type InputElement = {
  name: string;
  id: string;
  connections: { id: string; name: string }[];
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
        name: "Node A",
        id: "A",
        connections: [
          { id: "B", name: "Arrow AB" },
          { id: "C", name: "Arrow AC" }
        ],
      },
      {
        name: "Node B",
        id: "B",
        connections: [{ id: "C", name: "Arrow BC" }],
      },
      {
        name: "Node C",
        id: "C",
        connections: [],
      },
    ];

    const adjustments = {
      startLocation: { x: 0, y: 0 },
      distBetweenConnections: 100,
      distBetweenPeers: 200,
    };

    const diagram = this.generateTreeDiagram(elements, adjustments);
    console.log(diagram);

    this.shapesCreator.draw(atomsLocations, arrowsLocations);
  }

  generateTreeDiagram(
    elements: InputElement[],
    adjustments: PositionalAdjustments
  ): DiagramFormat {
    const { startLocation, distBetweenConnections, distBetweenPeers } = adjustments;

    const nodesMap = new Map<string, NodeEntry>();
    const diagram: DiagramFormat = { nodesEntries: [], arrowsEntries: [] };

    function calculateNodePosition(
      index: number,
      level: number
    ): Location {
      return {
        x: startLocation.x + index * distBetweenPeers,
        y: startLocation.y + level * distBetweenConnections,
      };
    }

    elements.forEach((element, index) => {
      if (!nodesMap.has(element.id)) {
        const nodePosition = calculateNodePosition(index, 0);
        const nodeEntry: NodeEntry = { loc: nodePosition, text: element.name };
        nodesMap.set(element.id, nodeEntry);
        diagram.nodesEntries.push(nodeEntry);
      }

      const currentNodeEntry = nodesMap.get(element.id)!;

      element.connections.forEach((connection, connectionIndex) => {
        if (!nodesMap.has(connection.id)) {
          const targetPosition = calculateNodePosition(
            connectionIndex,
            1
          );
          const targetNodeEntry: NodeEntry = {
            loc: targetPosition,
            text: elements.find((el) => el.id === connection.id)?.name || "",
          };
          nodesMap.set(connection.id, targetNodeEntry);
          diagram.nodesEntries.push(targetNodeEntry);
        }

        const targetNodeEntry = nodesMap.get(connection.id)!;

        const arrowEntry: ArrowEntry = {
          locOrig: currentNodeEntry.loc,
          locDest: targetNodeEntry.loc,
          name: connection.name,
        };
        diagram.arrowsEntries.push(arrowEntry);
      });
    });

    return diagram;
  }
}
