import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CompanyRoutingModule } from 'src/app/features/company/company-routing.module';
import { DashboardService } from 'src/app/services/dashboard.service';
import { DashboardStats } from 'src/app/shared/models/schedule.model';


@Component({
  standalone: true,
  selector: 'app-dashboard-stats',
  templateUrl: './dashboard-stats.component.html',
  styleUrls: ['./dashboard-stats.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    CompanyRoutingModule
  ]
})
export class DashboardStatsComponent implements OnInit {
  @Input() stats!: DashboardStats;
  loading = true;
  error   = '';


  constructor(private dashSrv: DashboardService){}
  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loading = true;

    this.dashSrv.getStats().subscribe({
      next : s   => { this.stats = s; this.loading = false; },
      error: err => { this.error = err.message; this.loading = false; }
    });
  }
  
   
}
