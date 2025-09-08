import { TestBed } from '@angular/core/testing';

import { EmployeeDocumentsServiceTsService } from './employee-documents.service.ts.service';

describe('EmployeeDocumentsServiceTsService', () => {
  let service: EmployeeDocumentsServiceTsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmployeeDocumentsServiceTsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
