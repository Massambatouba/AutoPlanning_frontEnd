import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { AdminService } from 'src/app/services/admin.service';
import { SiteService } from 'src/app/services/site.service';

import { Site } from 'src/app/shared/models/site.model';
import { AdminCmd } from 'src/app/shared/models/admin.model';
import { UserDto } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-admin-site-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-site-create.component.html',
  styleUrls: ['./admin-site-create.component.scss']
})
export class AdminSiteCreateComponent implements OnInit {
  private fb     = inject(FormBuilder);
  private admin  = inject(AdminService);
  private sites  = inject(SiteService);
  private router = inject(Router);
  private toast  = inject(ToastrService);

  loading = false;
  submitted = false;
  sitesList: Site[] = [];
  created: (UserDto & { siteIds?: number[] }) | null = null;

  // TODO: remplace 3 par l’id société du user connecté (ex: via AuthService/me)
  companyId = 3;

  form = this.fb.group({
    firstName:    ['', [Validators.required]],
    lastName:     ['', [Validators.required]],
    email:        ['', [Validators.required, Validators.email]],
    tempPassword: ['', [Validators.required, Validators.minLength(6)]],
    allSites:     [true,  []],
    siteIds:      this.fb.control<number[]>([])
  });

  ngOnInit(): void {
    this.sites.list({ active: true }).subscribe({
      next: s => this.sitesList = s,
      error: _ => this.toast.error('Impossible de charger les sites')
    });

    // si on décoche "Tous les sites", siteIds devient requis (au moins 1)
    this.form.get('allSites')!.valueChanges.subscribe(v => {
      const siteIds = this.form.get('siteIds')!;
      if (v === false) {
        siteIds.setValidators([Validators.required, this.nonEmptyArrayValidator]);
      } else {
        siteIds.clearValidators();
        siteIds.setValue([]); // vide si global
      }
      siteIds.updateValueAndValidity({ emitEvent: false });
    });
  }

  private nonEmptyArrayValidator(ctrl: AbstractControl) {
    const arr = ctrl.value as number[] | null;
    return (arr && arr.length > 0) ? null : { required: true };
  }

  get f() { return this.form.controls; }

  submit(): void {
    this.submitted = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const cmd: AdminCmd = {
      firstName:    v.firstName!,
      lastName:     v.lastName!,
      email:        v.email!,
      tempPassword: v.tempPassword!,
      companyId:    this.companyId,
      allSites:     !!v.allSites,
      siteIds:      v.allSites ? [] : (v.siteIds ?? [])
    };

    this.loading = true;
    this.admin.create(cmd).subscribe({
      next: (u) => {
        this.loading = false;
        this.created = u as any; // s’assure que le back renvoie manageAllSites + siteIds[]
        this.toast.success('Admin‑site créé avec succès');
        // Option A: afficher le résumé
        // Option B: rediriger
        // this.router.navigate(['/admin/admins', u.id]);
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(err?.error?.message ?? 'Création impossible');
      }
    });
  }
}
