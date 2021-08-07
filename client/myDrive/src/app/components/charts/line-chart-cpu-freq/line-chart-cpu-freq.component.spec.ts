import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LineChartCpuFreqComponent } from './line-chart-cpu-freq.component';

describe('LineChartCpuFreqComponent', () => {
  let component: LineChartCpuFreqComponent;
  let fixture: ComponentFixture<LineChartCpuFreqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LineChartCpuFreqComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LineChartCpuFreqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
