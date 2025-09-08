import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ScheduleService } from 'src/app/services/schedule.service';
import { ScheduleRoutingModule } from '../schedule-routing.model';
import { Site } from 'src/app/shared/models/site.model';
import { SiteService } from 'src/app/services/site.service';
import { CompanyRoutingModule } from '../../company/company-routing.module';

@Component({
  standalone: true,
  selector: 'app-schedule-create',
  templateUrl: './schedule-create.component.html',
  styleUrls: ['./schedule-create.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    CompanyRoutingModule,
    ScheduleRoutingModule
  ]
})
export class ScheduleCreateComponent implements OnInit {
  scheduleForm: FormGroup;
  loading = false;
  error = '';

  listSites!: Site[];

  constructor(
    private formBuilder: FormBuilder,
    private siteService: SiteService,
    private scheduleService: ScheduleService,
    private router: Router
  ) {
    this.scheduleForm = this.formBuilder.group({
      name: ['', Validators.required],
      mode: ['MONTH', Validators.required],
      siteId: ['', Validators.required],
      month: ['', [Validators.required, Validators.min(1), Validators.max(12)]],
      year: ['', [Validators.required, Validators.min(2024), Validators.max(2030)]],
      startDate: [''],
      endDate: ['']
    },
    { validators: this.rangeValidator }
  );
    // switch validators
  this.scheduleForm.get('mode')!.valueChanges.subscribe(mode => {
    if (mode === 'MONTH') {
      this.scheduleForm.get('month')!.setValidators([Validators.required, Validators.min(1), Validators.max(12)]);
      this.scheduleForm.get('year')!.setValidators([Validators.required, Validators.min(2024), Validators.max(2035)]);
      this.scheduleForm.get('startDate')!.clearValidators();
      this.scheduleForm.get('endDate')!.clearValidators();
    } else {
      this.scheduleForm.get('month')!.clearValidators();
      this.scheduleForm.get('year')!.clearValidators();
      this.scheduleForm.get('startDate')!.setValidators([Validators.required]);
      this.scheduleForm.get('endDate')!.setValidators([Validators.required]);
    }
    ['month','year','startDate','endDate'].forEach(k => this.scheduleForm.get(k)!.updateValueAndValidity());
  });

  }
  ngOnInit(): void {
    this.siteService.getSites().subscribe(sites => (this.listSites = sites));
    this.toggleValidators(this.scheduleForm.get('periodType')!.value);
    this.scheduleForm.get('periodType')!.valueChanges.subscribe(v => this.toggleValidators(v));
  }

 // ---- VALIDATEURS ----
  private toggleValidators(mode: 'MONTH' | 'RANGE') {
    const month = this.scheduleForm.get('month')!;
    const year = this.scheduleForm.get('year')!;
    const start = this.scheduleForm.get('startDate')!;
    const end = this.scheduleForm.get('endDate')!;

    if (mode === 'MONTH') {
      month.setValidators([Validators.required, Validators.min(1), Validators.max(12)]);
      year.setValidators([Validators.required, Validators.min(2024), Validators.max(2035)]);
      start.clearValidators(); end.clearValidators();

      start.setValue(''); end.setValue('');
    } else {
      month.clearValidators(); year.clearValidators();
      start.setValidators([Validators.required]);
      end.setValidators([Validators.required]);

      month.setValue(''); year.setValue('');
    }

    month.updateValueAndValidity();
    year.updateValueAndValidity();
    start.updateValueAndValidity();
    end.updateValueAndValidity();
    this.scheduleForm.updateValueAndValidity();
  }

  private rangeValidator = (group: AbstractControl): ValidationErrors | null => {
    const pt = group.get('periodType')?.value;
    if (pt !== 'RANGE') return null;
    const s = group.get('startDate')?.value;
    const e = group.get('endDate')?.value;
    if (!s || !e) return null;
    return new Date(s) <= new Date(e) ? null : { rangeInvalid: true };
  };

  // ---- SUBMIT ----
  onSubmit() {
    if (this.scheduleForm.invalid) return;

  this.loading = true; this.error = '';
  const { name, siteId, mode, month, year, startDate, endDate } = this.scheduleForm.value;

  if (mode === 'MONTH') {
    this.scheduleService.createMonthlySchedule({
      name, siteId: +siteId, month: +month, year: +year
    }).subscribe({
      next: () => this.router.navigate(['/schedules']),
      error: (e) => { this.error = e?.message ?? 'Erreur'; this.loading = false; }
    });
  } else {
    const s = this.toIso(startDate), e = this.toIso(endDate);
    if (new Date(s) > new Date(e)) { this.error = 'Début > Fin'; this.loading = false; return; }

    this.scheduleService.createRangeSchedule({
      name, siteId: +siteId, startDate: s, endDate: e
    }).subscribe({
      next: () => this.router.navigate(['/schedules']),
      error: (err) => { this.error = err?.message ?? 'Erreur'; this.loading = false; }
    });
  }
}
private toIso(d: any){ return new Date(d).toISOString().substring(0,10); }

  // ---- UI helpers ----
  getMonths() {
    return [
      { value: 1, label: 'Janvier' }, { value: 2, label: 'Février' }, { value: 3, label: 'Mars' },
      { value: 4, label: 'Avril' },   { value: 5, label: 'Mai' },     { value: 6, label: 'Juin' },
      { value: 7, label: 'Juillet' }, { value: 8, label: 'Août' },    { value: 9, label: 'Septembre' },
      { value: 10, label: 'Octobre' },{ value: 11, label: 'Novembre' },{ value: 12, label: 'Décembre' }
    ];
  }
  getYears() {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 8 }).map((_, i) => currentYear + i);
  }
}
