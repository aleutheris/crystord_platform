import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'df-node-arithmetic',
  template: `
    <div class="df-node df-node--arithmetic">
      <div class="df-node__title-row">
        <input id="titleInput" type="text" class="df-node__title-input" [value]="title"
               (input)="onTitleChange($any($event.target).value)" placeholder="Title" />
      </div>
      <div class="df-node__body">
        <label class="df-node__label" for="contentInput">Content</label>
        <input id="contentInput" type="text" class="df-node__input" [value]="content"
               (input)="onContentChange($any($event.target).value)" placeholder="Enter content..." />
      </div>
      <div class="df-node__ports">
        <span class="df-node__port df-node__port--in" title="input"></span>
        <span class="df-node__port df-node__port--out" title="output"></span>
      </div>
    </div>
  `,
  styles: [
    `:host { display: block; }
     .df-node { padding: .5rem; border-radius: .25rem; border: 1px solid var(--cui-border-color, #dee2e6); background: var(--cui-body-bg, #fff); }
     .df-node__title-row { margin-bottom: .5rem; }
     .df-node__title-input { width: 100%; font-weight: 600; padding: .375rem .5rem; border: 1px solid var(--cui-border-color, #dee2e6); border-radius: .25rem; }
     .df-node__label { display: block; font-size: .875rem; color: var(--cui-secondary-color, #6c757d); margin-bottom: .25rem; }
     .df-node__input { width: 100%; padding: .375rem .5rem; border: 1px solid var(--cui-border-color, #dee2e6); border-radius: .25rem; }
     .df-node__ports { display: flex; justify-content: space-between; margin-top: .5rem; }
     .df-node__port { width: .75rem; height: .75rem; border-radius: 50%; background: var(--cui-primary, #321fdb); display: inline-block; }
     .df-node__port--in { background: var(--cui-info, #39f); }
     .df-node__port--out { background: var(--cui-success, #2eb85c); }
    `
  ],
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
