// src/app/features/sites/weekly/weekly-create/weekly-create.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { WeeklyScheduleService } from 'src/app/services/weekly-schedule.service';
import { SiteRoutingModule } from '../../site-routing.model';
import {
  agentKind,
  weeklyDay,
  WeeklyScheduleRuleRequest
} from 'src/app/shared/models/weekly-schedule.module';

@Component({
  selector: 'app-weekly-create',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SiteRoutingModule
  ],
  templateUrl: './weekly-create.component.html',
  styleUrls: ['./weekly-create.component.scss']
})
export class WeeklyCreateComponent {

  templateForm: FormGroup;
  saving = false;
  error = '';
  siteId: number;

  // ► valeurs en CHAÎNES pour matcher l'API
  daysOfWeek: { value: weeklyDay; label: string }[] = [
    { value: 'MONDAY',    label: 'Lundi' },
    { value: 'TUESDAY',   label: 'Mardi' },
    { value: 'WEDNESDAY', label: 'Mercredi' },
    { value: 'THURSDAY',  label: 'Jeudi' },
    { value: 'FRIDAY',    label: 'Vendredi' },
    { value: 'SATURDAY',  label: 'Samedi' },
    { value: 'SUNDAY',    label: 'Dimanche' }
  ];






  agentTypes: { value: agentKind; label: string }[] = [
    { value: 'ADS',            label: 'ADS' },
    { value: 'SSIAP1',         label: 'SSIAP 1' },
    { value: 'SSIAP2',         label: 'SSIAP 2' },
    { value: 'SSIAP3',         label: 'SSIAP 3' },
    { value: 'CHEF_DE_POSTE',  label: 'Chef de Poste' },
    { value: 'CHEF_DE_EQUIPE', label: "Chef d'Équipe" },
    { value: 'RONDE',          label: 'Ronde' },
    { value: 'ASTREINTE',      label: 'Astreinte' },
    { value: 'FORMATION',      label: 'Formation' }
  ];

  constructor(
    private fb: FormBuilder,
    private weeklySrv: WeeklyScheduleService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.siteId = Number(this.route.snapshot.paramMap.get('siteId'));

    // ► SEULEMENT les champs requis par l’API
    this.templateForm = this.fb.group({
      name: ['', Validators.required],
      dayOfWeek: [null as weeklyDay | null, Validators.required],
      description: [''],
      agents: this.fb.array([])
    });
  }

  get agents(): FormArray {
    return this.templateForm.get('agents') as FormArray;
  }

  addAgent() {
    this.agents.push(
      this.fb.group({
        agentType: [null as agentKind | null, Validators.required],
        startTime: ['', Validators.required], // "HH:mm"
        endTime:   ['', Validators.required], // "HH:mm"
        requiredCount: [1, [Validators.required, Validators.min(1)]],
        notes: ['']
      })
    );
  }

  removeAgent(i: number) { this.agents.removeAt(i); }

  onSubmit() {
    if (this.templateForm.invalid || this.agents.length === 0) {
      this.templateForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.error = '';

    const v = this.templateForm.value;

    // ► payload EXACT: tableau de WeeklyScheduleRuleRequest
    const payload: WeeklyScheduleRuleRequest[] = [{
      name: (v.name || '').trim(),
      dayOfWeek: v.dayOfWeek as weeklyDay,
      description: v.description?.trim() || undefined,
      agents: (v.agents || []).map((a: any) => ({
        agentType: a.agentType as agentKind,
        startTime: a.startTime,
        endTime:   a.endTime,
        requiredCount: Number(a.requiredCount),
        notes: a.notes?.trim() || undefined
      }))
    }];

    this.weeklySrv.defineWeeklyRule(this.siteId, payload).subscribe({
      next: () => this.router.navigate(['..'], { relativeTo: this.route }),
      error: (err) => {
        this.error = err?.error?.message || err.message || 'Erreur inconnue';
        this.saving = false;
      }
    });
  }

  // pour [disabled]
  canSubmitDisabled(): boolean {
    const invalidBase = this.templateForm.invalid;
    const noAgents = this.agents.length === 0;
    const someAgentInvalid = this.agents.controls.some(g => g.invalid);
    return this.saving || invalidBase || noAgents || someAgentInvalid;
  }
}
