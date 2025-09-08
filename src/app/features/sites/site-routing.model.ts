import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

export const SITES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./site-list/site-list.component').then(m => m.SiteListComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./site-create/site-create.component').then(m => m.SiteCreateComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./site-detail/site-detail.component').then(m => m.SiteDetailComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./site-edit/site-edit.component').then(m => m.SiteEditComponent)
  },

{
  path: ':siteId/weekly-rules',
  loadComponent: () =>
    import('./weekly-schedule/weekly-schedule.component')
      .then(m => m.WeeklyScheduleComponent)
},
{
    path: ':siteId/weekly-rules/create',
    loadComponent: () => import('./weekly-schedule/weekly-create/weekly-create.component')
    .then(m => m.WeeklyCreateComponent)
},
{
    path: ':siteId/weekly-rules/:templateId/edit',
    loadComponent: () => import('./weekly-schedule/weekly-edit/weekly-edit.component')
    .then(m => m.WeeklyEditComponent)
},
{
    path: ':siteId/exceptions',
    loadComponent: () =>
      import('./weekly-exceptions/weekly-exceptions/weekly-exceptions.component')
        .then(m => m.WeeklyExceptionsComponent)
}
];

@NgModule({
  imports: [RouterModule.forChild(SITES_ROUTES)],
  exports: [RouterModule]
})
export class SiteRoutingModule {}
