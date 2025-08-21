// src/app/features/platform-admin/companies/company-detail/company-detail/company-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PlatformAdminService } from 'src/app/services/platform-admin.service'; // <- adapte ce chemin si besoin
import { CompanyOverview, SubscriptionPlan } from 'src/app/shared/models/platform-admin.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-company-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './company-detail.component.html',
  styleUrls: ['./company-detail.component.scss']
})
export class CompanyDetailComponent implements OnInit {

  company: CompanyOverview | null = null;
  loading = true;
  errorMsg = '';

  selectedPlanId: number | null = null;
  selectedPlan: 'STARTER' | 'PRO' | 'ENTERPRISE' | '' = '';
  selectedStatus: 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'INACTIVE' | '' = '';

  plans: SubscriptionPlan[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private platformAdminService: PlatformAdminService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigateByUrl('/platform-admin/companies');
      return;
    }
    this.loadData(id);
  }

  private loadData(id: number): void {
  this.loading = true;
  forkJoin({
    company: this.platformAdminService.getCompanyById(id),
    plans:   this.platformAdminService.getSubscriptionPlans()
  }).subscribe({
    next: ({ company, plans }) => {
      this.company = company;
      this.plans = plans;

      // ✅ prends l'id direct s'il est renvoyé par l'API
      this.selectedPlanId = (company as any).subscriptionPlanId ?? null;

      // fallback si backend ne renvoie pas encore subscriptionPlanId
      if (this.selectedPlanId == null && company.subscriptionPlan) {
        const planName = company.subscriptionPlan.toString().trim().toUpperCase();
        const byName = plans.find(p => (p.name ?? '').toUpperCase() === planName);
        this.selectedPlanId = byName?.id ?? null;
      }

      this.selectedStatus = company.subscriptionStatus as any;
      this.loading = false;
    },
    error: () => { this.errorMsg = 'Impossible de charger cette entreprise.'; this.loading = false; }
  });
}

  /** Sauvegarde plan + statut */
private saveSubscription(): void {
  if (!this.company) return;
  this.platformAdminService
    .updateCompanySubscription(this.company.id, this.selectedPlanId, this.selectedStatus) // ✅ id
    .subscribe({
      next: (updated) => {
        this.company = updated;
        // resynchroniser l'id si l’API le renvoie
        this.selectedPlanId = (updated as any).subscriptionPlanId ?? this.selectedPlanId;
        this.selectedStatus = updated.subscriptionStatus as any;
      },
      error: () => this.errorMsg = 'Échec de la mise à jour de l’abonnement.'
    });
}

onPlanChange(value: number | null) {
  this.selectedPlanId = value;
  this.saveSubscription();
}

currentPlanName(): string {
  if (this.selectedPlanId == null) return '—';
  const p = this.plans.find(x => x.id === this.selectedPlanId);
  return p?.name ?? '—';
}


onStatusChange(value: 'ACTIVE'|'TRIAL'|'EXPIRED'|'INACTIVE') {
  this.selectedStatus = value;
  this.saveSubscription();
}

toggleActive(): void {
  if (!this.company) return;
  this.platformAdminService.updateCompanyStatus(this.company.id, !this.company.isActive)
    .subscribe({
      next: (updated) => this.company = updated,
      error: () => this.errorMsg = 'Échec de la mise à jour du statut.'
    });
}

  deleteCompany(): void {
    if (!this.company) return;
    if (!confirm(`Supprimer définitivement "${this.company.name}" ?`)) return;
    this.platformAdminService.deleteCompany(this.company.id).subscribe({
      next: () => this.router.navigateByUrl('/platform-admin/companies'),
      error: () => this.errorMsg = 'Échec de la suppression.'
    });
  }

  // Stubs d’actions (à brancher plus tard si endpoints dispos)
  loginAsCompany() { console.log('SSO en tant que cette entreprise'); }
  viewLogs()       { console.log('Voir logs'); }
  resetPassword()  { console.log('Reset password'); }
  exportData()     { console.log('Exporter données'); }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      ACTIVE: 'Actif',
      TRIAL: 'Période d\'essai',
      EXPIRED: 'Expiré',
      INACTIVE: 'Inactif'
    };
    return labels[status] ?? status;
  }
}
