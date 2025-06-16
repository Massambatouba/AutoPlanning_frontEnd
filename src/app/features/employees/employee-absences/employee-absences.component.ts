import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Absence, AbsenceType } from 'src/app/shared/models/absence.model';
import { AbsenceService } from 'src/app/services/absence.service';
import { AuthService } from 'src/app/services/auth.service'; // Tu dois l’avoir ou le créer
import { CommonModule, DatePipe, NgClass, NgIf } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-employee-absences',
  templateUrl: './employee-absences.component.html',
  styleUrls: ['./employee-absences.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgClass,
    NgIf,
    DatePipe
  ]
})
export class EmployeeAbsencesComponent implements OnInit {

  absenceForm: FormGroup;
  absences: Absence[] = [];
  showAddForm = false;
  saving = false;
  employeeId!: number;
  editingId: number | null = null;

  editForm: FormGroup = this.formBuilder.group({
  startDate: ['', Validators.required],
  endDate: ['', Validators.required],
  type: ['', Validators.required],
  reason: ['']
  });

  absenceTypes = [
    { value: AbsenceType.CONGE_PAYE, label: 'Congé Payé' },
    { value: AbsenceType.CONGE_SANS_SOLDE, label: 'Congé Sans Solde' },
    { value: AbsenceType.MALADIE, label: 'Maladie' },
    { value: AbsenceType.ABSENCE_NON_JUSTIFIEE, label: 'Absence Non Justifiée' },
    { value: AbsenceType.CONGE_PARENTAL, label: 'Congé Parental' },
    { value: AbsenceType.AUTRE, label: 'Autre' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private absenceService: AbsenceService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {
    this.absenceForm = this.formBuilder.group({
      type: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      reason: ['']
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
    this.employeeId = +params['id'];
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    this.absenceService.getEmployeeAbsences(this.employeeId, year, month).subscribe({
      next: (data) => this.absences = data,
      error: (err) => console.error('Erreur chargement absences :', err)
    });
  }); 
  }

  startEdit(absence: Absence) {
  this.editingId = absence.id;
  this.editForm.patchValue({
    startDate: this.formatDate(absence.startDate),
    endDate: this.formatDate(absence.endDate),
    type: absence.type,
    reason: absence.reason
  });
  }

  cancelEdit() {
  this.editingId = null;
}

submitEdit(id: number) {
  if (this.editForm.invalid) return;

  const data = {
    ...this.editForm.value,
    employeeId: this.employeeId
  };

  this.absenceService.updateAbsence(id, data).subscribe({
    next: (updated) => {
      const index = this.absences.findIndex(a => a.id === id);
      if (index !== -1) this.absences[index] = updated;
      this.editingId = null;
    },
    error: (err) => console.error('Erreur maj', err)
  });
}

delete(id: number) {
  if (!confirm('Confirmer la suppression ?')) return;

  this.absenceService.deleteAbsence(id).subscribe({
    next: () => {
      this.absences = this.absences.filter(a => a.id !== id);
    },
    error: (err) => console.error('Erreur suppression', err)
  });
}

private formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toISOString().split('T')[0]; // yyyy-mm-dd
}


  onSubmit() {
    if (this.absenceForm.invalid) return;

    this.saving = true;
    const formData = {
      employeeId: this.employeeId,
      ...this.absenceForm.value
    };

    this.absenceService.addAbsence(formData).subscribe({
      next: (absence) => {
        this.absences.push(absence);
        this.absenceForm.reset();
        this.showAddForm = false;
        this.saving = false;
      },
      error: (err) => {
        console.error('Erreur enregistrement', err);
        this.saving = false;
      }
    });
  }

  canModifyOrDelete(absence: Absence): boolean {
    const today = new Date();
    return new Date(absence.startDate) >= today;
  }

  getTypeLabel(type: AbsenceType): string {
    const absenceType = this.absenceTypes.find(t => t.value === type);
    return absenceType ? absenceType.label : type;
  }

  getTypeClass(type: AbsenceType): string {
    switch (type) {
      case AbsenceType.CONGE_PAYE:
        return 'badge-success';
      case AbsenceType.MALADIE:
        return 'badge-warning';
      case AbsenceType.ABSENCE_NON_JUSTIFIEE:
        return 'badge-error';
      case AbsenceType.ABSENCE_NON_JUSTIFIEE:
        return 'badge-error';
      default:
        return 'badge-info';
    }
  }
}
