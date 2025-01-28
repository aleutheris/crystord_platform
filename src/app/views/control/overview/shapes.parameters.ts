import * as ShapeDefs from './shapes.defines';

export const textAdjustments: ShapeDefs.TextAdjustments = {
  arrowTextOffsetY: -20,
  textMarginX: 150,
  textMarginY: 10,
}

export const atomBlock: ShapeDefs.AtomBlock = {
  draggable: false,
};

export const arrowBlockParams: ShapeDefs.ArrowBlock = {
  draggable: false,
}

export const atomCircle: ShapeDefs.AtomCircle = {
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  radius: 75,
  fill: 'gray',
  stroke: 'black',
  strokeWidth: 2,
  draggable: false,
};

export const atomText: ShapeDefs.AtomText = {
  x: 0,
  y: 0,
  text: '-',
  fontSize: 20,
  fontFamily: 'Arial',
  fill: 'black',
  width: 300,
  align: 'center',
  draggable: false,
};

export const arrow: ShapeDefs.AtomArrow = {
  points: [0, 0, 0, 0],
  pointerLength: 10,
  pointerWidth: 10,
  fill: 'black',
  stroke: 'black',
  strokeWidth: 2,
};

export const arrowHead: ShapeDefs.AtomText = {
  x: 0,
  y: 0,
  text: '-',
  fontSize: 20,
  fontFamily: 'Arial',
  fill: 'black',
  width: 300,
  align: 'center',
  draggable: false,
};
