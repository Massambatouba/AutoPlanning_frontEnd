import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { filter, finalize, of, Subscription, tap } from 'rxjs';

import { ScheduleService } from 'src/app/services/schedule.service';
import { AssignmentService } from 'src/app/services/assignment.service';
import {
  AgentTypeConfig,
  Schedule,
  ScheduleAssignment,
  WeeklyScheduleRule
} from 'src/app/shared/models/schedule.model';
import { ScheduleComplianceComponent } from '../schedule-compliance/schedule-compliance.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

@Component({
  standalone  : true,
  selector    : 'app-schedule-detail',
  templateUrl : './schedule-detail.component.html',
  styleUrls   : ['./schedule-detail.component.scss'],
  imports     : [
    CommonModule, ScheduleComplianceComponent, FormsModule, ReactiveFormsModule, RouterModule
  ]
})
export class ScheduleDetailComponent implements OnInit, OnDestroy {

  /* ───── données principales ───── */
  schedule?: Schedule;
  assignments!: ScheduleAssignment[];
  siteRules : WeeklyScheduleRule[] = [];

  private toastr = inject(ToastrService);

  sendingAll = false;

  loadingAssignments = false;
  geratingAssignments = false;

  missingCount: Record<string, number> = {};

  error = '';
  viewMode: 'week' | 'month' = 'week';
  currentWeekStart = new Date();

  /* juste après tes propriétés */
get loading()               { return this.loadingSchedule; }
get generatingAssignments()  { return this.geratingAssignments; }


  /* ───── structures d’affichage ───── */
  dateKeys: string[] = [];
  dayNames: Record<string,string> = {};
  employees: {id:number; employeeName:string; totalMin:number}[] = [];
  assignMap : Record<number,Record<string,ScheduleAssignment[]>> = {};
  coverageGap: Record<string,boolean> = {};
  dailyTotalMin: number[] = [];
  monthTotalMin = 0;

  requiredTotalMin = 0;

  get coveragePercent(){
  return this.requiredTotalMin
       ? Math.round(this.monthTotalMin * 100 / this.requiredTotalMin)
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
    borderColor: 'border-secondary'
  },
  SSIAP1: {
    label: 'SSIAP 1',
    color: 'text-info',
    bgColor: 'bg-info',
    borderColor: 'border-info'
  },
  SSIAP2: {
    label: 'SSIAP 2',
    color: 'text-primary',
    bgColor: 'bg-primary',
    borderColor: 'border-primary'
  },
  SSIAP3: {
    label: 'SSIAP 3',
    color: 'text-dark',
    bgColor: 'bg-dark',
    borderColor: 'border-dark'
  },
  CHEF_DE_POSTE: {
    label: 'Chef de poste',
    color: 'text-warning',
    bgColor: 'bg-warning',
    borderColor: 'border-warning'
  },
  CHEF_DE_EQUIPE: {
    label: 'Chef d\'équipe',
    color: 'text-success',
    bgColor: 'bg-success',
    borderColor: 'border-success'
  },
  RONDE: {
    label: 'Ronde',
    color: 'text-primary',
    bgColor: 'bg-primary',
    borderColor: 'border-primary'
  },
  ASTREINTE: {
    label: 'Astreinte',
    color: 'text-danger',
    bgColor: 'bg-danger',
    borderColor: 'border-danger'
  },
  FORMATION: {
    label: 'Formation',
    color: 'text-info',
    bgColor: 'bg-info',
    borderColor: 'border-info'
  }
};


  /* ───── ctor / injections ───── */
  constructor(private route        : ActivatedRoute,
              private scheduleSrv  : ScheduleService,
              private assignmentSrv: AssignmentService,
              private modalService: NgbModal) {}

  ngOnInit(): void {
    const schedId = +this.route.snapshot.paramMap.get('id')!;
    this.loadSchedule(schedId);

    /* rechargement après ajout/suppression d’une vacation */
    this.refreshSub = this.assignmentSrv.refresh$
        .pipe(filter(()=> !!this.schedule))
        .subscribe(() => this.loadSchedule(this.schedule!.id));
  }
  ngOnDestroy(): void { this.refreshSub?.unsubscribe(); }

  private loadSchedule(id: number): void {
    this.loadingSchedule = true;
    this.error = '';

    this.scheduleSrv.getScheduleById(id).pipe(
      tap(s => {
        this.schedule    = s;
        console.log('DEBUG schedule:', this.schedule);
        console.log('DEBUG permissions:', this.schedule?.permissions, 'canEdit:', this.schedule?.canEdit,
            'published:', this.schedule?.isPublished, 'sent:', this.schedule?.isSent);
        this.assignments = s.assignments ?? [];
      }),
      finalize(()=> this.loadingSchedule = false)
    ).subscribe({
      next: sched => {
        if (!sched) { this.buildMonthGrid(); return; }

        const siteId = sched.site?.id ?? sched.siteId;
        console.log("Id du site : ", siteId)
        if (!siteId) {
          console.warn('[ScheduleDetail] siteId introuvable dans la réponse', sched);
          this.siteRules = [];
          this.buildMonthGrid();
          return;
        }

        this.scheduleSrv.getWeeklyRules(siteId).subscribe(rules => {
          console.log('[DEBUG] rules reçues :', rules);
          this.siteRules = rules;
          this.buildMonthGrid();
        });
      },
      error: err => {
        console.error(err);
        this.error = err?.message ?? 'Erreur de chargement';
        this.buildMonthGrid();
      }
    });
  }

  private loadAssignments() {
    if (!this.schedule) return;

    this.loadingAssignments = true;
    this.scheduleSrv.getScheduleAssignments(this.schedule.id)
      .subscribe({
        next: (assignments) => {
          this.assignments = assignments;
          this.loadingAssignments = false;
        },
        error: (error) => {
          this.error = error.message;
          this.loadingAssignments = false;
        }
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
  return this.canEdit && !this.schedule?.isPublished && !this.schedule?.isPublished;
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

    return `${this.currentWeekStart.getDate()}/${this.currentWeekStart.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1}`;
  }



  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'PENDING': 'En attente',
      'CONFIRMED': 'Confirmé',
      'DECLINED': 'Refusé',
      'ASSIGNED': 'Assigné'
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
      this.scheduleSrv.deleteAssignment(this.schedule.id, assignmentId)
        .subscribe({
          next: () => {
            this.loadAssignments();
          },
          error: (error) => {
            this.error = error.message;
          }
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
  const need = this.requiredByDay[d] ?? 0;   // calcule ça comme tu veux
  const done = this.doneByDay[d] ?? 0;
  return String(Math.max(need - done, 0));
}

requiredByDay: Record<string, number> = {};
doneByDay:     Record<string, number> = {};

  addAssignment() {
    // TODO: Ouvrir modal d'ajout
    console.log('Add assignment');
  }

  addAssignmentForDay(dayIso: string) {
    // TODO: Ouvrir modal d'ajout pour une date spécifique
    console.log('Add assignment for date:', dayIso);
  }

  getUniqueEmployeesCount(): number {
    const uniqueEmployees = new Set(this.assignments.map(a => a.employeeId));
    return uniqueEmployees.size;
  }

  getTotalHours(): number {
    return this.assignments.reduce((total, assignment) => {
      return total + (assignment.duration / 60); // Convertir minutes en heures
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
        date: date
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
        date: date
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
    this.scheduleSrv.generateAssignments(this.schedule.id)
      .subscribe({
        next: (updatedSchedule) => {
          this.schedule = updatedSchedule;
          this.loadAssignments(); // Recharger les affectations
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
    const m = this.schedule.month, y = this.schedule.year;
    const nbDays = new Date(y, m, 0).getDate();
    this.dateKeys = [];
    this.dayNames = {};
    for (let d=1; d<=nbDays; d++){
      const iso = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      this.dateKeys.push(iso);
      this.dayNames[iso] = new Date(y, m-1, d)
          .toLocaleDateString('fr-FR', {weekday:'short'});
    }

    /* 2) map employés --------------------------------------------------- */
    const empMap = new Map<number,string>();
    this.assignments.forEach(a=>{
      if (!empMap.has(a.employeeId))
          empMap.set(a.employeeId, a.employeeName ?? `Employé ${a.employeeId}`);
    });

    /* 3) structures vides ---------------------------------------------- */
    this.assignMap = {};
    empMap.forEach((_,id)=>{
      this.assignMap[id] = {};
      this.dateKeys.forEach(k=> this.assignMap[id][k]=[]);
    });
    this.dailyTotalMin = Array(this.dateKeys.length).fill(0);
    this.monthTotalMin = 0;
    const empTotals = new Map<number,number>();

    /* 4) injection des vacations --------------------------------------- */
    for (const a of this.assignments) {
      const day = typeof a.date === 'string' ? a.date
                : (a.date as any as Date).toISOString().substring(0,10);

      this.assignMap[a.employeeId]?.[day]?.push(a);

      const dur = this.durationMin(a);
      empTotals.set(a.employeeId,(empTotals.get(a.employeeId)||0)+dur);

      const i = this.dateKeys.indexOf(day);
      if (i>=0) this.dailyTotalMin[i]+=dur;
      this.monthTotalMin += dur;
    }

/* ---------- 5. besoins / gaps & total commandé ---------- */
this.coverageGap      = {};
this.requiredTotalMin = 0;

const dayNameToJSIdx: Record<string, number> = {
  SUNDAY:0, MONDAY:1, TUESDAY:2, WEDNESDAY:3,
  THURSDAY:4, FRIDAY:5, SATURDAY:6
};

const needMap: {[d:string]: {[t:string]: number}} = {};

this.siteRules.forEach(rule => {

  const ruleJSday = dayNameToJSIdx[rule.dayOfWeek as keyof typeof dayNameToJSIdx];

  this.dateKeys
    .filter(d => new Date(d).getDay() === ruleJSday)
    .forEach(d => {

      rule.agents.forEach(a => {

        /* ----------------- besoin du jour ---------------- */
        needMap[d] ??= {};
        needMap[d][a.agentType] =
          (needMap[d][a.agentType] ?? 0) + a.requiredCount;

        /* -------- accumulateur GLOBAL “commandé” -------- */
        const [sh, sm] = a.startTime.split(':').map(Number);
        let  [eh, em] = a.endTime  .split(':').map(Number);
        let dur = (eh*60 + em) - (sh*60 + sm);
        if (dur <= 0) dur += 24*60;            // passe minuit
        this.requiredTotalMin += dur * a.requiredCount;
      });
    });
});


// 5-b) décrémente avec les vacations réelles ---------------------------
for (const a of this.assignments){
  const day = typeof a.date==='string'
            ? a.date
            : (a.date as Date).toISOString().substring(0,10);

  if (needMap[day]?.[a.agentType] > 0){
      needMap[day][a.agentType]--;
  }
}

// 5-c) marque les gaps --------------------------------------------------
Object.entries(needMap).forEach(([d, types])=>{
  this.coverageGap[d] = Object.values(types).some(v=>v>0);
});

// 5-d) tableau des manquants (pour l'affichage)
this.missingCount = {};
Object.entries(needMap).forEach(([d, types]) => {
  // somme des manquants pour ce jour
  const totalMissing = Object.values(types).reduce((s, n) => s + n, 0);
  this.missingCount[d] = totalMissing;
});


    /* ---------- 5-bis. total minutes demandées ---------- */



    /* 6) tableau final employés ---------------------------------------- */
    this.employees = Array.from(empMap.entries())
      .map(([id,name])=>({id, employeeName:name, totalMin: empTotals.get(id)||0}))
      .sort((a,b)=> a.employeeName.localeCompare(b.employeeName));
  }

  refreshAssignments() {
    this.loadAssignments();
  }

  durationMin(a: ScheduleAssignment): number {
    const [sh,sm] = a.startTime.split(':').map(Number);
    let  [eh,em] = a.endTime.split(':').map(Number);
    let start = sh*60+sm, end = eh*60+em;
    if (end<start) end += 24*60;          // passe minuit
    return end-start;
  }

  formatHours(min:number){
    const h=Math.floor(min/60), m=min%60;
    return m ? `${h}h${m.toString().padStart(2,'0')}` : `${h}h`;
  }
  getMonthName(m?:number): string {
    if (!m) { return ''; }
    return ['Janv','Févr','Mars','Avr','Mai','Juin',
            'Juil','Août','Sept','Oct','Nov','Déc'][m-1];
  }
  getEmployeeInitials(n:string){
    return n.split(' ').map(x=>x[0]).join('').substring(0,2).toUpperCase();
  }
  getAgentTypeStyle(t:string):AgentTypeConfig{
    return this.agentTypeConfig[t] ??
           {label:t,color:'text-secondary',bgColor:'bg-secondary',
                     borderColor:'border-secondary'};
  }



  sendScheduleAll() {
    if (!this.schedule) { return; }
    this.sendingAll = true;

    this.scheduleSrv.send(this.schedule.id)
      .pipe(finalize(() => this.sendingAll = false))
      .subscribe({
        next : (report) => {
          /* supposons que votre backend renvoie {successCount, failureCount} */
          this.toastr.success(
            `Envoyé : ${report.successCount} OK, ${report.failureCount} erreur(s)`,
            'Plannings envoyés'
          );
        },
        error: (err)   =>
          this.toastr.error(err.error ?? err.message, 'Échec d’envoi')
      });
  }



getAssignmentsForDay(dayIso: string): ScheduleAssignment[] {
  return this.assignments.filter(a =>
    (typeof a.date === 'string'
        ? a.date
        : (a.date as Date).toISOString().substring(0, 10)
    ) === dayIso
  );
}
  isGap(day:string){ return !!this.coverageGap[day]; }


  publishSchedule() {
    if (!this.schedule) return;

    this.scheduleSrv.publishSchedule(this.schedule.id)
      .subscribe({
        next: (updatedSchedule) => {
          this.schedule = updatedSchedule;
        },
        error: (error) => {
          this.error = error.message;
        }
      });
  }

sendSchedule() {
    if (!this.schedule) return;

    this.scheduleSrv.send(this.schedule.id)
      .subscribe({
        next: (updatedSchedule) => {
          this.schedule = updatedSchedule;
        },
        error: (error) => {
          this.error = error.message;
        }
      });
}

  openAddModal(day:string, empId:number) {/* TODO */}
  openEditModal(a:ScheduleAssignment,e:MouseEvent){ e.stopPropagation(); }
}
