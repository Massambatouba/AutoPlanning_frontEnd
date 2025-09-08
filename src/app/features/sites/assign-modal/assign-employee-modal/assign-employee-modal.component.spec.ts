import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignEmployeeModalComponent } from './assign-employee-modal.component';

describe('AssignEmployeeModalComponent', () => {
  let component: AssignEmployeeModalComponent;
  let fixture: ComponentFixture<AssignEmployeeModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ AssignEmployeeModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignEmployeeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
