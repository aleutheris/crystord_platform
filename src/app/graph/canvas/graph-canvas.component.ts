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
  selectedIndex: number | null = null;

  onCanvasMouseDown(): void {
    this.selectedIndex = null;
  }

  onNodeMouseDown(event: MouseEvent, index: number): void {
    this.selectedIndex = index;
    const target = event.target as HTMLElement | null;
    const tag = target?.tagName.toLowerCase();
    const isEditable = tag === 'input' || tag === 'textarea' || target?.isContentEditable;

    if (isEditable) {
      // Allow native focus/selection behaviour for editable controls.
      return;
    }

    this.draggingIndex = index;
    this.dragOffsetX = event.clientX - this.nodes[index].x;
    this.dragOffsetY = event.clientY - this.nodes[index].y;
    const active = document.activeElement as HTMLElement | null;
    if (active && (active.tagName.toLowerCase() === 'input' || active.tagName.toLowerCase() === 'textarea' || active.isContentEditable)) {
      active.blur();
    }
    event.preventDefault();
    event.stopPropagation();
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
