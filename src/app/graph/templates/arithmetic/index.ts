import { NodeTemplate } from '../../models/node-template.types';
import { ARITHMETIC_NODE_TEMPLATE } from './node/arithmetic.node';

export const ARITHMETIC_TEMPLATES: NodeTemplate[] = [
  ARITHMETIC_NODE_TEMPLATE,
];

export const ARITHMETIC_MANIFEST = {
  category: 'arithmetic',
  templates: ARITHMETIC_TEMPLATES,
} as const;
