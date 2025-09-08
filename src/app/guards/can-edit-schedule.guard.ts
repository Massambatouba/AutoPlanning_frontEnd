import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, UrlTree, CanActivateFn } from '@angular/router';
import { ScheduleService } from '../services/schedule.service';
import { AuthService } from '../services/auth.service';
import { map, catchError, of } from 'rxjs';

export const canEditScheduleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const schedules = inject(ScheduleService);
  const auth = inject(AuthService);
  const router = inject(Router);

  const id = Number(route.paramMap.get('id'));

  // (optionnel mais pratique) : si rôle admin → on laisse passer direct
  if (auth.hasAnyRole('SUPER_ADMIN','ADMIN','SITE_ADMIN','COMPANY_ADMIN')) {
    return true;
  }

  // ✅ IMPORTANT : on utilise le bon endpoint /schedules/{id}
  return schedules.getScheduleById(id).pipe(
    map(s => (s.permissions?.edit || s.canEdit) ? true : router.createUrlTree(['/schedules', id])),
    catchError(() => of(router.createUrlTree(['/schedules', id])))
  );
};
