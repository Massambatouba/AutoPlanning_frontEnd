import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AssignmentDTO } from '../shared/models/employee.model';
import { Observable } from 'rxjs';
import { ScheduleAssignment, ScheduleAssignmentRequest } from '../shared/models/schedule.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AssignmentService {

private base = `${environment.apiUrl}/schedules`;

  constructor(private http: HttpClient) {}

  addAssignment(
    scheduleId: number,
    request: ScheduleAssignmentRequest
  ): Observable<AssignmentDTO> {
    return this.http.post<AssignmentDTO>(
      `${this.base}/${scheduleId}/assignments`,
      request
    );
  }

  updateAssignment(assignmentId: number, assignmentData: any): Observable<any> {
  return this.http.put(`${this.base}/assignments/${assignmentId}`, assignmentData);
}

  deleteAssignment(
    scheduleId: number,
    assignmentId: number
  ): Observable<void> {
    return this.http.delete<void>(
      `${this.base}/${scheduleId}/assignments/${assignmentId}`
    );
  }
}
