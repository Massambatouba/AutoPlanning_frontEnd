
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


export const SCHEDULES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./schedule-list/schedule-list.component').then(m => m.ScheduleListComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./schedule-create/schedule-create.component').then(m => m.ScheduleCreateComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./schedule-detail/schedule-detail.component').then(m => m.ScheduleDetailComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./schedule-edit/schedule-edit.component').then(m => m.ScheduleEditComponent)
  }
];

@NgModule({
  imports: [RouterModule.forChild(SCHEDULES_ROUTES)],
  exports: [RouterModule]
})
export class ScheduleRoutingModule {}
