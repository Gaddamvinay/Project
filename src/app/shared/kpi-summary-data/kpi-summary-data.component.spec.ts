import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiSummaryDataComponent } from './kpi-summary-data.component';

describe('KpiSummaryDataComponent', () => {
  let component: KpiSummaryDataComponent;
  let fixture: ComponentFixture<KpiSummaryDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KpiSummaryDataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KpiSummaryDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
