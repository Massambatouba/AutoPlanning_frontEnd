import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AgentType } from 'src/app/shared/models/agent-type.model';
import { DayOfWeek } from 'src/app/shared/models/day-of-week.model';
import { SiteRoutingModule } from '../../site-routing.model';
import { WeeklyScheduleService } from 'src/app/services/weekly-schedule.service';

@Component({
  standalone: true,
  selector: 'app-site-shift-template-create',
  templateUrl: './site-shift-template-create.component.html',
  styleUrls: ['./site-shift-template-create.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SiteRoutingModule
  ]
})
export class SiteShiftTemplateCreateComponent {
 templateForm: FormGroup;
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
      name: ['', Validators.required],
      dayOfWeek: ['', Validators.required],
      description: [''],
      agents: this.formBuilder.array([])
    });
  }

  get agents() {
    return this.templateForm.get('agents') as FormArray;
  }

  addAgent() {
    const agentGroup = this.formBuilder.group({
      agentType: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      requiredCount: [1, [Validators.required, Validators.min(1)]],
      notes: ['']
    });

    this.agents.push(agentGroup);
  }

  removeAgent(index: number) {
    this.agents.removeAt(index);
  }

  onSubmit() {
    if (this.templateForm.invalid) {
      return;
    }

    this.saving = true;
    this.error = '';

    this.templateService.createTemplate(this.siteId, this.templateForm.value)
      .subscribe({
        next: () => {
          this.router.navigate(['..'], { relativeTo: this.route });
        },
        error: (error) => {
          this.error = error.message;
          this.saving = false;
        }
      });
  }
}
