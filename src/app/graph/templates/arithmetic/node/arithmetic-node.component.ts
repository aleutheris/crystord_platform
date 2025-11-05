import { Component, EventEmitter, Input, Output } from '@angular/core';

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

  private static nextId = 0;
  titleInputId = `df-arithmetic-title-${ArithmeticNodeComponent.nextId++}`;
  contentInputId = `df-arithmetic-content-${ArithmeticNodeComponent.nextId++}`;

  onTitleChange(val: string) {
    this.title = val;
    this.titleChange.emit(val);
  }

  onContentChange(val: string) {
    this.content = val;
    this.contentChange.emit(val);
  }
}
