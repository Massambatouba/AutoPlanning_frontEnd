import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteShiftTemplateEditComponent } from './site-shift-template-edit.component';

describe('SiteShiftTemplateEditComponent', () => {
  let component: SiteShiftTemplateEditComponent;
  let fixture: ComponentFixture<SiteShiftTemplateEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteShiftTemplateEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteShiftTemplateEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
