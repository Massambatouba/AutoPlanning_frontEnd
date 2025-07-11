import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
      siteId: ['', Validators.required],
      month: ['', [Validators.required, Validators.min(1), Validators.max(12)]],
      year: ['', [Validators.required, Validators.min(2024), Validators.max(2030)]]
    });
  }
  ngOnInit(): void {
    this.onGetSite()
  }

  onSubmit() {
    if (this.scheduleForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.scheduleService.createSchedule(this.scheduleForm.value)
      .subscribe({
        next: () => {
          this.router.navigate(['/schedules']);
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
        }
      });
  }
  onGetSite(){
    this.siteService.getSites()
    .subscribe(sites =>this.listSites = sites)
    console.log(this.listSites);
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
