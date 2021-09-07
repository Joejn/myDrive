import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin-backend',
  templateUrl: './admin-backend.component.html',
  styleUrls: ['./admin-backend.component.scss']
})
export class AdminBackendComponent implements OnInit {

  public currentTab: string = "dashboard"

  constructor() { }

  ngOnInit(): void {
  }

}
