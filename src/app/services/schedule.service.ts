import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Schedule, ScheduleAssignment, ScheduleAssignmentRequest } from '../shared/models/schedule.model';
import { AssignmentDTO } from '../shared/models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  private readonly api = environment.apiUrl;

  constructor(private http: HttpClient) { }

  list(params?: {
    siteId?: number;
    month?: number;
    year?: number;
    published?: boolean;
  }): Observable<Schedule[]> {

    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v === undefined || v === null) { return; }
      
        if (typeof v === 'string' && v === 'all') { return; }
      
        httpParams = httpParams.set(k, String(v));
      });
    }
    return this.http.get<Schedule[]>(`${this.api}/schedules`, { params: httpParams });
  }

  getAll(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/schedules`);
  }

  getScheduleById(id: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/schedules/${id}`);
  }

  createSchedule(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/schedules`, data);
  }

  generateAssignments(scheduleId: number): Observable<any> {
    return this.http.post(`${environment.apiUrl}/schedules/${scheduleId}/generate-assignments`, {});
  }
  
  getScheduleAssignments(scheduleId: number): Observable<any> {
  return this.http.get(
    `${environment.apiUrl}/schedules/${scheduleId}/assignments`
  );
  }

  updateAssignment(scheduleId: number, assignmentId: number, data: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/schedules/${scheduleId}/assignments/${assignmentId}`, data);
  }

  deleteAssignment(
    scheduleId: number,
    assignmentId: number
  ): Observable<void> {
    return this.http.delete<void>(
      `/schedules/${scheduleId}/assignments/${assignmentId}`
    );
  }


  updateSchedule(id: number, data: Partial<Schedule>): Observable<Schedule> {
    return this.http.put<Schedule>(
      `${environment.apiUrl}/schedules/${id}`,
      data
    );
  }

  publishSchedule(scheduleId: number): Observable<any> {
    return this.http.post(`${environment.apiUrl}/schedules/${scheduleId}/publish`, {});
  }

  send(scheduleId: number): Observable<any> {
    return this.http.post(`${environment.apiUrl}/schedules/${scheduleId}/send`, {});
  }

  getSchedulesBySite(siteId: number): Observable<Schedule[]> {
    return this.http.get<Schedule[]>(`${environment.apiUrl}/schedules`, {
      params: { siteId: siteId.toString() }
    });
  }

  getSchedulesByEmployee(employeeId: number): Observable<Schedule[]> {
    return this.http.get<Schedule[]>(`${environment.apiUrl}/schedules`, {
      params: { employeeId: employeeId.toString() }
    });
  }

  addAssignment(
    scheduleId: number,
    request: ScheduleAssignmentRequest
  ): Observable<AssignmentDTO> {
    return this.http.post<AssignmentDTO>(
      `/schedules/${scheduleId}/assignments`,
      request
    );
  }
}
