import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Schedule } from '../shared/models/schedule.model';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  constructor(private http: HttpClient) { }

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

  deleteAssignment(scheduleId: number, assignmentId: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/schedules/${scheduleId}/assignments/${assignmentId}`);
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
}
