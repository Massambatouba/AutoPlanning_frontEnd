import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteShiftTemplateComponent } from './site-shift-template.component';

describe('SiteShiftTemplateComponent', () => {
  let component: SiteShiftTemplateComponent;
  let fixture: ComponentFixture<SiteShiftTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteShiftTemplateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteShiftTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
