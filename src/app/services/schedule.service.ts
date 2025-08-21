import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Schedule, ScheduleAssignment, ScheduleAssignmentRequest, ScheduleResponse, WeeklyScheduleRule } from '../shared/models/schedule.model';
import { AssignmentDTO, EmployeePlanningDTO, SitePlanningResponse } from '../shared/models/employee.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  private readonly api = environment.apiUrl;

  constructor(private http: HttpClient, private auth: AuthService) { }

  list(params?: {
    siteId?: number;
    month?: number;
    year?: number;
    published?: boolean;
  }): Observable<Schedule[]> {

    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v === undefined || v === null) return;
        httpParams = httpParams.set(k, String(v));
      });
    }

    const url = `${this.api}/schedules`;
    return this.http.get<any[]>(url, { params: httpParams }).pipe(
      // (optionnel) logs de debug
      // tap(res => console.log('[DEBUG] /schedules raw:', res)),
      map(list => (Array.isArray(list) ? list : []).map(dto => this.toSchedule(dto)))
    );
  }

  /** Adapte n'importe quel DTO (ScheduleResponse ou ancien Schedule) vers ton modèle front `Schedule`. */
  private toSchedule(dto: any): Schedule {
    const published = 'published' in dto ? !!dto.published : !!dto.isPublished;
    const sent      = 'sent' in dto ? !!dto.sent : !!dto.isSent;

    return {
      id: dto.id,
      companyId: dto.company?.id ?? dto.companyId ?? 0,
      siteId: dto.siteId ?? dto.site?.id,
      siteName: dto.siteName ?? dto.site?.name ?? '',
      name: dto.name,
      month: dto.month,
      year: dto.year,
      site: dto.site ? { id: dto.site.id, name: dto.site.name } : undefined,

      isPublished: published,
      isSent: sent,
      sentAt: dto.sentAt ? new Date(dto.sentAt) : undefined,

      startDate: dto.startDate ?? '',
      endDate: dto.endDate ?? '',

      createdBy: dto.createdBy,
      completionRate: dto.completionRate ?? 0,
      totalEmployees: dto.totalEmployees,
      totalAssignments: dto.totalAssignments,
      totalHours: dto.totalHours,

      createdAt: dto.createdAt ?? undefined,
      updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : new Date(),

      permissions: dto.permissions ? {
        edit: !!dto.permissions.edit,
        generate: !!dto.permissions.generate,
        publish: !!dto.permissions.publish,
        send: !!dto.permissions.send
      }: undefined,

      status: dto.status ?? (published ? 'APPROVED' : 'DRAFT'),
      canEdit: dto.canEdit === true
    };
  }
  getAll(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/schedules`);
  }

  get(companyId: number, id: number): Observable<ScheduleResponse> {
    return this.http.get<ScheduleResponse>(
      `${environment.apiUrl}/companies/${companyId}/schedules/${id}`
    );
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

sendScheduleToEmployee(scheduleId: number, empId: number) {
  return this.http.post<void>(`${environment.apiUrl}/schedules/${scheduleId}/send/${empId}`, {});
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
