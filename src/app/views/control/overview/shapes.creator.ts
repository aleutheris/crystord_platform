import { Injectable } from '@angular/core';
import Konva from 'konva';
import * as Sdefines from './shapes.defines';
import * as Sparams from './shapes.parameters';
import { AtomShapeCreator } from './atom.shape.creator';
import { ArrowShapeCreator } from './arrow.shape.creator';

@Injectable({
  providedIn: 'root',
})
export class ShapesCreator {
  constructor(private atomShapeCreator: AtomShapeCreator,
              private arrowShapeCreator: ArrowShapeCreator
  ) {
  }

  draw(): void {
    const stage = new Konva.Stage({
      container: 'konva-container',
      width: window.innerWidth,
      height: window.innerHeight,
      draggable: true
    });

    const layer = new Konva.Layer();
    stage.add(layer);

    const atomsLocations = [
      { x: 200, y: 200 },
      { x: 600, y: 200 },
    ];

    this.atomShapeCreator.addAtomBlock(layer, atomsLocations[0], 'Atom 1');
    this.atomShapeCreator.addAtomBlock(layer, atomsLocations[1], 'Atom 2');
    this.arrowShapeCreator.addArrow(layer, atomsLocations[0], atomsLocations[1]);

    const scaleBy = 1.05;
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

    stage.batchDraw();
    layer.batchDraw();
  }
}
