import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  public currentTab: string = "home"
  public isSidenavExpanded = true
  public isManuelSidenavExpanded = false
  public expansionIcon = "arrow_back"

  @ViewChild("sidenav") sidenav!: HTMLElement

  constructor() { }

  ngOnInit(): void {
    window.addEventListener("resize", () => {
      if (this.isManuelSidenavExpanded) {
        return
      }

      console.log(this.isManuelSidenavExpanded)
      this.setSidenaveExpanded(window.innerWidth > 768)
    })
  }

  onSidenavExpandClicked() {
    this.isManuelSidenavExpanded = true
    this.setSidenaveExpanded(!this.isSidenavExpanded)
  }

  setSidenaveExpanded(isExpanded: boolean) {
    this.isSidenavExpanded = isExpanded
    const sidenav = document.getElementById("sidenav")
    if (isExpanded) {
      sidenav?.classList.remove("sidenav--collapsed")
      this.expansionIcon = "arrow_back"
    } else {
      sidenav?.classList.add("sidenav--collapsed")
      this.expansionIcon = "arrow_forward"
    }
  }
}
