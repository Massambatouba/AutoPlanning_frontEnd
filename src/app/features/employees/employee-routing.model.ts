import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


export const EMPLOYEES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./employee-list/employee-list.component').then(m => m.EmployeeListComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./employee-create/employee-create.component').then(m => m.EmployeeCreateComponent)
  },
   {
    path: 'employees',
    loadComponent: () => import('./employee-list/employee-list.component').then(m => m.EmployeeListComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./employee-detail/employee-detail.component').then(m => m.EmployeeDetailComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./employee-edit/employee-edit.component').then(m => m.EmployeeEditComponent)
  }
];
@NgModule({
  imports: [RouterModule.forChild(EMPLOYEES_ROUTES)],
  exports: [RouterModule]
})
export class EmployeeRoutingModule {}
