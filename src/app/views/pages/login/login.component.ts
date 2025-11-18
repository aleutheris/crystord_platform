import { Component, signal, AfterViewInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IconDirective } from '@coreui/icons-angular';
import { ContainerComponent, RowComponent, ColComponent, CardGroupComponent, TextColorDirective, CardComponent, CardBodyComponent, FormDirective, InputGroupComponent, InputGroupTextDirective, FormControlDirective, ButtonDirective } from '@coreui/angular';
import { AuthService } from '../../../services/auth.service';
import { GoogleAuthService } from '../../../services/google-auth.service';
declare const google: any;

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    standalone: true,
    imports: [ContainerComponent, RowComponent, ColComponent, CardGroupComponent, TextColorDirective, CardComponent, CardBodyComponent, FormDirective, InputGroupComponent, InputGroupTextDirective, IconDirective, FormControlDirective, ButtonDirective, NgStyle, FormsModule, RouterLink]
})
export class LoginComponent implements AfterViewInit {
  loginForm = {
    username: '',
    password: ''
  };

  isLoading = signal(false);
  isGoogleLoading = signal(true);
  loginError = signal(false);

  private platformId = inject(PLATFORM_ID);

  constructor(
    private authService: AuthService,
    private router: Router,
    private googleAuth: GoogleAuthService
  ) {
    if (this.authService.isLoggedIn) {
      this.router.navigate(['/dashboard']);
    }

    if (!isPlatformBrowser(this.platformId)) {
      this.isGoogleLoading.set(false);
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.initializeGoogleButton(), 100);
    }
  }

  onLogin(): void {
    this.isLoading.set(true);
    this.loginError.set(false);

    this.authService.login(this.loginForm.username, this.loginForm.password).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/control']);
      },
      error: () => {
        this.isLoading.set(false);
        this.loginError.set(true);
      }
    });
  }

  private initializeGoogleButton(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.isGoogleLoading.set(false);
      return;
    }

    const buttonDiv = document.getElementById('google-signin-button');
    if (!buttonDiv) {
      // If somehow the element is not yet in the DOM, retry shortly once.
      setTimeout(() => this.initializeGoogleButton(), 100);
      return;
    }

    this.isGoogleLoading.set(true);
    this.googleAuth.renderButton(buttonDiv, (credential) => this.handleGoogleResponse(credential))
      .then(() => this.isGoogleLoading.set(false))
      .catch(error => {
        console.error('Error initializing Google button:', error);
        this.isGoogleLoading.set(false);
      });
  }

  private handleGoogleResponse(credential: string): void {
    this.isGoogleLoading.set(true);
    this.loginError.set(false);

    this.authService.loginWithGoogle(credential).subscribe({
      next: () => {
        this.isGoogleLoading.set(false);
        this.router.navigate(['/control']);
      },
      error: () => {
        this.isGoogleLoading.set(false);
        this.loginError.set(true);
      }
    });
  }
}
