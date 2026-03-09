import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitCta } from './submit-cta';

describe('SubmitCta', () => {
  let component: SubmitCta;
  let fixture: ComponentFixture<SubmitCta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmitCta]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmitCta);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
