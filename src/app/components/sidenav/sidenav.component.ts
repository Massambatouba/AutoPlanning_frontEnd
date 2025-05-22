import { Component, Input } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
}

@Component({
selector: 'app-sidenav',
  
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent {
   @Input() isOpen = true;

  navItems: NavItem[] = [
    { label: 'Dashboard',       icon: 'Dashboard', route: '/dashboard' },
    { label: 'Schedules',       icon: 'Calendar',  route: '/schedules' },
    { label: 'Employees',       icon: 'Users',     route: '/employees' },
    { label: 'Sites',           icon: 'MapPin',    route: '/sites' },
    { label: 'Reports',         icon: 'BarChart2', route: '/reports' },
    { label: 'Subscription',    icon: 'CreditCard',route: '/subscription' },
    { label: 'Settings',        icon: 'Settings',  route: '/settings' },
    { label: 'Admin Panel',     icon: 'ShieldCheck', route: '/admin', roles: ['ADMIN'] }
  ];

  constructor(private authService: AuthService) {
    this.navItems = this.navItems.filter(item => {
      if (!item.roles) return true;
      return item.roles.some(role => this.authService.hasRole(role));
    });
  }

  isActive(route: string): boolean {
    return window.location.pathname.startsWith(route);
  }
}
