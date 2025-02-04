import { Injectable } from '@angular/core';
import Konva from 'konva';
import { textAdjustments, arrowBlockParams } from './shapes.parameters';
import { ShapeLocation } from './shapes.defines';
import { ArrowShapeParams } from './arrow.shape.creator';
import { AtomTextParams } from './atom.text.params';


@Injectable({
  providedIn: 'root',
})
export class AtomArrowCreator {
  arrowShapeParams: ArrowShapeParams;

  constructor() {
    this.arrowShapeParams = new ArrowShapeParams();
  }

  addArrowBlock(layer: Konva.Layer,
                locationOrig: ShapeLocation, locationDest: ShapeLocation,
                text: string): void {
    this.arrowShapeParams.setArrowDisplacement(locationOrig, locationDest);
    const arrowParams = this.arrowShapeParams.getArrowShapeParams();

    const arrowShape = new Konva.Arrow(arrowParams);
    layer.add(arrowShape);
  }
}
