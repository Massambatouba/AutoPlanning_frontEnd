// src/app/app.routes.ts  (nouveau fichier)

import { Routes } from '@angular/router';
import { authGuard }  from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const APP_ROUTES: Routes = [
    {
      path: '',
      redirectTo: 'dashboard',
      pathMatch: 'full'
    },

    { path: 'login',
      loadComponent: () =>
        import('./features/auth/login/login.component')
          .then(m => m.LoginComponent)
    },

    {
      path: 'platform-admin',
      loadChildren: () =>
        import('./features/platform-admin/platform-admin.routes')
          .then(m => m.PLATFORM_ADMIN_ROUTES),
      canActivate: [authGuard],
    },

    {
      path: 'admin',
      loadChildren: () =>
        import('./features/admin/admin-routing.model')
          .then(m => m.ADMIN_ROUTES),
      canActivate: [
        authGuard,
        roleGuard(['SUPER_ADMIN', 'ADMIN'])]
    },

    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

    { path: 'auth',
      loadChildren: () =>
        import('./features/auth/auth-routing.model')
          .then(m => m.AUTH_ROUTES)
    },

    { path: 'dashboard',
      loadComponent: () =>
        import('./features/dashboard/dashboard.component')
          .then(m => m.DashboardComponent),
      canActivate: [authGuard]
    },

    { path: 'company',
      loadChildren: () =>
        import('./features/company/company-routing.module')
          .then(m => m.COMPANY_ROUTES),
      canActivate: [authGuard]
    },

    { path: 'schedules',
      loadChildren: () =>
        import('./features/schedules/schedule-routing.model')
          .then(m => m.SCHEDULES_ROUTES),
      canActivate: [authGuard]
    },

    { path: 'employees',
      loadChildren: () =>
        import('./features/employees/employee-routing.model')
          .then(m => m.EMPLOYEES_ROUTES),
      canActivate: [authGuard]
    },

    { path: 'sites',
      loadChildren: () =>
        import('./features/sites/site-routing.model')
          .then(m => m.SITES_ROUTES),
      canActivate: [authGuard]
    },

    /* abonnement éventuellement */
     {
       path: 'subscription',
       loadChildren: () =>
         import('./features/subscription/subscription-routing.model')
           .then(m => m.SUBSCRIPTION_ROUTES),
       canActivate: [authGuard]
     },

      {                     // ⬅ NOUVELLE ENTRÉE
        path: 'public-print/:id',
        loadComponent: () => import('./features/employees/employee-detail/employee-detail.component')
                              .then(m => m.EmployeeDetailComponent),
        data: { printMode: true }   // pas de guard
      },

    /* 404 stand-alone */
     {
       path: '**',
       loadComponent: () =>
         import('./components/not-found/not-found.component')
           .then(m => m.NotFoundComponent)
     }
  ];
