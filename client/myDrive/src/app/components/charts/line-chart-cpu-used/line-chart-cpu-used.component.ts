import { Component, Input, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-line-chart-cpu-used',
  templateUrl: './line-chart-cpu-used.component.html',
  styleUrls: ['./line-chart-cpu-used.component.scss']
})
export class LineChartCpuUsedComponent implements OnInit {

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
    this.chart = new Chart("cpu_used_chart", {
      type: "line",
      data: {
        labels: this.xAxie,
        datasets: [{
          data: this.yAxie,
          fill: true,
          borderColor: "rgb(252, 161, 3)",
          backgroundColor: "rgb(252, 161, 3, 0.2)",
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label: function (context) {
                const label = context.raw + "%"
                return label;
              }
            }
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
