import { Component, Input, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-line-chart-memory-used',
  templateUrl: './line-chart-memory-used.component.html',
  styleUrls: ['./line-chart-memory-used.component.scss']
})
export class LineChartMemoryUsedComponent implements OnInit {

  @Input() label: string = ""
  @Input() xAxie: string[] = []
  @Input() yAxie: number[] = []

  chart: any = ""

  constructor() { }

  ngOnInit(): void {
    Chart.register(...registerables)
    this.setChartData()
  }

  setChartData() {
    this.chart = new Chart("memory_used_chart", {
      type: "line",
      data: {
        labels: this.xAxie,
        datasets: [{
          data: this.yAxie,
          fill: true,
          borderColor: "rgb(190, 3, 252)",
          backgroundColor: "rgb(190, 3, 252, 0.2)",
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            ticks: {
              callback: function(value, index, values) {
                return value + "%"
              }
            },
            min: 0,
            max: 100
          }
        }
      }
    })
  }

  updateChart() {
    this.chart.update()
  }
}
