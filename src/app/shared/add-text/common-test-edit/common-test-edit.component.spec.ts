import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonTestEditComponent } from './common-test-edit.component';

describe('CommonTestEditComponent', () => {
  let component: CommonTestEditComponent;
  let fixture: ComponentFixture<CommonTestEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommonTestEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonTestEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
