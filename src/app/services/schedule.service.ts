import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Schedule, ScheduleAssignment, ScheduleAssignmentRequest, WeeklyScheduleRule } from '../shared/models/schedule.model';
import { AssignmentDTO, EmployeePlanningDTO, SitePlanningResponse } from '../shared/models/employee.model';

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

  generateAssignments(scheduleId: number): Observable<Schedule> {
    return this.http.post<Schedule>(`${environment.apiUrl}/schedules/${scheduleId}/generate-assignments`, {});
  }

  assignments(scheduleId: number): Observable<ScheduleAssignment[]> {
    return this.http.get<ScheduleAssignment[]>(`${this.api}/schedules/${scheduleId}/assignments`);
  }



  getScheduleAssignments(scheduleId: number): Observable<ScheduleAssignment[]> {
  return this.http.get<ScheduleAssignment[]>(
    `${this.api}/schedules/${scheduleId}/assignments`
  );
  }

  updateAssignment(scheduleId: number, id: number, dto: Partial<ScheduleAssignment>) {
    return this.http.put(`${this.api}/${scheduleId}/assignments/${id}`, dto);
  }

  generateSchedule(siteId: number, month: number, year: number): Observable<Schedule> {
    return this.http.post<Schedule>(`${environment.apiUrl}/generate`, null, {
    params: {
    siteId: siteId.toString(),
    month: month.toString(),
    year: year.toString()
    }
    });
  }

getSitePlanning(siteId: number, month: number, year: number) {
  return this.http.get<SitePlanningResponse>(
    `${environment.apiUrl}/planning/site/${siteId}`,
    { params: { month, year } }
  );
}


deleteAssignment(scheduleId: number, id: number) {
    return this.http.delete(`${this.api}/${scheduleId}/assignments/${id}`);
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

getSiteEmployees(siteId: number): Observable<EmployeePlanningDTO[]> {
  return this.http.get<EmployeePlanningDTO[]>(
    `${environment.apiUrl}/sites/${siteId}/employees`
  );
}


getSchedulesByEmployee(employeeId: number): Observable<Schedule[]> {
    return this.http.get<Schedule[]>(`${environment.apiUrl}/schedules`, {
      params: { employeeId: employeeId.toString() }
    });
}

addAssignment(scheduleId: number, dto: ScheduleAssignmentRequest) {
    return this.http.post(`${this.api}/${scheduleId}/assignments`, dto);
}

getWeeklyRules(siteId: number) {
  return this.http.get<WeeklyScheduleRule[]>(`${environment.apiUrl}/sites/${siteId}/weekly-schedule-rule`);
}


}
