import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ArithmeticNodeComponent } from '../templates/arithmetic/node/arithmetic-node.component';

export interface GraphNodeData {
  title: string;
  content: string;
}

export interface GraphNode {
  x: number;
  y: number;
  data: GraphNodeData;
}

@Component({
  selector: 'app-graph-canvas',
  standalone: true,
  imports: [CommonModule, ArithmeticNodeComponent],
  templateUrl: './graph-canvas.component.html',
  styleUrls: ['./graph-canvas.component.scss']
})
export class GraphCanvasComponent {
  @Input() nodes: GraphNode[] = [];

  private draggingIndex: number | null = null;
  private dragOffsetX = 0;
  private dragOffsetY = 0;

  onMouseDown(event: MouseEvent, index: number): void {
    this.draggingIndex = index;
    this.dragOffsetX = event.clientX - this.nodes[index].x;
    this.dragOffsetY = event.clientY - this.nodes[index].y;
    event.preventDefault();
  }

  onMouseMove(event: MouseEvent): void {
    if (this.draggingIndex !== null) {
      this.nodes[this.draggingIndex].x = event.clientX - this.dragOffsetX;
      this.nodes[this.draggingIndex].y = event.clientY - this.dragOffsetY;
    }
  }

  onMouseUp(): void {
    this.draggingIndex = null;
  }
}
