import { Component, Input, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-line-chart-cpu-freq',
  templateUrl: './line-chart-cpu-freq.component.html',
  styleUrls: ['./line-chart-cpu-freq.component.scss']
})
export class LineChartCpuFreqComponent implements OnInit {

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
    this.chart = new Chart("cpu_freq_chart", {
      type: "line",
      data: {
        labels: this.xAxie,
        datasets: [{
          data: this.yAxie,
          fill: true,
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgb(75, 192, 192, 0.2)",
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
                return value + "Hz"
              }
            },
          }
        }
      }
    })
  }

  updateChart() {
    this.chart.update()
  }

}
