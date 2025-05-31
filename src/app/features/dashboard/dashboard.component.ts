import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ScheduleService }   from 'src/app/services/schedule.service';

import { Schedule }          from 'src/app/shared/models/schedule.model';
import { CompanyRoutingModule } from '../company/company-routing.model';
import { DashboardSidebarComponent } from './components/dashboard-sidebar/dashboard-sidebar.component';
import { DashboardStatsComponent } from './components/dashboard-stats/dashboard-stats.component';
import { RecentSchedulesComponent } from './components/recent-schedules/recent-schedules.component';

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
    DashboardSidebarComponent,
    DashboardStatsComponent,
    RecentSchedulesComponent
    ]
})
export class DashboardComponent implements OnInit {

  loading = true;
  stats = {
    schedulesCount: 0,
    employeesCount: 0,
    sitesCount: 0,
    completionRate: 0
  };
  recentSchedules: Schedule[] = [];

  constructor(private scheduleService: ScheduleService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    // Simulation de chargement des données
    setTimeout(() => {
      this.stats = {
        schedulesCount: 5,
        employeesCount: 28,
        sitesCount: 3,
        completionRate: 87
      };

      this.recentSchedules = [
      {
        id: 1,
        companyId: 1,
        siteId: 1,
        name: 'Planning Site Principal',
        month: 4,
        year: 2025,
        startDate: '2025-04-01',
        endDate:   '2025-04-30',
        status: 'COMPLETED',
        isPublished: true,
        isSent: true,
        sentAt: new Date('2025-03-25'),
        completionRate: 100,
        createdAt: new Date('2025-03-20'),
        updatedAt: new Date('2025-03-25')
      },
        {
          id: 2,
          companyId: 1,
          siteId: 2,
          name: 'Agence Centre-Ville',
          month: 4,
          year: 2025,
          startDate: '2025-04-01',
          endDate:   '2025-04-30',
          status: 'COMPLETED',
          isPublished: true,
          isSent: false,
          completionRate: 87,
          createdAt: new Date('2025-03-22'),
          updatedAt: new Date('2025-03-24')
        },
        {
          id: 3,
          companyId: 1,
          siteId: 3,
          name: 'Bureau Aéroport',
          startDate: '2025-04-01',
          endDate:   '2025-04-30',
          status: 'COMPLETED',
          month: 4,
          year: 2025,
          isPublished: false,
          isSent: false,
          completionRate: 62,
          createdAt: new Date('2025-03-23'),
          updatedAt: new Date('2025-03-23')
        }
      ];

      this.loading = false;
    }, 1000);
  }
}
