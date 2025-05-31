import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SiteService } from 'src/app/services/site.service';
import { Site } from 'src/app/shared/models/site.model';
import { SiteRoutingModule } from '../site-routing.model';

@Component({
  standalone: true,
  selector: 'app-site-list',
  templateUrl: './site-list.component.html',
  styleUrls: ['./site-list.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SiteRoutingModule
  ]
})
export class SiteListComponent implements OnInit {
  sites: Site[] = [];
  site!: Site
  filteredSites: Site[] = [];
  loading = true;
  error = '';

  // Filtres
  searchTerm = '';
  statusFilter = 'all';

  constructor(private siteService: SiteService) {}

  ngOnInit(): void {
    this.loadSites();
  }

  loadSites(): void {
    this.siteService.getSites().subscribe({
    next: sites => {
      this.sites = sites;
      this.applyFilters();          // statusFilter a bien la bonne valeur
      this.loading = false;
    },
    error: err => { this.error = err.message; this.loading = false; }
    });
  }

  

  applyFilters(): void {
    this.filteredSites = this.sites.filter(site => {
      const matchesSearch = !this.searchTerm ||
        site.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        site.city.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = this.statusFilter === 'all' ||
        (this.statusFilter === 'active' && site.active) ||
        (this.statusFilter === 'inactive' && !site.active);

      return matchesSearch && matchesStatus;
    });
  }

toggleSiteStatus(site: Site) {
  this.siteService.toggleSiteStatus(site.id).subscribe({
    next: updated => {
      this.sites = this.sites.map(s =>
        s.id === updated.id ? updated : s
      );
      this.applyFilters();
    },
    error: err => this.error = err.error?.message || err.message
  });
}

}
