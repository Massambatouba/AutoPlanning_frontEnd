import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScheduleService } from 'src/app/services/schedule.service';
import { Schedule } from 'src/app/shared/models/schedule.model';
import { ScheduleRoutingModule } from '../schedule-routing.model';
import { RouterLink } from '@angular/router';
import { CompanyService } from 'src/app/services/company.service';
import { Site } from 'src/app/shared/models/site.model';
import { SiteService } from 'src/app/services/site.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CompanyRoutingModule } from '../../company/company-routing.module';
import { ScheduleGerationModalComponent } from '../schedule-geration-modal/schedule-geration-modal.component';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-schedule-list',
  templateUrl: './schedule-list.component.html',
  styleUrls: ['./schedule-list.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    CompanyRoutingModule,
    ScheduleRoutingModule
  ]
})
export class ScheduleListComponent implements OnInit {
  loading = true;
  schedules: Schedule[] = [];
  filteredSchedules: Schedule[] = [];
  sites: Site[] = [];
  deletingId: number | null = null;


  managedSites: { id: number; name: string }[] = [];


  // Filters
  searchTerm = '';
  statusFilter: 'all' | 'published' | 'draft' = 'all';
  siteFilter = 'all';
  monthFilter = 'all';
  yearFilter   = new Date().getFullYear();

  // sites: { id: number; name: string }[] = [];


  constructor(private scheduleService: ScheduleService,
    private companySrv : CompanyService,
     private modalService: NgbModal,
     private auth: AuthService,
     private http: HttpClient,
    private siteService: SiteService
  ) {}

  ngOnInit(): void {
    this.loadSites();
    //this.fetchSchedules()
    this.loadSchedules();
    this.fetchSchedules(); 
  }

  deleteSchedule(s: Schedule) {
  if (!s?.id) return;
  if (!confirm(`Supprimer le planning « ${s.name} » ? Cette action est définitive.`)) return;

  this.deletingId = s.id;
  this.scheduleService.deleteSchedule(s.id).subscribe({
    next: () => {
      this.deletingId = null;
      this.fetchSchedules(); // recharge la liste avec les filtres actifs
    },
    error: (err) => {
      this.deletingId = null;
      console.error('Suppression impossible', err);
      alert(err?.error ?? err?.message ?? 'Suppression impossible');
    }
  });
}


  loadSites(): void {
    this.siteService.getSites().subscribe({
      next: (sites) => {
        this.sites = sites;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des sites:', error);
      }
    });
  }

  isPublished(s: any): boolean { return !!(s?.isPublished ?? s?.published); }
  isSent(s: any): boolean      { return !!(s?.isSent      ?? s?.sent); }
  
  canEdit(s: any): boolean {
  if (s?.permissions) return !!s.permissions.edit;
  return !!s?.canEdit;
}
canSend(s: any): boolean {
  if (s?.permissions) return !!s.permissions.send;
  return this.canEdit(s) && this.isPublished(s) && !this.isSent(s);
}
canEditFromList(s: any): boolean {
  if (s?.permissions) return !!s.permissions.edit;
  return this.canEdit(s);
}

get canCreateOrGenerate(): boolean {
  return this.managedSites.length > 0
      || this.auth.hasAnyRole('SUPER_ADMIN','ADMIN','SITE_ADMIN','COMPANY_ADMIN'); // adapte à tes rôles
}

  private loadManagedSites(): void {
  this.http.get<{id:number; name:string}[]>(
    `${environment.apiUrl}/schedules/sites-managed`
  ).subscribe({
    next: sites => this.managedSites = sites,
    error: err => console.error('Erreur sites-managed', err)
  });
  }



  private loadSchedules(): void {
    this.loading = true;
    this.scheduleService.list().subscribe({
      next: data => { this.schedules = data; this.applyFilters(); this.loading = false; },
      error: err  => { console.error(err);   this.loading = false; }
    });
  }

  openGenerationModal(): void {
    const modalRef = this.modalService.open(ScheduleGerationModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.componentInstance.sites = this.sites;

    modalRef.result.then((result) => {
      if (result) {
        this.generateSchedule(result);
      }
    }).catch(() => {
      // Modal fermée sans action
    });
  }

    /** Appel à l’API avec les filtres courants */
  fetchSchedules(): void {

    this.loading = true;

    const params = {
      siteId   : this.siteFilter  !== 'all' ? +this.siteFilter : undefined,
      month    : this.monthFilter !== 'all' ? +this.monthFilter: undefined,
      year     : this.yearFilter,
      published: this.statusFilter === 'all'
                   ? undefined
                   : this.statusFilter === 'published'
    };

    this.scheduleService.list(params).subscribe({
      next : list => {
        // filtre “search” côté front uniquement (texte libre)
        const term = this.searchTerm.toLowerCase();
        this.schedules = term
          ? list.filter(s => s.name.toLowerCase().includes(term))
          : list;

        this.loading = false;
      },
      error: err => {
        console.error('Erreur chargement schedules', err);
        this.loading = false;
      }
    });
  }

    /** Quand un champ de filtre change (ngModelChange) */
  onFiltersChange() { this.fetchSchedules(); }

  /** Envoi d’un planning */
  sendSchedule(id: number) {
    this.scheduleService.send(id).subscribe(() => this.fetchSchedules());
  }

applyFilters(): void {
  this.loading = true;
  this.fetchSchedules();
  this.scheduleService.list({
      siteId: this.siteFilter === 'all' ? undefined : +this.siteFilter,
      month:  this.monthFilter === 'all' ? undefined : +this.monthFilter,
      published: this.statusFilter === 'all'
                 ? undefined
                 : this.statusFilter === 'published'
  }).subscribe({
      next: list => {
        this.filteredSchedules = list;
        this.loading = false;
      },
      error: err => { console.error(err); this.loading = false; }
  });
}


  getMonthName(month: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  }

  getSiteName(siteId: number): string {
    const site = this.sites.find(s => s.id === siteId);
    return site ? site.name : 'Unknown Site';
  }



  generateSchedule(params: { siteId: number, month: number, year: number }): void {
    this.scheduleService.generateSchedule(params.siteId, params.month, params.year).subscribe({
      next: (schedule) => {
        console.log('Planning généré avec succès:', schedule);
        this.loadSchedules(); // Recharger la liste
      },
      error: (error) => {
        console.error('Erreur lors de la génération:', error);
      }
    });
  }

}
