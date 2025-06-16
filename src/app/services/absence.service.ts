import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Absence } from '../shared/models/absence.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AbsenceService {

   constructor(private http: HttpClient) {}

  addAbsence(request: any): Observable<Absence> {
    return this.http.post<Absence>(`${environment.apiUrl}/absences`, request);
  }

getEmployeeAbsences(employeeId: number, year: number, month: number): Observable<Absence[]> {
  return this.http.get<Absence[]>(
    `${environment.apiUrl}/absences/employee/${employeeId}/month`,
    {
      params: {
        year: year.toString(),
        month: month.toString()
      }
    }
  );
}


  createUnjustifiedAbsence(employeeId: number, date: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/absences/unjustified`, null, {
      params: { employeeId: employeeId.toString(), date }
    });
  }

  updateAbsence(id: number, data: any): Observable<Absence> {
    return this.http.put<Absence>(`${environment.apiUrl}/absences/${id}`, data);
  }
  
  deleteAbsence(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/absences/${id}`);
  }

}
