import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleComplianceComponent } from './schedule-compliance.component';

describe('ScheduleComplianceComponent', () => {
  let component: ScheduleComplianceComponent;
  let fixture: ComponentFixture<ScheduleComplianceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ScheduleComplianceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleComplianceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
