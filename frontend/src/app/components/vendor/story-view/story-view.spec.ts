import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoryView } from './story-view';

describe('StoryView', () => {
  let component: StoryView;
  let fixture: ComponentFixture<StoryView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoryView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoryView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
