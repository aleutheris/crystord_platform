import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  ColComponent,
  ContainerComponent,
  FormControlDirective,
  FormDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  RowComponent,
  SpinnerComponent,
  AlertComponent
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonDirective,
    CardBodyComponent,
    CardComponent,
    ColComponent,
    ContainerComponent,
    FormControlDirective,
    FormDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    RowComponent,
    SpinnerComponent,
    AlertComponent,
    IconDirective
  ]
})
export class LandingComponent {
  loginForm = {
    email: '',
    password: ''
  };

  isLoading = signal(false);
  loginError = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin(): void {
    this.isLoading.set(true);
    this.loginError.set(false);

    this.authService.login(this.loginForm.email, this.loginForm.password).subscribe({
      next: (success) => {
        this.isLoading.set(false);
        if (success) {
          this.router.navigate(['/dashboard']);
        } else {
          this.loginError.set(true);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.loginError.set(true);
      }
    });
  }

  startDemo(): void {
    this.authService.startDemo();
    this.router.navigate(['/control']);
  }

  openYouTube(): void {
    window.open('https://www.youtube.com/@aleutheris', '_blank');
  }

  openNewsletter(): void {
    window.open('https://crystord.substack.com/embed', '_blank');
  }

  openAddon(): void {
    this.router.navigate(['/gaddon']);
  }

  openEmail(): void {
    window.open('mailto:aleutheris@gmail.com?subject=Crystord Inquiry', '_blank');
  }
}
