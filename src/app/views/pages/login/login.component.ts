import { Component, signal } from '@angular/core';
import { NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IconDirective } from '@coreui/icons-angular';
import { ContainerComponent, RowComponent, ColComponent, CardGroupComponent, TextColorDirective, CardComponent, CardBodyComponent, FormDirective, InputGroupComponent, InputGroupTextDirective, FormControlDirective, ButtonDirective } from '@coreui/angular';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    standalone: true,
    imports: [ContainerComponent, RowComponent, ColComponent, CardGroupComponent, TextColorDirective, CardComponent, CardBodyComponent, FormDirective, InputGroupComponent, InputGroupTextDirective, IconDirective, FormControlDirective, ButtonDirective, NgStyle, FormsModule, RouterLink]
})
export class LoginComponent {
  loginForm = {
    email: '',
    password: ''
  };

  isLoading = signal(false);
  loginError = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // If user is already logged in, redirect to dashboard
    if (this.authService.isLoggedIn) {
      this.router.navigate(['/dashboard']);
    }
  }

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
}
