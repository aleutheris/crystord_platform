import * as ShapeDefs from './shapes.defines';

export const atomBlock: ShapeDefs.AtomBlock = {
  draggable: false,
};

export const atomCicle: ShapeDefs.AtomCircle = {
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

export const atomFont: ShapeDefs.AtomFont = {
  x: 0,
  y: 0,
  text: 'Hello',
  fontSize: 20,
  fontFamily: 'Arial',
  fill: 'black',
  width: 300,
  align: 'center',
  draggable: false,
};

export const updateShapeLocation = (shape: any, location: ShapeDefs.ShapeLocation): any => {
  return { ...shape, x: location.x, y: location.y };
}

export const updateText = (shape: any, text: string): any => {
  return { ...shape, text };
}
