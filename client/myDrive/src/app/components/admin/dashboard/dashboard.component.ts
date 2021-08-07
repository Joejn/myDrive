import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { interval, merge, Observable, Subject, Subscription } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { ServerLoadService } from 'src/app/services/server-load.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements AfterViewInit {
  
  public cpuFreq = {
    x: [""],
    y: [0]
  }

  public cpuUsage  = {
    x: [""],
    y: [0]
  }

  public memoryUsage  = {
    x: [""],
    y: [0]
  }

  public spaceUsage = {
    free: 0,
    used: 0
  }


  constructor( private serverLoad: ServerLoadService ) {
    this.serverLoad.get_server_load().subscribe(data => {
      this.setChartData(data)
    })
  }

  sub: Subscription = new Subscription()

  @ViewChild("diskFreqChart") diskFreqChart : any;
  @ViewChild("cpuUsageChart") cpuUsageChart : any;
  @ViewChild("memoryUsageChart") memoryUsageChart : any;
  @ViewChild("spaceUsageChart") spaceUsageChart : any;
  ngAfterViewInit(): void {

    interval(2000).pipe(
      mergeMap(() => this.serverLoad.get_server_load())
    ).subscribe(data => this.setChartData(data))
  }

  
  setChartData(data: any) {
    if (this.cpuUsage.x.length > 8) {
      this.cpuUsage.x.shift()
      this.cpuUsage.y.shift()
    }

    if (data.cpu_usage.length > 0) {
      this.cpuUsage.x.push(data.cpu_usage.pop().time)
      this.cpuUsage.y.push(data.cpu_usage.pop().value)
    }

    //////////////////////////////////////////////////////////////////

    if (this.cpuFreq.x.length > 8) {
      this.cpuFreq.x.shift()
      this.cpuFreq.y.shift()
    }

    if (data.cpu_freq_current.length > 0) {
      this.cpuFreq.x.push(data.cpu_freq_current.pop().time)
      this.cpuFreq.y.push(data.cpu_freq_current.pop().value)
    }

    //////////////////////////////////////////////////////////////////

    if (this.memoryUsage.x.length > 8) {
      this.memoryUsage.x.shift()
      this.memoryUsage.y.shift()
    }

    if (data.memory_usage.length > 0) {
      this.memoryUsage.x.push(data.memory_usage.pop().time)
      this.memoryUsage.y.push(data.memory_usage.pop().value)
    }
    
    //////////////////////////////////////////////////////////////////

    this.spaceUsage.free = data.disk_space_free
    this.spaceUsage.used = data.disk_space_used
    
    this.diskFreqChart.updateChart()
    this.cpuUsageChart.updateChart()
    this.memoryUsageChart.updateChart()
    this.spaceUsageChart.updateChart()
  }
}
