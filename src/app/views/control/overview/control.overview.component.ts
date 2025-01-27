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
import { ShapesCreator } from './shapes.creator';

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
    ]
  })
export class ControlOverviewComponent {
  constructor(private shapesCreator: ShapesCreator) {
  }

  ngAfterViewInit(): void {
    this.shapesCreator.draw();
  }
}
