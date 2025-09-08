import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  SiteWeeklyException,
  SiteWeeklyExceptionRequest
} from '../shared/models/site-weekly-exception.model';

@Injectable({ providedIn: 'root' })
export class SiteWeeklyExceptionService {
  private base = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  list(siteId: number, from?: string, to?: string): Observable<SiteWeeklyException[]> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to)   params = params.set('to', to);
    return this.http.get<SiteWeeklyException[]>(`${this.base}/sites/${siteId}/weekly-exceptions`, { params });
  }

  create(siteId: number, body: SiteWeeklyExceptionRequest): Observable<SiteWeeklyException> {
    return this.http.post<SiteWeeklyException>(`${this.base}/sites/${siteId}/weekly-exceptions`, body);
  }

  update(siteId: number, id: number, body: SiteWeeklyExceptionRequest): Observable<SiteWeeklyException> {
    return this.http.put<SiteWeeklyException>(`${this.base}/sites/${siteId}/weekly-exceptions/${id}`, body);
  }

  delete(siteId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/sites/${siteId}/weekly-exceptions/${id}`);
  }
}
