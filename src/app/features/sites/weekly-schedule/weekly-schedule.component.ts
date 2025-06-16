import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { WeeklyScheduleService } from 'src/app/services/weekly-schedule.service';
import { WeeklyScheduleRule } from 'src/app/shared/models/weekly-schedule.module';

@Component({
  selector: 'app-weekly-schedule',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './weekly-schedule.component.html',
  styleUrls: ['./weekly-schedule.component.scss']
})
export class WeeklyScheduleComponent implements OnInit {
  templates: WeeklyScheduleRule[] = [];
  loading = true;
  error = '';
  siteId: number;

  constructor(
    private route: ActivatedRoute,
    private templateService: WeeklyScheduleService
  ) {
    this.siteId = Number(this.route.snapshot.paramMap.get('siteId'));
  }

  ngOnInit() {
    this.loadTemplates();
  }

  private loadTemplates() {
    this.templateService.getWeeklyRules(this.siteId)
      .subscribe({
        next: (templates) => {
          this.templates = templates;
          this.loading = false;
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
        }
      });
  }

  toggleTemplateStatus(template: WeeklyScheduleRule) {
    this.templateService.toggleTemplateStatus(this.siteId, template.id)
      .subscribe({
        next: (updatedTemplate) => {
          const index = this.templates.findIndex(t => t.id === template.id);
          this.templates[index] = updatedTemplate;
        },
        error: (error) => {
          this.error = error.message;
        }
      });
  }

  deleteTemplate(template: WeeklyScheduleRule) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce modèle ?')) {
      this.templateService.deleteAllWeeklyRules(this.siteId)
        .subscribe({
          next: () => {
            this.templates = this.templates.filter(t => t.id !== template.id);
          },
          error: (error) => {
            this.error = error.message;
          }
        });
    }
  }

  getDayOfWeekLabel(dayOfWeek: string): string {
    const labels: { [key: string]: string } = {
      'MONDAY': 'Lundi',
      'TUESDAY': 'Mardi',
      'WEDNESDAY': 'Mercredi',
      'THURSDAY': 'Jeudi',
      'FRIDAY': 'Vendredi',
      'SATURDAY': 'Samedi',
      'SUNDAY': 'Dimanche'
    };
    return labels[dayOfWeek] || dayOfWeek;
  }

  getAgentTypeLabel(agentType: string): string {
    const labels: { [key: string]: string } = {
      'ADS': 'ADS',
      'SSIAP1': 'SSIAP 1',
      'SSIAP2': 'SSIAP 2',
      'SSIAP3': 'SSIAP 3',
      'CHEF_DE_POSTE': 'Chef de Poste',
      'CHEF_DE_EQUIPE': 'Chef d\'Équipe',
      'RONDE': 'Ronde',
      'ASTREINTE': 'Astreinte',
      'FORMATION': 'Formation'
    };
    return labels[agentType] || agentType;
  }
}
