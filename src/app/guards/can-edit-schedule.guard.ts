import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, UrlTree, CanActivateFn } from '@angular/router';
import { ScheduleService } from '../services/schedule.service';
import { AuthService } from '../services/auth.service';
import { map, catchError, of } from 'rxjs';

export const canEditScheduleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const scheduleSrv = inject(ScheduleService);
  const auth = inject(AuthService);
  const router = inject(Router);

  const id = Number(route.paramMap.get('id'));
  const companyId = auth.getCurrentUserCompany()?.id!;
  return scheduleSrv.get(companyId, id).pipe(
    map(s => s.canEdit ? true : router.parseUrl(`/schedules/${id}`)),
    catchError(() => of(router.parseUrl(`/schedules/${id}`)))
  );
};
