import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  ColComponent,
  ContainerComponent,
  RowComponent
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [
    CommonModule,
    ButtonDirective,
    CardBodyComponent,
    CardComponent,
    ColComponent,
    ContainerComponent,
    RowComponent,
    IconDirective
  ],
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.scss']
})
export class PrivacyComponent {
  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/sheets-addon']);
  }
}
