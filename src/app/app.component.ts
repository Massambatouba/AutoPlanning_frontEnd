import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  isAuthenticated = false;
  isSidenavOpen = true;
  companyName = '';

    constructor(private authService: AuthService) {
    this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      this.isAuthenticated = isAuthenticated;
      if (isAuthenticated) {
        this.companyName = this.authService.getCurrentUserCompany() || 'Auto Planning';
      }
    });
  }
  toggleSidenav() {
    this.isSidenavOpen = !this.isSidenavOpen;
  }
}
