import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { EmployeeService } from 'src/app/services/employee.service';
import { CompanyService } from 'src/app/services/company.service';
import {
  Employee,
  EmployeePlanningDTO,
  AssignmentDTO
} from 'src/app/shared/models/employee.model';
import { Company } from 'src/app/shared/models/company.model';
import { CompanyRoutingModule } from '../../company/company-routing.model';
import { EmployeeRoutingModule } from '../employee-routing.model';
import { AssignmentService } from 'src/app/services/assignment.service';
import { ScheduleAssignmentRequest } from 'src/app/shared/models/schedule.model';
import { AgentTypeAbbreviationPipe } from 'src/app/pipes/agent-type-abbreviation.pipe';
import { AbsenceTypeAbbreviationPipe } from 'src/app/pipes/absence-type-abbreviation.pipe';
import { Site } from 'src/app/shared/models/site.model';

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
export class EmployeeDetailComponent implements OnInit {
  employee: Employee | null = null;
  loading = true;
  allSites: Site[] = [];
  employeePlanning: EmployeePlanningDTO | null = null;
  error = '';
  scheduleId!: number;
  editingAssignment: AssignmentDTO | null = null;

    // modes to add or delete
  mode!: 'none' | 'add' | 'delete' | 'edit';


  selectedDateKey: string = '';
  selectedSiteName: string = '';



  showAddForm = false;
  addForm!: FormGroup;
  private pendingDateKey = '';

  totalOrdinaryMin = 0;   // heures semaine hors nuit
  totalNightMin = 0;      // heures de nuit (21h–5h)
  totalSundayMin = 0;     // heures dominicales (dimanches)
  totalHolidayMin = 0;    // heures jours fériés officiels
  dailyTotalMin: number[] = [];

  selectedAssignment: AssignmentDTO | null = null;


  // URL du logo (peut être null si non défini)
  companyLogoUrl: string | null = null;

  // On stocke mois/année du planning pour générer tous les jours
  planningMonth: number = 0; // de 1 à 12
  planningYear: number = 0;  // ex. 2025

  // Propriétés pour le tableau du planning (grille)
  tableDates: Date[] = [];                      // Liste des Date JS pour chaque jour du mois
  tableDateKeys: string[] = [];                 // Liste des clefs ISO ("YYYY-MM-DD")
  dayInitials: string[] = [];                   // Initiale du jour en français pour chaque date
  siteList: string[] = [];                      // Tous les sites uniques dans le mois
  assignmentsMap: {                             // assignmentsMap[siteName][dateKey] = AssignmentDTO[]
    [siteName: string]: { [dateKey: string]: AssignmentDTO[] };
  } = {};


  // Ensemble des clefs ISO "YYYY-MM-DD" correspondant aux jours fériés FR pour l'année du planning
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
    private companyService: CompanyService,
    private assignmentService: AssignmentService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const idParam = this.route.snapshot.paramMap.get('id');
    this.initAddForm();
    this.loadEmployee(id);

    // setTimeout(() => {
    //   this.showAddForm = true;
    // }, 2000);


  }

getSiteByName(name: string): Site | undefined {
  const result = this.allSites?.find(s => s.name === name);
  console.log('[getSiteByName]', name, result);
  return result;
}



  private initAddForm(): void {
    this.addForm = this.fb.group({
      siteName: [''],
      siteId: ['', Validators.required],
      date: ['', Validators.required],
      shift: ['', Validators.required],
      agentType: ['', Validators.required],
      notes: [''],
      employeeId: ['', Validators.required],
      startTime: ['', [Validators.required, Validators.pattern(/^[0-2]\d:[0-5]\d$/)]],
      endTime: ['', [Validators.required, Validators.pattern(/^[0-2]\d:[0-5]\d$/)]]
    });
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
           if (a.isAbsence || !a.startTime || !a.endTime) return;
          // parse heures
          const [sh, sm] = a.startTime.split(':').map(Number);
          let [eh, em] = a.endTime.split(':').map(Number);
          let startMin = sh * 60 + sm;
          let endMin = eh * 60 + em;
          if (endMin < startMin) endMin += 24 * 60;
          const duration = endMin - startMin;

          // calcul des heures de nuit
          let night = 0;
          // portion 21h–24h
          const startN1 = 21*60, endN1 = 24*60;
          night += Math.max(0, Math.min(endMin, endN1) - Math.max(startMin, startN1));
          // portion 0–5h
          const startN2 = 24*60, endN2 = 30*60;
          night += Math.max(0, Math.min(endMin, endN2) - Math.max(startMin, startN2));

          // affectation selon jour
          if (isSun) {
            this.totalSundayMin += duration;
          } else if (isHol) {
            this.totalHolidayMin += duration;
          } else {
            // semaine non fériée, heures normales hors nuit
            this.totalOrdinaryMin += (duration - night);
          }
          // les heures de nuit sont toujours comptées
          this.totalNightMin += night;
        });
      });
    });
  }


  private computeDailyTotals(): void {
  // initialisation à zéro pour chaque jour
  this.dailyTotalMin = this.tableDateKeys.map(_ => 0);

  this.siteList.forEach(siteName => {
    this.tableDateKeys.forEach((dateKey, idx) => {
      const assigns = this.assignmentsMap[siteName][dateKey] || [];
      assigns.forEach(a => {
        // calcul duration en minutes
        if (a.isAbsence || !a.startTime || !a.endTime) return;
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
    return m
      ? `${h}h${m.toString().padStart(2, '0')}`
      : `${h}h`;
  }

   /**
   * Optionnel : calculer sur un a. Peut s'appeler en template si besoin.
   */
getDuration(a: AssignmentDTO): string {
  if (a.isAbsence || !a.startTime || !a.endTime) return 'a.absenceType | absenceAbbreviation'; // Ne rien afficher pour les absences
  const [sh, sm] = a.startTime.split(':').map(Number);
  let [eh, em] = a.endTime.split(':').map(Number);
  let startMin = sh * 60 + sm;
  let endMin = eh * 60 + em;
  if (endMin < startMin) endMin += 24 * 60;
  return this.formatMinutesToHours(endMin - startMin);
}


  private loadEmployee(id: number): void {
    this.employeeService.getEmployeeById(id).subscribe({
      next: (employee) => {
        this.employee = employee;
        console.log('📍 allSites:', this.allSites);
        if (employee.companyId) {
          this.companyService.getMyCompany().subscribe({
            next: (company: Company) => {
              this.allSites = company.sites ?? [];
              this.companyLogoUrl = company.logoUrl ?? null;
            },
            error: (err) => {
              console.error('Impossible de charger la compagnie', err);
            }
          });
        }
        this.loading = false;
        this.loadPlanning();
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
      }
    });
  }

  loadPlanning(): void {
    if (!this.employee) return;
    const { id } = this.employee;
    // On prend la date courante pour déterminer mois/année
    const now = new Date();
    this.planningMonth = now.getMonth() + 1; // de 1 à 12
    this.planningYear = now.getFullYear();

    // Calculer les jours fériés FR pour cette année
    this.holidayKeys = new Set(this.getFrenchHolidays(this.planningYear));

    this.employeeService
      .getMonthlyPlanning(this.employee.id, this.planningMonth, this.planningYear)
      .subscribe({
        next: (data) => {
          this.employeePlanning = data;
          this.prepareTable();
          this.prepareTable();
        },
        error: (err) => {
          console.error('Erreur chargement planning', err);
        }
      });
  }

    /** Toggle modes */
  toggleAddMode() { this.mode = this.mode === 'add' ? 'none' : 'add'; }
  toggleDeleteMode() { this.mode = this.mode === 'delete' ? 'none' : 'delete'; }

  /** Click on empty cell */
cellClicked(siteName: string, dateKey: string) {
  if (!this.employeePlanning) {
    console.warn('⚠️ planning pas encore prêt, ignore clic');
    return;
  }
  this.editingAssignment = null; // reset
  this.showAddForm = true;

  const site = this.getSiteByName(siteName);

this.addForm.patchValue({
  siteName: site?.name,
  siteId: site?.id,
  date: dateKey,
  shift: '',
  startTime: '',
  endTime: '',
  agentType: '',
  employeeId: this.employee?.id,
  notes: ''
});
  this.mode = 'add';
}


  /** Click on assignment */
assignmentClicked(assignment: AssignmentDTO, dateKey: string, event: MouseEvent) {
  event.stopPropagation(); // éviter de déclencher `cellClicked`

  this.editingAssignment = assignment;
  this.showAddForm = true;

  const site = this.getSiteByName(assignment.siteName);

this.addForm.patchValue({
  siteName: site?.name,
  siteId: site?.id,
  date: dateKey,
  shift: assignment.shift || '',
  startTime: assignment.startTime?.slice(0, 5),
  endTime: assignment.endTime?.slice(0, 5),
  agentType: assignment.agentType,
  employeeId: this.employee?.id
});


  this.mode = 'edit';
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

  /**
   * Méthode utilisée dans le template pour afficher le mois en toutes lettres.
   */
  currentMonthFullName(): string {
    // On génère à partir de planningYear/planningMonth pour être cohérent
    const date = new Date(this.planningYear, this.planningMonth - 1, 1);
    return date.toLocaleString('fr-FR', { month: 'long' });
  }

  /**
   * Getter pour l’année (utilisé dans le template).
   */
  get currentYear(): number {
    return this.planningYear;
  }

  /**
   * Vérifie si un objet Date tombe un samedi (6) ou dimanche (0).
   */
  isWeekend(d: Date): boolean {
    const dayNum = d.getDay(); // 0 = Dimanche, 6 = Samedi
    return dayNum === 0 || dayNum === 6;
  }

  /**
   * Vérifie si la date (au format "YYYY-MM-DD") est un jour férié.
   */
  isHoliday(dateKey: string): boolean {
    return this.holidayKeys.has(dateKey);
  }

  /**
   * Construit toutes les données nécessaires à l'affichage du planning en grille,
   * y compris les jours sans affectation.
   */
private prepareTable(): void {
    if (!this.employeePlanning) return;

    // 1) Toutes les dates 1→dernier jour
    const daysInMonth = new Date(this.planningYear, this.planningMonth, 0).getDate();
    this.tableDates = [];
    this.tableDateKeys = [];
    for (let d = 1; d <= daysInMonth; d++) {
      this.tableDates.push(new Date(this.planningYear, this.planningMonth - 1, d));
      const mm = String(this.planningMonth).padStart(2,'0'),
            dd = String(d).padStart(2,'0');
      this.tableDateKeys.push(`${this.planningYear}-${mm}-${dd}`);
    }

    // 2) Initiales des jours
    this.dayInitials = this.tableDates.map(date =>
      date.toLocaleDateString('fr-FR',{weekday:'long'}).charAt(0).toUpperCase()
    );

    // 3) Liste des sites
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
     this.scheduleId = this.employeePlanning!.scheduleId;
     console.log('✅ Schedule ID chargé :', this.scheduleId);
    // 5) Totaux
    this.computeSummary();
    this.computeDailyTotals();
  }

createAssignment(formValue: any) {
  console.log('➡️ createAssignment called');
  console.log('employeePlanning:', this.employeePlanning);
  console.log('scheduleId:', this.employeePlanning?.scheduleId);

  if (!this.employeePlanning || !this.employeePlanning.scheduleId) {
    console.error('❌ Planning ID manquant');
    alert('Impossible de créer : planning non chargé.');
    return;
  }

  const scheduleId = this.employeePlanning.scheduleId;

  this.assignmentService.addAssignment(scheduleId, formValue).subscribe({
    next: () => this.loadPlanning(),
    error: (err) => {
      console.error('Erreur lors de la création :', err);
    }
  });
}


updateAssignment(id: number, formValue: any) {
  this.assignmentService.updateAssignment(id, formValue).subscribe({
    next: (updatedAssignment) => {
      console.log('Modification réussie ✅',updatedAssignment);
      this.loadPlanning(); // recharge le planning
    },
    error: (err) => {
      console.error('Erreur lors de la modification :', err);
    }
  });
}



onAddAssignment() {
  if (!this.employee) {
    console.error('Impossible d’ajouter : employee est null');
    return;
  }

  const formValue = this.addForm.value;

  const payload = {
    ...formValue,
    employeeId: this.employee.id
  };

  if (this.editingAssignment) {
    this.updateAssignment(this.editingAssignment.id, payload);
  } else {
    this.createAssignment(payload);
  }

  this.showAddForm = false;
  this.editingAssignment = null;
}

showToast(message: string, type: 'success' | 'error' | 'warning' = 'success') {
  // TODO: remplace ceci par une vraie toastr ou snackbar plus tard
  alert(`[${type.toUpperCase()}] ${message}`);
}



resetForm() {
  this.selectedAssignment = null;
  // tu peux aussi réinitialiser le formulaire s’il y en a un
}


confirmDelete(): void {
  if (!this.editingAssignment || !this.employeePlanning?.scheduleId) {
    this.showToast('Impossible de supprimer : données manquantes', 'warning');
    return;
  }

  const confirmed = confirm('Voulez-vous vraiment supprimer cette vacation ?');
  if (!confirmed) return;

  this.assignmentService
    .deleteAssignment(this.employeePlanning.scheduleId, this.editingAssignment.id)
    .subscribe({
      next: () => {
        this.showToast('Vacation supprimée avec succès', 'success');
        this.loadPlanning();
        this.editingAssignment = null;
        this.showAddForm = false;
      },
      error: err => this.showToast('Erreur lors de la suppression : ' + err.message, 'error')
    });
}



  /**
   * Calcule les jours fériés français (nationaux) pour une année donnée.
   * Renvoie un tableau de chaînes ISO "YYYY-MM-DD".
   */
  private getFrenchHolidays(year: number): string[] {
    const holidays: string[] = [];

    // 1. Jour de l'An : 1er janvier
    holidays.push(`${year}-01-01`);

    // Calcul de la date de Pâques (algorithme de Gauss)
    const easterDate = this.calculateEasterDate(year); // renvoie un objet Date
    // 2. Lundi de Pâques : Pâques + 1 jour
    const easterMonday = new Date(easterDate);
    easterMonday.setDate(easterDate.getDate() + 1);
    holidays.push(this.formatISO(easterMonday));

    // 3. Fête du Travail : 1er mai
    holidays.push(`${year}-05-01`);


    // 4. Victoire de 1945 : 8 mai
    holidays.push(`${year}-05-08`);

    // 5. Ascension : Pâques + 39 jours
    const ascension = new Date(easterDate);
    ascension.setDate(easterDate.getDate() + 39);
    holidays.push(this.formatISO(ascension));

    // 6. Lundi de Pentecôte : Pâques + 50 jours
    const pentecostMonday = new Date(easterDate);
    pentecostMonday.setDate(easterDate.getDate() + 50);
    holidays.push(this.formatISO(pentecostMonday));

    // 7. Fête Nationale : 14 juillet
    holidays.push(`${year}-07-14`);

    // 8. Assomption : 15 août
    holidays.push(`${year}-08-15`);

    // 9. Toussaint : 1er novembre
    holidays.push(`${year}-11-01`);

    // 10. Armistice : 11 novembre
    holidays.push(`${year}-11-11`);

    // 11. Noël : 25 décembre
    holidays.push(`${year}-12-25`);

    return holidays;
  }

  formatTimeHM(time: string): string {
    return time?.substring(0, 5) ?? '';
  }

  /**
   * Calcule la date de Pâques (Gregorian) pour une année donnée
   * en utilisant l'algorithme de Gauss. Retourne un objet Date.
   */
  private calculateEasterDate(year: number): Date {
    // Algorithme de Gauss (version pour calendrier grégorien)
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
    const month = Math.floor((h + l - 7 * m + 114) / 31); // 3 = mars, 4 = avril
    const day = ((h + l - 7 * m + 114) % 31) + 1;

    // Renvoie un objet Date pour cette date de Pâques
    return new Date(year, month - 1, day);
  }

  /**
   * Formate un objet Date en chaîne ISO "YYYY-MM-DD".
   */
  private formatISO(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
