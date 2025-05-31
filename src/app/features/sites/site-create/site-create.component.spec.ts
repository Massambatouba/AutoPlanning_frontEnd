import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteCreateComponent } from './site-create.component';

describe('SiteCreateComponent', () => {
  let component: SiteCreateComponent;
  let fixture: ComponentFixture<SiteCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteCreateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
