import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSiteCreateComponent } from './admin-site-create.component';

describe('AdminSiteCreateComponent', () => {
  let component: AdminSiteCreateComponent;
  let fixture: ComponentFixture<AdminSiteCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ AdminSiteCreateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminSiteCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
