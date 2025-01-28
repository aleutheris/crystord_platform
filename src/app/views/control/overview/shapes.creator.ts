import { Injectable } from '@angular/core';
import Konva from 'konva';
import { AtomShapeCreator } from './atom.shape.creator';
import { ArrowShapeCreator } from './arrow.shape.creator';
import { AtomArrowCreator } from './atom.arrow.creator';

@Injectable({
  providedIn: 'root',
})
export class ShapesCreator {

  constructor(private atomShapeCreator: AtomShapeCreator,
              private arrowShapeCreator: ArrowShapeCreator,
              private atomArrowCreator: AtomArrowCreator) {}

  draw(): void {
    const layer = new Konva.Layer();
    const stage = new Konva.Stage({
      container: 'konva-container',
      width: window.innerWidth,
      height: window.innerHeight,
      draggable: true
    });
    stage.add(layer);

    const atomsLocations = [
      { x: 200, y: 200 },
      { x: 600, y: 200 },
    ];

    this.atomShapeCreator.addAtomBlock(layer, atomsLocations[0], 'Atom 1');
    this.atomShapeCreator.addAtomBlock(layer, atomsLocations[1], 'Atom 2');
    this.atomArrowCreator.addArrowBlock(layer, atomsLocations[0], atomsLocations[1]);

    this.configureStage(stage, 1.1);

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
