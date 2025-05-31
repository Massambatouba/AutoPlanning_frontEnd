import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteShiftTemplateCreateComponent } from './site-shift-template-create.component';

describe('SiteShiftTemplateCreateComponent', () => {
  let component: SiteShiftTemplateCreateComponent;
  let fixture: ComponentFixture<SiteShiftTemplateCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteShiftTemplateCreateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteShiftTemplateCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
