import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { interval, merge, Observable, Subject, Subscription } from 'rxjs';
import { map, mergeMap, switchMap } from 'rxjs/operators';
import { FileService } from 'src/app/services/file.service';
import { ServerLoadService } from 'src/app/services/server-load.service';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements AfterViewInit {
  
  isFirstGet: boolean = true

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

  public userCount: string = ""

  sub: Subscription = new Subscription()

  @ViewChild("diskFreqChart") diskFreqChart : any;
  @ViewChild("cpuUsageChart") cpuUsageChart : any;
  @ViewChild("memoryUsageChart") memoryUsageChart : any;
  @ViewChild("spaceUsageChart") spaceUsageChart : any;

  constructor( private serverLoad: ServerLoadService, private elementRef: ElementRef, private users: UsersService, file: FileService ) {
    this.users.getUserCount().subscribe((data: any) => {
      if (data) {
        this.userCount = String(data["user_count"])
      } else {
        this.userCount = "faild to load"
      }
    })
  }

  ngAfterViewInit(): void {
    this.serverLoad.get_server_load().subscribe(data => {
      this.setChartData(data)
    })

    const element = this.elementRef.nativeElement

    interval(2000).pipe(
      switchMap(() => {
        if (element.offsetParent !== null) {
          return this.serverLoad.get_server_load()
        }
        return new Observable()
      })
    ).subscribe(data => {
      if (data) {
        this.setChartData(data)
      }
    })
  }

  setChartData(data: any) {
    if (this.cpuUsage.x.length > 8) {
      this.cpuUsage.x.shift()
      this.cpuUsage.y.shift()
    }

    if (this.isFirstGet) {
      this.cpuUsage.x[0] = data.cpu_usage.time
      this.cpuUsage.y[0] = data.cpu_usage.value
    } else {
      this.cpuUsage.x.push(data.cpu_usage.time)
      this.cpuUsage.y.push(data.cpu_usage.value)
    }

    //////////////////////////////////////////////////////////////////

    if (this.cpuFreq.x.length > 8) {
      this.cpuFreq.x.shift()
      this.cpuFreq.y.shift()
    }

    if (this.isFirstGet) {
      this.cpuFreq.x[0] = data.cpu_freq_current.time
      this.cpuFreq.y[0] = data.cpu_freq_current.value
    } else {
      this.cpuFreq.x.push(data.cpu_freq_current.time)
      this.cpuFreq.y.push(data.cpu_freq_current.value)
    }

    //////////////////////////////////////////////////////////////////

    if (this.memoryUsage.x.length > 8) {
      this.memoryUsage.x.shift()
      this.memoryUsage.y.shift()
    }

    if (this.isFirstGet) {
      this.memoryUsage.x[0] = data.memory_usage.time
      this.memoryUsage.y[0] = data.memory_usage.value
      this.isFirstGet = false
    } else {
      this.memoryUsage.x.push(data.memory_usage.time)
      this.memoryUsage.y.push(data.memory_usage.value)
    }
    
    //////////////////////////////////////////////////////////////////

    this.spaceUsageChart.freeSpace = data.disk_space_free
    this.spaceUsageChart.usedSpace = data.disk_space_used
    
    this.diskFreqChart.updateChart()
    this.cpuUsageChart.updateChart()
    this.memoryUsageChart.updateChart()
    this.spaceUsageChart.updateChart()
  }
}
