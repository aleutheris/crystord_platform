import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
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
  selector: 'app-gaddon',
  templateUrl: './gaddon.component.html',
  styleUrls: ['./gaddon.component.scss'],
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
  ]
})
export class GaddonComponent {

  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/']);
  }

  installAddon(): void {
    window.open('https://gsuite.google.com/marketplace/app/foo/186388621973', '_blank');
  }

  contactSupport(): void {
    window.open('mailto:aleutheris@gmail.com?subject=Google Slides Add-on Inquiry', '_blank');
  }
}
