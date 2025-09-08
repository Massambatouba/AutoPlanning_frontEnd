import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SitePlanningComponent } from './site-planning.component';

describe('SitePlanningComponent', () => {
  let component: SitePlanningComponent;
  let fixture: ComponentFixture<SitePlanningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ SitePlanningComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SitePlanningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
