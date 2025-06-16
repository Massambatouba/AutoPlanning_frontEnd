import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ScheduleService } from 'src/app/services/schedule.service';
import { Schedule } from 'src/app/shared/models/schedule.model';
import { CompanyRoutingModule } from '../../company/company-routing.model';
import { ScheduleRoutingModule } from '../schedule-routing.model';
import { CompanyService } from 'src/app/services/company.service';

@Component({
  standalone: true,
  selector: 'app-schedule-list',
  templateUrl: './schedule-list.component.html',
  styleUrls: ['./schedule-list.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    CompanyRoutingModule,
    ScheduleRoutingModule
  ]
})
export class ScheduleListComponent implements OnInit {
  loading = true;
  schedules: Schedule[] = [];
  filteredSchedules: Schedule[] = [];

  // Filters
  searchTerm = '';
  statusFilter: 'all' | 'published' | 'draft' = 'all';
  siteFilter = 'all';
  monthFilter = 'all';
  yearFilter   = new Date().getFullYear(); 

  sites: { id: number; name: string }[] = [];
  

  constructor(private scheduleService: ScheduleService, private companySrv : CompanyService) {}

  ngOnInit(): void {
    this.loadSites();
    this.fetchSchedules()
  }

  private loadSites() {
    this.companySrv.getMyCompany().subscribe(c => this.sites = c.sites ?? []);
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


}
