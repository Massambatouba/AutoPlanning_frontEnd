import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RevenueData } from 'src/app/shared/models/platform-admin.model';
import { PlatformAdminService } from 'src/app/services/platform-admin.service';

@Component({
  selector: 'app-platform-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './platform-analytics.component.html',
  styleUrls: ['./platform-analytics.component.scss']
})
export class PlatformAnalyticsComponent implements OnInit {

  revenueData: RevenueData[] = [];
  loading = true;
  selectedMonths = 6;

  /** pour éviter division par 0 */
  maxRevenue = 1;
  maxNewCompanies = 1;
  readonly chartMaxHeightPx = 200;

  constructor(private platformAdminService: PlatformAdminService) {}

  ngOnInit(): void {
    this.loadAnalyticsData(this.selectedMonths);
  }

  changePeriod(months: number): void {
    if (months === this.selectedMonths) return;
    this.selectedMonths = months;
    this.loadAnalyticsData(months);
  }

  private loadAnalyticsData(months: number): void {
    this.loading = true;
    this.platformAdminService.getRevenueData(months).subscribe({
      next: (data) => {
        // ordre chronologique gauche → droite
        this.revenueData = [...data].reverse();

        const maxRev = Math.max(0, ...this.revenueData.map(d => d.revenue ?? 0));
        this.maxRevenue = Math.max(1, maxRev);

        // si newCompanies peut être absent, on le traite à 0
        const maxNew = Math.max(0, ...this.revenueData.map((d: any) => d.newCompanies ?? 0));
        this.maxNewCompanies = Math.max(1, maxNew);

        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement revenus:', err);
        this.revenueData = [];
        this.maxRevenue = 1;
        this.maxNewCompanies = 1;
        this.loading = false;
      }
    });
  }

  /** 2ᵉ paramètre optionnel (par défaut = maxRevenue) */
  barHeight(value: number | undefined, max: number = this.maxRevenue): number {
    const v = Math.max(0, value ?? 0);
    return (v / Math.max(1, max)) * this.chartMaxHeightPx;
  }

  trackByMonth = (_: number, d: RevenueData) => d.month;

  exportReport(): void {
    console.log('TODO: exporter en CSV/PDF');
  }
}
