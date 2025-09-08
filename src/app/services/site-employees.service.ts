// src/app/services/site-employees.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { EmployeeLite } from '../shared/models/employee.model';


@Injectable({ providedIn: 'root' })
export class SiteEmployeesService {
  private base = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

searchParams(q?: string) { return q ? { params: { q } } : {}; }

candidates(siteId: number, q?: string) {
  return this.http.get<EmployeeLite[]>(
    `${this.base}/sites/${siteId}/employees/candidates`,
    this.searchParams(q)
  );
}

list(siteId: number) {
  return this.http.get<EmployeeLite[]>(`${this.base}/sites/${siteId}/employees`);
}

attach(siteId: number, employeeId: number) {
  return this.http.post<EmployeeLite>(
    `${this.base}/sites/${siteId}/employees/${employeeId}`,
    {}
  );
}
}
