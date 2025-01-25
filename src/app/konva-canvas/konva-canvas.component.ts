import { Component, AfterViewInit } from '@angular/core';
import Konva from 'konva';

@Component({
  selector: 'app-konva-canvas',
  standalone: true,
  imports: [],
  template: '<div id="konva-container"></div>',
  templateUrl: './konva-canvas.component.html',
  styleUrl: './konva-canvas.component.scss'
})
export class KonvaCanvasComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    const stage = new Konva.Stage({
      container: 'konva-container',
      width: window.innerWidth,
      height: window.innerHeight,
    });

    const layer = new Konva.Layer();
    stage.add(layer);

    const rect = new Konva.Rect({
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      fill: 'lightgray',
      stroke: 'black',
      strokeWidth: 2,
    });
    layer.add(rect);

    layer.batchDraw();
  }
}
