import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdminService } from 'src/app/services/admin.service';
import { SiteService } from 'src/app/services/site.service';
import { ToastrService } from 'ngx-toastr';
import { UserDto } from 'src/app/shared/models/user.model';
import { Site } from 'src/app/shared/models/site.model';

@Component({
  selector: 'app-admin-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-detail.component.html',
  styleUrls: ['./admin-detail.component.scss']
})
export class AdminDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private admin = inject(AdminService);
  private sitesSrv = inject(SiteService);
  private toast = inject(ToastrService);

  user?: UserDto;
  allSites: Site[] = [];
  managedSiteNames: string[] = [];

  loading = true;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading = true;

    // Charge admin + tous les sites pour mapper les noms
    Promise.all([
      this.admin.get(id).toPromise(),
      this.sitesSrv.list().toPromise()
    ]).then(([u, sites]) => {
      this.user = u!;
      this.allSites = sites ?? [];
      this.managedSiteNames = (u?.siteIds ?? [])
        .map(id => this.allSites.find(s => s.id === id)?.name)
        .filter((n): n is string => !!n);
    }).catch(() => this.toast.error('Impossible de charger les données'))
      .finally(() => this.loading = false);
  }
}
