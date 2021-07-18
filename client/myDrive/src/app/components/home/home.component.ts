import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

export interface TableElement {
  type: string,
  name: string,
  owner: string,
  last_modified: Date,
  file_size: number
}

const ROWS: TableElement[] = [
  {type: "file", name: "Datei 1", owner: "admin", last_modified: new Date(), file_size: 2},
  {type: "file", name: "Datei 2", owner: "admin", last_modified: new Date(), file_size: 4},
  {type: "file", name: "Datei 3", owner: "admin", last_modified: new Date(), file_size: 6},
  {type: "file", name: "Datei 4", owner: "admin", last_modified: new Date(), file_size: 8},
  {type: "directory", name: "Folder 1", owner: "admin", last_modified: new Date(), file_size: 0}
]

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit {
  RecentFiles = [
    "Datei 1",
    "Datei 2",
    "Datei 3",
    "Datei 4"
  ]

  displayedColumns: string[] = ["name", "owner", "last_modified", "file_size"]
  dataSource = new MatTableDataSource(ROWS)

  constructor () {
    console.log(this.dataSource)
  }

  @ViewChild(MatSort, {static: false}) sort!: MatSort
  ngAfterViewInit() {
    this.dataSource.sort = this.sort
  }

  

  

  // @ViewChild(MatSort) sort: MatSort

}
