import { TestBed } from '@angular/core/testing';

import { PlatformAdminService } from './platform-admin.service';

describe('PlatformAdminService', () => {
  let service: PlatformAdminService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlatformAdminService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
