export interface ShapeLocation {
  x: number;
  y: number;
}

export interface AtomBlock {
  draggable: boolean;
}

export interface AtomCircle {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  draggable: boolean;
}

export interface AtomFont {
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fontFamily: string;
  fill: string;
  width: number;
  align: string;
  draggable: boolean;
}
