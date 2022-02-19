import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterResidentByTypeComponent } from './filter-resident-by-type.component';

describe('FilterResidentByTypeComponent', () => {
  let component: FilterResidentByTypeComponent;
  let fixture: ComponentFixture<FilterResidentByTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilterResidentByTypeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterResidentByTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
