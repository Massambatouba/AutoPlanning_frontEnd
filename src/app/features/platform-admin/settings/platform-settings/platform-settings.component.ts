import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PlatformAdminService } from 'src/app/services/platform-admin.service';
import { SubscriptionPlan } from 'src/app/shared/models/platform-admin.model';

@Component({
  selector: 'app-platform-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './platform-settings.component.html',
  styleUrls: ['./platform-settings.component.scss']
})
export class PlatformSettingsComponent implements OnInit {

  private fb = inject(FormBuilder);
  private api = inject(PlatformAdminService);

  saving = false;
  errorMsg = '';
  plans: SubscriptionPlan[] = [];

  get isManualPayments() {
   return this.form.get('paymentProvider')?.value === 'NONE';
  }

  form = this.fb.group({
    siteName: ['Auto Planning', [Validators.required]],
    logoUrl: [''],
    supportEmail: [''],

    defaultCurrency: ['EUR', [Validators.required]],
    vatRate: [0],
    vatEnabled: [false],

    trialDays: [14],
    defaultPlanId: [null as number | null],

    require2FA: [false],
    passwordMinLength: [8, [Validators.min(6)]],
    paymentProvider: ['NONE' as 'NONE' | 'STRIPE'],
  });

  ngOnInit(): void {
    this.api.getSubscriptionPlans().subscribe({ next: p => this.plans = p });
    this.api.getPlatformSettings().subscribe({
      next: s => this.form.patchValue(s),
      error: () => this.errorMsg = "Impossible de charger les paramètres."
    });
  }

  save(): void {
    this.errorMsg = '';
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    this.api.updatePlatformSettings(this.form.value).subscribe({
      next: () => this.saving = false,
      error: () => { this.saving = false; this.errorMsg = "Échec de l'enregistrement."; }
    });
  }
}
