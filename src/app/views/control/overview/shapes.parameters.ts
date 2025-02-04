import * as ShapeDefs from './shapes.defines';


export const treeParameters: ShapeDefs.TreeParameters = {
  minVerticalDistance: 170,
  minHorizontalDistance: 150,
};

export const textAdjustments: ShapeDefs.TextConfigurations = {
  arrowTextOffsetY: -20,
  textMarginX: 150,
  textMarginY: 10,
}

export const atomBlock: ShapeDefs.AtomBlock = {
  x: 0,
  y: 0,
  draggable: false,
};

export const arrowBlockParams: ShapeDefs.ArrowBlock = {
  x: 0,
  y: 0,
  draggable: false,
}

export const atomCircle: ShapeDefs.AtomCircle = {
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  radius: 75,
  fill: 'gray',
  stroke: 'white',
  strokeWidth: 2,
  draggable: false,
};

export const atomText: ShapeDefs.AtomText = {
  x: -150,
  y: -10,
  text: '-',
  fontSize: 20,
  fontFamily: 'Arial',
  fill: 'white',
  width: 300,
  align: 'center',
  draggable: false,
};

export const arrow: ShapeDefs.AtomArrow = {
  points: [0, 0, 0, 0],
  pointerLength: 10,
  pointerWidth: 10,
  fill: 'white',
  stroke: 'white',
  strokeWidth: 2,
};

export const arrowHead: ShapeDefs.AtomText = {
  x: 0,
  y: 0,
  text: '-',
  fontSize: 20,
  fontFamily: 'Arial',
  fill: 'white',
  width: 300,
  align: 'center',
  draggable: false,
};
