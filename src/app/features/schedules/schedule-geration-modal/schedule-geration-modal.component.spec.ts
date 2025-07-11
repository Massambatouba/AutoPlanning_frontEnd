import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleGerationModalComponent } from './schedule-geration-modal.component';

describe('ScheduleGerationModalComponent', () => {
  let component: ScheduleGerationModalComponent;
  let fixture: ComponentFixture<ScheduleGerationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ScheduleGerationModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleGerationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
