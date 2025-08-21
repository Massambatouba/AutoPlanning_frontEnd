import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Site } from '../shared/models/site.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SiteService {
  private api = `${environment.apiUrl}`;
constructor(private http: HttpClient) {}

getSites(): Observable<Site[]> {
  return this.http.get<Site[]>(`${this.api}/sites`).pipe(
    map(list => list.map(s => ({
      ...s,
      active: (s as any).active ?? (s as any).isActive ?? false
    })))
  );
}

  getSiteById(id: number): Observable<Site> {
    return this.http.get<Site>(`${this.api}/sites/${id}`);
  }

  createSite(site: Partial<Site>): Observable<Site> {
    return this.http.post<Site>(`${this.api}/sites`, site);
  }

  updateSite(id: number, site: Partial<Site>): Observable<Site> {
    return this.http.put<Site>(`${this.api}/sites/${id}`, site);
  }

  deleteSite(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/sites/${id}`);
  }

  activateSite(id: number): Observable<Site> {
    return this.http.put<Site>(`${this.api}/sites/${id}/activate`, {});
  }

  deactivateSite(id: number): Observable<Site> {
    return this.http.put<Site>(`${this.api}/sites/${id}/deactivate`, {});
  }

  toggleSiteStatus(id: number): Observable<Site> {
  return this.http.put<Site>(`${this.api}/sites/${id}/toggle-status`, {});
}

  list(params?: { city?: string; active?: boolean }): Observable<Site[]> {
    let p = new HttpParams();
    if (params?.city)   p = p.set('city', params.city);
    if (params?.active !== undefined) p = p.set('active', String(params.active));
    return this.http.get<Site[]>(`${this.api}/sites`, { params: p });
  }
}
