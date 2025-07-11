import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HourComplianceService } from 'src/app/services/hour-compliance.service';
import { ScheduleComplianceResponse } from 'src/app/shared/models/contractHour.model';

@Component({
  selector: 'app-schedule-compliance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './schedule-compliance.component.html',
  styleUrls: ['./schedule-compliance.component.scss']
})
export class ScheduleComplianceComponent implements OnInit {
  @Input() scheduleId!: number;

  overallComplianceRate!: number;          // 0-100
  compliantAssignments!:   number;
  nonCompliantAssignments!: number;

  complianceData: ScheduleComplianceResponse | null = null;
  loading = false;
  error = '';

  constructor(private complianceService: HourComplianceService) {}

  ngOnInit() {
    if (this.scheduleId) {
      this.loadComplianceData();
    }
  }

get rate(): number {
  return this.complianceData?.overallComplianceRate ?? 0;
}


  private loadComplianceData() {
    this.loading = true;
    this.error = '';

    this.complianceService.getScheduleCompliance(this.scheduleId).subscribe({
      next: (data) => {
        this.complianceData = data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des données de conformité';
        this.loading = false;
        console.error('Compliance error:', error);
      }
    });
  }

  getInitials(name: string): string {
    return name.split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getContractClass(contractType: string): string {
    switch (contractType) {
      case 'FULL_TIME': return 'full-time';
      case 'PART_TIME': return 'part-time';
      case 'TEMPORARY': return 'temporary';
      default: return 'temporary';
    }
  }

  getContractLabel(contractType: string): string {
    switch (contractType) {
      case 'FULL_TIME': return 'Temps plein';
      case 'PART_TIME': return 'Temps partiel';
      case 'TEMPORARY': return 'Temporaire';
      case 'CONTRACT': return 'Contrat';
      default: return contractType;
    }
  }

  generateMissingHours() {
    // TODO: Implémenter la génération automatique des heures manquantes
    console.log('Génération des heures manquantes...');
  }

  exportReport() {
    // TODO: Implémenter l'export du rapport
    console.log('Export du rapport...');
  }
}
