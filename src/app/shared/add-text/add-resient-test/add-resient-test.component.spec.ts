import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddResientTestComponent } from './add-resient-test.component';

describe('AddResientTestComponent', () => {
  let component: AddResientTestComponent;
  let fixture: ComponentFixture<AddResientTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddResientTestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddResientTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
