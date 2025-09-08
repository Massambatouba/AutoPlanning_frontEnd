import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { filter, finalize, of, Subscription, tap } from 'rxjs';

import { ScheduleService } from 'src/app/services/schedule.service';
import { AssignmentService } from 'src/app/services/assignment.service';
import {
  AgentTypeConfig,
  Schedule,
  ScheduleAssignment,
  ScheduleAssignmentRequest,
  ScheduleException,
  WeeklyScheduleRule,
} from 'src/app/shared/models/schedule.model';
import { ScheduleComplianceComponent } from '../schedule-compliance/schedule-compliance.component';
import { NgbModal, NgbModalModule, NgbModalRef, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { EmployeeLite } from 'src/app/shared/models/employee.model';
import { SiteEmployeesService } from 'src/app/services/site-employees.service';
import { AssignEmployeeModalComponent } from '../../sites/assign-modal/assign-employee-modal/assign-employee-modal.component';

type MissingItem = {
  agentType: string;
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  needed: number;
  have: number;
  missing: number;
};

@Component({
  standalone: true,
  selector: 'app-schedule-detail',
  templateUrl: './schedule-detail.component.html',
  styleUrls: ['./schedule-detail.component.scss'],
  imports: [
    CommonModule,
    ScheduleComplianceComponent,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NgbModalModule,
    NgbTooltipModule,
    AssignEmployeeModalComponent
  ],
})

export class ScheduleDetailComponent implements OnInit, OnDestroy {

@ViewChild('assignmentModal') assignmentModalTpl!: TemplateRef<any>;
private modalRef?: NgbModalRef;

mode: 'add' | 'edit' = 'add';
editing?: ScheduleAssignment;

missingDetails: Record<string, MissingItem[]> = {};

schedule!: Schedule;
siteId!: number;


exceptions: ScheduleException[] = [];
exceptionsByDay: Record<string, ScheduleException[]> = {};


siteEmployees: EmployeeLite[] = [];
empLoading = false;
empError = '';
showAssign = false;

addForm!: FormGroup;

assignments: ScheduleAssignment[] = [];

siteRules: WeeklyScheduleRule[] = [];

private toastr = inject(ToastrService);

sendingAll = false;

loadingAssignments = false;
geratingAssignments = false;

missingCount: Record<string, number> = {};

error = '';
viewMode: 'week' | 'month' = 'week';
currentWeekStart = new Date();

private pad(n: number) { return String(n).padStart(2, '0'); }
/** formate un Date local en YYYY-MM-DD (sans UTC) */
private formatIsoDate(d: Date): string {
  return `${d.getFullYear()}-${this.pad(d.getMonth()+1)}-${this.pad(d.getDate())}`;
}
/** clé normalisée “YYYY-MM-DD” quel que soit le type (string/Date) renvoyé par l’API */
private key(v: string | Date | null | undefined): string {
  if (!v) return '';
  if (typeof v === 'string') {
    // 1) Essaie de lire un motif a minima (supporte YYYY-M-D aussi)
    const m = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (m) {
      const y = +m[1], mo = +m[2], d = +m[3];
      return `${y}-${this.pad(mo)}-${this.pad(d)}`;
    }
    // 2) Sinon, parse en Date et re-formate
    const d = new Date(v);
    return isNaN(+d) ? '' : this.formatIsoDate(d);
  }
  return this.formatIsoDate(v as Date);
}
private formatIso(v: string | Date): string {
  if (!v) return '';
  if (typeof v === 'string') return v.slice(0, 10); // "YYYY-MM-DD" ou ISO → garde les 10 1ers
  const d = v as Date;
  return `${d.getFullYear()}-${this.pad(d.getMonth()+1)}-${this.pad(d.getDate())}`;
}
/** retourne "YYYY-MM-DD" en heure locale (pas d'UTC) */
private toYmd(d: Date) {
  return `${d.getFullYear()}-${this.pad(d.getMonth()+1)}-${this.pad(d.getDate())}`;
}

/** Lit une date quelle que soit la forme renvoyée par l'API et renvoie "YYYY-MM-DD" */
private dayKeyFromAny(raw: any): string {
  if (!raw) return '';
  if (raw instanceof Date) return this.toYmd(raw);
  if (typeof raw === 'string') {
    // ISO ou "YYYY-M-D..." -> prends les 10 1ers si possible
    const m = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (m) return `${m[1]}-${this.pad(+m[2])}-${this.pad(+m[3])}`;
    const d = new Date(raw);
    if (!isNaN(+d)) return this.toYmd(d);
    return '';
  }
  return '';
}

private getAssignmentDay(a: any): string {
  return this.dayKeyFromAny(a.date ?? a.day ?? a.assignmentDate ?? a.startDate);
}


  /* juste après tes propriétés */
  get loading() {
    return this.loadingSchedule;
  }
  get generatingAssignments() {
    return this.geratingAssignments;
  }

  /* ───── structures d’affichage ───── */
  dateKeys: string[] = [];
  dayNames: Record<string, string> = {};
  employees: { id: number; employeeName: string; totalMin: number }[] = [];
  assignMap: Record<number, Record<string, ScheduleAssignment[]>> = {};
  coverageGap: Record<string, boolean> = {};
  dailyTotalMin: number[] = [];
  monthTotalMin = 0;

  requiredTotalMin = 0;

  get coveragePercent() {
    return this.requiredTotalMin
      ? Math.round((this.monthTotalMin * 100) / this.requiredTotalMin)
      : 0;
  }

  /* ───── état & divers ───── */
  loadingSchedule = false;
  private refreshSub!: Subscription;

  /* ───── palette par type d’agent ───── */
  agentTypeConfig: Record<string, AgentTypeConfig> = {
    ADS: {
      label: 'ADS',
      color: 'text-secondary',
      bgColor: 'bg-secondary',
      borderColor: 'border-secondary',
    },
    SSIAP1: {
      label: 'SSIAP 1',
      color: 'text-info',
      bgColor: 'bg-info',
      borderColor: 'border-info',
    },
    SSIAP2: {
      label: 'SSIAP 2',
      color: 'text-primary',
      bgColor: 'bg-primary',
      borderColor: 'border-primary',
    },
    SSIAP3: {
      label: 'SSIAP 3',
      color: 'text-dark',
      bgColor: 'bg-dark',
      borderColor: 'border-dark',
    },
    CHEF_DE_POSTE: {
      label: 'Chef de poste',
      color: 'text-warning',
      bgColor: 'bg-warning',
      borderColor: 'border-warning',
    },
    CHEF_DE_EQUIPE: {
      label: "Chef d'équipe",
      color: 'text-success',
      bgColor: 'bg-success',
      borderColor: 'border-success',
    },
    RONDE: {
      label: 'Ronde',
      color: 'text-primary',
      bgColor: 'bg-primary',
      borderColor: 'border-primary',
    },
    ASTREINTE: {
      label: 'Astreinte',
      color: 'text-danger',
      bgColor: 'bg-danger',
      borderColor: 'border-danger',
    },
    FORMATION: {
      label: 'Formation',
      color: 'text-info',
      bgColor: 'bg-info',
      borderColor: 'border-info',
    },
  };

  /* ───── ctor / injections ───── */
  constructor(
    private route: ActivatedRoute,
    private scheduleSrv: ScheduleService,
    private assignmentSrv: AssignmentService,
    private modalService: NgbModal,
    private siteEmployeesSrv: SiteEmployeesService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    const schedId = +this.route.snapshot.paramMap.get('id')!;
    this.loadSchedule(schedId);

    /* rechargement après ajout/suppression d’une vacation */
    this.refreshSub = this.assignmentSrv.refresh$
      .pipe(filter(() => !!this.schedule))
      .subscribe(() => this.loadSchedule(this.schedule!.id));

      this.addForm = this.fb.group({
      siteId:     [null, Validators.required],
      employeeId: [null, Validators.required],
      date:       ['',  Validators.required],  // "YYYY-MM-DD"
      shift:      ['MATIN'],
      startTime:  ['', [Validators.required, Validators.pattern(/^([01]\d|2[0-3]):[0-5]\d$/)]],
      endTime:    ['', [Validators.required, Validators.pattern(/^([01]\d|2[0-3]):[0-5]\d$/)]],
      agentType:  ['ADS', Validators.required],
      notes:      ['']
});

}

missingTooltip(day: string): string {
  const items = this.missingDetails[day] ?? [];
  if (!items.length) return 'Couverture OK';
  return items
    .map(i => `${i.missing} × ${i.agentType} (${i.startTime}–${i.endTime})`)
    .join('\n');
}

labelFor(t: string) {
  return this.agentTypeConfig[t]?.label ?? t;
}
badgeClass(t: string) {
  switch (t) {
    case 'ADS': return 'bg-primary';
    case 'CHEF_DE_POSTE': return 'bg-warning text-dark';
    case 'SSIAP1': return 'bg-info text-dark';
    case 'SSIAP2': return 'bg-primary';
    case 'SSIAP3': return 'bg-dark';
    default: return 'bg-secondary';
  }
}


ngOnDestroy(): void {
    this.refreshSub?.unsubscribe();
}

  openAddModal(dayIso: string, empId: number) {
  if (!this.schedule) return;

  this.mode = 'add';
  this.editing = undefined;

  this.addForm.reset({
    siteId:     this.schedule.site?.id ?? this.schedule.siteId ?? null,
    employeeId: empId,
    date:       dayIso,
    shift:      'MATIN',
    startTime:  '',
    endTime:    '',
    agentType:  'ADS',
    notes:      ''
  });

  this.modalRef = this.modalService.open(this.assignmentModalTpl, { backdrop: 'static' });
}

openEditModal(a: ScheduleAssignment, e: MouseEvent) {
  e.stopPropagation();
  this.mode = 'edit';
  this.editing = a;

  this.addForm.reset({
    siteId:     a.siteId,
    employeeId: a.employeeId,
    date:       (typeof a.date === 'string' ? a.date.slice(0,10) : ''),
    shift:      a.shift || 'MATIN',
    startTime:  (a.startTime || '').slice(0,5),
    endTime:    (a.endTime   || '').slice(0,5),
    agentType:  a.agentType,
    notes:      a.notes ?? ''
  });

  this.modalRef = this.modalService.open(this.assignmentModalTpl, { backdrop: 'static' });
}

submitModal() {
  if (!this.schedule || this.addForm.invalid) return;

  // Form value au format attendu par l’API
  const payload = this.addForm.getRawValue() as ScheduleAssignmentRequest & { employeeId: number };

  if (this.mode === 'add') {
    this.assignmentSrv.addAssignment(this.schedule.id, payload).subscribe({
      next: () => { this.modalRef?.close(); this.loadAssignments(); },
      error: (err) => this.toastr.error(err.error?.message || err.message)
    });
  } else if (this.editing) {
    this.assignmentSrv.updateAssignment(this.schedule.id, this.editing.id, payload).subscribe({
      next: () => { this.modalRef?.close(); this.loadAssignments(); },
      error: (err) => this.toastr.error(err.error?.message || err.message)
    });
  }
}

deleteFromModal() {
  if (!this.schedule || !this.editing) return;
  if (!confirm('Supprimer cette vacation ?')) return;

  this.assignmentSrv.deleteAssignment(this.schedule.id, this.editing.id).subscribe({
    next: () => { this.modalRef?.close(); this.loadAssignments(); },
    error: (err) => this.toastr.error(err.error?.message || err.message)
  });
}

closeModal() { this.modalRef?.close(); }


private loadSchedule(id: number): void {
  this.loadingSchedule = true;
  this.error = '';

  this.scheduleSrv.getScheduleById(id)
    .pipe(
      tap(s => {
        this.schedule = s;
        this.siteId = (s as any).siteId ?? (s as any).site?.id;
        console.log('DEBUG schedule:', this.schedule);
        console.log('DEBUG permissions:', this.schedule?.permissions, 'canEdit:', this.schedule?.canEdit,
          'published:', this.schedule?.isPublished, 'sent:', this.schedule?.isSent);

        // ⬇️ NE PLUS LIRE s.assignments (il n'existe plus sur Schedule)
        this.assignments = []; 
      }),
      finalize(() => this.loadingSchedule = false)
    )
    .subscribe({
      next: sched => {
        if (!sched) {
          this.buildMonthGrid();
          return;
        }
        const siteId = sched.site?.id ?? sched.siteId;
        if (!siteId) {
          console.warn('[ScheduleDetail] siteId introuvable dans la réponse', sched);
          this.siteRules = [];
          this.buildMonthGrid();
          return;
        }

        this.scheduleSrv.getWeeklyRules(siteId).subscribe(rules => {
          console.log('[DEBUG] rules reçues :', rules);
          this.siteRules = rules;

          const { start, end } = this.periodRange();

          this.scheduleSrv.getSiteExceptions(this.siteId, start, end).subscribe({
            next: ex => {
              this.exceptions = ex || [];
              // on enchaîne ensuite le chargement des vacations
              this.loadAssignments();
            },
            error: _ => {
              this.exceptions = [];
              this.loadAssignments();
            }
          });

        });
      },
      error: err => {
        console.error(err);
        this.error = err?.message ?? 'Erreur de chargement';
        this.buildMonthGrid();
      }
    });
}

loadSiteEmployees() {
  this.empLoading = true;
  this.empError = '';
  this.siteEmployeesSrv.list(this.siteId).subscribe({
    next: (list) => { this.siteEmployees = list; this.empLoading = false; },
    error: (e) => {
      this.empError = e?.error?.message || `Erreur ${e.status} ${e.statusText || ''}`;
      this.empLoading = false;
    }
  });
}

dayNum(d: string): string {
  // d est une clé "YYYY-MM-DD"
  return d.substring(8, 10);
}
onEmployeeAttached(_emp: EmployeeLite) {
  this.showAssign = false;
  this.loadSiteEmployees();
}

private loadAssignments() {
  if (!this.schedule) return;

  this.loadingAssignments = true;
  this.scheduleSrv.getScheduleAssignments(this.schedule.id).subscribe({
    next: (assignments) => {
      this.assignments = assignments ?? [];
      this.loadingAssignments = false;
      this.buildMonthGrid();              // ⬅️ IMPORTANT
    },
    error: (error) => {
      this.error = error.message;
      this.loadingAssignments = false;
      this.buildMonthGrid();              // (facultatif) pour afficher au moins l’axe
    },
  });

}


  get canEdit(): boolean {
    // si le back renvoie permissions, on respecte
    if (this.schedule?.permissions) return !!this.schedule.permissions.edit;
    // sinon fallback sur canEdit
    return !!this.schedule?.canEdit;
  }

  get canGenerate(): boolean {
    if (this.schedule?.permissions) return !!this.schedule.permissions.generate;
    // fallback logique : peut éditer ET NON publié
    return (
      this.canEdit && !this.schedule?.isPublished && !this.schedule?.isPublished
    );
  }

  get canSendAll(): boolean {
    if (this.schedule?.permissions) return !!this.schedule.permissions.send;
    // fallback logique : peut éditer ET publié ET pas déjà envoyé
    const published = this.schedule?.isPublished ?? this.schedule?.isPublished;
    const sent = this.schedule?.isSent ?? this.schedule?.isSent;
    return this.canEdit && !!published && !sent;
  }

  getCalendarDays() {
    // Retourner les jours selon le mode de vue
    if (this.viewMode === 'week') {
      return this.getWeekDays();
    } else {
      return this.getMonthDays();
    }
  }

  setViewMode(mode: 'week' | 'month') {
    this.viewMode = mode;
  }

  previousWeek() {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7);
  }

  nextWeek() {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7);
  }

  getCurrentWeekLabel(): string {
    const end = new Date(this.currentWeekStart);
    end.setDate(this.currentWeekStart.getDate() + 6);

    return `${this.currentWeekStart.getDate()}/${
      this.currentWeekStart.getMonth() + 1
    } - ${end.getDate()}/${end.getMonth() + 1}`;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      PENDING: 'En attente',
      CONFIRMED: 'Confirmé',
      DECLINED: 'Refusé',
      ASSIGNED: 'Assigné',
    };
    return labels[status] || status;
  }

  editAssignment(assignment: ScheduleAssignment) {
    // TODO: Ouvrir modal d'édition
    console.log('Edit assignment:', assignment);
  }

  deleteAssignment(assignmentId: number) {
    if (!this.schedule) return;

    if (confirm('Êtes-vous sûr de vouloir supprimer cette affectation ?')) {
      this.scheduleSrv
        .deleteAssignment(this.schedule.id, assignmentId)
        .subscribe({
          next: () => {
            this.loadAssignments();
          },
          error: (error) => {
            this.error = error.message;
          },
        });
    }
  }

  getLegendColor(d: string): string {
    return this.coverageGap[d] ? 'legend-indispo' : 'legend-dispo';
  }

  getMissing(d: string): number {
    return this.missingCount[d] ?? 0;
  }

  isCovered(d: string): boolean {
    return (this.missingCount[d] ?? 0) === 0;
  }

  getLegendLabel(d: string): string {
    const need = this.requiredByDay[d] ?? 0; // calcule ça comme tu veux
    const done = this.doneByDay[d] ?? 0;
    return String(Math.max(need - done, 0));
  }

  requiredByDay: Record<string, number> = {};
  doneByDay: Record<string, number> = {};

  addAssignment() {
    // TODO: Ouvrir modal d'ajout
    console.log('Add assignment');
  }

  addAssignmentForDay(dayIso: string) {
    // TODO: Ouvrir modal d'ajout pour une date spécifique
    console.log('Add assignment for date:', dayIso);
  }

  getUniqueEmployeesCount(): number {
    const uniqueEmployees = new Set(this.assignments.map((a) => a.employeeId));
    return uniqueEmployees.size;
  }

  getTotalHours(): number {
    return this.assignments.reduce((total, assignment) => {
      return total + assignment.duration / 60; // Convertir minutes en heures
    }, 0);
  }

  private getWeekDays() {
    const days = [];
    const start = new Date(this.currentWeekStart);

    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      days.push({
        name: this.getDayName(date.getDay()),
        date: date,
      });
    }
    return days;
  }

  private getMonthDays() {
    if (!this.schedule) return [];

    const year = this.schedule.year;
    const month = this.schedule.month;
    const daysInMonth = new Date(year, month, 0).getDate();
    const days = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      days.push({
        name: this.getDayName(date.getDay()),
        date: date,
      });
    }
    return days;
  }

  private getDayName(dayIndex: number): string {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    return days[dayIndex];
  }

generateAssignments() {
  if (!this.schedule) return;
  this.geratingAssignments = true;

  this.scheduleSrv.generateAssignments(this.schedule.id).subscribe({
    next: () => {
      this.loadAssignments();
      this.geratingAssignments = false;
    },
    error: (error) => {
      this.error = error.message;
      this.geratingAssignments = false;
    }
  });
}


  private buildMonthGrid(): void {
    if (!this.schedule) return;

    /* 1) dates du mois -------------------------------------------------- */
    const axis = this.buildDateAxis();
    this.dateKeys = axis.dateKeys;
    this.dayNames = axis.dayNames

    if (this.assignments?.length) {
      const axisSet = new Set(this.dateKeys);
      const hasAnyMatch = this.assignments.some(a => axisSet.has(this.getAssignmentDay(a)));
      if (!hasAnyMatch) {
        const ax2 = this.buildAxisFromAssignments();
        this.dateKeys = ax2.dateKeys;
        this.dayNames = ax2.dayNames;
      }
    }

    /* 2) map employés --------------------------------------------------- */
    const empMap = new Map<number, string>();
    this.assignments.forEach((a) => {
      if (!empMap.has(a.employeeId))
        empMap.set(a.employeeId, a.employeeName ?? `Employé ${a.employeeId}`);
    });

    /* 3) structures vides ---------------------------------------------- */
    this.assignMap = {};
    empMap.forEach((_, id) => {
      this.assignMap[id] = {};
      this.dateKeys.forEach((k) => (this.assignMap[id][k] = []));
    });
    this.dailyTotalMin = Array(this.dateKeys.length).fill(0);
    this.monthTotalMin = 0;
    const empTotals = new Map<number, number>();

    /* 4) injection des vacations --------------------------------------- */
    for (const a of this.assignments) {
      const day = this.getAssignmentDay(a);     // <— utiliser le helper
      if (!day) continue;

      // crée les sous-objets au besoin
      this.assignMap[a.employeeId] ??= {};
      this.assignMap[a.employeeId][day] ??= [];
      this.assignMap[a.employeeId][day].push(a);

      const dur = this.durationMin(a);
      empTotals.set(a.employeeId, (empTotals.get(a.employeeId) || 0) + dur);

      const i = this.dateKeys.indexOf(day);
      if (i >= 0) this.dailyTotalMin[i] += dur;
      this.monthTotalMin += dur;
    }

    console.table(this.assignments.map(a => ({
      emp: a.employeeId,
      raw: (a as any).date ?? (a as any).day ?? (a as any).assignmentDate ?? (a as any).startDate,
      key: this.getAssignmentDay(a),
      inAxis: this.dateKeys.includes(this.getAssignmentDay(a))
    })));

    // -- Prépare exceptionsByDay à partir this.exceptions
this.exceptionsByDay = {};
const { start: pStart, end: pEnd } = this.periodRange();

for (const ex of (this.exceptions || [])) {
  const exStart = this.formatIso((ex as any).startDate || pStart);
  const exEnd   = this.formatIso((ex as any).endDate   || pEnd);
  const allowed = ((ex as any).daysOfWeek && (ex as any).daysOfWeek.length)
    ? (ex as any).daysOfWeek.map((d: string) => this.jsDowFromApi(d))
    : null;

  for (const d of this.dateKeys) {
    if (d < exStart || d > exEnd) continue;
    const js = new Date(d).getDay();
    if (allowed && !allowed.includes(js)) continue;
    (this.exceptionsByDay[d] ??= []).push(ex);
  }
}

    /* ---------- 5. besoins / gaps & total commandé ---------- */
/* ---------- 5. besoins / gaps & total commandé (avec exceptions) ---------- */
this.coverageGap = {};
this.requiredTotalMin = 0;

const dayNameToJSIdx: Record<string, number> = {
  SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4, FRIDAY: 5, SATURDAY: 6,
};

// Besoin "simple" (jour -> agentType -> nombre)
const needMap: { [d: string]: { [t: string]: number } } = {};

// Besoin/Présent "détaillé" (jour+type+créneau)
type Key = string; // `${day}|${agentType}|${start}|${end}`
const neededDetail = new Map<Key, number>();
const haveDetail   = new Map<Key, number>();

// petit helper
const addNeed = (day: string, agentType: string, start: string, end: string, count: number) => {
  if (!count) return;
  needMap[day] ??= {};
  needMap[day][agentType] = (needMap[day][agentType] ?? 0) + count;

  const k: Key = `${day}|${agentType}|${start}|${end}`;
  neededDetail.set(k, (neededDetail.get(k) ?? 0) + count);

  // durée pour KPI "requiredTotalMin"
  const [sh, sm] = (start || '00:00').split(':').map(Number);
  let [eh, em]   = (end   || '00:00').split(':').map(Number);
  let dur = eh * 60 + em - (sh * 60 + sm);
  if (dur <= 0) dur += 24 * 60; // chevauche minuit
  this.requiredTotalMin += dur * count;
};

// --- construit la commande jour par jour (règles + exceptions) ---
for (const day of this.dateKeys) {
  const jsDay = new Date(day).getDay();

  // 1) si fermeture, on saute tout
  const todaysEx = this.exceptionsByDay[day] || [];
  const isClosed = todaysEx.some(e => (e as any).type === 'CLOSE');
  if (isClosed) continue;

  // 2) règles hebdo du jour
  this.siteRules
    .filter(r => dayNameToJSIdx[r.dayOfWeek as keyof typeof dayNameToJSIdx] === jsDay)
    .forEach(r => {
      r.agents.forEach(a => {
        addNeed(day, a.agentType, a.startTime.slice(0,5), a.endTime.slice(0,5), a.requiredCount);
      });
    });

  // 3) exceptions ajoutées ce jour
  todaysEx
    .filter(e => (e as any).type !== 'CLOSE')
    .forEach((e: any) => {
      // on suppose que l’exception contient agentType / startTime / endTime / requiredCount
      addNeed(day, e.agentType, (e.startTime||'').slice(0,5), (e.endTime||'').slice(0,5), e.requiredCount || 1);
    });
}


// 5-b) présent réel (inchangé)
for (const a of this.assignments) {
  const day = this.getAssignmentDay(a);
  if (!day) continue;
  const start = (a.startTime || '').slice(0, 5);
  const end   = (a.endTime   || '').slice(0, 5);
  const k: Key = `${day}|${a.agentType}|${start}|${end}`;
  haveDetail.set(k, (haveDetail.get(k) ?? 0) + 1);

  if (needMap[day] && needMap[day][a.agentType] != null) {
    needMap[day][a.agentType] = Math.max(0, needMap[day][a.agentType] - 1);
  }
}

// 5-c) détails manquants par jour (inchangé)
this.missingDetails = {};
neededDetail.forEach((need, k) => {
  const [day, agentType, start, end] = k.split('|');
  const have = haveDetail.get(k) ?? 0;
  const missing = Math.max(need - have, 0);
  if (missing > 0) {
    this.missingDetails[day] ??= [];
    this.missingDetails[day].push({ agentType, startTime: start, endTime: end, needed: need, have, missing });
  }
});

// 5-d) gaps + total manquant par jour (inchangé)
this.coverageGap = {};
this.missingCount = {};
Object.entries(needMap).forEach(([d, types]) => {
  const totalMissing = Object.values(types).reduce((s, n) => s + n, 0);
  this.missingCount[d] = totalMissing;
  this.coverageGap[d] = totalMissing > 0;
});


    /* 6) tableau final employés ---------------------------------------- */
    this.employees = Array.from(empMap.entries())
      .map(([id, name]) => ({
        id,
        employeeName: name,
        totalMin: empTotals.get(id) || 0,
      }))
      .sort((a, b) => a.employeeName.localeCompare(b.employeeName));
  }

  refreshAssignments() {
    this.loadAssignments();
  }

  durationMin(a: ScheduleAssignment): number {
    const [sh, sm] = a.startTime.split(':').map(Number);
    let [eh, em] = a.endTime.split(':').map(Number);
    let start = sh * 60 + sm,
      end = eh * 60 + em;
    if (end < start) end += 24 * 60; // passe minuit
    return end - start;
  }

  formatHours(min: number) {
    const h = Math.floor(min / 60),
      m = min % 60;
    return m ? `${h}h${m.toString().padStart(2, '0')}` : `${h}h`;
  }
  getMonthName(m?: number): string {
    if (!m) {
      return '';
    }
    return [
      'Janv',
      'Févr',
      'Mars',
      'Avr',
      'Mai',
      'Juin',
      'Juil',
      'Août',
      'Sept',
      'Oct',
      'Nov',
      'Déc',
    ][m - 1];
  }
  getEmployeeInitials(n: string) {
    return n
      .split(' ')
      .map((x) => x[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }
  getAgentTypeStyle(t: string): AgentTypeConfig {
    return (
      this.agentTypeConfig[t] ?? {
        label: t,
        color: 'text-secondary',
        bgColor: 'bg-secondary',
        borderColor: 'border-secondary',
      }
    );
  }

  cellAssignments(empId: number, day: string): ScheduleAssignment[] {
    return this.assignMap[empId]?.[day] ?? [];
  }


  sendScheduleAll() {
    if (!this.schedule) {
      return;
    }
    this.sendingAll = true;

    this.scheduleSrv
      .send(this.schedule.id)
      .pipe(finalize(() => (this.sendingAll = false)))
      .subscribe({
        next: (report) => {
          /* supposons que votre backend renvoie {successCount, failureCount} */
          this.toastr.success(
            `Envoyé : ${report.successCount} OK, ${report.failureCount} erreur(s)`,
            'Plannings envoyés'
          );
        },
        error: (err) =>
          this.toastr.error(err.error ?? err.message, 'Échec d’envoi'),
      });
  }

  getAssignmentsForDay(dayIso: string): ScheduleAssignment[] {
    return this.assignments.filter(a => this.getAssignmentDay(a) === dayIso);
  }



  isGap(day: string) {
    return !!this.coverageGap[day];
  }

  publishSchedule() {
    if (!this.schedule) return;

    this.scheduleSrv.publishSchedule(this.schedule.id).subscribe({
      next: (updatedSchedule) => {
        this.schedule = updatedSchedule;
      },
      error: (error) => {
        this.error = error.message;
      },
    });
  }

/** Construit l’axe des dates selon periodType (MONTH ou RANGE). */
/** Construit l’axe des dates sans UTC (pas de toISOString) */
private buildDateAxis(): { dateKeys: string[]; dayNames: Record<string,string> } {
  const dateKeys: string[] = [];
  const dayNames: Record<string,string> = {};
  if (!this.schedule) return { dateKeys, dayNames };

  if (this.schedule.periodType === 'RANGE' && this.schedule.startDate && this.schedule.endDate) {
    const start = new Date(this.schedule.startDate);
    const end   = new Date(this.schedule.endDate);
    if (!isNaN(+start) && !isNaN(+end) && start <= end) {
      // clone/avance d’1 jour pour éviter les surprises DST/UTC
      for (let d = new Date(start); d <= end; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) {
        const iso = this.formatIsoDate(d);
        dateKeys.push(iso);
        dayNames[iso] = d.toLocaleDateString('fr-FR', { weekday: 'short' });
      }
    }
    return { dateKeys, dayNames };
  }

  // Cas mensuel
  const y = this.schedule.year!;
  const m = this.schedule.month!;
  const nb = new Date(y, m, 0).getDate();     // OK : m est 1..12
  for (let day = 1; day <= nb; day++) {
    const d = new Date(y, m - 1, day);
    const iso = this.formatIsoDate(d);
    dateKeys.push(iso);
    dayNames[iso] = d.toLocaleDateString('fr-FR', { weekday: 'short' });
  }
  return { dateKeys, dayNames };
}

private buildAxisFromAssignments(): { dateKeys: string[]; dayNames: Record<string, string> } {
  const keys = (this.assignments ?? [])
    .map(a => this.getAssignmentDay(a))
    .filter(k => !!k)
    .sort();
  const dateKeys: string[] = [];
  const dayNames: Record<string, string> = {};
  if (!keys.length) return { dateKeys, dayNames };

  const start = new Date(keys[0]);
  const end   = new Date(keys[keys.length - 1]);
  for (let d = new Date(start); d <= end; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) {
    const k = this.toYmd(d);
    dateKeys.push(k);
    dayNames[k] = d.toLocaleDateString('fr-FR', { weekday: 'short' });
  }
  return { dateKeys, dayNames };
}


getPeriodLabel(): string {
  if (!this.schedule) return '';
  if (this.schedule.periodType === 'RANGE' && this.schedule.startDate && this.schedule.endDate) {
    const sd = new Date(this.schedule.startDate);
    const ed = new Date(this.schedule.endDate);
    if (isNaN(+sd) || isNaN(+ed)) return '';
    const fmt = (d:Date) => d.toLocaleDateString('fr-FR', { day:'2-digit', month:'short' });
    const year =
      sd.getFullYear() === ed.getFullYear()
        ? sd.getFullYear().toString()
        : `${sd.getFullYear()}–${ed.getFullYear()}`;
    return `${fmt(sd)} → ${fmt(ed)} ${year}`;
  }
  return `${this.getMonthName(this.schedule.month)} ${this.schedule.year}`;
}


  sendSchedule() {
    if (!this.schedule) return;

    this.scheduleSrv.send(this.schedule.id).subscribe({
      next: (updatedSchedule) => {
        this.schedule = updatedSchedule;
      },
      error: (error) => {
        this.error = error.message;
      },
    });
  }

  private periodRange() {
  if (this.schedule.periodType === 'RANGE' && this.schedule.startDate && this.schedule.endDate) {
    return { start: this.formatIso(this.schedule.startDate), end: this.formatIso(this.schedule.endDate) };
  }
  const y = this.schedule.year!, m = this.schedule.month!;
  const start = `${y}-${this.pad(m)}-01`;
  const end   = `${y}-${this.pad(m)}-${this.pad(new Date(y, m, 0).getDate())}`;
  return { start, end };
}

private jsDowFromApi(dow: string): number {
  // API "SUNDAY..SATURDAY" → JS getDay(): 0=dim..6=sam
  const map: any = { SUNDAY:0, MONDAY:1, TUESDAY:2, WEDNESDAY:3, THURSDAY:4, FRIDAY:5, SATURDAY:6 };
  return map[dow] ?? -1;
}

private dateInRange(d: string, start: string, end: string): boolean {
  return d >= start && d <= end;
}

// Texte tooltip pour la bande exceptions
excTooltip(day: string): string {
  const list = this.exceptionsByDay[day] ?? [];
  if (!list.length) return '';
  return list.map(e => e.type === 'CLOSE'
    ? 'Fermeture'
    : `${e.requiredCount}× ${e.agentType} (${(e.startTime||'').slice(0,5)}–${(e.endTime||'').slice(0,5)})`
  ).join('\n');
}



}
