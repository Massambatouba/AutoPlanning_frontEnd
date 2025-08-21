import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminService } from 'src/app/services/admin.service';
import { SiteService } from 'src/app/services/site.service';

@Component({
  selector: 'app-admin-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-edit.component.html',
  styleUrls: ['./admin-edit.component.scss']
})
export class AdminEditComponent implements OnInit {
  id!: number;
  admin: any;
  sites: any[] = [];
  siteIds: number[] = [];

  constructor(
    private route: ActivatedRoute,
    private adminSrv: AdminService,
    private sitesSrv: SiteService
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.sitesSrv.list().subscribe(s => this.sites = s);
    this.adminSrv.get(this.id).subscribe(a => {
      this.admin = a;
      this.siteIds = a.siteIds ?? [];
    });
  }

  saveSites() {
    this.adminSrv.updateSites(this.id, this.siteIds).subscribe(() => {
      this.admin.manageAllSites = false;
      this.admin.siteIds = [...this.siteIds];
    });
  }

  grantAll() {
    this.adminSrv.grantAllSites(this.id).subscribe(a => {
      this.admin.manageAllSites = true;
      this.admin.siteIds = [];
    });
  }
}
