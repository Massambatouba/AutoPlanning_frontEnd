import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EmployeeService } from 'src/app/services/employee.service';
import { Employee } from 'src/app/shared/models/employee.model';
import { EmployeeRoutingModule } from '../employee-routing.model';
import { Site } from 'src/app/shared/models/site.model';
import { SiteService } from 'src/app/services/site.service';
import { AgentType } from 'src/app/shared/models/agent-type.model';
import { CompanyRoutingModule } from '../../company/company-routing.module';

@Component({
  standalone: true,
  selector: 'app-employee-edit',
  templateUrl: './employee-edit.component.html',
  styleUrls: ['./employee-edit.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    CompanyRoutingModule,
    EmployeeRoutingModule
  ]
})
export class EmployeeEditComponent implements OnInit{
  employeeForm!: FormGroup;
  agentTypes: AgentType[] = Object.values(AgentType);
  employee: Employee | null = null;
  sites    : Site[]   = [];
  loading = true;
  saving = false;
  error = '';

  departments = [
    'Administration',
    'Commercial',
    'Technique',
    'Support',
    'Ressources Humaines'
  ];

  contractTypes = [
    { value: 'FULL_TIME', label: 'Temps plein' },
    { value: 'PART_TIME', label: 'Temps partiel' },
    { value: 'TEMPORARY', label: 'Temporaire' },
    { value: 'CONTRACT', label: 'Contrat' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private siteService: SiteService,
    private employeeService: EmployeeService
  ) {
    // this.employeeForm = this.formBuilder.group({
    //   firstName: ['', Validators.required],
    //   lastName: ['', Validators.required],
    //   email: ['', [Validators.required, Validators.email]],
    //   phone: [''],
    //   position: ['', Validators.required],
    //   department: [''],
    //   employeeCode: ['', Validators.required],
    //   contractType: ['FULL_TIME', Validators.required],
    //   maxHoursPerWeek: [40, [Validators.required, Validators.min(1), Validators.max(168)]],
    //   skillSets: ['']
    // });
  }

  get preferredSites(): number[] {
    return this.employeeForm.get('preferredSites')?.value || [];
  }

  getSiteName(id: number): string {
    const site = this.sites.find(s => s.id === id);
    return site ? site.name : '';
  }

  ngOnInit() {
    /* 1) charger les sites pour les selects */
    this.siteService.getSites().subscribe({
      next : sites => this.sites = sites,
      error: ()    => this.error = 'Impossible de charger les sites'
    });
    /* 2) construire le FormGroup (identique à l’ajout) */
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
      preferredSites:            [[]],                          // pas required en édition
      skillSets:                 [''],
      adress : ['', Validators.required],
      zipCode: [''],
      city   : [''],
      country: [''],
      agentTypes:                [[], Validators.required],

      /* ---- Préférences ---- */
      canWorkWeeks:              [false],
      canWorkWeekends:           [false],
      canWorkNights:             [false],
      prefersDay:                [false],
      prefersNight:              [false],
      noPreference:              [false],

      /* ---- Contraintes horaires ---- */
      minHoursPerDay:            [6,  [Validators.required, Validators.min(1), Validators.max(24)]],
      maxHoursPerDay:            [12, [Validators.required, Validators.min(1), Validators.max(24)]],
      minHoursPerWeek:           [35, [Validators.required, Validators.min(1), Validators.max(168)]],
      maxHoursPerWeekPreference: [45, [Validators.required, Validators.min(1), Validators.max(168)]],
      preferredConsecutiveDays:  [4],
      minConsecutiveDaysOff:     [2],
    });

    /* 3) charger l’employé à éditer */
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadEmployee(id);
  }

  private loadEmployee(id: number): void {
    this.employeeService.getEmployeeById(id)
      .subscribe({
        next: (employee) => {
          this.employee = employee;
          this.employeeForm.patchValue({
            ...employee,
            skillSets: employee.skillSets?.join(', ') || '',
            maxHoursPerWeekPreference: employee.preferences.maxHoursPerWeek,
            ...employee.preferences
          });

          /* patch array pour agentTypes & preferredSites */
          this.employeeForm.get('agentTypes')!.setValue(employee.agentTypes);
          this.employeeForm.get('preferredSites')!.setValue(employee.preferredSites ?? []);

          this.loading = false;
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
        }
      });
  }

    /* ---------- UI actions ---------- */
  onPreferredSiteSelect(ev: Event): void {
    const select = ev.target as HTMLSelectElement;
    const id = Number(select.value);
    const arr = [...this.preferredSites];
    if (id && !arr.includes(id)) {
      arr.push(id);
      this.employeeForm.get('preferredSites')!.setValue(arr);
    }
    select.value = '';
  }

    removePreferredSite(id: number): void {
    const arr = this.preferredSites.filter(x => x !== id);
    this.employeeForm.get('preferredSites')!.setValue(arr);
  }

  clearPreferredSites(): void {
    this.employeeForm.get('preferredSites')!.setValue([]);
  }

  onAgentTypeToggle(type: AgentType, ev: Event): void {
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

  onSubmit(): void {
    if (this.employeeForm.invalid || !this.employee) {
      this.employeeForm.markAllAsTouched();
      return;
  }

    this.saving = true;
    this.error = '';

    const fv = this.employeeForm.value;
    const payload: Employee & { preferences: Employee['preferences'] } = {
      id:            this.employee.id,
      firstName:     fv.firstName,
      lastName:      fv.lastName,
      email:         fv.email,
      phone:         fv.phone,
      position:      fv.position,
      department:    fv.department,
      adress: fv.adress,
      city: fv.city,
      country: fv.country,
      zipCode: fv.zipCode,
      employeeCode:  fv.employeeCode,
      contractType:  fv.contractType,
      maxHoursPerWeek: fv.maxHoursPerWeek,
      siteId:        fv.siteId,
      preferredSites: fv.preferredSites,
      skillSets:     fv.skillSets
                      .split(',')
                      .map((s: string) => s.trim())
                      .filter((s: string) => s),
      agentTypes:    fv.agentTypes,
      /* ---- mapping préférences ---- */
      preferences: {
        canWorkWeeks:             fv.canWorkWeeks,
        canWorkWeekends:          fv.canWorkWeekends,
        canWorkNights:            fv.canWorkNights,
        prefersDay:               fv.prefersDay,
        prefersNight:             fv.prefersNight,
        noPreference:             fv.noPreference,
        minHoursPerDay:           fv.minHoursPerDay,
        maxHoursPerDay:           fv.maxHoursPerDay,
        minHoursPerWeek:          fv.minHoursPerWeek,
        maxHoursPerWeek:          fv.maxHoursPerWeekPreference,
        preferredConsecutiveDays: fv.preferredConsecutiveDays,
        minConsecutiveDaysOff:    fv.minConsecutiveDaysOff
      }
    };

     this.employeeService.updateEmployee(payload.id, payload).subscribe({
      next : () => this.router.navigate(['/employees', payload.id]),
      error: err => {
        this.error  = err.error?.message || 'Erreur lors de la sauvegarde';
        this.saving = false;
      }
    });
  }
}
