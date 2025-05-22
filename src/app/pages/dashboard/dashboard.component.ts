import { Component, OnInit } from '@angular/core';
import { Router }            from '@angular/router';
import { finalize }          from 'rxjs/operators';

import { ScheduleService }   from 'src/app/services/schedule.service';
import { CompanyService }    from 'src/app/services/company.service';
import { AuthService }       from 'src/app/services/auth.service';

import { Schedule }          from 'src/app/shared/models/schedule.model';
import { Company }           from 'src/app/shared/models/company.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  // --- Données page ---
  schedules: Schedule[] = [];
  company:   Company   | null = null;

  // --- UI ---
  isLoading = true;
  error: string | null = null;

  constructor(
    private router: Router,
    private scheduleService: ScheduleService,
    private companyService: CompanyService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.fetchSchedules();
    this.fetchCompany();   // <- seulement si vous gardez le header
  }

  /* ---------------- SCHEDULES ---------------- */

  private fetchSchedules(): void {
    this.isLoading = true;
    this.scheduleService.getAll()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: res  => (this.schedules = res.data ?? []),
        error: err => {
          console.error('Error fetching schedules:', err);
          this.error = 'Impossible de charger les plannings. Veuillez réessayer plus tard.';
        }
      });
  }

  /** Nombre de plannings dont le statut n’est pas « COMPLETED » */
  get activeCount(): number {
    return this.schedules.filter(s => s.status && s.status !== 'COMPLETED').length;
  }

  /** Nombre de plannings en attente d’approbation */
  get pendingCount(): number {
    return this.schedules.filter(s => s.status === 'SENT_TO_EMPLOYEE').length;
  }

  /* ---------------- COMPANY ---------------- */

  /** Charge la compagnie pour afficher le header (facultatif) */
  private fetchCompany(): void {
    const user = this.authService.getCurrentUser();
    if (!user?.companyId) return;

    this.companyService.getById(user.companyId).subscribe({
      next: c   => this.company = c,
      error: err => console.error('Error fetching company:', err)
    });
  }

  getSubscriptionStatusLabel(status?: string): string {
    const map: Record<string,string> = {
      ACTIVE: 'Actif',
      INACTIVE: 'Inactif',
      TRIAL: 'Période d\'essai'
    };
    return status ? map[status] : 'Inconnu';
  }

  /* ---------------- UTIL ---------------- */

  /** Formate string \| Date \| undefined vers jj/mm/aaaa ou ‘–’ */
  formatDate(d: string | Date | undefined): string {
    if (!d) return '–';
    const date = typeof d === 'string' ? new Date(d) : d;
    return date.toLocaleDateString('fr-FR');
  }

  /** Renvoie la classe badge Bootstrap / utility pour le statut */
  getStatusBadgeClass(status: Schedule['status']): string {
    switch (status) {
      case 'DRAFT':            return 'bg-warning text-dark';
      case 'SENT_TO_EMPLOYEE': return 'bg-info text-dark';
      case 'APPROVED':         return 'bg-success text-white';
      case 'COMPLETED':        return 'bg-secondary text-white';
      default:                 return 'bg-light text-dark';
    }
  }
}
