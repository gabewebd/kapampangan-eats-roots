import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreMap } from './explore-map';

describe('ExploreMap', () => {
  let component: ExploreMap;
  let fixture: ComponentFixture<ExploreMap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExploreMap]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExploreMap);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
