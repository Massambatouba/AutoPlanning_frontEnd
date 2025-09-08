// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations }      from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter }          from '@angular/router';
import { importProvidersFrom, APP_INITIALIZER } from '@angular/core';

import { AppComponent }           from './app/app.component';
import { APP_ROUTES }             from './app/app.routes';

import { AuthService }            from './app/services/auth.service';
import { authInterceptor }        from './app/interceptors/auth.interceptor';
import { errorInterceptor }       from './app/interceptors/error.interceptor';

import {
  LucideAngularModule,
  Menu, Bell, User, LogOut,
  Calendar,
  Shield, ShieldCheck,
  LayoutDashboard,
  MapPin,
  Users,
  Settings,
  CreditCard,
  BarChart2,
  CalendarDays,
  Building2,
  Clock,
  UserPlus
} from 'lucide-angular';
import { ToastrModule } from 'ngx-toastr';

function initAuth(auth: AuthService) {
  return () => auth.initializeAuth();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(APP_ROUTES),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideAnimations(),

    importProvidersFrom(
      ToastrModule.forRoot({
        positionClass: 'toast-bottom-right',
        timeOut      : 4000,
        closeButton  : true,
      }),
      LucideAngularModule.pick({
        Menu,
        Bell,
        User,
        LogOut,
        Calendar,
         UserPlus,
        CalendarDays,
        Shield,
        ShieldCheck,

        LayoutDashboard,  // deviens "layout-dashboard"
        MapPin,            // deviens "map-pin"
        Users,             // deviens "users"
        Settings,          // "settings"
        CreditCard,        // "credit-card"
        BarChart2,          // "bar-chart-2"
        Building2,
        Clock
      })
    ),
    {
      provide: APP_INITIALIZER,
      useFactory: initAuth,
      deps: [AuthService],
      multi: true
    }
  ]
}).catch(console.error);
