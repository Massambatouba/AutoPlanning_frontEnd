import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AssignmentDTO, ScheduleAssignmentRequest } from '../shared/models/schedule.model';

@Injectable({ providedIn: 'root' })
export class AssignmentService {
  private base = `${environment.apiUrl}/schedules`;

  /** bus de synchro cross-écrans */
  private _refresh$ = new BehaviorSubject<{ scheduleId: number } | null>(null);
  readonly refresh$ = this._refresh$.asObservable();

  constructor(private http: HttpClient) {}

  listBySchedule(scheduleId: number): Observable<AssignmentDTO[]> {
    return this.http.get<AssignmentDTO[]>(`${this.base}/${scheduleId}/assignments`);
  }

  addAssignment(scheduleId: number, body: ScheduleAssignmentRequest): Observable<AssignmentDTO> {
    return this.http
      .post<AssignmentDTO>(`${this.base}/${scheduleId}/assignments`, body)
      .pipe(tap(() => this._refresh$.next({ scheduleId })));
  }

  updateAssignment(
    scheduleId: number,
    assignmentId: number,
    body: ScheduleAssignmentRequest
  ): Observable<AssignmentDTO> {
    return this.http
      .put<AssignmentDTO>(`${this.base}/${scheduleId}/assignments/${assignmentId}`, body)
      .pipe(tap(() => this._refresh$.next({ scheduleId })));
  }

  deleteAssignment(scheduleId: number, assignmentId: number): Observable<void> {
    return this.http
      .delete<void>(`${this.base}/${scheduleId}/assignments/${assignmentId}`)
      .pipe(tap(() => this._refresh$.next({ scheduleId })));
  }
}
