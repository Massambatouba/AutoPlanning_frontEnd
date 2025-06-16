import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Employee } from '../shared/models/employee.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
private base = `${environment.apiUrl}/employees`;
constructor(private http: HttpClient) {}

/** Liste filtrée (department & contractType facultatifs) */
getEmployees(department?: string, contractType?: string): Observable<Employee[]> {
  let params = new HttpParams();
    if (department && department !== 'all') {
      params = params.set('department', department);
  }
    if (contractType && contractType !== 'all') {
      params = params.set('contractType', contractType);
  }
    return this.http.get<Employee[]>(this.base, { params });
}

/** Tous les employés (sans filtre) */
  getAllEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.base}/all`);
  }

/** Récupérer un seul */
  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.base}/${id}`);
  }

  createEmployee(employee: Partial<Employee>): Observable<Employee> {
    return this.http.post<Employee>(this.base, employee);
  }

  updateEmployee(id: number, employee: Partial<Employee>): Observable<Employee> {
    return this.http.put<Employee>(`${this.base}/${id}`, employee);
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/employees/${id}`);
  }

/** Basculer statut actif/inactif */
  toggleEmployeeStatus(id: number): Observable<Employee> {
    return this.http.put<Employee>(`${this.base}/${id}/toggle-status`, {});
  }

  getEmployeeSchedules(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/employees/${id}/schedules`);
  }

  /** Récupérer le planning mensuel d'un employé */
getMonthlyPlanning(employeeId: number, month: number, year: number): Observable<any> {
  const params = new HttpParams()
    .set('month', month)
    .set('year', year);
  return this.http.get(`${environment.apiUrl}/planning/employee/${employeeId}`, { params });
}

}
