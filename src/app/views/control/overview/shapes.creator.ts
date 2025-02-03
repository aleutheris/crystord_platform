import { Injectable } from '@angular/core';
import Konva from 'konva';
import { AtomShapeCreator } from './atom.shape.creator';
import { AtomArrowCreator } from './atom.arrow.creator';
import { treeParameters } from './shapes.parameters';
import { ShapeLocation } from './shapes.defines';


export interface AtomElement {
  loc: ShapeLocation;
  text: string;
}

export interface ArrowElement {
  locOrig: ShapeLocation;
  locDest: ShapeLocation;
  text: string;
}

export interface TreeConfiguration {
  marginWidth: number;
  marginHeight: number;
  width: number;
  height: number;
  depthSizes: number[];
}

export interface NodeElement {
  uuid: string;
  children: NodeElement[];
  depth: number;
  position: number;
  loc?: ShapeLocation;
  data?: any;
}


@Injectable({
  providedIn: 'root',
})
export class ShapesCreator {
  scaleStep = 1.1;

  constructor(private atomShapeCreator: AtomShapeCreator,
              private atomArrowCreator: AtomArrowCreator) {}
  draw(nodeTree: any, treeConfiguration: TreeConfiguration): void {
    this.getShapesLocations(nodeTree, treeConfiguration);
    this.drawTree(nodeTree, treeConfiguration);
  }

  getShapesLocations(nodeTree: Record<string, NodeElement>,
                     treeConfiguration: TreeConfiguration): Record<string, NodeElement> {
    const width = treeConfiguration.width;
    const height = treeConfiguration.height;

    Object.values(nodeTree).forEach((node) => {
      const depthSize = treeConfiguration.depthSizes[node.depth];
      const xStep = width / depthSize;
      const xOffset = xStep / 2;
      const yStep = treeParameters.minVerticalDistance;
      const yOffSet = treeConfiguration.marginHeight + 75;

      node.loc = {
        x: node.position * xStep + xOffset,
        y: node.depth * yStep + yOffSet
      }
    });
    console.log('nodeTree', nodeTree);
    return nodeTree;
  }

  // getHierarchyTree(nodeTree: any, rootNode: any): any {
  //   const hierarchyTree = hierarchy(rootNode, (d: any) => d.children);

  //   const treeLayout = tree()
  //     .size([1200, 600])
  //     .separation((a, b) => {
  //       return a.parent == b.parent ? 3 : 4;
  //     });

  //   treeLayout(hierarchyTree);

  //   hierarchyTree.descendants().forEach(node => {
  //     nodeTree[node.data.uuid].loc = { x: node.x, y: (node.y !== undefined ? node.y : 0) + 90 };
  //   });

  //   return hierarchyTree;
  // }

  drawTree(nodeTree: Record<string, NodeElement>, treeConfiguration: TreeConfiguration): void {
    const layer = new Konva.Layer();
    const stage = new Konva.Stage({
      container: 'konva-container',
      width: 1250,
      height: treeConfiguration.height,
      draggable: true
    });

    stage.add(layer);
    this.configureStage(stage, this.scaleStep);

    Object.values(nodeTree).forEach((node) => {
      const loc = node.loc || { x: 0, y: 0 };
      const text = node.data.properties.nuclearies.title;
      this.atomShapeCreator.addAtomBlock(layer, loc, text);

      // function drawEdges() {
        Object.values(nodeTree).forEach((node) => {
          Object.values(node.children).forEach((child) => {
            const defLoc = { x: 0, y: 0 };
            const locOrig = getEdgePoints(child.loc || defLoc, node.loc || defLoc, 75);
            const locDest = getEdgePoints(node.loc || defLoc, child.loc || defLoc, 75);
            this.atomArrowCreator.addArrowBlock(layer, locOrig, locDest, '');
          });
        });

        function getEdgePoints(locOrig: ShapeLocation,
                locDest: ShapeLocation,
                radius: number): ShapeLocation {
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
      // }
    });

    stage.batchDraw();
    layer.batchDraw();
  }

  configureStage(stage: Konva.Stage, scaleBy: number): void {
    stage.on('wheel', (e) => {
      e.evt.preventDefault();

      const oldScale = stage.scaleX();
      const pointer = stage.getPointerPosition();

      if (!pointer) return;

      const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      };

      const newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      };

      stage.scale({ x: newScale, y: newScale });
      stage.position(newPos);
    });
  }
}
