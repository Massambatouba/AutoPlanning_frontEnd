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
  mustChangePassword?: boolean;
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
  private roles: string[] = [];
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  currentUser$ = this.currentUserSubject.asObservable();
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';
  private readonly COMPANY_KEY = 'current_company';
  private readonly ROLES_KEY = 'roles';
  private readonly MUST_CHANGE_KEY = 'must_change_pw';


  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

initializeAuth(): Promise<boolean> {
  return new Promise((resolve) => {
    const token   = localStorage.getItem(this.TOKEN_KEY);
    const userStr = localStorage.getItem(this.USER_KEY);

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;

        // Recalcule les rôles depuis user.roles ou depuis le JWT
        const rolesFromUser = Array.isArray((user as any).roles) ? (user as any).roles : [];
        let roles: string[] = rolesFromUser.length ? rolesFromUser : this.decodeJwtRoles(token);

        // Normalisation + persistance
        roles = (roles || []).map((r: any) =>
          (typeof r === 'string' ? r : (r?.name ?? r?.role ?? r?.authority ?? ''))
            .replace(/^ROLE_/, '')
            .toUpperCase()
        );
        localStorage.setItem(this.ROLES_KEY, JSON.stringify(roles));

        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      } catch {
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
    localStorage.removeItem(this.ROLES_KEY);
    this.clearMustChangeFlag();
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

getRoles(): string[] {
  const raw = localStorage.getItem(this.ROLES_KEY);
  if (!raw) return [];
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { return []; }

  const arr = Array.isArray(parsed) ? parsed : [parsed];
  return arr
    .map((r: any) => typeof r === 'string' ? r : (r?.name ?? r?.role ?? r?.authority ?? ''))
    .filter(Boolean)
    .map((r: string) => r.replace(/^ROLE_/, '').toUpperCase());
}


  hasAnyRole(...required: string[]): boolean {
    const roles = this.getRoles();
    return required.some(r => roles.includes(r));
  }

  hasAnyRoleFromArray(wanted: string[]): boolean {
    return this.hasAnyRole(...wanted);
  }

  private handleAuthentication(response: AuthResponse): void {
    const { token, user, company, mustChangePassword } = response;

    const rolesFromUser = Array.isArray((user as any)?.roles) ? (user as any).roles : [];
    const roles = rolesFromUser.length ? rolesFromUser : this.decodeJwtRoles(token);

    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    localStorage.setItem(this.ROLES_KEY, JSON.stringify(roles));

    if (company) {
      localStorage.setItem(this.COMPANY_KEY, JSON.stringify(company));
    }

    if (mustChangePassword) {
      this.router.navigate(['/auth/change-password']);
    }

    this.setMustChangePassword(!!mustChangePassword);

    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

    private decodeJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      // Ajoute le padding manquant (=) si besoin
      const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
      const json = decodeURIComponent(
        atob(padded)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  private decodeJwtRoles(token: string): string[] {
    const payload = this.decodeJwt(token);
    if (!payload) return [];

    // Sources possibles selon l’IdP
    let rawRoles: unknown =
      payload.roles ??
      payload.authorities ??
      payload.realm_access?.roles ??
      payload.resource_access?.account?.roles ??
      payload.scope;

    let roles: string[] = [];
    if (Array.isArray(rawRoles)) {
      roles = rawRoles as string[];
    } else if (typeof rawRoles === 'string') {
      // ex: "read write ROLE_ADMIN"
      roles = rawRoles.split(/\s+/).filter(Boolean);
    }

    // Normalisation : retirer le préfixe ROLE_
    return roles.map(r => r.replace(/^ROLE_/, ''));
  }
  mustChangePassword(): boolean {
    return localStorage.getItem(this.MUST_CHANGE_KEY) === 'true';
  }

  setMustChangePassword(flag: boolean) {
    localStorage.setItem(this.MUST_CHANGE_KEY, String(!!flag));
  }
  
  clearMustChangeFlag() {
    localStorage.removeItem(this.MUST_CHANGE_KEY);
  }

  /** 1) Mot de passe oublié : envoie email avec lien de reset */
forgotPassword(email: string) {
  return this.http.post<void>(
    `${environment.apiUrl}/auth/forgot-password`,
    { email }
  );
}

/** 2) Réinitialisation via le token reçu par mail */
resetPassword(token: string, newPassword: string) {
  return this.http.post<void>(
    `${environment.apiUrl}/auth/reset-password`,
    { token, newPassword }
  );
}

/** 3) Changement après la première connexion (ou depuis profil) */
changePassword(oldPassword: string, newPassword: string) {
  return this.http.post<void>(
    `${environment.apiUrl}/auth/change-password`,
    { oldPassword, newPassword }
  );
}
}
