import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from './components/header/header.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule,
    HeaderComponent,
    //FooterComponent,
    SidenavComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  isAuthenticated = false;
  isSidenavOpen = true;
  companyName = '';

    constructor(private authService: AuthService) {
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
      if (isAuth) {
        // récupère Company puis prend .name
        const c = this.authService.getCurrentUserCompany();
        this.companyName = c ? c.name : 'Auto Planning';
      } else {
        this.companyName = '';
      }
    });
  }
  toggleSidenav() {
    this.isSidenavOpen = !this.isSidenavOpen;
  }
}
