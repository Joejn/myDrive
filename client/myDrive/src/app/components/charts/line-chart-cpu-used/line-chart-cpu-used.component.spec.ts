import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LineChartCpuUsedComponent } from './line-chart-cpu-used.component';

describe('LineChartCpuUsedComponent', () => {
  let component: LineChartCpuUsedComponent;
  let fixture: ComponentFixture<LineChartCpuUsedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LineChartCpuUsedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LineChartCpuUsedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
