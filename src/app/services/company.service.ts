import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Company } from '../shared/models/company.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  constructor(private http: HttpClient) {}

  /** Récupère une compagnie par son id */
  getById(companyId: number): Observable<Company> {
    return this.http.get<Company>(`${environment.apiUrl}/companies/${companyId}`);
  }

  /** Met-à-jour une compagnie (multipart/form-data) */
  updateCompany(companyId: number, formData: FormData): Observable<Company> {
    return this.http.put<Company>(`${environment.apiUrl}/companies/${companyId}`, formData);
  }

  /** Statistiques agrégées (employés, sites, plannings, etc.) */
  getCompanyStats(companyId: number): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/companies/${companyId}/stats`);
  }

  /** Limites d’abonnement (nombre max d’employés, de sites…) */
  getCompanyLimits(companyId: number): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/companies/${companyId}/limits`);
  }
}
