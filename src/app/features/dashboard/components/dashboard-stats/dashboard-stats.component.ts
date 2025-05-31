import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CompanyRoutingModule } from 'src/app/features/company/company-routing.model';


interface DashboardStats {
  schedulesCount: number;
  employeesCount: number;
  sitesCount: number;
  completionRate: number;
}

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
export class DashboardStatsComponent {
   @Input() stats!: DashboardStats;
}
