import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CompanyService } from 'src/app/services/company.service';
import { CreateCompanyPayload, SubscriptionPlanDto } from 'src/app/shared/models/company.model';

@Component({
  selector: 'app-company-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './company-create.component.html',
  styleUrls: ['./company-create.component.scss']
})
export class CompanyCreateComponent {

   private fb = inject(FormBuilder);
  private api = inject(CompanyService);
  private router = inject(Router);

  loading = false;
  errorMsg = '';
  plans: SubscriptionPlanDto[] = [];
  showPwd = false;

  form = this.fb.group({
    companyName: ['', [Validators.required, Validators.maxLength(120)]],
    address: ['',[Validators.maxLength(255)]],
    phone: ['',[Validators.maxLength(30)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(190)]],
    website: ['',[Validators.maxLength(255)]],
    subscriptionPlanId: [null as unknown as number, [Validators.required]],
    adminFirstName: ['', [Validators.required, Validators.maxLength(80)]],
    adminLastName: ['', [Validators.required, Validators.maxLength(80)]],
    adminUsername: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
    adminEmail: ['', [Validators.required, Validators.email, Validators.maxLength(190)]],
    adminPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
  });

  ngOnInit(): void {
    this.api.getSubscriptionPlans().subscribe({
      next: (plans) => this.plans = plans,
      error: () => this.errorMsg = "Impossible de charger les plans d'abonnement."
    });
  }

  submit(): void {
    this.errorMsg = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    const payload = this.form.value as CreateCompanyPayload;
    this.api.createCompany(payload).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/platform-admin/companies'], { queryParams: { created: '1' } });
      },
      error: (err) => {
        this.loading = false;
        if (err?.status === 409) this.errorMsg = 'Email/username déjà utilisés.';
        else if (err?.status === 404) this.errorMsg = 'Plan introuvable.';
        else if (err?.status === 400) this.errorMsg = 'Formulaire invalide.';
        else this.errorMsg = 'Erreur inattendue.';
      }
    });
  }
}
