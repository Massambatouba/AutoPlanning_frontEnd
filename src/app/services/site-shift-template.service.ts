import { Injectable } from '@angular/core';
import { SiteShiftTemplate } from '../shared/models/site-shift-template.model';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SiteShiftTemplateService {
 constructor(private http: HttpClient) {}

  getTemplates(siteId: number, active?: boolean): Observable<SiteShiftTemplate[]> {
    let url = `${environment.apiUrl}/sites/${siteId}/templates`;
    if (active !== undefined) {
      url += `?active=${active}`;
    }
    return this.http.get<SiteShiftTemplate[]>(url);
  }

  getTemplate(siteId: number, templateId: number): Observable<SiteShiftTemplate> {
    return this.http.get<SiteShiftTemplate>(`${environment.apiUrl}/sites/${siteId}/templates/${templateId}`);
  }

  createTemplate(siteId: number, template: Partial<SiteShiftTemplate>): Observable<SiteShiftTemplate> {
    return this.http.post<SiteShiftTemplate>(`${environment.apiUrl}/sites/${siteId}/templates`, template);
  }

  updateTemplate(siteId: number, templateId: number, template: Partial<SiteShiftTemplate>): Observable<SiteShiftTemplate> {
    return this.http.put<SiteShiftTemplate>(`${environment.apiUrl}/sites/${siteId}/templates/${templateId}`, template);
  }

  toggleTemplateStatus(siteId: number, templateId: number): Observable<SiteShiftTemplate> {
    return this.http.put<SiteShiftTemplate>(`${environment.apiUrl}/sites/${siteId}/templates/${templateId}/toggle`, {});
  }

  deleteTemplate(siteId: number, templateId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/sites/${siteId}/templates/${templateId}`);
  }
}
