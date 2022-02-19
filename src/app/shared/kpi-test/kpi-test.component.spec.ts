import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiTestComponent } from './kpi-test.component';

describe('KpiTestComponent', () => {
  let component: KpiTestComponent;
  let fixture: ComponentFixture<KpiTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KpiTestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KpiTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
