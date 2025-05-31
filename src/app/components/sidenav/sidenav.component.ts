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
    { label: 'Tableau de bord', route: '/dashboard', icon: 'layout-dashboard' },
    { label: 'Sites',          route: '/sites',     icon: 'map-pin'         },
    { label: 'Agents',         route: '/employees', icon: 'users'           },
    { label: 'Plannings',      route: '/schedules',  icon: 'calendar'        },
    { label: 'Statistiques',   route: '/reports',   icon: 'bar-chart-2'     },
    { label: 'Facturation',    route: '/billing',   icon: 'credit-card'     },
    { label: 'Admin',          route: '/admin',     icon: 'shield-check'    },
    { label: 'Paramètres',     route: '/settings',  icon: 'settings'        },
    { label: 'Admin Panel',     icon: 'ShieldCheck', route: '/admin', roles: ['ADMIN'] }
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
