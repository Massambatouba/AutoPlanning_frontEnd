import { TestBed } from '@angular/core/testing';

import { SiteShiftTemplateService } from './site-shift-template.service';

describe('SiteShiftTemplateService', () => {
  let service: SiteShiftTemplateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SiteShiftTemplateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
