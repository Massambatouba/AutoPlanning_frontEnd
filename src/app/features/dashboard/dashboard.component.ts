import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ScheduleService }   from 'src/app/services/schedule.service';

import { Schedule }          from 'src/app/shared/models/schedule.model';
import { DashboardSidebarComponent } from './components/dashboard-sidebar/dashboard-sidebar.component';
import { DashboardStatsComponent } from './components/dashboard-stats/dashboard-stats.component';
import { RecentSchedulesComponent } from './components/recent-schedules/recent-schedules.component';
import { DashboardService, DashboardStats } from 'src/app/services/dashboard.service';
import { forkJoin } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    RecentSchedulesComponent,
    DashboardStatsComponent,
    DashboardSidebarComponent,
    DashboardStatsComponent,
    RecentSchedulesComponent
    ]
})
export class DashboardComponent implements OnInit {

loading = false;
public auth = inject(AuthService);
 stats: DashboardStats = {
    employeesCount : 0,
    sitesCount     : 0,
    schedulesCount : 0,
    completionRate : 0
  };
  recentSchedules: Schedule[] = [];

  constructor(private dashSrv: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loading = true;

    forkJoin({
      stats  : this.dashSrv.getStats(),
      recent : this.dashSrv.getRecent(5)
    }).subscribe({
      next: ({ stats, recent }) => {
        this.stats           = stats;
        this.recentSchedules = recent;
        this.loading         = false;
      },
      error: err => {
        console.error('[Dashboard] loading error', err);
        this.loading = false;
      }
    });
  }

 
}
