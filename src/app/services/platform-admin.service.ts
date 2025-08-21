import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { CompanyOverview, PageResponse, PlatformStats, RevenueData, SubscriptionPlan } from "../shared/models/platform-admin.model";
import { map, Observable } from "rxjs";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class PlatformAdminService {
  private readonly api = `${environment.apiUrl}/platform-admin`;

  constructor(private http: HttpClient) {}

  /** 1) Stats globales */
  getPlatformStats(): Observable<PlatformStats> {
    return this.http.get<PlatformStats>(`${this.api}/stats`);
  }

  /** 2) Entreprises (liste) */
  getCompanies(
    page = 0,
    size = 20,
    search?: string,
    status?: string
  ): Observable<PageResponse<CompanyOverview>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (search) params = params.set('q', search);
    if (status) params = params.set('status', status);

    return this.http.get<PageResponse<CompanyOverview>>(
      `${this.api}/companies`,
      { params }
    );
  }

  /** Activer / désactiver */
  updateCompanyStatus(id: number, active: boolean): Observable<CompanyOverview> {
    return this.http.patch<CompanyOverview>(
      `${this.api}/companies/${id}/toggle-status`,
      { active }
    );
  }

// platform-admin.service.ts
updateCompanySubscription(
  id: number,
  planId: number | null,
  status: string
): Observable<CompanyOverview> {
  return this.http.put<CompanyOverview>(
    `${this.api}/companies/${id}/subscription`,
    { planId, status }            
  );
}

// pour le détail
getCompanyById(id: number): Observable<CompanyOverview> {
  return this.http.get<any>(`${this.api}/companies_id/${id}`).pipe(
    map(c => ({
      ...c,
      // garde ces normalisations si besoin
      employeesCount: c?.employeesCount ?? c?.employees_count ?? 0,
      sitesCount:     c?.sitesCount     ?? c?.sites_count     ?? 0,
    }))
  );
}


  deleteCompany(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/companies/${id}`);
  }

  /** 3) Plans d’abonnement */
  getSubscriptionPlans(): Observable<SubscriptionPlan[]> {
    return this.http.get<SubscriptionPlan[]>(`${this.api}/subscription-plans`);
  }

  /** 4) Revenus (courbe) */
  getRevenueData(months = 6): Observable<RevenueData[]> {
    const params = new HttpParams().set('months', months.toString());
    return this.http.get<RevenueData[]>(`${this.api}/revenues`, { params });
  }
}
