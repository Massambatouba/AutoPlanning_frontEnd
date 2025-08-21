// src/app/services/dashboard.service.ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { Schedule }   from '../shared/models/schedule.model';

export interface DashboardStats {
  schedulesCount: number;
  employeesCount: number;
  sitesCount:     number;
  completionRate: number;
}

@Injectable({providedIn: 'root'})
export class DashboardService {

  constructor(private http: HttpClient) {}

  private api = `${environment.apiUrl}/dashboard`;


  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.api}/stats`);
  }

  getRecent(limit = 5): Observable<Schedule[]> {
    return this.http.get<Schedule[]>(
      `${this.api}/recent-schedules`, { params: { limit } }
    );
  }
}
