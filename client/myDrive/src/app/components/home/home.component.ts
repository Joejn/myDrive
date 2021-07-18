import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FileService } from 'src/app/services/file.service';
import { Dir } from 'src/app/interfaces/dir';

export interface TableElement {
  type: string,
  name: string,
  last_modified: string,
  file_size: string
}

let rows: TableElement[] = []

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

  displayedColumns: string[] = ["name", "last_modified", "file_size"]
  dataSource = new MatTableDataSource(rows)

  constructor ( private file: FileService ) {
    rows = []
    this.file.getHomeDir().subscribe((data: Dir) => {
      for (const item of data.directories) {
        const last_modified = new Date(item.last_modified * 1000)
        rows.push(
          {
            "type": "directory",
            "name": item.name,
            "last_modified": this.getModifiedStr(last_modified),
            "file_size": this.formatBytes(item.file_size)
          }
        )
      }

      for (const item of data.files) {
        const last_modified = new Date(item.last_modified * 1000)
        
        rows.push(
          {
            "type": "file",
            "name": item.name,
            "last_modified": this.getModifiedStr(last_modified),
            "file_size": this.formatBytes(item.file_size)
          }
        )
      }

      console.log(rows)
      this.dataSource = new MatTableDataSource(rows)
      this.dataSource.sort = this.sort
    })
  }

  @ViewChild(MatSort, {static: false}) sort!: MatSort
  ngAfterViewInit() {
    this.dataSource.sort = this.sort
  }

  // https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
  formatBytes( bytes: number, decimals: number = 2 ): string {
    if (bytes === 0) {
      return "0 Bytes"
    }

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
  }

  getModifiedStr( last_modified: Date): string {
    const last_modified_date = new Date(last_modified).setHours(0, 0, 0, 0)
    const today = new Date().setHours(0, 0, 0, 0)
    let display_last_modified = ""
    if (today !== last_modified_date) {
      display_last_modified = `${last_modified.getDate()}.${last_modified.getMonth()}.${last_modified.getFullYear()}`
    } else {
      display_last_modified = `${last_modified.getHours()}:${last_modified.getMinutes()}`
    }

    return display_last_modified
  }

  // @ViewChild(MatSort) sort: MatSort

}
