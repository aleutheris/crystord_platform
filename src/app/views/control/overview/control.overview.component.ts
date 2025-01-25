import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  RowComponent,
  ColComponent,
  TextColorDirective,
  CardComponent,
  CardHeaderComponent,
  CardBodyComponent,
} from '@coreui/angular';
import { AtomService } from './atom.service';
import { KonvaCanvasComponent } from '../../../konva-canvas/konva-canvas.component';

@Component({
    selector: 'app-control',
    templateUrl: './control.overview.component.html',
    styleUrls: ['./control.overview.component.scss'],
    standalone: true,
    imports: [
      CommonModule,
      RowComponent,
      ColComponent,
      TextColorDirective,
      CardComponent,
      CardHeaderComponent,
      CardBodyComponent,
      KonvaCanvasComponent
    ]
  })
export class ControlOverviewComponent {
  constructor(private atomService: AtomService) {
  }
}
