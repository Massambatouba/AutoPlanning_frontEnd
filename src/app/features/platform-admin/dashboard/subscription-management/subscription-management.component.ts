import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyOverview, PlatformStats, SubscriptionPlan } from 'src/app/shared/models/platform-admin.model';
import { PlatformAdminService } from 'src/app/services/platform-admin.service';

@Component({
  selector: 'app-subscription-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subscription-management.component.html',
  styleUrls: ['./subscription-management.component.scss']
})
export class SubscriptionManagementComponent implements OnInit {

  subscriptionPlans: SubscriptionPlan[] = [];
  companies: CompanyOverview[] = [];

  stats?: PlatformStats;
  computedMonthlyRevenue = 0;

  // KPIs
  activeSubscriptions = 0;
  trialSubscriptions = 0;
  expiredSubscriptions = 0;
  totalCompanies = 0;

  loading = true;
  errorMsg = '';

  constructor(private platformAdminService: PlatformAdminService) {}

  ngOnInit(): void {
    this.loadAll();
  }

  /** Charge plans, stats et toutes les entreprises (pagination) */
  private async loadAll(): Promise<void> {
    this.loading = true;
    this.errorMsg = '';
    try {
      // 1) Plans
      this.platformAdminService.getSubscriptionPlans().subscribe({
        next: (plans) => this.subscriptionPlans = plans,
        error: () => {} // non bloquant
      });

      // 2) Stats (si exposées par ton backend)
      this.platformAdminService.getPlatformStats().subscribe({
        next: (s) => this.stats = s,
        error: () => {} // non bloquant
      });

      // 3) Entreprises (récupérer toutes les pages pour stats exactes)
      const all: CompanyOverview[] = [];
      const pageSize = 50;
      let page = 0;
      let total = 0;

      // première page
      const first = await this.platformAdminService.getCompanies(page, pageSize).toPromise();
      all.push(...(first?.content ?? []));
      total = first?.totalElements ?? all.length;

      // pages suivantes
      const totalPages = Math.ceil(total / pageSize);
      const remaining = [];
      for (page = 1; page < totalPages; page++) {
        remaining.push(this.platformAdminService.getCompanies(page, pageSize).toPromise());
      }
      const others = await Promise.all(remaining);
      others.forEach(r => all.push(...(r?.content ?? [])));

      this.companies = all;
      this.totalCompanies = total;

      // Calculs locaux si l’API stats ne donne pas tout
      this.calculateDerivedStats();

      this.loading = false;
    } catch (e) {
      console.error(e);
      this.errorMsg = 'Impossible de charger les données.';
      this.loading = false;
    }
  }

  /** Calcule KPIs locaux et un fallback pour revenus mensuels */
  private calculateDerivedStats(): void {
    this.activeSubscriptions  = this.companies.filter(c => c.subscriptionStatus === 'ACTIVE').length;
    this.trialSubscriptions   = this.companies.filter(c => c.subscriptionStatus === 'TRIAL').length;
    this.expiredSubscriptions = this.companies.filter(c => c.subscriptionStatus === 'EXPIRED').length;

    // fallback si stats.totalRevenue absent : somme des revenus/mois des actifs
    this.computedMonthlyRevenue = this.companies
      .filter(c => c.subscriptionStatus === 'ACTIVE')
      .reduce((sum, c) => sum + (c.monthlyRevenue || 0), 0);
  }

  getCompaniesCountByPlan(planId: string): number {
    const pid = this.normalize(planId);
    return this.companies.filter(c => (c.subscriptionPlan ?? -1) === pid).length;
  }

  normalize(id: string): string {
    return (id || '').toUpperCase();
  }

  trackPlan(_: number, p: SubscriptionPlan): string {
    return p.name;
  }

  /* Actions (à connecter à ton backend si tu as les endpoints) */
  editPlan(plan: SubscriptionPlan): void {
    console.log('Modifier le plan:', plan);
    // TODO: ouvrir un modal, envoyer PUT /platform-admin/subscription-plans/:id ...
  }

  deletePlan(plan: SubscriptionPlan): void {
    console.log('Supprimer le plan:', plan);
    // TODO: confirmer + DELETE /platform-admin/subscription-plans/:id puis reload
  }

  createPlan(): void {
    console.log('Créer un nouveau plan');
    // TODO: ouvrir un modal + POST /platform-admin/subscription-plans
  }
}
