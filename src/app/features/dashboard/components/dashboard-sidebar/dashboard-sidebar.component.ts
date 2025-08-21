import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Bell, Calendar, UserPlus, Building2, BarChart2 } from 'lucide-angular';
import { CompanyRoutingModule } from 'src/app/features/company/company-routing.module';
import { AuthService } from 'src/app/services/auth.service';
import { NotificationService } from 'src/app/services/notification.service';
import { Notification } from 'src/app/shared/models/company.model';

@Component({
  standalone: true,
  selector: 'app-dashboard-sidebar',
  templateUrl: './dashboard-sidebar.component.html',
  styleUrls: ['./dashboard-sidebar.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    CompanyRoutingModule,
    LucideAngularModule
  ]
})
export class DashboardSidebarComponent implements OnInit {

  notifications: Notification[] = [];
  loading = true;
  error   = '';
  public auth = inject(AuthService);


  constructor(private notifSrv: NotificationService) {}

   ngOnInit(): void {
    this.notifSrv.getRecent(10).subscribe({
      next : list  => { this.notifications = list; this.loading = false; },
      error: err   => { this.error = 'Erreur de chargement'; this.loading = false; }
    });
  }
}


