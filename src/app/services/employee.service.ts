import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Employee } from '../shared/models/employee.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
 constructor(private http: HttpClient) {}

  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${environment.apiUrl}/employees`);
  }

  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${environment.apiUrl}/employees/${id}`);
  }

  createEmployee(employee: Partial<Employee>): Observable<Employee> {
    return this.http.post<Employee>(`${environment.apiUrl}/employees`, employee);
  }

  updateEmployee(id: number, employee: Partial<Employee>): Observable<Employee> {
    return this.http.put<Employee>(`${environment.apiUrl}/employees/${id}`, employee);
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/employees/${id}`);
  }

  activateEmployee(id: number): Observable<Employee> {
    return this.http.put<Employee>(`${environment.apiUrl}/employees/${id}/activate`, {});
  }

  deactivateEmployee(id: number): Observable<Employee> {
    return this.http.put<Employee>(`${environment.apiUrl}/employees/${id}/deactivate`, {});
  }

  getEmployeeSchedules(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/employees/${id}/schedules`);
  }
}
