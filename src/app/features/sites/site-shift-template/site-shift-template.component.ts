import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
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

  constructor(private templateService: SiteShiftTemplateService) {}

  ngOnInit() {
    // TODO: Get siteId from route params
    const siteId = 1;
    this.loadTemplates(siteId);
  }

  private loadTemplates(siteId: number) {
    this.templateService.getTemplates(siteId)
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
    this.templateService.toggleTemplateStatus(template.siteId, template.id)
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
    return agentType.replace('_', ' ');
  }
}
