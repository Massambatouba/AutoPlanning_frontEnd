import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SiteService } from 'src/app/services/site.service';
import { ScheduleRoutingModule } from '../../schedules/schedule-routing.model';
import { SiteRoutingModule } from '../site-routing.model';

@Component({
  standalone: true,
  selector: 'app-site-create',
  templateUrl: './site-create.component.html',
  styleUrls: ['./site-create.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SiteRoutingModule,
    ScheduleRoutingModule
  ]
})
export class SiteCreateComponent {
   siteForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private siteService: SiteService,
    private router: Router
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

  onSubmit() {
    if (this.siteForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.siteService.createSite(this.siteForm.value)
      .subscribe({
        next: () => {
          this.router.navigate(['/sites']);
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
        }
      });
  }
}
