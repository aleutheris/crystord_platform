export interface ShapeLocation {
  x: number;
  y: number;
}

export interface TextAdjustments {
  arrowTextOffsetY: number;
  textMarginX: number;
  textMarginY: number;
}

export interface AtomBlock {
  draggable: boolean;
}

export interface ArrowBlock {
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

export interface AtomText {
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

export interface AtomArrow {
  points: number[];
  pointerLength: number;
  pointerWidth: number;
  fill: string;
  stroke: string;
  strokeWidth: number;

}
