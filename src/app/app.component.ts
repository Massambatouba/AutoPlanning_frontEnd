import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from './components/header/header.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { filter } from 'rxjs';

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
  isPrintMode = false;

    constructor(private authService: AuthService, private route: ActivatedRoute,private router: Router ) {
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
        /* --- détection printMode ---------------------------------------------- */
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        // on remonte jusqu’à la route enfant la plus profonde
        let r = this.route.firstChild;
        while (r?.firstChild) { r = r.firstChild; }
        this.isPrintMode = r?.snapshot.data['printMode'] === true;
      });
  
  }
  toggleSidenav() {
    this.isSidenavOpen = !this.isSidenavOpen;
  }
}
