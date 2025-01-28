import { Injectable } from '@angular/core';
import Konva from 'konva';
import * as Sdefines from './shapes.defines';
import * as Sparams from './shapes.parameters';
import { AtomCircleParams } from './atom.circle.params';
import { AtomTextParams } from './atom.text.params';


@Injectable({
  providedIn: 'root',
})
export class AtomShapeCreator {
  constructor(private atomCircleParams: AtomCircleParams,
              private atomTextParams: AtomTextParams) {}

  addAtomBlock(layer: Konva.Layer, location: Sdefines.ShapeLocation, text: string): void {
    this.atomCircleParams.setLocation(location);
    const circleParams = this.atomCircleParams.getAtomCircleParams();

    const textLocation = { x: location.x - 150, y: location.y -10 };
    this.atomTextParams.setLocation(textLocation);
    this.atomTextParams.setText(text);
    const textParams = this.atomTextParams.getAtomTextParams();

    const circleShape = new Konva.Circle(circleParams);
    const textShape = new Konva.Text(textParams);

    const atomBlock = new Konva.Group(Sparams.atomBlock);

    atomBlock.add(circleShape);
    atomBlock.add(textShape);

    layer.add(circleShape);
    layer.add(atomBlock);
  }
}
