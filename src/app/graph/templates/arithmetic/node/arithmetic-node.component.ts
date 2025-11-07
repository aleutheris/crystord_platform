import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

export type NodePortType = 'input' | 'output';

export interface NodePortPointerEvent {
  type: NodePortType;
  portId: string;
  event: PointerEvent;
}

@Component({
  selector: 'df-node-arithmetic',
  templateUrl: './arithmetic-node.component.html',
  styleUrls: ['./arithmetic-node.component.scss'],
  standalone: true
})
export class ArithmeticNodeComponent {
  @Input() title = '';
  @Input() content = '';
  @Input() selected = false;
  @Output() titleChange = new EventEmitter<string>();
  @Output() contentChange = new EventEmitter<string>();
  @Output() portPointerDown = new EventEmitter<NodePortPointerEvent>();
  @Output() portPointerEnter = new EventEmitter<Omit<NodePortPointerEvent, 'event'>>();
  @Output() portPointerLeave = new EventEmitter<Omit<NodePortPointerEvent, 'event'>>();

  private static nextId = 0;
  titleInputId = `df-arithmetic-title-${ArithmeticNodeComponent.nextId++}`;
  contentInputId = `df-arithmetic-content-${ArithmeticNodeComponent.nextId++}`;

  @ViewChild('inputPort', { static: true, read: ElementRef })
  private inputPort?: ElementRef<HTMLElement>;

  @ViewChild('outputPort', { static: true, read: ElementRef })
  private outputPort?: ElementRef<HTMLElement>;

  onTitleChange(val: string) {
    this.title = val;
    this.titleChange.emit(val);
  }

  onContentChange(val: string) {
    this.content = val;
    this.contentChange.emit(val);
  }

  handlePortPointerDown(event: PointerEvent, type: NodePortType, portId: string): void {
    this.portPointerDown.emit({ type, portId, event });
  }

  handlePortPointerEnter(type: NodePortType, portId: string): void {
    this.portPointerEnter.emit({ type, portId });
  }

  handlePortPointerLeave(type: NodePortType, portId: string): void {
    this.portPointerLeave.emit({ type, portId });
  }

  getPortRect(type: NodePortType): DOMRect | null {
    const el = type === 'input' ? this.inputPort?.nativeElement : this.outputPort?.nativeElement;
    return el?.getBoundingClientRect() ?? null;
  }
}
