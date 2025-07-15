import { Injectable, signal } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private isDemoModeSubject = new BehaviorSubject<boolean>(false);

  // Signals for reactive UI
  isAuthenticated = signal<boolean>(false);
  isDemoMode = signal<boolean>(false);

  constructor() {
    // Check if user was previously authenticated (you can expand this with localStorage, JWT, etc.)
    const wasAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const wasDemoMode = localStorage.getItem('isDemoMode') === 'true';

    if (wasAuthenticated || wasDemoMode) {
      this.setAuthenticated(wasAuthenticated);
      this.setDemoMode(wasDemoMode);
    }
  }

  get isAuthenticated$(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  get isDemoMode$(): Observable<boolean> {
    return this.isDemoModeSubject.asObservable();
  }

  get isLoggedIn(): boolean {
    return this.isAuthenticated() || this.isDemoMode();
  }

  login(email: string, password: string): Observable<boolean> {
    // Simulate login logic - replace with your actual authentication
    return new Observable(observer => {
      setTimeout(() => {
        // Simple validation for demo purposes
        if (email && password) {
          this.setAuthenticated(true);
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.removeItem('isDemoMode');
          observer.next(true);
        } else {
          observer.next(false);
        }
        observer.complete();
      }, 1000);
    });
  }

  startDemo(): void {
    this.setDemoMode(true);
    this.setAuthenticated(false);
    localStorage.setItem('isDemoMode', 'true');
    localStorage.removeItem('isAuthenticated');
  }

  logout(): void {
    this.setAuthenticated(false);
    this.setDemoMode(false);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('isDemoMode');
  }

  private setAuthenticated(value: boolean): void {
    this.isAuthenticated.set(value);
    this.isAuthenticatedSubject.next(value);
  }

  private setDemoMode(value: boolean): void {
    this.isDemoMode.set(value);
    this.isDemoModeSubject.next(value);
  }
}
