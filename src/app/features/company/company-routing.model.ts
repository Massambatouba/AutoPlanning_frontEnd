import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


export const COMPANY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./company-dashboard/company-dashboard.component').then(m => m.CompanyDashboardComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./company-profile/company-profile.component').then(m => m.CompanyProfileComponent)
  }
];
@NgModule({
  imports: [RouterModule.forChild(COMPANY_ROUTES)],
  exports: [RouterModule]
})
export class CompanyRoutingModule {}