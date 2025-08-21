import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CompanyOverview } from 'src/app/shared/models/platform-admin.model';
import { PlatformAdminService } from 'src/app/services/platform-admin.service';

@Component({
  selector: 'app-company-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './company-management.component.html',
  styleUrls: ['./company-management.component.scss']
})
export class CompanyManagementComponent implements OnInit {
  companies: CompanyOverview[] = [];
  loading = true;
  errorMsg = '';

  // Filtres
  searchTerm = '';
  statusFilter = '';
  planFilter = ''; // appliqué côté client sauf si ton backend le supporte

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalCompanies = 0;
  totalPages = 0;

  // debounce recherche
  private searchTimer?: any;

  constructor(private platformAdminService: PlatformAdminService, private router: Router) {}

  ngOnInit(): void {
    this.loadCompanies();
  }

  /** Charge la page courante depuis l'API (recherche + statut côté serveur) */
  private loadCompanies(): void {
    this.loading = true;
    this.errorMsg = '';

    this.platformAdminService
      .getCompanies(
        this.currentPage,
        this.pageSize,
        this.searchTerm || undefined,
        this.statusFilter || undefined
      )
      .subscribe({
        next: (res) => {
          // Si tu gères aussi le filtre "plan" côté serveur, on ne filtre pas ici
          const raw = res.content ?? [];
          this.companies = this.planFilter
            ? raw.filter(c => c.subscriptionPlan === this.planFilter)
            : raw;

          this.totalCompanies = res.totalElements ?? this.companies.length;
          // Attention : si on filtre par plan côté client, la pagination serveur
          // et le totalElements ne reflètent pas le plan. Dans ce cas, on peut
          // recalculer totalCompanies localement :
          if (this.planFilter) {
            this.totalCompanies = this.companies.length;
          }

          this.totalPages = Math.max(1, Math.ceil(this.totalCompanies / this.pageSize));
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.errorMsg = 'Erreur lors du chargement des entreprises.';
          this.loading = false;
        }
      });
  }

  /** Recherche (debounce 400ms) */
  onSearchChange(): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.currentPage = 0;
      this.loadCompanies();
    }, 400);
  }

  /** Changement de statut (appel serveur direct) */
  onStatusChange(): void {
    this.currentPage = 0;
    this.loadCompanies();
  }

  /** Changement de plan (filtre local par défaut) */
  onPlanChange(): void {
    // Si ton backend gère ?plan=..., remplace par this.loadCompanies()
    this.currentPage = 0;
    this.loadCompanies();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.planFilter = '';
    this.currentPage = 0;
    this.loadCompanies();
  }

  getCompanyInitials(name: string): string {
    return name
      .split(' ')
      .map(w => w.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      ACTIVE: 'Actif',
      TRIAL: 'Essai',
      EXPIRED: 'Expiré',
      INACTIVE: 'Inactif'
    };
    return labels[status] || status;
  }

  toggleCompanyStatus(company: CompanyOverview): void {
    const newStatus = !company.isActive;
    this.platformAdminService.updateCompanyStatus(company.id, newStatus).subscribe({
      next: (updated) => {
        // On remplace l’élément dans la liste courante
        const idx = this.companies.findIndex(c => c.id === company.id);
        if (idx >= 0) this.companies[idx] = updated;
      },
      error: (err) => {
        console.error(err);
        alert('Erreur lors de la mise à jour du statut.');
      }
    });
  }

  deleteCompany(company: CompanyOverview): void {
    if (!confirm(`Supprimer "${company.name}" ? Action irréversible.`)) return;

    this.platformAdminService.deleteCompany(company.id).subscribe({
      next: () => {
        // On recharge la page pour rester cohérent avec la pagination serveur
        this.loadCompanies();
      },
      error: (err) => {
        console.error(err);
        alert('Erreur lors de la suppression.');
      }
    });
  }

  changePage(page: number): void {
    if (page < 0) return;
    // Si planFilter est local et réduit beaucoup les résultats, on protège :
    if (!this.planFilter && page >= this.totalPages) return;

    this.currentPage = page;
    this.loadCompanies();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(0, this.currentPage - 2);
    const end = Math.min((this.totalPages || 1) - 1, this.currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

createCompany(): void {
  this.router.navigate(['/platform-admin/companies/create']);
}

  trackById(_: number, item: CompanyOverview): number {
    return item.id;
  }

  planBadgeClass(plan?: string | null): string {
  const p = (plan ?? '').toUpperCase();
  switch (p) {
    case 'STARTER':     return 'text-bg-info';     
    case 'PRO':         return 'text-bg-success';  
    case 'ENTERPRISE':  return 'text-bg-dark';    
    default:            return 'text-bg-secondary';
  }
}

}
