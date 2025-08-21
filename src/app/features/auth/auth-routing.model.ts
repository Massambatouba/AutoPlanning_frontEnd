import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent)
  },
    {
    path: 'public-print/:id',
    loadComponent: () =>
      import('../employees/employee-detail/employee-detail.component')
        .then(m => m.EmployeeDetailComponent),
    data: { printMode: true }         
  },

  {
  path: 'change-password',
  loadComponent: () => import('./change-password/change-password.component')
    .then(m => m.ChangePasswordComponent)
},
{
  path: 'forgot-password',
  loadComponent: () => import('./forgot-password/forgot-password.component')
    .then(m => m.ForgotPasswordComponent)
},
{
  path: 'reset-password',
  loadComponent: () => import('./reset-password/reset-password.component')
    .then(m => m.ResetPasswordComponent)
},
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(AUTH_ROUTES
    
  )],
  exports: [RouterModule]
})
export class AuthRoutingModule {}