import { Component, Input, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { HighlightSpanKind } from 'typescript';

@Component({
  selector: 'app-doughnut-chart-space-used',
  templateUrl: './doughnut-chart-space-used.component.html',
  styleUrls: ['./doughnut-chart-space-used.component.scss']
})
export class DoughnutChartSpaceUsedComponent implements OnInit {

  @Input() label: string = ""
  @Input() freeSpace: number = 0
  @Input() usedSpace: number = 0

  chart: any = ""

  constructor() { }

  ngOnInit(): void {
    this.setChartData()
  }

  setChartData() {
    Chart.register(...registerables)

    this.chart = new Chart("space_used_chart", {
      type: "doughnut",
      data: {
        labels: ["free", "used"],
        datasets: [{
          data: [this.freeSpace, this.usedSpace],
          borderColor: ["rgb(54, 255, 107)", "rgb(255, 54, 54)"],
          backgroundColor: ["rgb(54, 255, 107, 0.2)", "rgb(255, 54, 54, 0.2)"],
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 0
        }
      }
    })
  }

  updateChart() {
    this.chart.data.datasets = [{
      data: [this.freeSpace, this.usedSpace],
      borderColor: ["rgb(54, 255, 107)", "rgb(255, 54, 54)"],
      backgroundColor: ["rgb(54, 255, 107, 0.2)", "rgb(255, 54, 54, 0.2)"],
    }]

    this.chart.update()
  }
}
