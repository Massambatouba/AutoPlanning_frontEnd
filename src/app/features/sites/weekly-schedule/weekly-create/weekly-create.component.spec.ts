import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeeklyCreateComponent } from './weekly-create.component';

describe('WeeklyCreateComponent', () => {
  let component: WeeklyCreateComponent;
  let fixture: ComponentFixture<WeeklyCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ WeeklyCreateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeeklyCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
