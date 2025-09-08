
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from 'src/app/guards/admin.guard';
import { canEditScheduleGuard } from 'src/app/guards/can-edit-schedule.guard';


export const SCHEDULES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./schedule-list/schedule-list.component')
    .then(m => m.ScheduleListComponent),
    canActivate: [RoleGuard],
    data: { roles: ['SUPER_ADMIN','ADMIN','SITE_ADMIN'] }
  },
  {
    path: 'generate',
    loadComponent: () => import('./schedule-geration-modal/schedule-geration-modal.component')
    .then(m => m.ScheduleGerationModalComponent),
    canActivate: [RoleGuard, canEditScheduleGuard], 
    data: { roles: ['SUPER_ADMIN','ADMIN','SITE_ADMIN'] }
  },
  {
    path: 'create',
    loadComponent: () => import('./schedule-create/schedule-create.component')
    .then(m => m.ScheduleCreateComponent),
    canActivate: [RoleGuard],
    data: { roles: ['SUPER_ADMIN','ADMIN','SITE_ADMIN'] }
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./schedule-edit/schedule-edit.component')
    .then(m => m.ScheduleEditComponent),
    canActivate: [RoleGuard, canEditScheduleGuard], 
    data: { roles: ['SUPER_ADMIN','ADMIN','SITE_ADMIN'] }
  },
  {
    path: ':id',
    loadComponent: () => import('./schedule-detail/schedule-detail.component').then(m => m.ScheduleDetailComponent)
  },

];

@NgModule({
  imports: [RouterModule.forChild(SCHEDULES_ROUTES)],
  exports: [RouterModule]
})
export class ScheduleRoutingModule {}
