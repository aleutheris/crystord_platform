import { Injectable } from '@angular/core';
import Konva from 'konva';
import { atomBlock } from './shapes.parameters';

@Injectable({
  providedIn: 'root',
})
export class ShapesCreator {
  constructor() {
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

    const circle1 = new Konva.Circle(atomBlock);

    const circle2 = new Konva.Circle({
      x: 600,
      y: 200,
      radius: 75,
      fill: 'gray',
      stroke: 'black',
      strokeWidth: 2,
      draggable: false,
    });
    layer.add(circle1);

    const text1 = new Konva.Text({
      x: 50,
      y: 190,
      text: 'Hello',
      fontSize: 30,
      fontFamily: 'Arial',
      fill: 'black',
      width: 300,
      align: 'center',
      draggable: false,
    });
    layer.add(circle2);

    const group1 = new Konva.Group({
      draggable: false,
    });

    group1.add(circle1);
    group1.add(text1);

    layer.add(group1);

    const arrow = new Konva.Arrow({
      points: [
        circle1.x() + circle1.radius(),
        circle1.y(),
        circle2.x() - circle1.radius(),
        circle2.y()
      ],
      pointerLength: 10,
      pointerWidth: 10,
      fill: 'black',
      stroke: 'black',
      strokeWidth: 2,
    });
    layer.add(arrow);

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
