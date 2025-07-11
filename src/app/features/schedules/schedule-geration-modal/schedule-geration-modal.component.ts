import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Site } from 'src/app/shared/models/site.model';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-schedule-geration-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './schedule-geration-modal.component.html',
  styleUrls: ['./schedule-geration-modal.component.scss']
})
export class ScheduleGerationModalComponent {

   @Input() sites: Site[] = [];

  generationForm: FormGroup;
  loading = false;

  months = [
    { value: 1, label: 'Janvier' },
    { value: 2, label: 'Février' },
    { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' },
    { value: 5, label: 'Mai' },
    { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' },
    { value: 8, label: 'Août' },
    { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' },
    { value: 12, label: 'Décembre' }
  ];

  years: number[] = [];

  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder
  ) {
    this.generationForm = this.formBuilder.group({
      siteId: ['', Validators.required],
      month: ['', Validators.required],
      year: ['', Validators.required]
    });

    // Générer les années (année courante + 2 suivantes)
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 3; i++) {
      this.years.push(currentYear + i);
    }
  }

  onSubmit(): void {
    if (this.generationForm.invalid) {
      this.generationForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    // Simuler un délai de génération
    setTimeout(() => {
      this.activeModal.close(this.generationForm.value);
    }, 1500);
  }

}
