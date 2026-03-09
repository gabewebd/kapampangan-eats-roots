import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderBranding } from './header-branding';

describe('HeaderBranding', () => {
  let component: HeaderBranding;
  let fixture: ComponentFixture<HeaderBranding>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderBranding]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderBranding);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
