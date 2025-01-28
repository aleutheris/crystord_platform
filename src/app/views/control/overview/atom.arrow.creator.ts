import { Injectable } from '@angular/core';
import Konva from 'konva';
import { ShapeLocation } from './shapes.defines';
import { ArrowShapeCreator } from './arrow.shape.creator';


@Injectable({
  providedIn: 'root',
})
export class AtomArrowCreator {
  arrowShape: ArrowShapeCreator;

  constructor() {
    this.arrowShape = new ArrowShapeCreator();
  }

  addArrowBlock(layer: Konva.Layer,
                locationOrig: ShapeLocation, locationDest: ShapeLocation): void {
    this.arrowShape.addArrow(layer, locationOrig, locationDest);
  }
}
