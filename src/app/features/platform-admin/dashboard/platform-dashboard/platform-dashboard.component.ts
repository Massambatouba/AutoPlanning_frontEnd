import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyOverview, PlatformStats, RevenueData } from 'src/app/shared/models/platform-admin.model';
import { PlatformAdminService } from 'src/app/services/platform-admin.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-platform-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './platform-dashboard.component.html',
  styleUrls: ['./platform-dashboard.component.scss']
})
export class PlatformDashboardComponent implements OnInit {

  stats: PlatformStats | null = null;
  recentCompanies: CompanyOverview[] = [];
  revenueData: RevenueData[] = [];
  maxRevenue = 0;
  loading = true;
  loadingRevenue = false;
  selectedMonths = 6;

  constructor(private platformAdminService: PlatformAdminService, private router: Router) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  changeMonths(m: number) {
    if (this.selectedMonths === m) return;
    this.selectedMonths = m;
    this.loadRevenue(m);
  }

  private loadDashboardData() {
    // Charger les statistiques
    this.platformAdminService.getPlatformStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des stats:', error);
      }
    });

    // Charger les entreprises récentes
    this.platformAdminService.getCompanies(0, 5).subscribe({
      next: (response) => {
        this.recentCompanies = response.content.slice(0, 4);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des entreprises:', error);
      }
    });

    this.loadRevenue(this.selectedMonths);

    // Charger les données de revenus
    this.platformAdminService.getRevenueData().subscribe({
      next: (data) => {
        this.revenueData = data.reverse(); // Plus récent à droite
        this.maxRevenue = Math.max(...data.map(d => d.revenue));
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des revenus:', error);
        this.loading = false;
      }
    });
  }

  private loadRevenue(months: number) {
    this.loadingRevenue = true;
    this.platformAdminService.getRevenueData(months).subscribe({
      next: (data) => {
        // recent à droite
        this.revenueData = (data ?? []).slice().reverse();
        // garde : évite -Infinity quand le tableau est vide
        this.maxRevenue = Math.max(0, ...this.revenueData.map(d => d.revenue || 0));
        this.loadingRevenue = false;
        this.loading = false; // si tu affiches un spinner global au 1er chargement
      },
      error: (err) => {
        console.error('Erreur revenus:', err);
        this.revenueData = [];
        this.maxRevenue = 0;
        this.loadingRevenue = false;
        this.loading = false;
      }
    });
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'ACTIVE': 'Actif',
      'TRIAL': 'Essai',
      'EXPIRED': 'Expiré',
      'INACTIVE': 'Inactif'
    };
    return labels[status] || status;
  }

createCompany(): void {
  this.router.navigate(['/platform-admin/companies/create']);
}

}
