import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, tap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { Company } from '../shared/models/company.model';
import { User } from '../shared/models/user.model';

interface AuthResponse {
  token: string;
  user: User;
  company?: Company;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  
  currentUser$ = this.currentUserSubject.asObservable();
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';
  private readonly COMPANY_KEY = 'current_company';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  initializeAuth(): Promise<boolean> {
    return new Promise((resolve) => {
      const token = localStorage.getItem(this.TOKEN_KEY);
      const userJson = localStorage.getItem(this.USER_KEY);
      
      if (token && userJson) {
        try {
          const user = JSON.parse(userJson);
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
        } catch (error) {
          this.logout();
        }
      }
      
      resolve(true);
    });
  }

  login(email: string, password: string): Observable<User> {
    const loginRequest: LoginRequest = { email, password };
    
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, loginRequest)
      .pipe(
        tap(response => this.handleAuthentication(response)),
        map(response => response.user),
        catchError(error => {
          console.error('Erreur de connexion:', error);
          let errorMessage = 'La connexion a échoué';
          
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.status === 401) {
            errorMessage = 'Email ou mot de passe incorrect';
          } else if (error.status === 0) {
            errorMessage = 'Impossible de contacter le serveur';
          }
          
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  register(userData: RegisterRequest): Observable<User> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, userData)
      .pipe(
        tap(response => this.handleAuthentication(response)),
        map(response => response.user),
        catchError(error => {
          console.error('Erreur d\'inscription:', error);
          let errorMessage = 'L\'inscription a échoué';
          
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.status === 400) {
            errorMessage = 'Données d\'inscription invalides';
          } else if (error.status === 409) {
            errorMessage = 'Un compte existe déjà avec cet email';
          }
          
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.COMPANY_KEY);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

// auth.service.ts
getCurrentUserCompany(): Company | null {
  const json = localStorage.getItem(this.COMPANY_KEY);
  try   { return json ? JSON.parse(json) as Company : null; }
  catch { return null; }
}


  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.roles?.includes(role) || false;
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  private handleAuthentication(response: AuthResponse): void {
    const { token, user, company } = response;
    
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    
    if (company) {
      localStorage.setItem(this.COMPANY_KEY, JSON.stringify(company));
    }
    
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }
}