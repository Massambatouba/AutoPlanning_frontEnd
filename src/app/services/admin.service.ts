import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AdminCmd } from '../shared/models/admin.model';
import { UserDto } from '../shared/models/user.model';
import { AuthService } from './auth.service';
import { AdminInvitation } from '../shared/models/admin-invation.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
private readonly api = environment.apiUrl;
  constructor(private http: HttpClient, private auth: AuthService) {}

  private companyId(): number {
    const id = this.auth.getCurrentUserCompany()?.id;
    if (!id) throw new Error('Aucune entreprise sélectionnée');
    return id;
  }

  /** LIST */
  list(): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(`${this.api}/admins/company/${this.companyId()}`);
  }

  /** CREATE */
  create(cmd: AdminCmd): Observable<UserDto> {
    return this.http.post<UserDto>(`${this.api}/admins`, cmd);
  }

  /** ACCESS: all sites */
  grantAllSites(adminId: number): Observable<UserDto> {
    return this.http.put<UserDto>(`${this.api}/admins/${adminId}/grant-all`, {});
  }

  /** ACCESS: list of sites */
  updateSites(adminId: number, siteIds: number[]): Observable<UserDto> {
    return this.http.put<UserDto>(`${this.api}/admins/${adminId}/sites`, siteIds);
  }

  /** ACCESS: unified endpoint */
  updateAccessAll(id: number) {
    return this.http.put<UserDto>(`${this.api}/admins/${id}/access`, { manageAllSites: true, siteIds: [] });
  }
  updateAccessList(id: number, siteIds: number[]) {
    return this.http.put<UserDto>(`${this.api}/admins/${id}/access`, { manageAllSites: false, siteIds });
  }

  /** STATUS */
  setStatus(adminId: number, active: boolean): Observable<UserDto> {
    return this.http.put<UserDto>(`${this.api}/admins/${adminId}/status`, { active });
  }

  /** DELETE */
  removeAdmin(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/admins/${userId}`);
  }

  /** GET by id (si tu as une page détail) */
  get(id: number): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.api}/admins/${id}`);
  }
  /* ====== INVITATIONS (compat) ====== */
  inviteAdmin(email: string): Observable<AdminInvitation> {
    return this.http.post<AdminInvitation>(`${this.api}/company/admins/invite`, { email });
  }

  getInvitations(): Observable<AdminInvitation[]> {
    return this.http.get<AdminInvitation[]>(`${this.api}/company/admins/invitations`);
  }

  cancelInvitation(invitationId: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/company/admins/invitations/${invitationId}`);
  }

}
