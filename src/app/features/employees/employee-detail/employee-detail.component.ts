import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { firstValueFrom, Subscription } from 'rxjs';

import { EmployeeService } from 'src/app/services/employee.service';
import { CompanyService } from 'src/app/services/company.service';
import { AssignmentService } from 'src/app/services/assignment.service';
import { ScheduleService } from 'src/app/services/schedule.service';

import {
  Employee,
  EmployeePlanningDTO,
  EmployeeAssignmentDTO
} from 'src/app/shared/models/employee.model';
import { Company } from 'src/app/shared/models/company.model';
import { EmployeeRoutingModule } from '../employee-routing.model';
import { CompanyRoutingModule } from '../../company/company-routing.module';
import { AgentTypeAbbreviationPipe } from 'src/app/pipes/agent-type-abbreviation.pipe';
import { AbsenceTypeAbbreviationPipe } from 'src/app/pipes/absence-type-abbreviation.pipe';
import { Site } from 'src/app/shared/models/site.model';
import { ScheduleAssignmentRequest } from 'src/app/shared/models/schedule.model';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { EmployeeMonthlyPlanningDTO, EmployeeMonthlySummary } from 'src/app/shared/models/employee-planning-agg.model';

@Component({
  standalone: true,
  selector: 'app-employee-detail',
  templateUrl: './employee-detail.component.html',
  styleUrls: ['./employee-detail.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    CompanyRoutingModule,
    EmployeeRoutingModule,
    AgentTypeAbbreviationPipe,
    AbsenceTypeAbbreviationPipe
  ]
})
export class EmployeeDetailComponent implements OnInit, OnDestroy {
  employee: Employee | null = null;
  loading = true;
  allSites: Site[] = [];
  viewMode: 'classic' | 'aggegated' = 'classic';

  private siteIdByName = new Map<string, number>();

  // peut être un planning classique (1 schedule) ou agrégé (multi-sites)
  employeePlanning: EmployeePlanningDTO | EmployeeMonthlyPlanningDTO | null = null;

  error = '';
  // Schedule utilisé UNIQUEMENT pour le mode classique (envoi au salarié)
  scheduleId: number | null = null;

  // mapping siteId -> scheduleId pour le mode agrégé
  private scheduleIdBySiteId = new Map<number, number>();

  editingAssignment: EmployeeAssignmentDTO | null = null;

  @ViewChild('assignmentModal') assignmentModal!: TemplateRef<any>;
  private modalRef?: NgbModalRef | null = null;

  mode: 'none' | 'add' | 'delete' | 'edit' = 'none';
  private sub?: Subscription;

  sending = false;

  selectedDateKey: string = '';
  selectedSiteName: string = '';

  months: EmployeeMonthlySummary[] = [];
  selectedMonth = { month: new Date().getMonth() + 1, year: new Date().getFullYear() };

  showAddForm = false;
  addForm!: FormGroup;

  totalOrdinaryMin = 0;   // heures semaine hors nuit
  totalNightMin = 0;      // heures de nuit (21h–5h)
  totalSundayMin = 0;     // heures dominicales (dimanches)
  totalHolidayMin = 0;    // heures jours fériés officiels
  dailyTotalMin: number[] = [];

  selectedAssignment: EmployeeAssignmentDTO | null = null;

  companyLogoUrl: string | null = null;
  printMode = false;

  // --- Type guards ---
  private isClassic(p: any): p is EmployeePlanningDTO {
    return !!p && 'scheduleId' in p;
  }
  private reloadCurrent() {
    this.loadMonth(this.planningMonth, this.planningYear);
  }
  private isAggregated(p: any): p is EmployeeMonthlyPlanningDTO {
    return !!p && 'schedules' in p && Array.isArray(p.schedules);
  }

  // Axe calendrier (mois/année en cours)
  planningMonth: number = 0; // 1..12
  planningYear: number = 0;  // ex. 2025

  // Grille planning
  tableDates: Date[] = [];
  tableDateKeys: string[] = [];
  dayInitials: string[] = [];
  siteList: string[] = [];
  assignmentsMap: {
    [siteName: string]: { [dateKey: string]: EmployeeAssignmentDTO[] };
  } = {};

  holidayKeys: Set<string> = new Set<string>();

  contractTypes = {
    'FULL_TIME': 'Temps plein',
    'PART_TIME': 'Temps partiel',
    'TEMPORARY': 'Temporaire',
    'CONTRACT': 'Contrat'
  };

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private scheduleSrv: ScheduleService,
    private companyService: CompanyService,
    private modalService: NgbModal,
    private assignmentService: AssignmentService
  ) {}

  ngOnInit(): void {
    // 1) mode impression ?
    this.printMode = this.route.snapshot.data['printMode'] === true;

    // 2) si print : récupère ?schedule=
    if (this.printMode) {
      const q = this.route.snapshot.queryParamMap.get('schedule');
      this.scheduleId = q ? Number(q) : null;
    }

    // 3) charge employé
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.initAddForm();
    this.loadEmployee(id);

    // 4) imprime quand les données sont prêtes
    if (this.printMode) {
      setTimeout(() => window.print(), 1000);
    }

    // refresh via bus cross-écran (ajout/suppression)
    this.sub = this.assignmentService.refresh$
      .subscribe(() => this.loadPlanning());
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  // --------- Chargements ----------

  loadMonths(year = this.selectedMonth.year) {
    if (!this.employee) return;
    this.employeeService
      .listMonthlyPlanningSummaries(this.employee.id, year)
      .subscribe(list => this.months = list.sort((a, b) => a.month - b.month));
  }
  loadMonth(m: number, y: number) {
    if (this.viewMode === 'classic') {
      this.loadClassicPlanning(m, y);
    } else {
      this.loadAggregatedPlanning(m, y);
    }
  }
   
  private loadClassicPlanning(m: number, y: number) {
    if (!this.employee) return;
    this.planningMonth = m;
    this.planningYear  = y;

    // jours fériés pour l’année demandée
    this.holidayKeys = new Set(this.getFrenchHolidays(y));

    this.employeeService
      .getMonthlyPlanning(this.employee.id, m, y)
      .subscribe({
        next: (data) => {
          this.employeePlanning = data;
          this.scheduleId = this.isClassic(data) ? data.scheduleId : null;
          this.scheduleIdBySiteId.clear(); // pas utile en classique
          this.prepareTable();
          if (this.printMode) window.print();
        },
        error: (err) => console.error('Erreur chargement planning (classique)', err)
      });
  }


  loadAggregatedPlanning(m: number, y: number) {
    if (!this.employee) return;

    this.planningMonth = m;
    this.planningYear  = y;
    this.selectedMonth = { month: m, year: y };

    this.holidayKeys = new Set(this.getFrenchHolidays(y));

    this.employeeService
      .getAggregatedMonthlyPlanning(this.employee.id, m, y)
      .subscribe(dto => {
        this.employeePlanning = dto;

        this.scheduleIdBySiteId =
          new Map(dto.schedules.map(s => [s.siteId, s.scheduleId]));

        this.scheduleId = null; // pas d’envoi en mode agrégé
        this.prepareTable();
      });
  }

  private loadEmployee(id: number): void {
    this.employeeService.getEmployeeById(id).subscribe({
      next: (employee) => {
        this.employee = employee;

        if (employee.companyId) {
          this.companyService.getMyCompany().subscribe({
            next: (company: Company) => {
              this.allSites = company.sites ?? [];
              this.companyLogoUrl = company.logoUrl ?? null;
            },
            error: (err) => console.error('Impossible de charger la compagnie', err)
          });
        }

        this.loading = false;

        // charge le mois courant (classique par défaut)
        const now = new Date();
        this.loadClassicPlanning(now.getMonth() + 1, now.getFullYear());

        // charge les “pastilles” de mois de l’année sélectionnée
        this.loadMonths(this.selectedMonth.year);
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
      }
    });
  }


  onYearChange(y: number) {
    this.selectedMonth.year = +y;
    this.loadMonths(this.selectedMonth.year);
  }
  monthName(n: number) {
    return ['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'][n-1] || '';
  }

  loadPlanning(): void {
    if (!this.employee) return;

    // mois/année courants
    const now = new Date();
    this.planningMonth = now.getMonth() + 1;
    this.planningYear = now.getFullYear();

    // jours fériés FR de l'année
    this.holidayKeys = new Set(this.getFrenchHolidays(this.planningYear));

    // ici on charge la version "classique" (un seul schedule)
    this.employeeService
      .getMonthlyPlanning(this.employee.id, this.planningMonth, this.planningYear)
      .subscribe({
        next: (data) => {
          this.employeePlanning = data;

          // en mode classique, on a bien un scheduleId global
          this.scheduleId = this.isClassic(data) ? data.scheduleId : null;

          // reset mapping (pas utile en mode classique)
          this.scheduleIdBySiteId.clear();

          this.prepareTable();
          if (this.printMode) window.print();
        },
        error: (err) => {
          console.error('Erreur chargement planning', err);
        }
      });
  }

  // --------- Utilitaires de type / mapping ----------

private getScheduleIdForSiteId(siteId?: number | null): number | undefined {
  if (!this.employeePlanning) return undefined;
  if (this.isClassic(this.employeePlanning)) return this.employeePlanning.scheduleId;
  if (this.isAggregated(this.employeePlanning) && siteId != null) {
    return this.scheduleIdBySiteId.get(siteId);
  }
  return undefined;
}

  getSiteByName(name?: string): Site | undefined {
    if (!name) return undefined;
    return this.allSites?.find(s => s.name === name);
  }

  // --------- Actions haut de page ----------

  sendToEmployee(empId: number) {
    // on autorise uniquement en mode classique (un seul scheduleId)
    if (!this.scheduleId) {
      alert('Envoi indisponible : ce mois regroupe plusieurs plannings (ou planning non chargé).');
      return;
    }

    this.sending = true;

    this.scheduleSrv
      .sendScheduleToEmployee(this.scheduleId, empId)
      .subscribe({
        next: () => {
          this.sending = false;
          alert('Planning envoyé ✔︎');
        },
        error: err => {
          this.sending = false;
          alert('Erreur d’envoi : ' + (err.error?.message || err.message));
        }
      });
  }

  toggleEmployeeStatus(): void {
    if (!this.employee) return;
    this.employeeService.toggleEmployeeStatus(this.employee.id).subscribe({
      next: (updatedEmployee) => {
        this.employee = updatedEmployee;
      },
      error: (error) => {
        this.error = error.message;
      }
    });
  }

  // --------- Modale Add/Edit ----------

  private initAddForm(): void {
    this.addForm = this.fb.group({
      siteId:    [null, Validators.required],
      date:      ['',  Validators.required],
      shift:     ['MATIN', Validators.required],
      startTime: ['',  [Validators.required, Validators.pattern(/^([01]\d|2[0-3]):[0-5]\d$/)]],
      endTime:   ['',  [Validators.required, Validators.pattern(/^([01]\d|2[0-3]):[0-5]\d$/)]],
      agentType: ['ADS', Validators.required],
      notes:     [''],
      employeeId:[null, Validators.required],
    });
  }

  cellClicked(siteName: string, dateKey: string) {
    if (!this.employee || !this.employeePlanning) return;

    const site = this.getSiteByName(siteName);

    this.mode = 'add';
    this.editingAssignment = null;

    this.addForm.reset({
      siteId:    site?.id ?? null,
      date:      dateKey,
      shift:     'MATIN',
      startTime: '',
      endTime:   '',
      agentType: 'ADS',
      notes:     '',
      employeeId: this.employee.id
    });

    this.openModal();
  }

  assignmentClicked(a: EmployeeAssignmentDTO, dateKey: string, ev: MouseEvent) {
    ev.stopPropagation();
    if (!this.employee?.id) return;

    if (a.isAbsence) {
      alert('Cette entrée est une absence ; modification directe désactivée ici.');
      return;
    }

    const site = this.getSiteByName(a.siteName);

    this.mode = 'edit';
    this.editingAssignment = a;

    this.addForm.reset({
      siteId:    site?.id ?? null,
      date:      dateKey,
      shift:     a.shift || 'MATIN',
      startTime: a.startTime?.slice(0,5) ?? '',
      endTime:   a.endTime?.slice(0,5) ?? '',
      agentType: a.agentType ?? 'ADS',
      notes:     a.notes ?? '',
      employeeId: this.employee.id
    });

    this.openModal();
  }

  private openModal() {
    this.modalRef = this.modalService.open(this.assignmentModal, {
      centered: true,
      backdrop: 'static',
      size: 'lg'
    });
  }

  closeModal() {
    this.modalRef?.close();
    this.modalRef = null;
  }

async submitModal() {
  if (!this.employeePlanning || !this.employee?.id) return;
  if (this.addForm.invalid) return;

  const fv = this.addForm.value as ScheduleAssignmentRequest;
  const siteId = Number(fv.siteId);

  let scheduleId = this.getScheduleIdForSiteId(siteId);

  // 🔁 fallback : créer/rafraîchir si absent
  if (!scheduleId) {
    try {
      const req = {
        siteId,
        periodType: 'MONTH',
        month: this.planningMonth,
        year: this.planningYear
      } as any; // interface de ton backend

      const created = await firstValueFrom(this.scheduleSrv.createOrRefresh(req));
      scheduleId = created.id;

      // mets à jour le mapping
      if (this.isAggregated(this.employeePlanning)) {
        this.scheduleIdBySiteId.set(siteId, scheduleId);
      } else {
        this.scheduleId = scheduleId;
      }
    } catch (e: any) {
      alert('Planning introuvable pour ce site/mois et impossible de le créer.\n' +
            (e?.error?.message || e?.message || ''));
      return;
    }
  }

  const payload: ScheduleAssignmentRequest = {
    siteId,
    employeeId: this.employee.id,
    date:       fv.date,
    startTime:  fv.startTime,
    endTime:    fv.endTime,
    shift:      fv.shift || null as any,
    agentType:  fv.agentType || null as any,
    notes:      fv.notes || null as any
  };

  if (this.mode === 'add') {
    this.assignmentService.addAssignment(scheduleId!, payload).subscribe({
      next: () => { this.closeModal(); this.loadPlanning(); },
      error: (err) => alert('Erreur création : ' + (err.error?.message || err.message))
    });
  } else if (this.mode === 'edit' && this.editingAssignment) {
    this.assignmentService.updateAssignment(scheduleId!, this.editingAssignment.id, payload).subscribe({
      next: () => { this.closeModal(); this.loadPlanning(); },
      error: (err) => alert('Erreur modification : ' + (err.error?.message || err.message))
    });
  }
}


  deleteFromModal() {
    if (!this.employeePlanning || !this.editingAssignment) return;

    const site = this.getSiteByName(this.editingAssignment.siteName);
    const scheduleId = this.getScheduleIdForSiteId(site?.id);
    if (!scheduleId) { alert('Planning introuvable pour ce site/mois.'); return; }
    if (!confirm('Supprimer cette vacation ?')) return;

    this.assignmentService.deleteAssignment(scheduleId, this.editingAssignment.id).subscribe({
      next: () => { this.closeModal(); this.loadPlanning(); },
      error: (err) => alert('Erreur suppression : ' + (err.error?.message || err.message))
    });
  }

  // --------- Anciennes méthodes overlay (si utilisées ailleurs) ----------

  createAssignment(formValue: any) {
    // détermine le scheduleId à partir du site choisi
    const scheduleId = this.getScheduleIdForSiteId(Number(formValue.siteId));
    if (!scheduleId) {
      console.error('❌ Planning ID manquant');
      alert('Impossible de créer : planning non chargé.');
      return;
    }

    const payload: ScheduleAssignmentRequest = {
      siteId:     Number(formValue.siteId),
      employeeId: this.employee!.id,
      date:       formValue.date,
      startTime:  formValue.startTime,
      endTime:    formValue.endTime,
      agentType:  formValue.agentType,
      notes:      formValue.notes || null,
      shift:      formValue.shift || null,
    };

    this.assignmentService.addAssignment(scheduleId, payload).subscribe({
      next: () => this.loadPlanning(),
      error: (err) => console.error('Erreur lors de la création :', err)
    });
  }

  updateAssignment(id: number, formValue: any) {
    const scheduleId = this.getScheduleIdForSiteId(Number(formValue.siteId));
    if (!scheduleId || !this.employee) {
      alert('Impossible de modifier : planning ou employé manquant.');
      return;
    }

    const payload: ScheduleAssignmentRequest = {
      siteId:     Number(formValue.siteId),
      employeeId: this.employee.id,
      date:       formValue.date,
      startTime:  formValue.startTime,
      endTime:    formValue.endTime,
      agentType:  formValue.agentType,
      notes:      formValue.notes || null,
      shift:      formValue.shift || null,
    };

    this.assignmentService.updateAssignment(scheduleId, id, payload).subscribe({
      next: () => this.loadPlanning(),
      error: (err) => alert('Erreur modification : ' + (err.error?.message || err.message))
    });
  }

  onAddAssignment() {
    if (!this.employee) return;
    const formValue = this.addForm.value;
    const payload = { ...formValue, employeeId: this.employee.id };

    if (this.editingAssignment) {
      this.updateAssignment(this.editingAssignment.id, payload);
    } else {
      this.createAssignment(payload);
    }

    this.showAddForm = false;
    this.editingAssignment = null;
  }

  // --------- Affichages / calculs ----------

  currentMonthFullName(): string {
    const date = new Date(this.planningYear, this.planningMonth - 1, 1);
    return date.toLocaleString('fr-FR', { month: 'long' });
  }

  get currentYear(): number {
    return this.planningYear;
  }

  isWeekend(d: Date): boolean {
    const dayNum = d.getDay();
    return dayNum === 0 || dayNum === 6;
  }

  isHoliday(dateKey: string): boolean {
    return this.holidayKeys.has(dateKey);
  }

  private prepareTable(): void {
    if (!this.employeePlanning) return;

    // 1) Jours du mois
    const daysInMonth = new Date(this.planningYear, this.planningMonth, 0).getDate();
    this.tableDates = [];
    this.tableDateKeys = [];
    for (let d = 1; d <= daysInMonth; d++) {
      this.tableDates.push(new Date(this.planningYear, this.planningMonth - 1, d));
      const mm = String(this.planningMonth).padStart(2,'0');
      const dd = String(d).padStart(2,'0');
      this.tableDateKeys.push(`${this.planningYear}-${mm}-${dd}`);
    }

    // 2) Initiales des jours
    this.dayInitials = this.tableDates.map(date =>
      date.toLocaleDateString('fr-FR',{weekday:'long'}).charAt(0).toUpperCase()
    );

    // 3) Liste des sites (à partir du calendrier)
    const sites = new Set<string>();
    Object.values(this.employeePlanning.calendar).forEach(arr =>
      arr.forEach(a => sites.add(a.siteName))
    );
    this.siteList = Array.from(sites).sort();

    // 4) assignmentsMap[site][dateKey]
    this.assignmentsMap = {};
    this.siteList.forEach(site => {
      this.assignmentsMap[site] = {};
      this.tableDateKeys.forEach(key => {
        const allOnDate = this.employeePlanning!.calendar[key] || [];
        this.assignmentsMap[site][key] = allOnDate.filter(a => a.siteName === site);
      });
    });

    // 5) Totaux
    this.computeSummary();
    this.computeDailyTotals();
  }

  private computeSummary(): void {
    this.totalOrdinaryMin = 0;
    this.totalNightMin = 0;
    this.totalSundayMin = 0;
    this.totalHolidayMin = 0;

    this.siteList.forEach(siteName => {
      this.tableDateKeys.forEach((dateKey, idx) => {
        const d = this.tableDates[idx];
        const isSun = d.getDay() === 0;  // 0 = dimanche
        const isHol = this.isHoliday(dateKey);

        this.assignmentsMap[siteName][dateKey].forEach(a => {
          if (a.isAbsence || a.absence || !a.startTime || !a.endTime) return;

          const [sh, sm] = a.startTime.split(':').map(Number);
          let [eh, em] = a.endTime.split(':').map(Number);
          let startMin = sh * 60 + sm;
          let endMin   = eh * 60 + em;
          if (endMin < startMin) endMin += 24 * 60;
          const duration = endMin - startMin;

          // nuit (21h–24h) + (0h–5h)
          let night = 0;
          const startN1 = 21*60, endN1 = 24*60;
          night += Math.max(0, Math.min(endMin, endN1) - Math.max(startMin, startN1));
          const startN2 = 24*60, endN2 = 30*60;
          night += Math.max(0, Math.min(endMin, endN2) - Math.max(startMin, startN2));

          if (isSun) {
            this.totalSundayMin += duration;
          } else if (isHol) {
            this.totalHolidayMin += duration;
          } else {
            this.totalOrdinaryMin += (duration - night);
          }
          this.totalNightMin += night;
        });
      });
    });
  }

  private computeDailyTotals(): void {
    this.dailyTotalMin = this.tableDateKeys.map(_ => 0);

    this.siteList.forEach(siteName => {
      this.tableDateKeys.forEach((dateKey, idx) => {
        const assigns = this.assignmentsMap[siteName][dateKey] || [];
        assigns.forEach(a => {
          if (a.isAbsence || a.absence || !a.startTime || !a.endTime) return;

          const [sh, sm] = a.startTime.split(':').map(Number);
          let [eh, em] = a.endTime.split(':').map(Number);
          let startMin = sh * 60 + sm;
          let endMin   = eh * 60 + em;
          if (endMin < startMin) endMin += 24*60;
          this.dailyTotalMin[idx] += endMin - startMin;
        });
      });
    });
  }

  formatMinutesToHours(mins: number): string {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m ? `${h}h${m.toString().padStart(2, '0')}` : `${h}h`;
  }

  getDuration(a: EmployeeAssignmentDTO): string {
    if (a.isAbsence || a.absence || !a.startTime || !a.endTime) return '';
    const [sh, sm] = a.startTime.split(':').map(Number);
    let [eh, em] = a.endTime.split(':').map(Number);
    let startMin = sh * 60 + sm;
    let endMin   = eh * 60 + em;
    if (endMin < startMin) endMin += 24 * 60;
    return this.formatMinutesToHours(endMin - startMin);
  }

  // --------- Divers ----------

  toggleAddMode() { this.mode = this.mode === 'add' ? 'none' : 'add'; }
  toggleDeleteMode() { this.mode = this.mode === 'delete' ? 'none' : 'delete'; }

  resetForm() {
    this.selectedAssignment = null;
  }

  confirmDelete(): void {
    if (!this.editingAssignment) return;

    const site = this.getSiteByName(this.editingAssignment.siteName);
    const scheduleId = this.getScheduleIdForSiteId(site?.id);
    if (!scheduleId) return;
    if (!confirm('Voulez-vous vraiment supprimer cette vacation ?')) return;

    this.assignmentService
      .deleteAssignment(scheduleId, this.editingAssignment.id)
      .subscribe({
        next: () => {
          this.loadPlanning();
          this.editingAssignment = null;
          this.showAddForm = false;
        },
        error: err => alert('Erreur suppression : ' + (err.error?.message || err.message))
      });
  }

  // --------- Jours fériés France ----------

  private getFrenchHolidays(year: number): string[] {
    const holidays: string[] = [];
    holidays.push(`${year}-01-01`); // Jour de l'An

    const easterDate = this.calculateEasterDate(year);
    const easterMon = new Date(easterDate);
    easterMon.setDate(easterDate.getDate() + 1);
    holidays.push(this.formatISO(easterMon)); // Lundi de Pâques

    holidays.push(`${year}-05-01`); // Fête du Travail
    holidays.push(`${year}-05-08`); // Victoire 1945

    const asc = new Date(easterDate);
    asc.setDate(easterDate.getDate() + 39);
    holidays.push(this.formatISO(asc)); // Ascension

    const pentMon = new Date(easterDate);
    pentMon.setDate(easterDate.getDate() + 50);
    holidays.push(this.formatISO(pentMon)); // Lundi de Pentecôte

    holidays.push(`${year}-07-14`); // Fête Nationale
    holidays.push(`${year}-08-15`); // Assomption
    holidays.push(`${year}-11-01`); // Toussaint
    holidays.push(`${year}-11-11`); // Armistice
    holidays.push(`${year}-12-25`); // Noël

    return holidays;
  }

  private calculateEasterDate(year: number): Date {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
  }

  private formatISO(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
