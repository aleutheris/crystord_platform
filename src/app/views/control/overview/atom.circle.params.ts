import { Injectable } from '@angular/core';
import { AtomCircle } from './shapes.defines';
import * as Sparams from './shapes.parameters';

@Injectable({
  providedIn: 'root',
})
export class AtomCircleParams {
  atomCircleParams: AtomCircle

  constructor() {
    this.atomCircleParams = Sparams.atomCircle;
  }

  setLocation(location: any) {
    this.atomCircleParams.x = location.x;
    this.atomCircleParams.y = location.y;
  }

  getLocation() {
    return { x: this.atomCircleParams.x, y: this.atomCircleParams.y };
  }

  getAtomCircleParams() {
    return this.atomCircleParams;
  }
}
