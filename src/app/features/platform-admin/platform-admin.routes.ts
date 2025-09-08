// platform-admin.routes.ts
import { Routes } from '@angular/router';
import { RoleGuard } from 'src/app/guards/admin.guard';

export const PLATFORM_ADMIN_ROUTES: Routes = [
  {
    path: '',
    canActivate: [RoleGuard],
    data: { roles: ['SUPER_ADMIN'] },
    children: [
      { path: '', pathMatch: 'full',
        loadComponent: () =>
          import('./dashboard/platform-dashboard/platform-dashboard.component')
            .then(m => m.PlatformDashboardComponent)
      },
      { path: 'companies',
        loadComponent: () =>
          import('./companies/company-management/company-management.component')
            .then(m => m.CompanyManagementComponent)
      },
      {
        path: 'companies/create',
        loadComponent: () =>
          import('./companies/company-create/company-create.component')
            .then(m => m.CompanyCreateComponent)
      },
      { path: 'companies/:id',
        loadComponent: () =>
          import('./companies/company-detail/company-detail/company-detail.component')
            .then(m => m.CompanyDetailComponent)
      },
      { path: 'subscriptions',
        loadComponent: () =>
          import('./dashboard/subscription-management/subscription-management.component')
            .then(m => m.SubscriptionManagementComponent)
      },
      { path: 'analytics',
        loadComponent: () =>
          import('./analytics/platform-analytics/platform-analytics.component')
            .then(m => m.PlatformAnalyticsComponent)
      },
      { path: 'settings',
        loadComponent: () =>
          import('./settings/platform-settings/platform-settings.component')
            .then(m => m.PlatformSettingsComponent)
      }

    ]
  }
];
