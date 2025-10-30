import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ArithmeticNodeComponent } from '../templates/arithmetic/node/arithmetic-node.component';

export interface GraphNodeData {
  title: string;
  content: string;
}

@Component({
  selector: 'app-graph-canvas',
  standalone: true,
  imports: [CommonModule, ArithmeticNodeComponent],
  template: `
    <div class="graph-canvas" [style.height.%]="100">
      <div class="graph-node" [style.left.px]="nodeX" [style.top.px]="nodeY">
        <df-node-arithmetic
          [title]="node.title"
          [content]="node.content"
          (titleChange)="node.title = $event"
          (contentChange)="node.content = $event"
        ></df-node-arithmetic>
      </div>
    </div>
  `,
  styles: [
    `:host { display: block; height: 100%; }
     .graph-canvas { position: relative; overflow: auto; background: var(--cui-light, #f8f9fa); border-radius: .25rem; }
     .graph-node { position: absolute; }
    `
  ]
})
export class GraphCanvasComponent {
  @Input() node: GraphNodeData = { title: 'Arithmetic', content: 'demo' };
  @Input() nodeX = 120;
  @Input() nodeY = 100;
}
