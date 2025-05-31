import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SiteService } from 'src/app/services/site.service';
import { Site } from 'src/app/shared/models/site.model';
import { CompanyRoutingModule } from '../../company/company-routing.model';
import { SiteRoutingModule } from '../site-routing.model';

@Component({
  standalone: true,
  selector: 'app-site-edit',
  templateUrl: './site-edit.component.html',
  styleUrls: ['./site-edit.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SiteRoutingModule
  ]
})
export class SiteEditComponent implements OnInit {
  siteForm: FormGroup;
  site: Site | null = null;
  loading = true;
  saving = false;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private siteService: SiteService
  ) {
    this.siteForm = this.formBuilder.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      zipCode: ['', Validators.required],
      country: ['France', Validators.required],
      phone: [''],
      email: ['', Validators.email],
      managerName: [''],
      managerEmail: ['', Validators.email],
      managerPhone: ['']
    });
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadSite(id);
  }

  private loadSite(id: number) {
    this.siteService.getSiteById(id)
      .subscribe({
        next: (site) => {
          this.site = site;
          this.siteForm.patchValue(site);
          this.loading = false;
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
        }
      });
  }

  onSubmit() {
    if (this.siteForm.invalid || !this.site) {
      return;
    }

    this.saving = true;
    this.error = '';

    this.siteService.updateSite(this.site.id, this.siteForm.value)
      .subscribe({
        next: () => {
          this.router.navigate(['/sites', this.site?.id]);
        },
        error: (error) => {
          this.error = error.message;
          this.saving = false;
        }
      });
  }
}
