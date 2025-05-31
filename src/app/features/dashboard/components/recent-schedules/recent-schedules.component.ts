import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CompanyRoutingModule } from 'src/app/features/company/company-routing.model';
import { Schedule } from 'src/app/shared/models/schedule.model';

@Component({
  standalone: true,
  selector: 'app-recent-schedules',
  templateUrl: './recent-schedules.component.html',
  styleUrls: ['./recent-schedules.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    CompanyRoutingModule
  ]
})
export class RecentSchedulesComponent {
  @Input() loading = false;
  @Input() schedules: Schedule[] = [];
}
