import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeeklyExceptionsComponent } from './weekly-exceptions.component';

describe('WeeklyExceptionsComponent', () => {
  let component: WeeklyExceptionsComponent;
  let fixture: ComponentFixture<WeeklyExceptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ WeeklyExceptionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeeklyExceptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
