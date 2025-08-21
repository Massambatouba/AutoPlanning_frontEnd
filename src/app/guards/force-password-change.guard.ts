// force-password-change.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class ForcePasswordChangeGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    const token = this.auth.getToken();
    if (token && this.auth.mustChangePassword()) {
      return this.router.parseUrl('/auth/change-password');
    }
    return true;
  }
}
