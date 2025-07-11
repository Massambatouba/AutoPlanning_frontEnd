import { TestBed } from '@angular/core/testing';

import { HourComplianceService } from './hour-compliance.service';

describe('HourComplianceService', () => {
  let service: HourComplianceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HourComplianceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
