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
  @Output() titleChange = new EventEmitter<string>();
  @Output() contentChange = new EventEmitter<string>();

  onTitleChange(val: string) {
    this.title = val;
    this.titleChange.emit(val);
  }

  onContentChange(val: string) {
    this.content = val;
    this.contentChange.emit(val);
  }
}
