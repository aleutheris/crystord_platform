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


interface InputElement {
  nodeName: string;
  id: string;
  connection: string[];
}

interface PositionalAdjustments {
  distanceBetweenConnections: number;
  distanceBetweenPeers: number;
}

interface TreeNode {
  nodeID: string;
  refNodeName: string;
  refNodeLocation: { x: number; y: number };
  connections: string[];
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

    this.shapesCreator.draw(atomsLocations, arrowsLocations);

    const elements: InputElement[] = [
      { nodeName: "Root", id: "1", connection: ["2", "3"] },
      { nodeName: "Child 1", id: "2", connection: ["4"] },
      { nodeName: "Child 2", id: "3", connection: [] },
      { nodeName: "Grandchild", id: "4", connection: [] },
    ];

    const adjustments: PositionalAdjustments = {
      distanceBetweenConnections: 100,
      distanceBetweenPeers: 50,
    };

    const treeDiagram = this.generateTreeDiagram(elements, adjustments);
    console.log(treeDiagram);
  }

  generateTreeDiagram(
    elements: InputElement[],
    adjustments: PositionalAdjustments
  ): TreeNode[] {
    const elementMap: Map<string, InputElement> = new Map();
    elements.forEach((el) => elementMap.set(el.id, el));

    const treeNodes: TreeNode[] = [];
    const positions: Map<string, { x: number; y: number }> = new Map();

    function placeNode(
      nodeId: string,
      x: number,
      y: number,
      siblingIndex: number
    ): void {
      const element = elementMap.get(nodeId);
      if (!element) return;

      const adjustedX = x + siblingIndex * adjustments.distanceBetweenPeers;
      const adjustedY = y;
      positions.set(nodeId, { x: adjustedX, y: adjustedY });

      treeNodes.push({
        nodeID: element.id,
        refNodeName: element.nodeName,
        refNodeLocation: { x: adjustedX, y: adjustedY },
        connections: element.connection,
      });

      const childY = adjustedY + adjustments.distanceBetweenConnections;
      element.connection.forEach((childId, index) => {
        placeNode(childId, adjustedX, childY, index);
      });
    }

    const rootNodes = elements.filter((el) =>
      !elements.some((other) => other.connection.includes(el.id))
    );

    rootNodes.forEach((root, index) => {
      placeNode(root.id, 0, 0, index);
    });

    return treeNodes;
  }
}
