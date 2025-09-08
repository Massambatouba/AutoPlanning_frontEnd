import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyOverview, RevenueData, SubscriptionPlan } from 'src/app/shared/models/platform-admin.model';
import { PlatformAdminService } from 'src/app/services/platform-admin.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-platform-analytics',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './platform-analytics.component.html',
  styleUrls: ['./platform-analytics.component.scss']
})
export class PlatformAnalyticsComponent implements OnInit {

  revenueData: RevenueData[] = [];
  subscriptionPlans: SubscriptionPlan[] = [];
  companies: CompanyOverview[] = [];
  totalCompanies = 0;

    errorMsg = ''; 

  loading = true;
  selectedMonths = 6;

  // pour les barres du petit graphe
  maxRevenue = 1;
  maxNewCompanies = 1;
  readonly chartMaxHeightPx = 200;

  constructor(private api: PlatformAdminService) {}

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.loadAnalyticsData(this.selectedMonths),
      this.loadPlansAndCompanies()
    ]);
  }

  changePeriod(months: number): void {
    if (months === this.selectedMonths) return;
    this.selectedMonths = months;
    this.loadAnalyticsData(months);
  }

  private loadAnalyticsData(months: number): Promise<void> {
    this.loading = true;
    return new Promise((resolve) => {
      this.api.getRevenueData(months).subscribe({
        next: (data) => {
          this.revenueData = [...data].reverse();
          const maxRev = Math.max(0, ...this.revenueData.map(d => d.revenue ?? 0));
          const maxNew = Math.max(0, ...this.revenueData.map((d: any) => d.newCompanies ?? 0));
          this.maxRevenue = Math.max(1, maxRev);
          this.maxNewCompanies = Math.max(1, maxNew);
          this.loading = false;
          resolve();
        },
        error: () => { this.revenueData = []; this.loading = false; resolve(); }
      });
    });
  }

  private async loadPlansAndCompanies(): Promise<void> {
    // Plans
    this.api.getSubscriptionPlans().subscribe(plans => this.subscriptionPlans = plans);

    // Entreprises – récupère toutes les pages
    const all: CompanyOverview[] = [];
    const pageSize = 50;
    const first = await this.api.getCompanies(0, pageSize).toPromise();
    all.push(...(first?.content ?? []));
    const total = first?.totalElements ?? all.length;
    const totalPages = Math.ceil(total / pageSize);
    const rest = await Promise.all(
      Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) =>
        this.api.getCompanies(i + 1, pageSize).toPromise()
      )
    );
    rest.forEach(r => all.push(...(r?.content ?? [])));
    this.companies = all;
    this.totalCompanies = all.length;
  }

  // ---------- helpers répartition ----------
  private norm(s?: string): string { return (s ?? '').trim().toUpperCase(); }

  countByPlanName(planName: string): number {
    const p = this.norm(planName);
    return this.companies.filter(c => this.norm(c.subscriptionPlan as any) === p).length;
  }

  percentByPlanName(planName: string): number {
    const n = this.countByPlanName(planName);
    return this.totalCompanies ? Math.round((n / this.totalCompanies) * 100) : 0;
  }

  // petit util pour colorer chaque barre différemment
  barClass(i: number): string {
    const classes = ['bg-info', 'bg-primary', 'bg-dark', 'bg-success', 'bg-warning'];
    return classes[i % classes.length];
  }

  // graphe barres (revenus / nouvelles entreprises)
  barHeight(value: number | undefined, max: number = this.maxRevenue): number {
    const v = Math.max(0, value ?? 0);
    return (v / Math.max(1, max)) * this.chartMaxHeightPx;
  }

  trackByMonth = (_: number, d: RevenueData) => d.month;
}
