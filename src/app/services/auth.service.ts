import { Injectable, signal } from '@angular/core';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Apollo, gql } from 'apollo-angular';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private isDemoModeSubject = new BehaviorSubject<boolean>(false);

  private readonly TOKEN_STORAGE_KEY = 'crystordAuthToken';
  private readonly TOKEN_COOKIE_KEY = 'jwt_token';
  private readonly AUTH_STATE_KEY = 'isAuthenticated';
  private readonly DEMO_STATE_KEY = 'isDemoMode';
  private readonly USERNAME_KEY = 'crystordUsername';

  private username: string | null = null;

  // Signals for reactive UI
  isAuthenticated = signal<boolean>(false);
  isDemoMode = signal<boolean>(false);

  constructor(private apollo: Apollo) {
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

  signup(username: string, password: string, isDemo: boolean = false): Observable<void> {
    // Map username -> email for GraphQL schema compatibility
    const SIGNUP = gql`
      mutation Signup($email: String!, $password: String!, $username: String) {
        signup(email: $email, password: $password, username: $username)
      }
    `;
    return this.apollo.mutate({ mutation: SIGNUP, variables: { email: username, password, username } }).pipe(
      switchMap(() => this.authenticate({ username, password }, isDemo)),
      catchError(error => throwError(() => error))
    );
  }

  startDemo(): Observable<void> {
    return this.authenticate({ username: 'demo', password: 'demo' }, true);
  }

  loginWithGoogle(idToken: string): Observable<void> {
    const SIGNIN_GOOGLE = gql`
      query SigninGoogle($idToken: String!) {
        signinGoogle(idToken: $idToken)
      }
    `;
    return this.apollo.query<{ signinGoogle: string }>({ query: SIGNIN_GOOGLE, variables: { idToken } }).pipe(
      tap(res => {
        const token = res.data?.signinGoogle;
        if (!token) throw new Error('Authentication token missing in response');
        const username = this.extractEmailFromToken(idToken);
        this.persistAuthState(token, false, username);
      }),
      map(() => void 0),
      catchError(error => {
        this.clearAuthState();
        return throwError(() => error);
      })
    );
  }

  getGoogleClientId(): Observable<string> {
    const GET_GOOGLE_CLIENT_ID = gql`
      query GetGoogleClientID {
        getGoogleClientID
      }
    `;
    return this.apollo.query<{ getGoogleClientID: any }>({ query: GET_GOOGLE_CLIENT_ID }).pipe(
      map(res => {
        const data = res.data?.getGoogleClientID;
        return data?.clientId || data?.client_id || data;
      }),
      catchError(error => throwError(() => error))
    );
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

  private extractEmailFromToken(idToken: string): string {
    try {
      const payload = JSON.parse(atob(idToken.split('.')[1]));
      return payload.email || 'Google User';
    } catch {
      return 'Google User';
    }
  }

  private authenticate(
    credentials: { username: string; password: string },
    isDemo: boolean
  ): Observable<void> {
    const SIGNIN = gql`
      query Signin($email: String!, $password: String!) {
        signin(email: $email, password: $password)
      }
    `;
    return this.apollo.query<{ signin: string }>({ query: SIGNIN, variables: { email: credentials.username, password: credentials.password } }).pipe(
      tap(res => {
        const token = res.data?.signin;
        if (!token) throw new Error('Authentication token missing in response');
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
    this.setTokenCookie(token);

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
    this.clearTokenCookie();

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

  private setTokenCookie(token: string): void {
    if (typeof document === 'undefined') {
      return;
    }

    const maxAge = 60 * 60 * 24 * 30; // 30 days
    document.cookie = `${this.TOKEN_COOKIE_KEY}=${token};path=/;max-age=${maxAge};SameSite=Lax`;
  }

  private clearTokenCookie(): void {
    if (typeof document === 'undefined') {
      return;
    }

    document.cookie = `${this.TOKEN_COOKIE_KEY}=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT;SameSite=Lax`;
  }
}

// GraphQL returns a string token from signin/signup
