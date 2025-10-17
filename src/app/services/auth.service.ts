import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private isDemoModeSubject = new BehaviorSubject<boolean>(false);

  private readonly TOKEN_STORAGE_KEY = 'crystordAuthToken';
  private readonly AUTH_STATE_KEY = 'isAuthenticated';
  private readonly DEMO_STATE_KEY = 'isDemoMode';
  private readonly USERNAME_KEY = 'crystordUsername';

  private username: string | null = null;

  // Signals for reactive UI
  isAuthenticated = signal<boolean>(false);
  isDemoMode = signal<boolean>(false);

  constructor(private http: HttpClient) {
    const storedToken = this.getToken();
    const wasDemoMode = localStorage.getItem(this.DEMO_STATE_KEY) === 'true';
    const storedUsername = localStorage.getItem(this.USERNAME_KEY);

    if (storedToken) {
      this.setAuthenticated(true);
    }

    if (wasDemoMode) {
      this.setDemoMode(true);
    }

    if (storedUsername) {
      this.username = storedUsername;
    }
  }

  get isAuthenticated$(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  get isDemoMode$(): Observable<boolean> {
    return this.isDemoModeSubject.asObservable();
  }

  get isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  login(username: string, password: string): Observable<void> {
    return this.authenticate({ username, password }, false);
  }

  signup(username: string, password: string): Observable<void> {
    return this.http.post('/api/signup', { username, password }).pipe(
      switchMap(() => this.authenticate({ username, password }, false)),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  startDemo(): Observable<void> {
    return this.authenticate({ username: 'dummy', password: 'dummy' }, true);
  }

  logout(): void {
    this.clearAuthState();
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_STORAGE_KEY);
  }

  getUsername(): string | null {
    return this.username;
  }

  private authenticate(
    credentials: { username: string; password: string },
    isDemo: boolean
  ): Observable<void> {
    return this.http.post<AuthResponse>('/api/signin', credentials).pipe(
      tap(response => {
        const token = response?.token ?? response?.access_token;

        if (!token) {
          throw new Error('Authentication token missing in response');
        }

        const username = isDemo ? 'Demo User' : credentials.username;
        this.persistAuthState(token, isDemo, username);
      }),
      map(() => void 0),
      catchError(error => {
        this.clearAuthState();
        return throwError(() => error);
      })
    );
  }

  private persistAuthState(token: string, isDemo: boolean, username: string): void {
    localStorage.setItem(this.TOKEN_STORAGE_KEY, token);
    localStorage.setItem(this.AUTH_STATE_KEY, 'true');
    localStorage.setItem(this.USERNAME_KEY, username);

    if (isDemo) {
      localStorage.setItem(this.DEMO_STATE_KEY, 'true');
    } else {
      localStorage.removeItem(this.DEMO_STATE_KEY);
    }

    this.username = username;
    this.setAuthenticated(true);
    this.setDemoMode(isDemo);
  }

  private clearAuthState(): void {
    localStorage.removeItem(this.TOKEN_STORAGE_KEY);
    localStorage.removeItem(this.AUTH_STATE_KEY);
    localStorage.removeItem(this.DEMO_STATE_KEY);
    localStorage.removeItem(this.USERNAME_KEY);

    this.username = null;
    this.setAuthenticated(false);
    this.setDemoMode(false);
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

interface AuthResponse {
  token?: string;
  access_token?: string;
}
