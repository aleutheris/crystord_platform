import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AtomCircleParams {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  draggable: boolean;

  constructor() {
    this.x = 0;
    this.y = 0;
    this.width = 100;
    this.height = 100;
    this.radius = 75;
    this.fill = 'gray';
    this.stroke = 'black';
    this.strokeWidth = 2;
    this.draggable = false;
  }

  updateShapeLocation(location: any) {
    this.x = location.x;
    this.y = location.y;
  }

  getAtomCircleParams() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      radius: this.radius,
      fill: this.fill,
      stroke: this.stroke,
      strokeWidth: this.strokeWidth,
      draggable: this.draggable,
    };
  }
}
