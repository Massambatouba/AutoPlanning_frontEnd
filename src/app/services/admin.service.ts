import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminInvitation } from '../shared/models/admin-invation.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
   constructor(private http: HttpClient) {}

  inviteAdmin(email: string): Observable<AdminInvitation> {
    return this.http.post<AdminInvitation>(`${environment.apiUrl}/company/admins/invite`, { email });
  }

  getInvitations(): Observable<AdminInvitation[]> {
    return this.http.get<AdminInvitation[]>(`${environment.apiUrl}/company/admins/invitations`);
  }

  cancelInvitation(invitationId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/company/admins/invitations/${invitationId}`);
  }

  removeAdmin(userId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/company/admins/${userId}`);
  }
}
