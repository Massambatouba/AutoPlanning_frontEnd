import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AuthService }    from 'src/app/services/auth.service';
import { CompanyService } from 'src/app/services/company.service';
import { Company }        from 'src/app/shared/models/company.model';
import { CompanyRoutingModule } from '../company-routing.model';
import { CompanyAdminsComponent } from './company-admins/company-admins.component';

@Component({
  standalone: true,
  selector: 'app-company-profile',
  templateUrl: './company-profile.component.html',
  styleUrls: ['./company-profile.component.scss'],
  imports: [
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      RouterModule,
      CompanyRoutingModule,
      CompanyAdminsComponent
  ]
})
export class CompanyProfileComponent implements OnInit {

  company: Company | null = null;
  companyForm: FormGroup;
  loading = true;
  saving  = false;
  error   = '';
  logoPreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private companyService: CompanyService
  ) {
    this.companyForm = this.fb.group({
      name:    ['', Validators.required],
      address: [''],
      phone:   [''],
      email:   ['', Validators.email],
      website: [''],
      logo:    [null]
    });
  }

  /* ---------- charge la société depuis le localStorage ---------- */
  ngOnInit(): void {
    const c = this.authService.getCurrentUserCompany();
    if (!c) {
      this.error = 'Entreprise non trouvée';
      this.loading = false;
      return;
    }

    this.company = c;
    this.companyForm.patchValue({
      name:    c.name,
      address: c.address,
      phone:   c.phone,
      email:   c.email,
      website: c.website
    });
    this.logoPreview = c.logoUrl ?? null;
    this.loading = false;
  }

  /* ---------- changement de logo ---------- */
  onLogoChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => (this.logoPreview = reader.result as string);
    reader.readAsDataURL(file);

    this.companyForm.patchValue({ logo: file });
  }

  /* ---------- enregistrement ---------- */
  onSubmit(): void {
    if (this.companyForm.invalid || !this.company) return;

    const fd = new FormData();
    Object.entries(this.companyForm.value).forEach(([k, v]) => {
      if (v !== null && v !== '') fd.append(k, v as string | Blob);
    });

    this.saving = true;
    this.companyService.updateCompany(this.company.id, fd).subscribe({
      next: updated => {
        this.company = updated;
        // synchronise aussi AuthService / localStorage
        localStorage.setItem('current_company', JSON.stringify(updated));
        this.saving = false;
      },
      error: err => {
        this.error  = err.message;
        this.saving = false;
      }
    });
  }

  /* ---------- utilitaire ---------- */
  getSubscriptionStatusLabel(status?: string): string {
    const map: Record<string,string> = {
      ACTIVE: 'Actif',
      INACTIVE: 'Inactif',
      TRIAL: 'Période d\'essai'
    };
    return status ? map[status] : 'Inconnu';
  }
}
