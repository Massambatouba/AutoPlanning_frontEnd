import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentSchedulesComponent } from './recent-schedules.component';

describe('RecentSchedulesComponent', () => {
  let component: RecentSchedulesComponent;
  let fixture: ComponentFixture<RecentSchedulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecentSchedulesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecentSchedulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
