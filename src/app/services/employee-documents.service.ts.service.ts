import { Injectable } from '@angular/core';
import { EmployeeDocument, EmployeeEligibility } from '../shared/models/employee-documents.model';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmployeeDocumentsServiceTsService {

  private base = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }
getDocuments(employeeId: number) {
  return this.http.get<EmployeeDocument[]>(`${this.base}/employees/${employeeId}/documents`);
}

createDocument(employeeId: number, body: FormData) {
  return this.http.post<EmployeeDocument>(`${this.base}/employees/${employeeId}/documents`, body);
}

updateDocument(employeeId: number, docId: number, body: FormData) {
  return this.http.put<EmployeeDocument>(`${this.base}/employees/${employeeId}/documents/${docId}`, body);
}

deleteDocument(employeeId: number, docId: number) {
  return this.http.delete<void>(`${this.base}/employees/${employeeId}/documents/${docId}`);
}

getEligibility(employeeId: number) {
  return this.http.get<EmployeeEligibility>(`${this.base}/employees/${employeeId}/eligibility`);
}

}
