import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  constructor(private http: HttpClient) { }

  getAll(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/schedules`);
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/schedules/${id}`);
  }

  create(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/schedules`, data);
  }

  generateAssignments(scheduleId: number): Observable<any> {
    return this.http.post(`${environment.apiUrl}/schedules/${scheduleId}/generate-assignments`, {});
  }

  updateAssignment(scheduleId: number, assignmentId: number, data: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/schedules/${scheduleId}/assignments/${assignmentId}`, data);
  }

  deleteAssignment(scheduleId: number, assignmentId: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/schedules/${scheduleId}/assignments/${assignmentId}`);
  }

  publish(scheduleId: number): Observable<any> {
    return this.http.post(`${environment.apiUrl}/schedules/${scheduleId}/publish`, {});
  }

  send(scheduleId: number): Observable<any> {
    return this.http.post(`${environment.apiUrl}/schedules/${scheduleId}/send`, {});
  }
}
