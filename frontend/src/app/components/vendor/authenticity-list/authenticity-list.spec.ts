import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthenticityList } from './authenticity-list';

describe('AuthenticityList', () => {
  let component: AuthenticityList;
  let fixture: ComponentFixture<AuthenticityList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthenticityList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthenticityList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
