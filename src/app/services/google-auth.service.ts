import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { defer, firstValueFrom, shareReplay } from 'rxjs';
import { AuthService } from './auth.service';

declare const google: any;

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {
  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);
  private clientId$ = defer(() => this.authService.getGoogleClientId()).pipe(shareReplay(1));
  private scriptLoading?: Promise<void>;

  private loadScript(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return Promise.reject('Google Sign-In is only available in the browser');
    }

    if (this.scriptLoading) {
      return this.scriptLoading;
    }

    if (document.getElementById('google-signin-script')) {
      this.scriptLoading = Promise.resolve();
      return this.scriptLoading;
    }

    this.scriptLoading = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.id = 'google-signin-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Sign-In script'));
      document.head.appendChild(script);
    });

    return this.scriptLoading;
  }

  async renderButton(
    element: HTMLElement,
    onCredential: (credential: string) => void,
    options?: Record<string, unknown>
  ): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    await this.loadScript();
    const clientId = await firstValueFrom(this.clientId$);

    if (!clientId || typeof google === 'undefined') {
      throw new Error('Google Sign-In is not available');
    }

    // Avoid duplicate renders if already initialized on this element
    if (element.childElementCount > 0) {
      return;
    }

    google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: any) => {
        if (response.credential) {
          onCredential(response.credential);
        }
      }
    });

    google.accounts.id.renderButton(element, {
      theme: 'outline',
      size: 'large',
      width: element.offsetWidth || 320,
      text: 'signin_with',
      ...options
    });
  }
}
