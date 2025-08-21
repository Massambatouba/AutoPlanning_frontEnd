import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { CompanyService } from 'src/app/services/company.service';
import { Company } from 'src/app/shared/models/company.model';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CompanyRoutingModule } from '../company-routing.module';
import { forkJoin } from 'rxjs';
import { DashboardService } from 'src/app/services/dashboard.service';
import { Schedule } from 'src/app/shared/models/schedule.model';

@Component({
  standalone: true,
  selector: 'app-company-dashboard',
  templateUrl: './company-dashboard.component.html',
  styleUrls: ['./company-dashboard.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    CompanyRoutingModule
  ]
})
export class CompanyDashboardComponent implements OnInit {

  company: Company | null = null;
  stats: any = null;
  error = '';
  @Input() loading: boolean = false;

  recentSchedules: Schedule[] = [];
  constructor(
    private companyService: CompanyService,
    private authService: AuthService,
    private dashSrv: DashboardService
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (this.company) {
      this.loadCompanyStats();
    }
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
  this.loading = true;

  forkJoin({
    stats  : this.dashSrv.getStats(),
    recent : this.dashSrv.getRecent(5)   
  }).subscribe({
    next : ({ stats, recent }) => {
      this.stats           = stats;
      this.recentSchedules = recent;
      this.loading         = false;
    },
    error: err => { this.error = err.message; this.loading = false; }
  });
}

  private loadCompanyStats() {
    if (!this.company) return;

    this.companyService.getCompanyStats(this.company.id).subscribe({
      next: stats => this.stats = stats,
      error: err => this.error = err.message
    });
  }

  getSubscriptionStatusLabel(status?: string): string {
    const labels: Record<string,string> = {
      ACTIVE: 'Actif',
      INACTIVE: 'Inactif',
      TRIAL: 'Période d\'essai'
    };
    return status ? labels[status] : 'Inconnu';
  }
}
