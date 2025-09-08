import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeLite } from 'src/app/shared/models/employee.model';
import { SiteEmployeesService } from 'src/app/services/site-employees.service';

@Component({
  selector: 'app-assign-employee-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assign-employee-modal.component.html',
  styleUrls: ['./assign-employee-modal.component.scss']
})
export class AssignEmployeeModalComponent {

  @Input() siteId!: number;
  @Output() closed = new EventEmitter<void>();
  @Output() attached = new EventEmitter<EmployeeLite>();

  q = '';
  loading = false;
  error = '';
  list: EmployeeLite[] = [];

  constructor(private api: SiteEmployeesService) {}

  ngOnInit(): void { this.search(); }

  search() {
    this.loading = true;
    this.api.candidates(this.siteId, this.q).subscribe({
      next: v => { this.list = v; this.loading = false; },
      error: e => {
  this.error = e?.error?.message || `Erreur ${e.status} ${e.statusText}`;
    this.loading = false;
  }
    });
  }

  attach(e: EmployeeLite) {
    this.loading = true;
    this.api.attach(this.siteId, e.id).subscribe({
      next: emp => {
        this.loading = false;
        this.attached.emit(emp);
        // on garde le modal ouvert pour en affecter plusieurs d'affilée
        this.search();
      },
      error: e => {
        this.error = e?.error?.message || `Erreur ${e.status} ${e.statusText}`;
        this.loading = false;
      }

    });
  }
}
