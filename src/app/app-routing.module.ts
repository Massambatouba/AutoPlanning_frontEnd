import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CompanyDashboardComponent } from './features/company/company-dashboard.component';

const routes: Routes = [
  { path: 'login',      component: LoginComponent },
  { path: 'dashboard',  component: DashboardComponent /*, canActivate:[authGuard]*/ },
  { path: 'company',    component: CompanyDashboardComponent /*, canActivate:[authGuard]*/ },
  // … vos autres routes similaires :
  // { path: 'schedules', component: SchedulesComponent },
  // { path: 'employees', component: EmployeesComponent },
  // { path: 'sites',     component: SitesComponent },
  // { path: 'admin',     component: AdminComponent /*, canActivate:[authGuard,adminGuard]*/ },
  // { path: 'subscription', component: SubscriptionComponent },
  { path: '',           redirectTo: 'login', pathMatch: 'full' },
  //{ path: '**',         component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
