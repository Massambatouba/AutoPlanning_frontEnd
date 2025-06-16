// weekly-edit.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SiteRoutingModule } from '../../site-routing.model';
import { DayOfWeek } from 'src/app/shared/models/day-of-week.model';
import { AgentType } from 'src/app/shared/models/agent-type.model';
import { WeeklyScheduleService } from 'src/app/services/weekly-schedule.service';
import { WeeklyScheduleRuleRequest } from 'src/app/shared/models/weekly-schedule.module';


@Component({
  selector: 'app-weekly-edit',
  standalone: true,
  templateUrl: './weekly-edit.component.html',
  styleUrls: ['./weekly-edit.component.scss'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, SiteRoutingModule]
})
export class WeeklyEditComponent implements OnInit {
  templateForm: FormGroup;
  loading = true;
  saving = false;
  error = '';
  siteId: number;

  daysOfWeek = [
    { value: DayOfWeek.MONDAY, label: 'Lundi' },
    { value: DayOfWeek.TUESDAY, label: 'Mardi' },
    { value: DayOfWeek.WEDNESDAY, label: 'Mercredi' },
    { value: DayOfWeek.THURSDAY, label: 'Jeudi' },
    { value: DayOfWeek.FRIDAY, label: 'Vendredi' },
    { value: DayOfWeek.SATURDAY, label: 'Samedi' },
    { value: DayOfWeek.SUNDAY, label: 'Dimanche' }
  ];

  agentTypes = [
    { value: AgentType.ADS, label: 'ADS' },
    { value: AgentType.SSIAP1, label: 'SSIAP 1' },
    { value: AgentType.SSIAP2, label: 'SSIAP 2' },
    { value: AgentType.SSIAP3, label: 'SSIAP 3' },
    { value: AgentType.CHEF_DE_POSTE, label: 'Chef de Poste' },
    { value: AgentType.CHEF_DE_EQUIPE, label: "Chef d'Équipe" },
    { value: AgentType.RONDE, label: 'Ronde' },
    { value: AgentType.ASTREINTE, label: 'Astreinte' },
    { value: AgentType.FORMATION, label: 'Formation' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private templateService: WeeklyScheduleService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.siteId = Number(this.route.snapshot.paramMap.get('siteId'));
    this.templateForm = this.formBuilder.group({
      rules: this.formBuilder.array([])
    });
  }

  ngOnInit() {
    this.loadAllRules();
  }

  get rules(): FormArray {
    return this.templateForm.get('rules') as FormArray;
  }

  addAgentFormGroup(agent?: any): FormGroup {
    return this.formBuilder.group({
      agentType: [agent?.agentType || '', Validators.required],
      startTime: [agent?.startTime || '', Validators.required],
      endTime: [agent?.endTime || '', Validators.required],
      requiredCount: [agent?.requiredCount || 1, [Validators.required, Validators.min(1)]],
      notes: [agent?.notes || '']
    });
  }

  getDayLabel(dayValue: string): string {
  return this.daysOfWeek.find(d => d.value === dayValue)?.label || dayValue;
}


  loadAllRules() {
    this.templateService.getWeeklyRules(this.siteId).subscribe({
      next: (rules) => {
        rules.forEach(rule => {
          const agentsFormArray = this.formBuilder.array(
            rule.agents.map(agent => this.addAgentFormGroup(agent))
          );

          const ruleGroup = this.formBuilder.group({
            id: [rule.id],
            name: [rule.name || ''],
            dayOfWeek: [rule.dayOfWeek, Validators.required],
            description: [rule.description || ''],
            agents: agentsFormArray
          });

          this.rules.push(ruleGroup);
        });

        this.loading = false;
      },
      error: err => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }

  onSubmit() {
    if (this.templateForm.invalid) return;

    const payload: WeeklyScheduleRuleRequest[] = this.rules.value.map((rule: any) => ({
      name: rule.name || '',
      dayOfWeek: rule.dayOfWeek.toString(),
      description: rule.description || '',
      agents: rule.agents
    }));

    this.saving = true;
    this.templateService.updateWeeklyRule(this.siteId, payload).subscribe({
      next: () => this.router.navigate(['../..'], { relativeTo: this.route }),
      error: (err) => {
        this.error = err.message;
        this.saving = false;
      }
    });
  }

  getAgentsControls(rule: AbstractControl): FormArray {
  return rule.get('agents') as FormArray;
  }

  addAgentToRule(ruleIndex: number) {
  const rule = this.rules.at(ruleIndex) as FormGroup;
  const agents = rule.get('agents') as FormArray;
  agents.push(this.addAgentFormGroup());
}


  deleteAllRules() {
    this.templateService.deleteAllWeeklyRules(this.siteId).subscribe({
      next: () => this.router.navigate(['../..'], { relativeTo: this.route }),
      error: err => this.error = err.message
    });
}

removeRule(index: number): void {
  this.rules.removeAt(index);
}

}
