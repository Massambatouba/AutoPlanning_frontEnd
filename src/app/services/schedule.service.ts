import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Schedule, ScheduleAssignment, ScheduleAssignmentRequest, ScheduleException, ScheduleResponse, WeeklyScheduleRule } from '../shared/models/schedule.model';
import { AuthService } from './auth.service';
import { EmployeePlanningDTO, SitePlanningResponse } from '../shared/models/employee.model';

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

      periodType: dto.periodType ?? (dto.startDate && dto.endDate ? 'RANGE' : 'MONTH'),
      startDate: dto.startDate ?? undefined,
      endDate: dto.endDate ?? undefined,

      isPublished: published,
      isSent: sent,
      sentAt: dto.sentAt ? new Date(dto.sentAt) : undefined,

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

  getScheduleById(id: number): Observable<Schedule> {
    return this.http.get<any>(`${environment.apiUrl}/schedules/${id}`)
    .pipe(map(dto => this.toSchedule(dto)));
  }

  createSchedule(data: any): Observable<Schedule> {
    return this.http.post<any>(`${environment.apiUrl}/schedules`, data)
     .pipe(map(dto => this.toSchedule(dto)));
  }

    // --- création mensuelle explicite
  createMonthlySchedule(payload: { name: string; siteId: number; month: number; year: number }) {
    return this.http.post(`${this.api}/schedules`, { ...payload, periodType: 'MONTH' });
  }

  // création par plage de dates explicite
  createRangeSchedule(payload: { name: string; siteId: number; startDate: string; endDate: string }) {
    return this.http.post(`${this.api}/schedules`, { ...payload, periodType: 'RANGE' });
  }

  generateAssignments(scheduleId: number): Observable<void> {
    return this.http.post<void>(
      `${environment.apiUrl}/schedules/${scheduleId}/generate-assignments`,
      {}
    );
  }

  assignments(scheduleId: number): Observable<ScheduleAssignment[]> {
    return this.http.get<ScheduleAssignment[]>(`${this.api}/schedules/${scheduleId}/assignments`);
  }



  getScheduleAssignments(scheduleId: number): Observable<ScheduleAssignment[]> {
  return this.http.get<ScheduleAssignment[]>(
    `${this.api}/schedules/${scheduleId}/assignments`
  )
  .pipe(map(list => (Array.isArray(list) ? list : []).map(this.toAssignment)));
  }

  updateAssignment(scheduleId: number, id: number, dto: Partial<ScheduleAssignment>) {
    return this.http.put(`${this.api}/schedules/${scheduleId}/assignments/${id}`, dto)
    .pipe(map(this.toAssignment));
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


createOrRefresh(body: {
  siteId: number;
  periodType: 'MONTH';
  month: number;
  year: number;
}) {
  return this.http.post<{ id: number }>(`${this.api}/schedules`, body);
}



deleteAssignment(scheduleId: number, id: number) {
    return this.http.delete(`${this.api}/schedules/${scheduleId}/assignments/${id}`);
}


updateSchedule(id: number, data: Partial<Schedule>): Observable<Schedule> {
  // Assure un payload compatible avec ScheduleRequest
  const payload: any = {
    ...data,
    periodType: 'MONTH' // on édite bien un planning mensuel dans ton écran
  };

  // (optionnel) forcer number si tes selects renvoient des strings
  if (payload.month) payload.month = +payload.month;
  if (payload.year)  payload.year  = +payload.year;
  if (payload.siteId) payload.siteId = +payload.siteId;

  return this.http.put<any>(`${environment.apiUrl}/schedules/${id}`, payload)
    .pipe(map(dto => this.toSchedule(dto)));
}


publishSchedule(scheduleId: number): Observable<Schedule> {
    return this.http.post<any>(`${environment.apiUrl}/schedules/${scheduleId}/publish`, {})
    .pipe(map(dto => this.toSchedule(dto)));
}

deleteSchedule(id: number): Observable<void> {
  return this.http.delete<void>(`${environment.apiUrl}/schedules/${id}`);
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

getSiteExceptions(siteId: number, start: string, end: string) {
  // le contrôleur attend from / to
  const url = `/api/sites/${siteId}/weekly-exceptions?from=${start}&to=${end}`;
  return this.http.get<ScheduleException[]>(`${this.api}/sites/${siteId}/weekly-exceptions?from=${start}&to=${end}`);
}




getSchedulesByEmployee(employeeId: number): Observable<Schedule[]> {
    return this.http.get<Schedule[]>(`${environment.apiUrl}/schedules`, {
      params: { employeeId: employeeId.toString() }
    });
}

addAssignment(scheduleId: number, dto: ScheduleAssignmentRequest) {
    return this.http.post(`${this.api}/schedules/${scheduleId}/assignments`, dto)
    .pipe(map(this.toAssignment));
}

getWeeklyRules(siteId: number) {
  return this.http.get<WeeklyScheduleRule[]>(`${environment.apiUrl}/sites/${siteId}/weekly-schedule-rule`);
}

// 1) Génération/création mensuelle (corrige l'URL)
generateMonthly(siteId: number, month: number, year: number) {
  return this.http.post(`${environment.apiUrl}/schedules/generate`, null, {
    params: { siteId, month, year }
  });
}

// 2) Génération/création sur une période
generateRange(siteId: number, startDate: string, endDate: string) {
  return this.http.post(`${environment.apiUrl}/schedules/generate-range`, null, {
    params: { siteId, startDate, endDate }
  });
}

// helpers internes
private pad(n: number) { return String(n).padStart(2, '0'); }
private toYmdLocal(d: Date) {
  return `${d.getFullYear()}-${this.pad(d.getMonth()+1)}-${this.pad(d.getDate())}`;
}
private hhmm(x: string | Date): string {
  if (typeof x === 'string') {
    const m = x.match(/(\d{2}):(\d{2})/);
    if (m) return `${m[1]}:${m[2]}`;
  }
  const dt = new Date(x);
  return `${this.pad(dt.getHours())}:${this.pad(dt.getMinutes())}`;
}

private toAssignment = (dto: any): ScheduleAssignment => {
  let dateStr: string;
  if (typeof dto.date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dto.date)) {
    dateStr = dto.date.slice(0, 10);
  } else if (dto.date) {
    dateStr = this.toYmdLocal(new Date(dto.date));
  } else if (dto.day || dto.assignmentDate) {
    dateStr = String(dto.day ?? dto.assignmentDate).slice(0, 10);
  } else {
    dateStr = this.toYmdLocal(new Date());
  }

  return {
    id: dto.id,
    scheduleId: dto.scheduleId ?? dto.schedule?.id,
    siteId: dto.siteId ?? dto.site?.id,
    siteName: dto.siteName ?? dto.site?.name,
    employeeId: dto.employeeId ?? dto.employee?.id,
    employeeName: dto.employeeName ?? dto.employee?.fullName ?? dto.employee?.name ?? 'Employé',
    date: dateStr,                              // <— IMPORTANT: string "YYYY-MM-DD"
    startTime: this.hhmm(dto.startTime),
    endTime: this.hhmm(dto.endTime),
    agentType: dto.agentType,
    duration: dto.duration ?? dto.minutes ?? 0,
    shift: dto.shift,
    notes: dto.notes,
    status: (dto.status ?? 'PENDING') as any,
    createdAt: dto.createdAt ? new Date(dto.createdAt) : new Date(),
    updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : new Date(),
    absence: dto.absence ?? false,
    absenceType: dto.absenceType
  };
};



}
