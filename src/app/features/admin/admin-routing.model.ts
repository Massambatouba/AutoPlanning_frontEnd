import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from 'src/app/guards/admin.guard';



export const ADMIN_ROUTES: Routes = [
{
path: '',
loadComponent: () => import('./admin/admin.component').then(m => m.AdminComponent)
},
{
path: 'hour-requirements',
loadComponent: () => import('./hour-requirements/hour-requirements.component').then(m => m.HourRequirementsComponent)
},
{
  path: 'admins/create',
  loadComponent: () => import('./admin-site-create/admin-site-create.component')
    .then(m => m.AdminSiteCreateComponent),
  canActivate: [RoleGuard], data: { roles: ['SUPER_ADMIN','ADMIN'] }
},
{
    path: 'admins/:id',
    loadComponent: () => import('./admin-detail/admin-detail.component').then(m => m.AdminDetailComponent),
    canActivate: [RoleGuard],
    data: { roles: ['SUPER_ADMIN', 'ADMIN'] }
  },
  {
    path: 'admins/:id/edit',
    loadComponent: () => import('./admin-edit/admin-edit.component').then(m => m.AdminEditComponent),
    canActivate: [RoleGuard],
    data: { roles: ['SUPER_ADMIN', 'ADMIN'] }
  },
  {
  path: 'admins',
    loadComponent: () => import('./admin-list/admin-list.component')
      .then(m => m.AdminListComponent),
    canActivate: [RoleGuard],
    data: { roles: ['SUPER_ADMIN','ADMIN'] }
  }

];
@NgModule({
  imports: [RouterModule.forChild(ADMIN_ROUTES)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
