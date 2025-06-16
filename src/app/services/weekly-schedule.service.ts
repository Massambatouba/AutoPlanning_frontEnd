import { WeeklyScheduleRule, WeeklyScheduleRuleRequest } from './../shared/models/weekly-schedule.module';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WeeklyScheduleService {

  constructor(private http: HttpClient) {}

  defineWeeklyRule(siteId: number, rules: Partial<WeeklyScheduleRule>[]): Observable<WeeklyScheduleRule[]> {
    return this.http.post<WeeklyScheduleRule[]>(`${environment.apiUrl}/sites/${siteId}/weekly-schedule-rule`, rules);
  }

  // getWeeklyRules(siteId: number): Observable<WeeklyScheduleRule[]> {
  //   return this.http.get<WeeklyScheduleRule[]>(`${environment.apiUrl}/sites/${siteId}/weekly-schedule-rule`);
  // }
getWeeklyRules(siteId: number): Observable<WeeklyScheduleRule[]> {
  return this.http.get<WeeklyScheduleRule[]>(`${environment.apiUrl}/sites/${siteId}/weekly-schedule-rule`);
}

  createTemplate(siteId: number, template: Partial<WeeklyScheduleRule>): Observable<WeeklyScheduleRule> {
      return this.http.post<WeeklyScheduleRule>(`${environment.apiUrl}/sites/${siteId}/weekly-schedule-rule`, template);
  }


updateWeeklyRule(siteId: number, rules: WeeklyScheduleRuleRequest[]) {
  return this.http.put<WeeklyScheduleRule[]>(`${environment.apiUrl}/sites/${siteId}/weekly-schedule-rule`, rules);
}


  toggleTemplateStatus(siteId: number, templateId: number): Observable<WeeklyScheduleRule> {
    return this.http.put<WeeklyScheduleRule>(
      `${environment.apiUrl}/sites/${siteId}/weekly-schedule-rule/${templateId}/toggle`,
      {}
    );
  }

deleteAllWeeklyRules(siteId: number) {
  return this.http.delete<void>(`${environment.apiUrl}/sites/${siteId}/weekly-schedule-rule`);
}
}

