import { NodeTemplate } from '../../../models/node-template.types';
import { ArithmeticNodeComponent } from './arithmetic-node.component';

export const ARITHMETIC_NODE_TEMPLATE: NodeTemplate = {
  id: 'arithmetic:node',
  label: 'Arithmetic',
  category: 'arithmetic',
  inputs: [ { name: 'in', type: 'any' } ],
  outputs: [ { name: 'out', type: 'any' } ],
  defaults: { title: 'Arithmetic', content: '' },
  renderer: { type: 'angular', component: ArithmeticNodeComponent }
};
