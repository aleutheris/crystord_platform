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
    const circleParams = this.atomCircleParams.getAtomCircleParams();
    const circleShape = new Konva.Circle(circleParams);

    this.atomTextParams.setText(text);
    const textParams = this.atomTextParams.getAtomTextParams();
    const textShape = new Konva.Text(textParams);

    Sparams.atomBlock.x = location.x;
    Sparams.atomBlock.y = location.y;
    const atomBlock = new Konva.Group(Sparams.atomBlock);

    atomBlock.add(circleShape);
    atomBlock.add(textShape);

    layer.add(atomBlock);
  }
}
