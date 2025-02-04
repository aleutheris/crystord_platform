import { Injectable } from '@angular/core';
import Konva from 'konva';
import { AtomArrow, ShapeLocation } from './shapes.defines';
import * as Sparams from './shapes.parameters';


@Injectable({
  providedIn: 'root',
})
export class ArrowShapeParams {
  arrowParams: AtomArrow;
  circleRadius = Sparams.atomCircle.radius;

  constructor() {
    this.arrowParams = Sparams.arrow;
  }

  setArrowDisplacement(locationOrig: ShapeLocation,
                       locationDest: ShapeLocation): void {
    this.arrowParams.points = [
      locationOrig.x,
      locationOrig.y,
      locationDest.x,
      locationDest.y
    ];
  }

  getArrowShapeParams(): AtomArrow {
    return this.arrowParams;
  }
}
