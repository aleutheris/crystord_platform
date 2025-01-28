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
  arrowTextParams: AtomTextParams;

  constructor() {
    this.arrowShapeParams = new ArrowShapeParams();
    this.arrowTextParams = new AtomTextParams();
  }

  addArrowBlock(layer: Konva.Layer,
                locationOrig: ShapeLocation, locationDest: ShapeLocation,
                text: string): void {
    this.arrowShapeParams.setArrowDisplacement(locationOrig, locationDest);
    const arrowParams = this.arrowShapeParams.getArrowShapeParams();

    const location = {
      x: (locationOrig.x + locationDest.x) / 2,
      y: (locationOrig.y + locationDest.y) / 2 + textAdjustments.arrowTextOffsetY
    };
    const textLocation = {
      x: location.x - textAdjustments.textMarginX,
      y: location.y - textAdjustments.textMarginY
    };
    this.arrowTextParams.setLocation(textLocation);
    this.arrowTextParams.setText(text);
    const textParams = this.arrowTextParams.getAtomTextParams();

    const arrowShape = new Konva.Arrow(arrowParams);
    const textShape = new Konva.Text(textParams);

    const arrowBlock = new Konva.Group(arrowBlockParams);

    arrowBlock.add(arrowShape);
    arrowBlock.add(textShape);

    layer.add(arrowShape);
    layer.add(arrowBlock);
  }
}
