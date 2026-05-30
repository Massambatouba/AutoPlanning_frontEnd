import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
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
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, LucideAngularModule]
})
export class SidenavComponent {
  /** ouvert = plein / fermé = réduit (reste visible) */
  @Input() isOpen = true;

  navItems: NavItem[] = [
    { label: 'Tableau de bord', icon: 'layout-dashboard', route: '/dashboard' },
    { label: 'Plannings',       icon: 'calendar-days',    route: '/schedules' },
    { label: 'Employés',        icon: 'users',            route: '/employees' },
    { label: 'Sites',           icon: 'building-2',       route: '/sites' },
    { label: 'Rapports',        icon: 'bar-chart-2',      route: '/reports' },
    { label: 'Abonnement',      icon: 'credit-card',      route: '/subscription' },
    { label: 'Administration',  icon: 'shield',           route: '/admin', roles: ['ADMIN'] },
    { label: 'Gestion des heures', icon: 'clock',         route: '/admin/hour-requirements', roles: ['ADMIN'] },
  ];

  constructor(private auth: AuthService, private router: Router) {
    // Filtrage par rôles si nécessaire
    this.navItems = this.navItems.filter(item => !item.roles || item.roles.some(r => this.auth.hasRole(r)));
  }

  toggle(): void { this.isOpen = !this.isOpen; }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

  trackByRoute(_: number, item: NavItem) { return item.route; }
}
