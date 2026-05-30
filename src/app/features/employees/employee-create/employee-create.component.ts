import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { EmployeeService } from 'src/app/services/employee.service';
import { SiteService }     from 'src/app/services/site.service';
import { AgentType }       from 'src/app/shared/models/agent-type.model';
import { Site }            from 'src/app/shared/models/site.model';
import { Employee }        from 'src/app/shared/models/employee.model';
import { DraftDoc, EmployeeDocsComponent } from '../employee-docs/employee-docs.component';
import { EmployeeDocumentsServiceTsService } from 'src/app/services/employee-documents.service.ts.service';
import { catchError, forkJoin, of } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-employee-create',
  templateUrl: './employee-create.component.html',
  styleUrls: ['./employee-create.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    EmployeeDocsComponent
  ]
})
export class EmployeeCreateComponent implements OnInit {
  @ViewChild(EmployeeDocsComponent) docsComp!: EmployeeDocsComponent;
  employeeForm!: FormGroup;
  saving = false;
  error: string | null = null;
  sites: Site[] = [];
  employeeId?: number;


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
    private router: Router,
    private docsSrv: EmployeeDocumentsServiceTsService
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
      adress : ['', Validators.required],
      zipCode: [''],
      city   : [''],
      country: [''],
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

 private toFormData(d: DraftDoc): FormData {
    const fd = new FormData();
    fd.append('category', d.category);
    fd.append('type', d.type);
    if (d.number) fd.append('number', d.number);
    if (d.expiryDate) fd.append('expiryDate', d.expiryDate);
    if (d.file) fd.append('file', d.file);
    return fd;
  }

  /** Convertit ce que renvoie le formulaire en AgentType[] (string) attendus par le back */
private normalizeAgentTypes(arr: any[]): string[] {
  // Si ton enum TS est string (e.g. 'ADS'), on renvoie tel quel,
  // si jamais c'est numérique, on essaie de remonter le nom.
  return (arr || []).map((v: any) => {
    if (typeof v === 'string') return v;
    // @ts-ignore – si c'est un enum numérique, on tente la clé
    return (AgentType as any)[v] ?? String(v);
  });
}

/** Construit le payload EXACT pour EmployeeRequest (DTO back) */
private buildEmployeePayload(): any {
  const f = this.employeeForm.getRawValue();

  // skillSets: "a, b, c" -> ["a","b","c"], jamais ""
  const skillSets: string[] = (f.skillSets || '')
    .split(',')
    .map((s: string) => s.trim())
    .filter(Boolean);

  return {
    // champs simples
    firstName: f.firstName,
    lastName:  f.lastName,
    email:     f.email,
    phone:     f.phone || null,

    adress:    f.adress || null,
    zipCode:   f.zipCode || null,
    city:      f.city || null,
    country:   f.country || null,

    position:      f.position,
    department:    f.department || null,
    employeeCode:  f.employeeCode,
    contractType:  f.contractType,                 // ex: "FULL_TIME"
    maxHoursPerWeek: Number(f.maxHoursPerWeek),    // niveau racine du DTO
    siteId:        Number(f.siteId),

    // listes : JAMAIS "", toujours []
    preferredSites: Array.isArray(f.preferredSites)
      ? f.preferredSites.map((n: any) => Number(n))
      : [],

    skillSets, // tableau de string

    agentTypes: this.normalizeAgentTypes(f.agentTypes), // tableau de strings (enum names)

    // objet imbriqué OBLIGATOIRE pour matcher EmployeeRequest.preferences
    preferences: {
      canWorkWeekends: !!f.canWorkWeekends,
      canWorkWeeks:    !!f.canWorkWeeks,
      canWorkNights:   !!f.canWorkNights,
      prefersDay:      !!f.prefersDay,
      prefersNight:    !!f.prefersNight,
      noPreference:    !!f.noPreference,

      minHoursPerDay:  Number(f.minHoursPerDay ?? 0),
      maxHoursPerDay:  Number(f.maxHoursPerDay ?? 0),
      minHoursPerWeek: Number(f.minHoursPerWeek ?? 0),
      // ⚠️ ton form s’appelle maxHoursPerWeekPreference pour la partie préférences
      maxHoursPerWeek: Number(f.maxHoursPerWeekPreference ?? 0),

      preferredConsecutiveDays: Number(f.preferredConsecutiveDays ?? 0),
      minConsecutiveDaysOff:    Number(f.minConsecutiveDaysOff ?? 0),
    },
  };
}


onSubmit() {
  this.error = null;

  if (this.employeeForm.invalid) {
    this.employeeForm.markAllAsTouched();
    this.error = 'Le formulaire contient des erreurs';
    return;
  }

  // 1) Construire le payload conforme au DTO
  const payload = this.buildEmployeePayload();

  // 2) Créer l’employé (JSON)
  this.saving = true;
  this.employeeService.createEmployee(payload).subscribe({
    next: (emp: Employee) => {
      this.employeeId = emp.id;

      // 3) Récupérer les brouillons de documents du composant enfant
      const drafts: DraftDoc[] =
        this.docsComp && typeof this.docsComp.collectDrafts === 'function'
          ? this.docsComp.collectDrafts()
          : [];

      if (!drafts.length) {
        // pas de doc à envoyer → terminé
        this.saving = false;
        this.router.navigate(['/employees']);
        return;
      }

      // 4) Enchaîner les POST documents (multipart/form-data)
      forkJoin(
        drafts.map(d =>
          this.docsSrv.createDocument(emp.id!, this.toFormData(d))
            .pipe(catchError(err => of(err)))
        )
      ).subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/employees']);
        },
        error: () => {
          // catchError empêche d’arriver ici normalement, mais on sécurise
          this.saving = false;
          this.router.navigate(['/employees']);
        }
      });
    },
    error: (err) => {
      this.saving = false;
      this.error = err?.error?.message || err?.message || 'Erreur lors de la création de l’employé';
      console.error('Erreur création employé', err);
    }
  });
}



}

