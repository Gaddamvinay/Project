import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterResidentByNameComponent } from './filter-resident-by-name.component';

describe('FilterResidentByNameComponent', () => {
  let component: FilterResidentByNameComponent;
  let fixture: ComponentFixture<FilterResidentByNameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilterResidentByNameComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterResidentByNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
