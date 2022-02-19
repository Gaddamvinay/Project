import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DischargeResidentComponent } from './discharge-resident.component';

describe('DischargeResidentComponent', () => {
  let component: DischargeResidentComponent;
  let fixture: ComponentFixture<DischargeResidentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DischargeResidentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DischargeResidentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
