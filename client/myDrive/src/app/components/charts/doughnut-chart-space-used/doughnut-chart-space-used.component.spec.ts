import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoughnutChartSpaceUsedComponent } from './doughnut-chart-space-used.component';

describe('DoughnutChartSpaceUsedComponent', () => {
  let component: DoughnutChartSpaceUsedComponent;
  let fixture: ComponentFixture<DoughnutChartSpaceUsedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DoughnutChartSpaceUsedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DoughnutChartSpaceUsedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
