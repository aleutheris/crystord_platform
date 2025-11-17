import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonDirective } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, ButtonDirective, IconDirective],
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss']
})
export class SupportComponent {

  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/gaddons/sheets-addon']);
  }
}
