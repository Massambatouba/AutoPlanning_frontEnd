import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { EmployeeService } from 'src/app/services/employee.service';
import { Employee } from 'src/app/shared/models/employee.model';
import { CompanyRoutingModule } from '../../company/company-routing.model';
import { EmployeeRoutingModule } from '../employee-routing.model';

@Component({
  standalone: true,
  selector: 'app-employee-detail',
  templateUrl: './employee-detail.component.html',
  styleUrls: ['./employee-detail.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    CompanyRoutingModule,
    EmployeeRoutingModule
  ]
})
export class EmployeeDetailComponent {
   employee: Employee | null = null;
  loading = true;
  error = '';

  contractTypes = {
    'FULL_TIME': 'Temps plein',
    'PART_TIME': 'Temps partiel',
    'TEMPORARY': 'Temporaire',
    'CONTRACT': 'Contrat'
  };

  constructor(
    private route: ActivatedRoute,
    private employeeService: EmployeeService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadEmployee(id);
  }

  private loadEmployee(id: number) {
    this.employeeService.getEmployeeById(id)
      .subscribe({
        next: (employee) => {
          this.employee = employee;
          this.loading = false;
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
        }
      });
  }

  toggleEmployeeStatus() {
    if (!this.employee) return;

    const action = this.employee.active ?
      this.employeeService.toggleEmployeeStatus(this.employee.id) :
      this.employeeService.toggleEmployeeStatus(this.employee.id);

    action.subscribe({
      next: (updatedEmployee) => {
        this.employee = updatedEmployee;
      },
      error: (error) => {
        this.error = error.message;
      }
    });
  }

}
