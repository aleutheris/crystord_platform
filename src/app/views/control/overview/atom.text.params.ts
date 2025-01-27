import { Injectable } from '@angular/core';
import { AtomText } from './shapes.defines';
import * as Sparams from './shapes.parameters';

@Injectable({
  providedIn: 'root',
})
export class AtomTextParams {
  atomTextParams: AtomText

  constructor() {
    this.atomTextParams = Sparams.atomText;
  }

  setLocation(location: any) {
    this.atomTextParams.x = location.x;
    this.atomTextParams.y = location.y;
  }

  setText(text: string) {
    this.atomTextParams.text = text;
  }

  getLocation() {
    return { x: this.atomTextParams.x, y: this.atomTextParams.y };
  }

  getAtomTextParams() {
    return this.atomTextParams;
  }
}
