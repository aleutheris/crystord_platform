import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  ButtonDirective,
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';

@Component({
  selector: 'app-sheets-addon',
  templateUrl: './sheets-addon.component.html',
  styleUrls: ['./sheets-addon.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ButtonDirective,
    IconDirective
  ]
})
export class SheetsAddonComponent {
  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/']);
  }

  installAddon(): void {
    // TODO: Update with actual Google Workspace Marketplace link when available
    window.open('https://workspace.google.com/marketplace', '_blank');
  }

  contactSupport(): void {
    window.open('mailto:aleutheris@gmail.com?subject=Google Sheets Add-on Inquiry', '_blank');
  }
}
