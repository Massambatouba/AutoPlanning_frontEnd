import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AssignmentDTO } from '../shared/models/employee.model';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ScheduleAssignment, ScheduleAssignmentRequest } from '../shared/models/schedule.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AssignmentService {

private base = `${environment.apiUrl}/schedules`;

   /** ---- bus de rafraîchissement ---- */
  private _refresh$ = new BehaviorSubject<void>(undefined);
  /** Flux public : on s'abonne depuis les composants */
  readonly refresh$ = this._refresh$.asObservable(); 

  constructor(private http: HttpClient) {}

  addAssignment(
    scheduleId: number,
    request: ScheduleAssignmentRequest
  ): Observable<AssignmentDTO> {
    return this.http.post<AssignmentDTO>(
      `${this.base}/${scheduleId}/assignments`,
      request
    ).pipe(tap(() => this._refresh$.next()));
  }

  updateAssignment(assignmentId: number, 
                         assignmentData: any): Observable<any> {
  return this.http
  .put(`${this.base}/assignments/${assignmentId}`, assignmentData)
  .pipe(tap(() => this._refresh$.next()));
}

  deleteAssignment(
    scheduleId: number,
    assignmentId: number
  ): Observable<void> {
    return this.http.delete<void>(
      `${this.base}/${scheduleId}/assignments/${assignmentId}`
    ).pipe(tap(() => this._refresh$.next()));
  }
}
