import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LineChartMemoryUsedComponent } from './line-chart-memory-used.component';

describe('LineChartMemoryUsedComponent', () => {
  let component: LineChartMemoryUsedComponent;
  let fixture: ComponentFixture<LineChartMemoryUsedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LineChartMemoryUsedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LineChartMemoryUsedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
