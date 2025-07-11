import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ScheduleService } from 'src/app/services/schedule.service';
import { Schedule } from 'src/app/shared/models/schedule.model';
import { ScheduleRoutingModule } from '../schedule-routing.model';
import { CompanyRoutingModule } from '../../company/company-routing.module';

@Component({
  standalone: true,
  selector: 'app-schedule-edit',
  templateUrl: './schedule-edit.component.html',
  styleUrls: ['./schedule-edit.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    CompanyRoutingModule,
    ScheduleRoutingModule
  ]
})
export class ScheduleEditComponent implements OnInit {
  scheduleForm: FormGroup;
  schedule: Schedule | null = null;
  loading = true;
  saving = false;
  error = '';

  sites = [
    { id: 1, name: 'Site Principal' },
    { id: 2, name: 'Agence Centre-Ville' },
    { id: 3, name: 'Bureau Aéroport' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private scheduleService: ScheduleService
  ) {
    this.scheduleForm = this.formBuilder.group({
      name: ['', Validators.required],
      siteId: ['', Validators.required],
      month: ['', [Validators.required, Validators.min(1), Validators.max(12)]],
      year: ['', [Validators.required, Validators.min(2024), Validators.max(2030)]]
    });
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadSchedule(id);
  }

  private loadSchedule(id: number) {
    this.scheduleService.getScheduleById(id)
      .subscribe({
        next: (schedule) => {
          this.schedule = schedule;
          this.scheduleForm.patchValue({
            name: schedule.name,
            siteId: schedule.siteId,
            month: schedule.month,
            year: schedule.year
          });
          this.loading = false;
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
        }
      });
  }

  onSubmit() {
    if (this.scheduleForm.invalid || !this.schedule) {
      return;
    }

    this.saving = true;
    this.error = '';

    this.scheduleService.updateSchedule(this.schedule.id, this.scheduleForm.value)
      .subscribe({
        next: () => {
          this.router.navigate(['/schedules', this.schedule?.id]);
        },
        error: (error) => {
          this.error = error.message;
          this.saving = false;
        }
      });
  }

  getMonths() {
    return [
      { value: 1, label: 'Janvier' },
      { value: 2, label: 'Février' },
      { value: 3, label: 'Mars' },
      { value: 4, label: 'Avril' },
      { value: 5, label: 'Mai' },
      { value: 6, label: 'Juin' },
      { value: 7, label: 'Juillet' },
      { value: 8, label: 'Août' },
      { value: 9, label: 'Septembre' },
      { value: 10, label: 'Octobre' },
      { value: 11, label: 'Novembre' },
      { value: 12, label: 'Décembre' }
    ];
  }

  getYears() {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 5; i++) {
      years.push(currentYear + i);
    }
    return years;
  }
}
