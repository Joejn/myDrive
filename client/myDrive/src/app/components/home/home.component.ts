import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FileService } from 'src/app/services/file.service';
import { Dir } from 'src/app/interfaces/dir';
import { MatDialog } from '@angular/material/dialog';
import { TextFileComponent } from 'src/app/dialogs/text-file/text-file.component';
import { ImageFileComponent } from 'src/app/dialogs/image-file/image-file.component';
import { RecentFiles } from 'src/app/interfaces/recent-files';
import { CreateFolderComponent } from 'src/app/dialogs/create-folder/create-folder.component';

export interface TableElement {
  type: string,
  name: string,
  path: string
  last_modified: string,
  file_size: string
}

interface Row {
  "type": string,
  "name": string,
  "path": string
}

let rows: TableElement[] = []

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit {
  recentFiles: RecentFiles[] = []

  displayedColumns: string[] = ["name", "last_modified", "file_size"]
  dataSource = new MatTableDataSource(rows)
  currentDir = ""

  constructor ( private file: FileService, private dialog: MatDialog ) {
    this.setTableData()
    this.setRecentFiles()
  }

  @ViewChild(MatSort, {static: false}) sort!: MatSort
  ngAfterViewInit() {
    this.dataSource.sort = this.sort
  }

  setTableData(directory: string = "/") {
    rows = []
    if (directory !== "/" && directory !== "..") {
      rows = [{
        "type": "directory",
        "name": "..",
        "path": "..",
        "last_modified": "",
        "file_size": ""
      }]
    }
    
    this.file.getDir(directory).subscribe((data: Dir) => {
      for (const item of data.directories) {
        const last_modified = new Date(item.last_modified * 1000)
        rows.push(
          {
            "type": "directory",
            "name": item.name,
            "path": item.path,
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
            "path": item.path,
            "last_modified": this.getModifiedStr(last_modified),
            "file_size": this.formatBytes(item.file_size),
          }
        )
      }

      this.dataSource = new MatTableDataSource(rows)
      this.dataSource.sort = this.sort
    })
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

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////

  getModifiedStr( last_modified: Date): string {
    const last_modified_date = new Date(last_modified).setHours(0, 0, 0, 0)
    const today = new Date().setHours(0, 0, 0, 0)
    let display_last_modified = ""
    if (today !== last_modified_date) {
      let day = last_modified.getDate() < 10 ? "0" + String(last_modified.getDate()) : last_modified.getDate()
      let month = last_modified.getMonth() < 10 ? "0" + String(last_modified.getMonth()) : last_modified.getMonth()
      let year = last_modified.getFullYear()

      display_last_modified = `${day}.${month}.${year}`
    } else {
      let houre = last_modified.getHours() < 10 ? "0" + String(last_modified.getHours()) : last_modified.getHours()
      let minutes = last_modified.getMinutes() < 10 ? "0" + String(last_modified.getMinutes()) : last_modified.getMinutes()

      display_last_modified = `${houre}:${minutes}`
    }

    return display_last_modified
  }

  // @ViewChild(MatSort) sort: MatSort

  onClick(row: any) {
    const currentRow: Row = {
      type: row["type"],
      name: row["name"],
      path: row["path"]
    }

    this.currentDir = row["path"]
    this.setFileAction(currentRow)
  }

  openTextDialog( title: string, content: string, path: string) {
    let dialog = this.dialog.open(TextFileComponent, { disableClose: true })
    dialog.componentInstance.title = title
    dialog.componentInstance.content = content
    dialog.componentInstance.path = path
  }

  openImageDialog( title: string, content: string ) {
    let dialog = this.dialog.open(ImageFileComponent, {disableClose: true})
    dialog.componentInstance.title = title
    dialog.componentInstance.content = content
  }

  setRecentFiles() {
    this.file.getRecentFiles().subscribe((data: RecentFiles[]) => {
        this.recentFiles = data
    })
  }

  onRecentFileClicked( name: string, path: string ) {
    const currentRow: Row = {
      type: "file",
      name: name,
      path: path
    }
    this.setFileAction(currentRow)
  }

  setFileAction(row: Row) {
    if (row["type"] === "directory") {
      this.setTableData(row.path)
    } else {
      const  file_extension: string = row.name.split(".").pop() + ""
      this.file.getSpecificFile(row.path).subscribe(data => {
        let blob = new Blob([atob(data)], { type: "octet/stream" })
        const imgFormats = ["png", "jpg"]
        
        if (file_extension === "txt") {
            this.openTextDialog(row.name, atob(data), row.path)
        } else if (file_extension === "pdf") {

        } else if (imgFormats.includes(file_extension)) {
          this.openImageDialog(row.name, data)
        } else {
          // https://stackoverflow.com/questions/52182851/how-to-download-file-with-blob-function-using-angular-5
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement("a")
          document.body.appendChild(a)
          a.setAttribute("style", "display: none")
          a.href = url
          a.download = row.name
          a.click()
          window.URL.revokeObjectURL(url)
          a.remove()
        }
      })
    }
  }

  onFileUploadChanged(event: any) {
    console.log(this.currentDir)
    this.file.uploadFiles(event.target.files, this.currentDir).subscribe((data) => {
      this.setTableData(this.currentDir)
    })
  }

  onCreateFolderClicked() {
    const dialogRef = this.dialog.open(CreateFolderComponent)
    dialogRef.afterClosed().subscribe((result: string) => {
      if (result === "") {
        return
      }
      this.file.createFolder(this.currentDir, result).subscribe(data => {
        this.setTableData(this.currentDir)
      })
    })
  }
}
