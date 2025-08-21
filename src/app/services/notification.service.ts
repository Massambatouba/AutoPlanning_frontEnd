import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable }             from '@angular/core';
import { Observable }             from 'rxjs';
import { environment }            from 'src/environments/environment';
import { Notification }           from '../shared/models/company.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {

  private api = environment.apiUrl;   // ex. http://localhost:8080

  constructor(private http: HttpClient) {}

  /** Récupère les “limit” dernières notifications de la société courante */
  getRecent(limit = 10): Observable<Notification[]> {
    const params = new HttpParams().set('limit', limit);
    return this.http.get<Notification[]>(`${this.api}/dashboard/notifications`, { params });
  }
}
