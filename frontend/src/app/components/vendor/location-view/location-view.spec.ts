import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationView } from './location-view';

describe('LocationView', () => {
  let component: LocationView;
  let fixture: ComponentFixture<LocationView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocationView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocationView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
