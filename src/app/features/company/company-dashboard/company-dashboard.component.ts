import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { CompanyService } from 'src/app/services/company.service';
import { Company } from 'src/app/shared/models/company.model';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CompanyRoutingModule } from '../company-routing.module';

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
export class CompanyDashboardComponent {

  company: Company | null = null;
  stats: any = null;
  error = '';

  constructor(
    private companyService: CompanyService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (this.company) {
      this.loadCompanyStats();
    }
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
