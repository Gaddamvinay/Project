import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonTestAddComponent } from './common-test-add.component';

describe('CommonTestAddComponent', () => {
  let component: CommonTestAddComponent;
  let fixture: ComponentFixture<CommonTestAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommonTestAddComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonTestAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
