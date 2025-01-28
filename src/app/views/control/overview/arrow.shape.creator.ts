import { Injectable } from '@angular/core';
import Konva from 'konva';
import { AtomArrow, ShapeLocation } from './shapes.defines';
import * as Sparams from './shapes.parameters';


@Injectable({
  providedIn: 'root',
})
export class ArrowShapeCreator {
  arrowParams: AtomArrow;
  circleRadius = Sparams.atomCircle.radius;

  constructor() {
    this.arrowParams = Sparams.arrow;
  }

  addArrow(layer: Konva.Layer,
           locationOrig: ShapeLocation,
           locationDest: ShapeLocation): void {
    this.setArrowPoints(locationOrig, locationDest);

    const arrow = new Konva.Arrow(this.arrowParams);
    layer.add(arrow);
  }

  setArrowPoints(locationOrig: ShapeLocation,
                 locationDest: ShapeLocation): void {
    this.arrowParams.points = [
      locationOrig.x + this.circleRadius,
      locationOrig.y,
      locationDest.x - this.circleRadius,
      locationDest.y
    ];
  }
}
