import { Injectable } from '@angular/core';
import Konva from 'konva';
import { hierarchy, tree } from 'd3-hierarchy';
import * as d3 from 'd3';
import { Atom } from '../atomhall/atom.model';
import { AtomShapeCreator } from './atom.shape.creator';
import { AtomArrowCreator } from './atom.arrow.creator';
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
}

export interface NodeElement {
  uuid: string;
  children: NodeElement[];
  x?: number;
  y?: number;
  data?: any;
}


@Injectable({
  providedIn: 'root',
})
export class ShapesCreator {
  scaleStep = 1.1;

  constructor(private atomShapeCreator: AtomShapeCreator,
              private atomArrowCreator: AtomArrowCreator) {}

  create_shapes(nodes: Record<string, NodeElement>): void {
    this.renderNodes(nodes);
  }

  create_tree(nodeTree: Record<string, NodeElement>, treeConfiguration: TreeConfiguration): void {
    // this.getShapesLocations(nodeTree, treeConfiguration);
    this.getHierarchyTree(nodeTree, nodeTree[Object.keys(nodeTree)[0]]);
    this.renderTree(nodeTree, treeConfiguration);
  }

  renderNodes(nodes: Record<string, NodeElement>): void {
    const width = 1240;
    const height = 800;

    const layer = new Konva.Layer();
    const stage = new Konva.Stage({
      container: 'konva-container',
      width: width,
      height: height,
      draggable: true
    });

    const simulationNodes: NodeElement[] = Object.values(nodes);

    const simulation = d3.forceSimulation(simulationNodes)
      .force('x', d3.forceX(width / 2).strength(0.5))
      .force('y', d3.forceY(height / 2).strength(0.5))
      .force('collide', d3.forceCollide(150))
      .force('charge', d3.forceManyBody().strength(-100));

    const numTicks = 10;
    for (let i = 0; i < numTicks; i++) {
      simulation.tick();
    }
    simulation.stop();

    stage.add(layer);
    this.configureStage(stage, this.scaleStep);

    Object.values(nodes).forEach((node) => {
      const loc = {
        x: node.x ?? 0,
        y: node.y ?? 0
      };
      const text = node.data.properties.nuclearies.title;
      this.atomShapeCreator.addAtomBlock(layer, loc, text);
      // this.renderEdges(nodeTree, layer);
    });

    stage.batchDraw();
    layer.batchDraw();
  }

  getHierarchyTree(nodeTree: Record<string, NodeElement>, rootNode: any): any {
    const hierarchyTree = hierarchy(rootNode, (d: any) => d.children);

    const treeLayout = tree()
      .size([1240, 800])
      .separation((a, b) => {
        return a.parent == b.parent ? 3 : 4;
      });

    treeLayout(hierarchyTree);

    hierarchyTree.descendants().forEach(node => {
      nodeTree[node.data.uuid].x = node.x;
      nodeTree[node.data.uuid].y = (node.y !== undefined ? node.y : 0) + 90
    });

    return hierarchyTree;
  }

  renderTree(nodeTree: Record<string, NodeElement>,
             treeConfiguration: TreeConfiguration): void {
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
      const loc = {
        x: node.x ?? 0,
        y: node.y ?? 0
      };
      const text = node.data.properties.nuclearies.title;
      this.atomShapeCreator.addAtomBlock(layer, loc, text);
      this.renderEdges(nodeTree, layer);
    });

    stage.batchDraw();
    layer.batchDraw();
  }

  private renderEdges(nodeTree: Record<string, NodeElement>, layer: Konva.Layer): void {
    Object.values(nodeTree).forEach((node) => {
      Object.values(node.children).forEach((child) => {
        const childLoc = { x: child.x ?? 0, y: child.y ?? 0 };
        const nodeLoc = { x: node.x ?? 0, y: node.y ?? 0 };
        const locOrig = this.getEdgePoints(childLoc, nodeLoc, 75);
        const locDest = this.getEdgePoints(nodeLoc, childLoc, 75);
        this.atomArrowCreator.addArrowBlock(layer, locOrig, locDest, '');
      });
    });
  }

  private getEdgePoints(locOrig: ShapeLocation,
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

  private configureStage(stage: Konva.Stage, scaleBy: number): void {
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
