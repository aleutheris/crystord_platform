import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  standalone: true,
  imports: [CommonModule]
})
export class ArithmeticNodeComponent implements OnChanges {
  @Input() title = '';
  @Input() content = '';
  @Input() operator = '';
  @Input() selected = false;
  @Input() isDirty = false;
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

  getOperatorSymbols(): string {
    if (!this.operator) return '';

    // Parse the operation string format: "UUID operator UUID operator UUID..."
    // We want to extract only the operator symbols (+, -, *, /)

    // Map operators to their display symbols
    const operatorSymbolMap: Record<string, string> = {
      '+': '+',
      '-': '-',
      '*': '×',
      '/': '÷'
    };

    // Split by spaces and filter for operator symbols
    const parts = this.operator.split(' ').filter(p => p.trim());
    const operators: string[] = [];

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      // Operators are at odd indices (1, 3, 5, ...) in the format: UUID op UUID op UUID
      if (i % 2 === 1 && operatorSymbolMap[part]) {
        operators.push(operatorSymbolMap[part]);
      }
    }

    return operators.length > 0 ? operators.join(' ') : '';
  }

  getPortRect(type: NodePortType): DOMRect | null {
    const el = type === 'input' ? this.inputPort?.nativeElement : this.outputPort?.nativeElement;
    return el?.getBoundingClientRect() ?? null;
  }
}
