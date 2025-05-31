import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyAdminsComponent } from './company-admins.component';

describe('CompanyAdminsComponent', () => {
  let component: CompanyAdminsComponent;
  let fixture: ComponentFixture<CompanyAdminsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompanyAdminsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyAdminsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
