import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Employee, EmployeePlanningDTO } from '../shared/models/employee.model';
import { environment } from 'src/environments/environment';
import { EmployeeMonthlyPlanningDTO, EmployeeMonthlySummary } from '../shared/models/employee-planning-agg.model';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly ROOT = `${environment.apiUrl}`;                 // ex: http://localhost:8080/api
  private readonly EMP  = `${this.ROOT}/employees`;
  private readonly SITES = `${this.ROOT}/sites`;
  private readonly PLANNING = `${this.ROOT}/planning`;

  constructor(private http: HttpClient) {}

  /** Liste filtrée (department & contractType facultatifs) */
  getEmployees(department?: string, contractType?: string): Observable<Employee[]> {
    let params = new HttpParams();
    if (department && department !== 'all')  params = params.set('department', department);
    if (contractType && contractType !== 'all') params = params.set('contractType', contractType);
    return this.http.get<Employee[]>(this.EMP, { params });
  }

  /** Tous les employés (sans filtre) */
  getAllEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.EMP}/all`);
  }

  /** Employés actifs d’un site (pour planning site) */
  getSiteEmployees(siteId: number): Observable<EmployeePlanningDTO[]> {
    return this.http.get<EmployeePlanningDTO[]>(`${this.SITES}/${siteId}/employees`)
      .pipe(map(employees =>
        employees.filter(emp => emp.employeeId && emp.employeeName && emp.employeeName.trim() !== '')
      ));
  }

  /** Un seul employé */
  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.EMP}/${id}`);
  }

  createEmployee(employee: Partial<Employee>): Observable<Employee> {
    return this.http.post<Employee>(this.EMP, employee);
  }

  updateEmployee(id: number, employee: Partial<Employee>): Observable<Employee> {
    return this.http.put<Employee>(`${this.EMP}/${id}`, employee);
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.EMP}/${id}`);
  }

  /** Basculer statut actif/inactif */
  toggleEmployeeStatus(id: number): Observable<Employee> {
    return this.http.put<Employee>(`${this.EMP}/${id}/toggle-status`, {});
  }

  /** Schedules d’un employé (si tu l’utilises) */
  getEmployeeSchedules(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.EMP}/${id}/schedules`);
  }

  /** Planning mensuel (classique) */
  getMonthlyPlanning(employeeId: number, month: number, year: number): Observable<any> {
    const params = new HttpParams().set('month', month).set('year', year);
    return this.http.get(`${this.PLANNING}/employee/${employeeId}`, { params });
  }

  /** Planning mensuel agrégé (multi-sites) */
  getAggregatedMonthlyPlanning(employeeId: number, month: number, year: number) {
    return this.http.get<EmployeeMonthlyPlanningDTO>(
      `${this.EMP}/${employeeId}/planning/aggregated`,
      { params: { year, month } as any }
    );
  }

  /** Résumés mensuels (12 mois) */
  listMonthlyPlanningSummaries(employeeId: number, year: number) {
    return this.http.get<EmployeeMonthlySummary[]>(
      `${this.EMP}/${employeeId}/planning/summaries`,
      { params: { year } as any }
    );
  }
}
