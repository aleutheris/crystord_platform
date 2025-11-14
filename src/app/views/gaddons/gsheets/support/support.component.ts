import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
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
  selector: 'app-support',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonDirective,
    CardBodyComponent,
    CardComponent,
    ColComponent,
    ContainerComponent,
    RowComponent,
    IconDirective
  ],
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss']
})
export class SupportComponent {
  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/sheets-addon']);
  }

  contactSupport(): void {
    window.open('mailto:aleutheris@gmail.com?subject=Google Sheets Add-on Support', '_blank');
  }
}
