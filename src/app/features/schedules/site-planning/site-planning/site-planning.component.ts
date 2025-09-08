// src/app/features/schedule/site-planning/site-planning.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SiteService } from 'src/app/services/site.service';
import { ScheduleService } from 'src/app/services/schedule.service';
import { AssignmentService } from 'src/app/services/assignment.service';
import { Site } from 'src/app/shared/models/site.model';
import { Schedule } from 'src/app/shared/models/schedule.model';

@Component({
  standalone: true,
  selector: 'app-site-planning',
  templateUrl: './site-planning.component.html',
  styleUrls: ['./site-planning.component.scss'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class SitePlanningComponent implements OnInit, OnDestroy {
  sites: Site[] = [];
  siteId!: number;
  month!: number;
  year!: number;

  schedule!: Schedule;
  scheduleId!: number;

  loading = false;
  error = '';

  tableDates: Date[] = [];
  dateKeys: string[] = [];
  employees: { id: number; name: string }[] = [];
  // map[employeeId][dateKey] = AssignmentDTO[]
  map: Record<number, Record<string, any[]>> = {};

  showForm = false;
  editing: { id: number } | null = null;
  form!: FormGroup;

  private sub!: Subscription;

  constructor(
    private fb: FormBuilder,
    private siteSrv: SiteService,
    private schedules: ScheduleService,
    private assignments: AssignmentService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      employeeId: [null, Validators.required],
      siteId:     [null, Validators.required],
      date:       ['',  Validators.required],
      startTime:  ['',  [Validators.required, Validators.pattern(/^([01]\d|2[0-3]):[0-5]\d$/)]],
      endTime:    ['',  [Validators.required, Validators.pattern(/^([01]\d|2[0-3]):[0-5]\d$/)]],
      shift:      ['MATIN', Validators.required],
      agentType:  ['ADS', Validators.required],
      notes:      ['']
    });

    this.siteSrv.getSites().subscribe(s => this.sites = s);

    const now = new Date();
    this.month = now.getMonth() + 1;
    this.year = now.getFullYear();

    // synchro globale
    this.sub = this.assignments.refresh$
      .subscribe(e => { if (e.scheduleId === this.scheduleId) this.load(); });
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  load(): void {
    if (!this.siteId || !this.month || !this.year) return;

    this.loading = true;
    this.error = '';

    this.schedules.list({ siteId: this.siteId, month: this.month, year: this.year })
      .subscribe({
        next: (list) => {
          if (!list.length) { this.loading = false; this.error = 'Aucun planning pour ce site et ce mois.'; return; }

          this.schedule = list[0];
          this.scheduleId = this.schedule.id;

          // dates du mois
          const days = new Date(this.year, this.month, 0).getDate();
          this.tableDates = Array.from({length: days}, (_, i) => new Date(this.year, this.month - 1, i + 1));
          this.dateKeys = this.tableDates.map(d =>
            `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`);

          // vacations
          this.assignments.listBySchedule(this.scheduleId).subscribe({
            next: (assigns) => {
              const empMap = new Map<number, string>();
              assigns.forEach(a => {
                const id   = a.employee?.id ?? a.employeeId;
                const name = a.employee?.fullName ?? a.employeeName ?? `#${id}`;
                empMap.set(id, name);
              });
              this.employees = Array.from(empMap.entries()).map(([id, name]) => ({ id, name })).sort((a,b) => a.name.localeCompare(b.name));

              this.map = {};
              this.employees.forEach(e => {
                this.map[e.id] = {};
                this.dateKeys.forEach(k => this.map[e.id][k] = []);
              });

              assigns.forEach(a => {
                const empId = a.employee?.id ?? a.employeeId;
                const key   = typeof a.date === 'string' ? a.date.slice(0,10) : '';
                if (this.map[empId]?.[key]) this.map[empId][key].push(a);
              });

              // Préremplir le site du formulaire
              this.form.patchValue({ siteId: this.schedule.siteId ?? this.schedule.site?.id ?? null });

              this.loading = false;
            },
            error: (err) => { this.error = err.message; this.loading = false; }
          });
        },
        error: (err) => { this.error = err.message; this.loading = false; }
      });
  }

  cellAdd(empId: number, key: string) {
    this.editing = null;
    this.showForm = true;
    this.form.patchValue({
      employeeId: empId,
      date: key,
      startTime: '',
      endTime: '',
      shift: 'MATIN',
      agentType: 'ADS',
      notes: ''
    });
  }

  clickAssignment(a: any, empId: number, key: string, ev: MouseEvent) {
    ev.stopPropagation();
    this.editing = { id: a.id };
    this.showForm = true;
    this.form.patchValue({
      employeeId: empId,
      date: key,
      startTime: (a.startTime || '').slice(0,5),
      endTime:   (a.endTime   || '').slice(0,5),
      shift: a.shift || 'MATIN',
      agentType: a.agentType || 'ADS',
      notes: a.notes || ''
    });
  }

  submit() {
    if (this.form.invalid) return;

    const fv = this.form.value;

    if (this.editing) {
      this.assignments.updateAssignment(this.scheduleId, this.editing.id, fv).subscribe();
    } else {
      this.assignments.addAssignment(this.scheduleId, fv).subscribe();
    }
    this.showForm = false;
    this.editing = null;
  }

  delete(a: any) {
    if (!confirm('Supprimer cette vacation ?')) return;
    this.assignments.deleteAssignment(this.scheduleId, a.id).subscribe();
  }
}
