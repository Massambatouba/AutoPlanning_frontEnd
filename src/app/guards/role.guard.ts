import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export function roleGuard(required: string[]): CanActivateFn {
  return () => {
    const auth   = inject(AuthService);
    const router = inject(Router);

    const token = auth.getToken();
    const roles = auth.getRoles();

    if (!token) return router.parseUrl('/login');

    const ok = required.length === 0 || roles.some(r => required.includes(r));
    return ok ? true : router.parseUrl('/forbidden');
  };
}
