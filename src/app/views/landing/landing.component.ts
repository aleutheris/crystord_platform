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
    username: '',
    password: ''
  };

  signupForm = {
    username: '',
    password: '',
    confirmPassword: ''
  };

  isLoading = signal(false);
  demoLoading = signal(false);
  authMode = signal<'signin' | 'signup'>('signin');
  authError = signal<string | null>(null);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  switchMode(mode: 'signin' | 'signup'): void {
    if (this.authMode() === mode) {
      return;
    }

    this.authMode.set(mode);
    this.authError.set(null);
    this.isLoading.set(false);

    if (mode === 'signin') {
      this.signupForm = { username: '', password: '', confirmPassword: '' };
    } else {
      this.loginForm = { username: '', password: '' };
    }
  }

  onSubmit(): void {
    if (this.authMode() === 'signin') {
      this.submitSignIn();
    } else {
      this.submitSignUp();
    }
  }

  private submitSignIn(): void {
    this.isLoading.set(true);
    this.authError.set(null);

    this.authService.login(this.loginForm.username, this.loginForm.password).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/control']);
      },
      error: () => {
        this.isLoading.set(false);
        this.authError.set('Unable to sign in. Please check your credentials.');
      }
    });
  }

  private submitSignUp(): void {
    if (this.signupForm.password !== this.signupForm.confirmPassword) {
      this.authError.set('Passwords do not match.');
      return;
    }

    if (!this.signupForm.username || !this.signupForm.password) {
      this.authError.set('Username and password are required.');
      return;
    }

    this.isLoading.set(true);
    this.authError.set(null);

    this.authService.signup(this.signupForm.username, this.signupForm.password).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/control']);
      },
      error: (error) => {
        this.isLoading.set(false);
        const message = error?.error?.message || 'Unable to create account. Please try again.';
        this.authError.set(message);
      }
    });
  }

  startDemo(): void {
    this.demoLoading.set(true);
    this.authError.set(null);

    this.authService.startDemo().subscribe({
      next: () => {
        this.demoLoading.set(false);
        this.router.navigate(['/control']);
      },
      error: () => {
        this.demoLoading.set(false);
        this.authError.set('Unable to start demo. Please try again later.');
      }
    });
  }

  openYouTube(): void {
    window.open('https://www.youtube.com/@aleutheris', '_blank');
  }

  openNewsletter(): void {
    window.open('https://crystord.substack.com/embed', '_blank');
  }

  openSlidesAddon(): void {
    this.router.navigate(['/slides-addon']);
  }

  openSheetsAddon(): void {
    this.router.navigate(['/sheets-addon']);
  }

  openEmail(): void {
    window.open('mailto:aleutheris@gmail.com?subject=Crystord Inquiry', '_blank');
  }
}
