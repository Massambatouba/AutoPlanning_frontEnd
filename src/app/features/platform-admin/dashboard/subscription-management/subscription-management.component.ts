import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyOverview, PlatformStats, SubscriptionPlan } from 'src/app/shared/models/platform-admin.model';
import { PlatformAdminService } from 'src/app/services/platform-admin.service';
import { FormsModule } from '@angular/forms';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-subscription-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subscription-management.component.html',
  styleUrls: ['./subscription-management.component.scss']
})
export class SubscriptionManagementComponent implements OnInit {

  subscriptionPlans: SubscriptionPlan[] = [];
  companies: CompanyOverview[] = [];

  stats?: PlatformStats;
  computedMonthlyRevenue = 0;
  isCreate = false;

  // KPIs
  activeSubscriptions = 0;
  trialSubscriptions = 0;
  expiredSubscriptions = 0;
  totalCompanies = 0;

  editModel: {
    id: number;
    name: string;
    description?: string;
    maxEmployees: number;
    maxSites: number;
    price: number;
    durationMonths?: number;
    isActive?: boolean;
  } | null = null;

  loading = true;
  errorMsg = '';

    // UI état modale
  showEdit = false;
  saving = false;

  @ViewChild('editModal') editModalRef!: ElementRef;
  private editModalInstance?: Modal;

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

  /* ====== Modale édition ====== */
editPlan(plan: SubscriptionPlan): void {
  this.editModel = {
    id: plan.id,
    name: plan.name,
    description: (plan as any).description ?? '',
    maxEmployees: plan.maxEmployees,
    maxSites: plan.maxSites,
    price: plan.price,
    durationMonths: (plan as any).durationMonths ?? 1,
    isActive: (plan as any).isActive ?? true
  };
  this.openEditModal(); // ← au lieu de this.showEdit = true
}

createPlan(): void {
  // modèle vide par défaut
  this.editModel = {
    id: 0 as any,              // pas utilisé côté POST
    name: '',
    description: '',
    maxEmployees: 0,
    maxSites: 0,
    price: 0,
    durationMonths: 1,
    isActive: true
  };
  this.isCreate = true;
  this.openEditModal()
}

    
  cancelEdit(): void {
    this.showEdit = false;
    this.editModel = null;
  }

    private openEditModal(): void {
    if (!this.editModalInstance) {
      this.editModalInstance = Modal.getOrCreateInstance(this.editModalRef.nativeElement);
      // Optionnel : reset du modèle à la fermeture (via événement Bootstrap)
      this.editModalRef.nativeElement.addEventListener('hidden.bs.modal', () => {
        this.editModel = null;
        this.saving = false;
      });
    }
    this.editModalInstance.show();
  }

  private hideEditModal(): void {
    this.editModalInstance?.hide();
  }

  closeEdit(): void {
    this.hideEditModal();
  }

  saveEdit(): void {
    if (!this.editModel) return;
    this.saving = true;
    this.platformAdminService.updateSubscriptionPlan(this.editModel).subscribe({
      next: (updated) => {
        // Remplace l’item dans la liste sans recharger toute la page
        const idx = this.subscriptionPlans.findIndex(p => p.id === updated.id);
        if (idx >= 0) {
          this.subscriptionPlans[idx] = { ...this.subscriptionPlans[idx], ...updated };
        }
        this.saving = false;
        this.showEdit = false;
        this.editModel = null;
      },
      error: () => {
        this.saving = false;
        alert('Échec de la mise à jour du plan.');
      }
    });
  }

  deletePlan(plan: SubscriptionPlan): void {
    console.log('Supprimer le plan:', plan);
    // TODO: confirmer + DELETE /platform-admin/subscription-plans/:id puis reload
  }

  // --- utils ---
private normalize_(s?: string): string {
  return (s ?? '').trim().toUpperCase();
}


// % du total plateforme pour un plan donné
percentByPlan(planName: string): number {
  const n = this.getCompaniesCountByPlan(planName);
  return this.totalCompanies ? Math.round((n / this.totalCompanies) * 100) : 0;
}

// Comptage par STATUT à l’intérieur d’un plan (barres empilées)
getStatusCountByPlan(
  planName: string,
  status: 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'INACTIVE'
): number {
  const pid = this.normalize_(planName);
  return this.companies.filter(
    c => this.normalize_(c.subscriptionPlan) === pid && c.subscriptionStatus === status
  ).length;
}

// % par STATUT dans un plan
percentStatusWithinPlan(
  planName: string,
  status: 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'INACTIVE'
): number {
  const total = this.getCompaniesCountByPlan(planName);
  if (!total) return 0;
  const n = this.getStatusCountByPlan(planName, status);
  return Math.round((n / total) * 100);
}
}
