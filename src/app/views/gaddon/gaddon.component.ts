import { Component } from '@angular/core';
import { Router } from '@angular/router';
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

  installAddon(): void {
    window.open('https://gsuite.google.com/marketplace/app/foo/186388621973', '_blank');
  }

  learnMore(): void {
    // Scroll to functionality section
    const element = document.querySelector('.functionality-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  subscribeNewsletter(): void {
    window.open('https://crystord.substack.com/embed', '_blank');
  }

  exploreCore(): void {
    window.open('https://crystord.com', '_blank');
  }
}
