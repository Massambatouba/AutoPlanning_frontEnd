import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Site } from '../shared/models/site.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SiteService {
  private base = `${environment.apiUrl}/sites`;
constructor(private http: HttpClient) {}

getSites(): Observable<Site[]> {
  return this.http.get<Site[]>(this.base).pipe(
    map(list => list.map(s => ({
      ...s,
      active: (s as any).active ?? (s as any).isActive ?? false
    })))
  );
}

  getSiteById(id: number): Observable<Site> {
    return this.http.get<Site>(`${environment.apiUrl}/sites/${id}`);
  }

  createSite(site: Partial<Site>): Observable<Site> {
    return this.http.post<Site>(`${environment.apiUrl}/sites`, site);
  }

  updateSite(id: number, site: Partial<Site>): Observable<Site> {
    return this.http.put<Site>(`${environment.apiUrl}/sites/${id}`, site);
  }

  deleteSite(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/sites/${id}`);
  }

  activateSite(id: number): Observable<Site> {
    return this.http.put<Site>(`${environment.apiUrl}/sites/${id}/activate`, {});
  }

  deactivateSite(id: number): Observable<Site> {
    return this.http.put<Site>(`${environment.apiUrl}/sites/${id}/deactivate`, {});
  }

  toggleSiteStatus(id: number): Observable<Site> {
  return this.http.put<Site>(`${environment.apiUrl}/sites/${id}/toggle-status`, {});
}
}
