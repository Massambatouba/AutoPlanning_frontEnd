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

  onSubmit() {
  if (this.employeeForm.invalid) return;

  // ✅ Vérifier documents AVANT l'appel API
  if (!this.docsComp.isValid()) {
    this.docsComp.markInvalid();
    // Optionnel : scroll jusqu’au bloc documents
    document.querySelector('app-employee-docs')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  this.saving = true;

  this.employeeService.createEmployee(this.employeeForm.value).subscribe({
    next: (emp) => {
      const drafts = this.docsComp.collectDrafts();
      const uploads$ = drafts.map(d =>
        this.docsSrv.createDocument(emp.id, this.toFormData(d))
      );
      forkJoin(uploads$).subscribe({
        next: () => { this.saving = false; /* redirection / toast */ },
        error: () => { this.saving = false; /* gérer au besoin */ }
      });
    },
    error: (err) => {
      this.saving = false;
      this.error = err.error?.message || err.message;
    }
  });
}

}

