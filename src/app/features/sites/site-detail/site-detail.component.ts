import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SiteService } from 'src/app/services/site.service';
import { Site } from 'src/app/shared/models/site.model';
import { SiteRoutingModule } from '../site-routing.model';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Schedule } from 'src/app/shared/models/schedule.model';
import { ScheduleService } from 'src/app/services/schedule.service';
import { CompanyRoutingModule } from '../../company/company-routing.module';

@Component({
  standalone: true,
  selector: 'app-site-detail',
  templateUrl: './site-detail.component.html',
  styleUrls: ['./site-detail.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    CompanyRoutingModule,
    SiteRoutingModule
  ]
})
export class SiteDetailComponent implements OnInit {
  site: Site | null = null;
  schedules: Schedule[] = [];
  loadingSchedules = false;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private scheduleService: ScheduleService,
    private siteService: SiteService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadSite(id);
  }

  private loadSite(id: number) {
    this.siteService.getSiteById(id)
      .subscribe({
        next: (site) => {
          this.site = site;
          this.loading = false;
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
        }
      });
}

private loadSchedules() {
    if (!this.site) return;

    this.loadingSchedules = true;
    this.scheduleService.getSchedulesBySite(this.site.id)
      .subscribe({
        next: (schedules) => {
          this.schedules = schedules;
          this.loadingSchedules = false;
        },
        error: (error) => {
          this.error = error.message;
          this.loadingSchedules = false;
        }
      });
  }

toggleSiteStatus(): void {
  if (!this.site) { return; }

  this.siteService.toggleSiteStatus(this.site.id).subscribe({
    next : updated => this.site = updated,
    error: err     => this.error = err.message
  });
}
}
