import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Bell, LogOut, LucideAngularModule, Menu, User } from 'lucide-angular';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './pages/login/login.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { CompanyDashboardComponent } from './features/company/company-dashboard.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    DashboardComponent,
    DashboardComponent,
    LoginComponent,
    LoginComponent,
    SidenavComponent,
    CompanyDashboardComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    RouterModule,
    LucideAngularModule.pick({ Menu, Bell, User, LogOut }),
    AppRoutingModule
  ],
  providers: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
