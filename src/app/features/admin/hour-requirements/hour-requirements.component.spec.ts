import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HourRequirementsComponent } from './hour-requirements.component';

describe('HourRequirementsComponent', () => {
  let component: HourRequirementsComponent;
  let fixture: ComponentFixture<HourRequirementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ HourRequirementsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HourRequirementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
