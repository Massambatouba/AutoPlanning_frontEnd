import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { EmployeeService } from 'src/app/services/employee.service';
import { SiteService }     from 'src/app/services/site.service';
import { AgentType }       from 'src/app/shared/models/agent-type.model';
import { Site }            from 'src/app/shared/models/site.model';
import { Employee }        from 'src/app/shared/models/employee.model';

@Component({
  standalone: true,
  selector: 'app-employee-create',
  templateUrl: './employee-create.component.html',
  styleUrls: ['./employee-create.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ]
})
export class EmployeeCreateComponent implements OnInit {
  employeeForm!: FormGroup;
  saving = false;
  error: string | null = null;
  sites: Site[] = [];

  departments = ['Sécurité', 'Informatique', 'RH'];
  contractTypes = [
    { value: 'FULL_TIME', label: 'Temps plein' },
    { value: 'PART_TIME', label: 'Temps partiel' },
    { value: 'TEMPORARY',  label: 'Temporaire' },
    { value: 'CONTRACT',   label: 'Contrat' },
  ];
  agentTypes: AgentType[] = Object.values(AgentType);

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private siteService: SiteService,
    private router: Router
  ) {}

  ngOnInit() {
    // Charger la liste des sites pour le select
    this.siteService.getSites().subscribe({
      next: sites => this.sites = sites,
      error: () => this.error = 'Impossible de charger les sites'
    });

    // Construction du FormGroup
    this.employeeForm = this.fb.group({
      firstName:                 ['', Validators.required],
      lastName:                  ['', Validators.required],
      email:                     ['', [Validators.required, Validators.email]],
      phone:                     [''],
      position:                  ['', Validators.required],
      department:                [''],
      employeeCode:              ['', Validators.required],
      contractType:              ['', Validators.required],
      maxHoursPerWeek:           [40, [Validators.required, Validators.min(1), Validators.max(168)]],
      siteId:                    [null, Validators.required],
      preferredSites:            [[], Validators.required],
      skillSets:                 [''],
      agentTypes:                [[], Validators.required],
      // Préférences
      canWorkWeeks:              [false],
      canWorkWeekends:           [false],
      canWorkNights:             [false],
      prefersDay:                [false],
      prefersNight:              [false],
      noPreference:              [false],
      // Contraintes horaires
      minHoursPerDay:            [6,  [Validators.required, Validators.min(1), Validators.max(24)]],
      maxHoursPerDay:            [12, [Validators.required, Validators.min(1), Validators.max(24)]],
      minHoursPerWeek:           [35, [Validators.required, Validators.min(1), Validators.max(168)]],
      maxHoursPerWeekPreference: [45, [Validators.required, Validators.min(1), Validators.max(168)]],
      preferredConsecutiveDays:  [4,  [Validators.min(1)]],
      minConsecutiveDaysOff:     [2,  [Validators.min(1)]],
    });
  }

  /** Récupère le tableau d’IDs depuis le form */
  get preferredSites(): number[] {
    return this.employeeForm.get('preferredSites')?.value || [];
  }

  /** Affiche le nom d’un site */
  getSiteName(id: number): string {
    const site = this.sites.find(s => s.id === id);
    return site ? site.name : '';
  }

  /** Ajoute un site préféré */
  onPreferredSiteSelect(ev: Event) {
    const select = ev.target as HTMLSelectElement;
    const id = Number(select.value);
    const arr = [...this.preferredSites];
    if (id && !arr.includes(id)) {
      arr.push(id);
      this.employeeForm.get('preferredSites')!.setValue(arr);
    }
    select.value = '';
  }

  /** Retire un site préféré */
  removePreferredSite(id: number) {
    const arr = this.preferredSites.filter(x => x !== id);
    this.employeeForm.get('preferredSites')!.setValue(arr);
  }

  /** Vide tous les sites préférés */
  clearPreferredSites() {
    this.employeeForm.get('preferredSites')!.setValue([]);
  }

  /** Gère le toggle des AgentTypes */
  onAgentTypeToggle(type: AgentType, ev: Event) {
    const checked = (ev.target as HTMLInputElement).checked;
    const ctrl = this.employeeForm.get('agentTypes')!;
    const arr: AgentType[] = [...ctrl.value];
    if (checked) {
      arr.push(type);
    } else {
      const idx = arr.indexOf(type);
      if (idx > -1) arr.splice(idx, 1);
    }
    ctrl.setValue(arr);
  }

  /** Soumission du formulaire */
  onSubmit(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.error = null;

    const fv = this.employeeForm.value;
    const payload: Employee = {
      id: fv.id,
      firstName: fv.firstName,
      lastName:  fv.lastName,
      email:     fv.email,
      phone:     fv.phone,
      position:  fv.position,
      department: fv.department,
      employeeCode: fv.employeeCode,
      contractType: fv.contractType,
      maxHoursPerWeek: fv.maxHoursPerWeek,
      siteId:    fv.siteId,
      preferredSites: fv.preferredSites,
      skillSets: fv.skillSets
        .split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s),
      agentTypes: fv.agentTypes,
  preferences: {
    canWorkWeekends:          fv.canWorkWeekends,
    canWorkNights:            fv.canWorkNights,
    canWorkWeeks:             fv.canWorkWeeks,
    prefersDay:               fv.prefersDay,
    prefersNight:             fv.prefersNight,
    noPreference:             fv.noPreference,
    minHoursPerDay:           fv.minHoursPerDay,
    maxHoursPerDay:           fv.maxHoursPerDay,
    minHoursPerWeek:          fv.minHoursPerWeek,
    maxHoursPerWeek:          fv.maxHoursPerWeekPreference,
    preferredConsecutiveDays: fv.preferredConsecutiveDays,
    minConsecutiveDaysOff:    fv.minConsecutiveDaysOff
  },
  //siteName: this.getSiteName(fv.siteId)
    };

    this.employeeService.createEmployee(payload).subscribe({
      next: res => this.router.navigate(['/employees', res.id]),
      error: err => {
        this.error = err.error?.message || 'Une erreur est survenue';
        this.saving = false;
      }
    });
  }
}
