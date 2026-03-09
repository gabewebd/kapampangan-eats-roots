import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeritageItem } from './heritage-item';

describe('HeritageItem', () => {
  let component: HeritageItem;
  let fixture: ComponentFixture<HeritageItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeritageItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeritageItem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
