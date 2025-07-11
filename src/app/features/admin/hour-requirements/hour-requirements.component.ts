import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContractHourRequirement } from 'src/app/shared/models/contractHour.model';
import { HourComplianceService } from 'src/app/services/hour-compliance.service';

@Component({
  selector: 'app-hour-requirements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hour-requirements.component.html',
  styleUrls: ['./hour-requirements.component.scss']
})
export class HourRequirementsComponent {
 requirements: ContractHourRequirement[] = [];
  loading = false;
  saving = false;
  error = '';
  editingId: number | null = null;
  editForm: any = {};

  constructor(private complianceService: HourComplianceService) {}

  ngOnInit() {
    this.loadRequirements();
  }

  loadRequirements() {
    this.loading = true;
    this.error = '';

    this.complianceService.getRequirements().subscribe({
      next: (requirements) => {
        this.requirements = requirements;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des exigences';
        this.loading = false;
        console.error('Requirements error:', error);
      }
    });
  }

  initializeRequirements() {
    this.loading = true;
    this.error = '';

    this.complianceService.initializeRequirements().subscribe({
      next: () => {
        this.loadRequirements();
      },
      error: (error) => {
        this.error = 'Erreur lors de l\'initialisation des exigences';
        this.loading = false;
        console.error('Initialize error:', error);
      }
    });
  }

  startEdit(requirement: ContractHourRequirement) {
    if (requirement.contractType === 'FULL_TIME') {
      return; // Ne pas permettre l'édition des FULL_TIME
    }

    this.editingId = requirement.id;
    this.editForm = {
      contractType: requirement.contractType,
      minimumHoursPerMonth: requirement.minimumHoursPerMonth,
      description: requirement.description
    };
  }

  cancelEdit() {
    this.editingId = null;
    this.editForm = {};
  }

  saveRequirement(requirement: ContractHourRequirement) {
    this.saving = true;
    this.error = '';

    this.complianceService.updateRequirement(this.editForm).subscribe({
      next: (updated) => {
        const index = this.requirements.findIndex(r => r.id === requirement.id);
        if (index !== -1) {
          this.requirements[index] = updated;
        }
        this.editingId = null;
        this.editForm = {};
        this.saving = false;
      },
      error: (error) => {
        this.error = 'Erreur lors de la sauvegarde';
        this.saving = false;
        console.error('Save error:', error);
      }
    });
  }

  getContractLabel(contractType: string): string {
    const labels: { [key: string]: string } = {
      'FULL_TIME': 'Temps Plein',
      'PART_TIME': 'Temps Partiel',
      'TEMPORARY': 'Temporaire',
      'CONTRACT': 'Contrat'
    };
    return labels[contractType] || contractType;
  }
}
