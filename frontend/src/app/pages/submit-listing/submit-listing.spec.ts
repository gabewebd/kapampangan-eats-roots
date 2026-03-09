import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitListing } from './submit-listing';

describe('SubmitListing', () => {
  let component: SubmitListing;
  let fixture: ComponentFixture<SubmitListing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmitListing]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmitListing);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
