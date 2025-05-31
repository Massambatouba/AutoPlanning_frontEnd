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
    path: ':siteId/templates',
    loadComponent: () => import('./site-shift-template/site-shift-template.component').then(m => m.SiteShiftTemplateComponent)
  },
  {
    path: ':siteId/templates/create',
    loadComponent: () => import('./site-shift-template/site-shift-template-create/site-shift-template-create.component').then(m => m.SiteShiftTemplateCreateComponent)
  },
  {
    path: ':siteId/templates/:templateId',
    loadComponent: () => import('./site-shift-template/site-shift-template-edit/site-shift-template-edit.component').then(m => m.SiteShiftTemplateEditComponent)
  }
];

@NgModule({
  imports: [RouterModule.forChild(SITES_ROUTES)],
  exports: [RouterModule]
})
export class SiteRoutingModule {}
