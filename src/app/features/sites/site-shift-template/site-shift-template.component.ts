import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SiteShiftTemplateService } from 'src/app/services/site-shift-template.service';
import { SiteShiftTemplate } from 'src/app/shared/models/site-shift-template.model';
import { SiteRoutingModule } from '../site-routing.model';

@Component({
  standalone: true,
  selector: 'app-site-shift-template',
  templateUrl:'./site-shift-template.component.html',
  styleUrls: ['./site-shift-template.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SiteRoutingModule
  ]
})
export class SiteShiftTemplateComponent implements OnInit {
   templates: SiteShiftTemplate[] = [];
  loading = true;
  error = '';
  siteId: number;

  constructor(
    private route: ActivatedRoute,
    private templateService: SiteShiftTemplateService
  ) {
    this.siteId = Number(this.route.snapshot.paramMap.get('siteId'));
  }

  ngOnInit() {
    this.loadTemplates();
  }

  private loadTemplates() {
    this.templateService.getTemplates(this.siteId)
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

  toggleTemplateStatus(template: SiteShiftTemplate) {
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

  deleteTemplate(template: SiteShiftTemplate) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce modèle ?')) {
      this.templateService.deleteTemplate(this.siteId, template.id)
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
