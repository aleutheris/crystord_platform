import { Injectable } from '@angular/core';
import Konva from 'konva';
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

@Injectable({
  providedIn: 'root',
})
export class ShapesCreator {
  scaleStep = 1.1;

  constructor(private atomShapeCreator: AtomShapeCreator,
              private atomArrowCreator: AtomArrowCreator) {}

  draw(atomElement: AtomElement[], arrowElement: ArrowElement[]): void {
    const layer = new Konva.Layer();
    const stage = new Konva.Stage({
      container: 'konva-container',
      width: window.innerWidth,
      height: window.innerHeight,
      draggable: true
    });

    stage.add(layer);
    this.configureStage(stage, this.scaleStep);

    for (let i = 0; i < atomElement.length; i++) {
      this.atomShapeCreator.addAtomBlock(layer, atomElement[i].loc, atomElement[i].text);
    }

    for (let i = 0; i < arrowElement.length; i++) {
      this.atomArrowCreator.addArrowBlock(layer, arrowElement[i].locOrig,
                                                 arrowElement[i].locDest,
                                                 arrowElement[i].text);
    }

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
