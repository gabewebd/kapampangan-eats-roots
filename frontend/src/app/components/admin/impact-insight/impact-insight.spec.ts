import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImpactInsight } from './impact-insight';

describe('ImpactInsight', () => {
  let component: ImpactInsight;
  let fixture: ComponentFixture<ImpactInsight>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImpactInsight]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImpactInsight);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
