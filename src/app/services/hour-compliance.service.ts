import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ContractHourRequirement, ScheduleComplianceResponse } from '../shared/models/contractHour.model';

@Injectable({
  providedIn: 'root'
})
export class HourComplianceService {

    private apiUrl = `${environment.apiUrl}/hour-compliance`;

  constructor(private http: HttpClient) {}

  getRequirements(): Observable<ContractHourRequirement[]> {
    return this.http.get<ContractHourRequirement[]>(`${this.apiUrl}/requirements`);
  }

  updateRequirement(requirement: Partial<ContractHourRequirement>): Observable<ContractHourRequirement> {
    return this.http.put<ContractHourRequirement>(`${this.apiUrl}/requirements`, requirement);
  }

  initializeRequirements(): Observable<ContractHourRequirement[]> {
    return this.http.post<ContractHourRequirement[]>(`${this.apiUrl}/requirements/initialize`, {});
  }

  getScheduleCompliance(scheduleId: number): Observable<ScheduleComplianceResponse> {
    return this.http.get<ScheduleComplianceResponse>(`${this.apiUrl}/schedule/${scheduleId}`);
  }

  getMonthlyCompliance(month: number, year: number): Observable<ScheduleComplianceResponse> {
    return this.http.get<ScheduleComplianceResponse>(`${this.apiUrl}/monthly`, {
      params: { month: month.toString(), year: year.toString() }
    });
  }
}

