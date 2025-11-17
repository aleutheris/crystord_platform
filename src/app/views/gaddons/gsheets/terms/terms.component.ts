import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonDirective } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule, ButtonDirective, IconDirective],
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss']
})
export class TermsComponent {

  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/gaddons/sheets-addon']);
  }
}
