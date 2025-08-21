// src/app/guards/admin.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    const required: string[] = route.data['roles'] ?? [];
    const userRoles: string[] = this.auth.getRoles() ?? [];

    // DEBUG (temporaire)
    console.log('[RoleGuard] url=', state.url, 'required=', required, 'userRoles=', userRoles);

    if (!required.length) return true;

    const ok = required.some(r => userRoles.includes(r));
    if (ok) return true;

    // Si pas autorisé, redirige proprement (pas vers 404)
    return this.router.parseUrl('/dashboard');
  }
}
