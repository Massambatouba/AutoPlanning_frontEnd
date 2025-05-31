import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ScheduleService } from 'src/app/services/schedule.service';
import { Schedule, ScheduleAssignment } from 'src/app/shared/models/schedule.model';
import { CompanyRoutingModule } from '../../company/company-routing.model';
import { ScheduleRoutingModule } from '../schedule-routing.model';

@Component({
  standalone: true,
  selector: 'app-schedule-detail',
  templateUrl: './schedule-detail.component.html',
  styleUrls: ['./schedule-detail.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    CompanyRoutingModule,
    ScheduleRoutingModule
  ]
})
export class ScheduleDetailComponent {
 schedule: Schedule | null = null;
  assignments: ScheduleAssignment[] = [];
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private scheduleService: ScheduleService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadSchedule(id);
  }

  private loadSchedule(id: number) {
    this.scheduleService.getScheduleById(id)
      .subscribe({
        next: (schedule) => {
          this.schedule = schedule;
          this.loadAssignments(id);
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
        }
      });
  }

  private loadAssignments(scheduleId: number) {
    this.scheduleService.getScheduleAssignments(scheduleId)
      .subscribe({
        next: (assignments) => {
          this.assignments = assignments;
          this.loading = false;
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
        }
      });
  }

  sendSchedule(): void {
    if (!this.schedule) { return; }

    this.scheduleService.send(this.schedule.id).subscribe({
      next : updated => (this.schedule = updated),   // votre API renvoie le planning mis à jour
      error: err     => (this.error   = err.message)
    });
  }

  publishSchedule() {
    if (!this.schedule) return;

    this.scheduleService.publishSchedule(this.schedule.id)
      .subscribe({
        next: (updatedSchedule) => {
          this.schedule = updatedSchedule;
        },
        error: (error) => {
          this.error = error.message;
        }
      });
    }
}
