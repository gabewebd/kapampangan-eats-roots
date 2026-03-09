import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorDetail } from './vendor-detail';

describe('VendorDetail', () => {
  let component: VendorDetail;
  let fixture: ComponentFixture<VendorDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
