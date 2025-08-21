import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployeeDetailComponent } from './employee-detail/employee-detail.component';


export const EMPLOYEES_ROUTES: Routes = [
  /* ─ LISTE ─────────────────────────────────────── */
  {
    path: '',
    loadComponent: () =>
      import('./employee-list/employee-list.component')
        .then(m => m.EmployeeListComponent)
  },

  /* ─ CRÉATION ──────────────────────────────────── */
  {
    path: 'create',
    loadComponent: () =>
      import('./employee-create/employee-create.component')
        .then(m => m.EmployeeCreateComponent)
  },

  /* ─ MODE IMPRESSION ───────────────────────────── */
  {
    path: 'print/:id',
    loadComponent: () =>
      import('./employee-detail/employee-detail.component')
        .then(m => m.EmployeeDetailComponent),
    data: { printMode: true }
  },

  /* ─ SOUS-PAGES SPÉCIFIQUES ────────────────────── */
  {
    path: ':id/absences',
    loadComponent: () =>
      import('./employee-absences/employee-absences.component')
        .then(m => m.EmployeeAbsencesComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./employee-edit/employee-edit.component')
        .then(m => m.EmployeeEditComponent)
  },

  /* ─ FICHE EMPLOYÉ (garde-le **en dernier**) ───── */
  {
    path: ':id',
    loadComponent: () =>
      import('./employee-detail/employee-detail.component')
        .then(m => m.EmployeeDetailComponent)
  }
];

@NgModule({
  imports: [RouterModule.forChild(EMPLOYEES_ROUTES)],
  exports: [RouterModule]
})
export class EmployeeRoutingModule {}
