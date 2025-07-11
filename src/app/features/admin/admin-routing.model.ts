import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';



export const ADMIN_ROUTES: Routes = [
{
path: '',
loadComponent: () => import('./admin/admin.component').then(m => m.AdminComponent)
},
{
path: 'hour-requirements',
loadComponent: () => import('./hour-requirements/hour-requirements.component').then(m => m.HourRequirementsComponent)
}
];
@NgModule({
  imports: [RouterModule.forChild(ADMIN_ROUTES)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
