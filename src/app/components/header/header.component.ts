import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Input() companyName = 'Auto Planning';
  @Output() toggleSidenav = new EventEmitter<void>();

  isUserMenuOpen = false;
  notificationCount = 2;
  userName = '';
  userInitials = '';

  constructor(private authService: AuthService) {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userName = user.firstName;
      this.userInitials = user.firstName.charAt(0) + (user.lastName?.charAt(0) || '');
    }
  }

  onToggleSidenav() {
    this.toggleSidenav.emit();
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  logout() {
    this.authService.logout();
  }
}
