import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ScheduleService } from 'src/app/services/schedule.service';
import { Schedule } from 'src/app/shared/models/schedule.model';
import { CompanyRoutingModule } from '../../company/company-routing.model';
import { ScheduleRoutingModule } from '../schedule-routing.model';

@Component({
  standalone: true,
  selector: 'app-schedule-list',
  templateUrl: './schedule-list.component.html',
  styleUrls: ['./schedule-list.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    CompanyRoutingModule,
    ScheduleRoutingModule
  ]
})
export class ScheduleListComponent implements OnInit {
  loading = true;
  schedules: Schedule[] = [];
  filteredSchedules: Schedule[] = [];

  // Filters
  searchTerm = '';
  statusFilter = 'all';
  siteFilter = 'all';
  monthFilter = 'all';

  // Mock data for sites (would come from an API in production)
  sites = [
    { id: 1, name: 'Main Site' },
    { id: 2, name: 'Downtown Branch' },
    { id: 3, name: 'Airport Office' }
  ];

  constructor(private scheduleService: ScheduleService) {}

  ngOnInit(): void {
    this.loadSchedules();
  }

  loadSchedules(): void {
    // In a real app, this would be an API call
    setTimeout(() => {
      this.schedules = [
        {
          id: 1,
          companyId: 1,
          siteId: 1,
          name: 'Main Site Schedule',
          month: 4,
          startDate: '2025-03-01',
          endDate:   '2025-03-30',
          status: 'COMPLETED',
          year: 2025,
          isPublished: true,
          isSent: true,
          sentAt: new Date('2025-03-25'),
          completionRate: 100,
          createdAt: new Date('2025-03-20'),
          updatedAt: new Date('2025-03-25')
        },
        {
          id: 2,
          companyId: 1,
          siteId: 2,
          name: 'Downtown Branch',
          month: 4,
          year: 2025,
          startDate: '2025-04-01',
          endDate:   '2025-04-30',
          status: 'COMPLETED',
          isPublished: true,
          isSent: false,
          completionRate: 87,
          createdAt: new Date('2025-04-22'),
          updatedAt: new Date('2025-04-24')
        },
        {
          id: 3,
          companyId: 1,
          siteId: 3,
          name: 'Airport Office',
          month: 1,
          startDate: '2025-01-01',
          endDate:   '2025-01-30',
          status: 'COMPLETED',
          year: 2025,
          isPublished: false,
          isSent: false,
          completionRate: 62,
          createdAt: new Date('2024-12-23'),
          updatedAt: new Date('2025-01-23')
        },
        {
          id: 4,
          companyId: 1,
          siteId: 1,
          name: 'Main Site Schedule',
          month: 3,
          year: 2025,
          isPublished: true,
          startDate: '2025-03-01',
          endDate:   '2025-03-30',
          status: 'COMPLETED',
          isSent: true,
          sentAt: new Date('2025-02-25'),
          completionRate: 100,
          createdAt: new Date('2025-02-20'),
          updatedAt: new Date('2025-02-25')
        },
        {
          id: 5,
          companyId: 1,
          siteId: 2,
          name: 'Downtown Branch',
          month: 3,
          startDate: '2025-03-01',
          endDate:   '2025-03-30',
          status: 'COMPLETED',
          year: 2025,
          isPublished: true,
          isSent: true,
          sentAt: new Date('2025-02-24'),
          completionRate: 100,
          createdAt: new Date('2025-02-15'),
          updatedAt: new Date('2025-02-24')
        }
      ];

      this.filteredSchedules = [...this.schedules];
      this.loading = false;
    }, 1000);
  }

  applyFilters(): void {
    this.filteredSchedules = this.schedules.filter(schedule => {
      // Search term filter
      if (this.searchTerm && !schedule.name.toLowerCase().includes(this.searchTerm.toLowerCase())) {
        return false;
      }

      // Status filter
      if (this.statusFilter !== 'all') {
        if (this.statusFilter === 'published' && !schedule.isPublished) {
          return false;
        }
        if (this.statusFilter === 'draft' && schedule.isPublished) {
          return false;
        }
      }

      // Site filter
      if (this.siteFilter !== 'all' && schedule.siteId !== +this.siteFilter) {
        return false;
      }

      // Month filter
      if (this.monthFilter !== 'all' && schedule.month !== +this.monthFilter) {
        return false;
      }

      return true;
    });
  }

  getMonthName(month: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  }

  getSiteName(siteId: number): string {
    const site = this.sites.find(s => s.id === siteId);
    return site ? site.name : 'Unknown Site';
  }

  sendSchedule(id: number): void {
    // In a real app, this would call the API
    console.log(`Sending schedule ${id}`);
    const scheduleIndex = this.schedules.findIndex(s => s.id === id);
    if (scheduleIndex !== -1) {
      this.schedules[scheduleIndex].isSent = true;
      this.schedules[scheduleIndex].sentAt = new Date();
      this.applyFilters();
    }
  }
}
