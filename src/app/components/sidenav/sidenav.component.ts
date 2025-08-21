import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Bell, LogOut, LucideAngularModule, Menu, User } from 'lucide-angular';
import { AuthService } from 'src/app/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
}

@Component({
selector: 'app-sidenav',
  standalone: true,
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
    imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    LucideAngularModule
  ]
})
export class SidenavComponent {
   @Input() isOpen = true;

navItems: NavItem[] = [
  { label: 'Dashboard',        icon: 'layout-dashboard', route: '/dashboard' },
  { label: 'Schedules',        icon: 'calendar-days',    route: '/schedules' },
  { label: 'Employees',        icon: 'users',            route: '/employees' },
  { label: 'Sites',            icon: 'building-2',       route: '/sites' },
  { label: 'Reports',          icon: 'bar-chart-2',      route: '/reports' },
  { label: 'Subscription',     icon: 'credit-card',      route: '/subscription' },
  { label: 'Settings',         icon: 'settings',         route: '/settings' },
  { label: 'Admin Panel',      icon: 'shield',           route: '/admin', roles: ['ADMIN'] },
  { label: 'Gestion des Heures', icon: 'clock',          route: '/admin/hour-requirements', roles: ['ADMIN'] },
];

  constructor(private authService: AuthService, private router: Router) {
    this.navItems = this.navItems.filter(item => {
      if (!item.roles) return true;
      return item.roles.some(role => this.authService.hasRole(role));
    });
  }

  isActive(route: string): boolean {
    return window.location.pathname.startsWith(route);
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
  }
}
