import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EmployeeService } from 'src/app/services/employee.service';
import { Employee } from 'src/app/shared/models/employee.model';
import { EmployeeRoutingModule } from '../employee-routing.model';

@Component({
  standalone: true,
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ReactiveFormsModule,
    EmployeeRoutingModule
  ]
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  loading = true;
  error = '';

  // Filtres
  searchTerm = '';
  statusFilter = 'all';
  departmentFilter = 'all';
  contractTypeFilter = 'all';

  // Pagination
  page = 1;
  currentPage = 1;
  pageSize = 10;

  departments = [
    'Administration',
    'Securite',
    'Technique',
    'Support',
    'Ressources Humaines'
  ];

  contractTypes = [
    { value: 'FULL_TIME', label: 'Temps plein' },
    { value: 'PART_TIME', label: 'Temps partiel' },
    { value: 'TEMPORARY', label: 'Temporaire' },
    { value: 'CONTRACT', label: 'Contrat' }
  ];

  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.employeeService.getEmployees(this.departmentFilter, this.contractTypeFilter)
      .subscribe({
        next: (employees) => {
          this.employees = employees;
          this.applyFilters();
          this.loading = false;
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
        }
      });
  }

    applyFilters() {
    this.currentPage = 1;
    this.filteredEmployees = this.employees.filter(emp => {
      const term = this.searchTerm.toLowerCase();
      const matchesSearch =
        !term ||
        emp.firstName.toLowerCase().includes(term) ||
        emp.lastName.toLowerCase().includes(term) ||
        emp.email.toLowerCase().includes(term) ||
        emp.employeeCode.toLowerCase().includes(term);

      const matchesStatus =
        this.statusFilter === 'all' ||
        (this.statusFilter === 'active' && emp.active) ||
        (this.statusFilter === 'inactive' && !emp.active);

      const matchesDept =
        this.departmentFilter === 'all' ||
        emp.department === this.departmentFilter;

      const matchesContract =
        this.contractTypeFilter === 'all' ||
        emp.contractType === this.contractTypeFilter;

      return matchesSearch && matchesStatus && matchesDept && matchesContract;
    });
  }

  
// pagination helpers
  totalPages(): number {
    return Math.ceil(this.filteredEmployees.length / this.pageSize);
  }

  pagesArray(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  }

  pagedEmployees(): Employee[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredEmployees.slice(start, start + this.pageSize);
  }

  goToPage(p: number) {
    this.currentPage = p;
  }
  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }
  nextPage() {
    if (this.currentPage < this.totalPages()) this.currentPage++;
  }

  toggleStatus(emp: Employee) {
    this.employeeService.toggleEmployeeStatus(emp.id).subscribe({
      next: updated => {
        const idx = this.employees.findIndex(e => e.id === emp.id);
        this.employees[idx] = updated;
        this.applyFilters();
      },
      error: err => (this.error = err.message)
    });
  }

  getContractTypeLabel(type: string): string {
    const ct = this.contractTypes.find(x => x.value === type);
    return ct ? ct.label : type;
  }

  resetFilters() {
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.departmentFilter = 'all';
    this.contractTypeFilter = 'all';
    this.applyFilters();
  }
}
