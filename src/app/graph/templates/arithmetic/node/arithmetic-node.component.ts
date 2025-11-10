import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, OnChanges } from '@angular/core';

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
export class ArithmeticNodeComponent implements OnChanges {
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

  private pendingTitle = '';
  private pendingContent = '';
  private originalTitle = '';
  private originalContent = '';

  @ViewChild('inputPort', { static: true, read: ElementRef })
  private inputPort?: ElementRef<HTMLElement>;

  @ViewChild('outputPort', { static: true, read: ElementRef })
  private outputPort?: ElementRef<HTMLElement>;

  ngOnChanges() {
    // Sync original values when inputs change
    this.originalTitle = this.title;
    this.originalContent = this.content;
    this.pendingTitle = this.title;
    this.pendingContent = this.content;
  }

  onTitleInput(val: string) {
    this.pendingTitle = val;
  }

  onTitleBlur() {
    if (this.pendingTitle !== this.originalTitle) {
      this.title = this.pendingTitle;
      this.originalTitle = this.pendingTitle;
      this.titleChange.emit(this.pendingTitle);
    }
  }

  onContentInput(val: string) {
    this.pendingContent = val;
  }

  onContentBlur() {
    if (this.pendingContent !== this.originalContent) {
      this.content = this.pendingContent;
      this.originalContent = this.pendingContent;
      this.contentChange.emit(this.pendingContent);
    }
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
