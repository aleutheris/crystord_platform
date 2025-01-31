import { Injectable } from '@angular/core';
import { hierarchy, tree, HierarchyNode } from "d3-hierarchy";
import Konva from 'konva';
import { AtomShapeCreator } from './atom.shape.creator';
import { AtomArrowCreator } from './atom.arrow.creator';
import { ShapeLocation } from './shapes.defines';


type NodeEntry = { loc: ShapeLocation; text: string };
type ArrowEntry = { locOrig: Location; locDest: Location; text: string };

interface TreeNode {
  id: number;
  children?: TreeNode[];
}

export interface AtomElement {
  loc: ShapeLocation;
  text: string;
}

export interface ArrowElement {
  locOrig: ShapeLocation;
  locDest: ShapeLocation;
  text: string;
}

type InputElement = {
  text: string;
  id: string;
  children: { id: string; text: string }[];
};

type PositionalAdjustments = {
  startLocation: Location;
  distBetweenConnections: number;
  distBetweenPeers: number;
  nodeRadius: number;
};

@Injectable({
  providedIn: 'root',
})
export class ShapesCreator {
  scaleStep = 1.1;

  constructor(private atomShapeCreator: AtomShapeCreator,
              private atomArrowCreator: AtomArrowCreator) {}
  draw(nodeTree: any, rootNodeId: string): void {
    this.getHierarchyTree(nodeTree, nodeTree[rootNodeId]);
    this.drawTree(nodeTree);
  }

  getHierarchyTree(nodeTree: any, rootNode: any): any {
    console.log(rootNode);
    const hierarchyTree = hierarchy(rootNode, (d: any) => d.children);

    const treeLayout = tree()
      .size([1200, 600])
      .separation((a, b) => {
        return a.parent == b.parent ? 3 : 4;
      });

    treeLayout(hierarchyTree);

    hierarchyTree.descendants().forEach(node => {
      nodeTree[node.data.uuid].loc = { x: node.x, y: (node.y !== undefined ? node.y : 0) + 90 };
    });

    return hierarchyTree;
  }

  drawTree(atomTree: any): void {
    const layer = new Konva.Layer();
    const stage = new Konva.Stage({
      container: 'konva-container',
      width: 1250,
      height: window.innerHeight,
      draggable: true
    });

    stage.add(layer);
    this.configureStage(stage, this.scaleStep);

    for (const uuid in atomTree) {
      const atomNode = atomTree[uuid];
      const loc = atomNode.loc;
      const text = atomNode.data.properties.nuclearies.title;
      this.atomShapeCreator.addAtomBlock(layer, loc, text);
    }

    // for (let i = 0; i < arrowElement.length; i++) {
    //   this.atomArrowCreator.addArrowBlock(layer, arrowElement[i].locOrig,
    //                                               arrowElement[i].locDest,
    //                                               arrowElement[i].text);
    // }

    stage.batchDraw();
    layer.batchDraw();
  }

  getEdgePoints(locOrig: ShapeLocation,
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
