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
import { FileTableRow } from 'src/app/interfaces/file-table-row';
import { SelectionModel } from '@angular/cdk/collections';
import { MatMenuTrigger } from '@angular/material/menu';

let rows: FileTableRow[] = []

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit {
  recentFiles: RecentFiles[] = []

  displayedColumns: string[] = ["select", "name", "last_modified", "file_size", "delete"]
  dataSource = new MatTableDataSource(rows)
  selection = new SelectionModel<FileTableRow>(true, [])
  currentDir = ""

  constructor(private file: FileService, private dialog: MatDialog) {
    this.setTableData()
    this.setRecentFiles()
  }

  @ViewChild(MatSort, { static: false }) sort!: MatSort
  ngAfterViewInit() {
    this.dataSource.sort = this.sort
  }

  // Source: https://material.angular.io/components/table/examples also used code from the same source in HTML file /////////////////////////////////////
  isAllSelected() {
    const numSelected = this.selection.selected.length
    const numRows = this.dataSource.data.length
    return numSelected == numRows
  }

  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear()
      return
    }

    this.selection.select(...this.dataSource.data)
  }

  checkboxLabel(row?: FileTableRow): string {
    if (!row) {
      return `${this.isAllSelected() ? "deselect" : "select"} all`
    }
    return `${this.selection.isSelected(row) ? "deselect" : "select"} row ${row.position + 1}`
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////

  setTableData(directory: string = "/") {
    rows = []
    if (directory !== "/" && directory !== "..") {
      rows = [{
        "position": -1,
        "type": "directory",
        "name": "..",
        "path": "..",
        "last_modified": "",
        "file_size": ""
      }]
    }

    this.file.getDir(directory).subscribe((data: Dir) => {
      const items = this.file.formatFileRowContent(data)
      for (const item of items) {
        rows.push(item)
      }
      this.dataSource = new MatTableDataSource(rows)
      this.dataSource.sort = this.sort
    })
  }

  // https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
  formatBytes(bytes: number, decimals: number = 2): string {
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

  getModifiedStr(last_modified: Date): string {
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

  onClick(row: FileTableRow) {
    const currentRow: FileTableRow = {
      position: row.position,
      type: row["type"],
      name: row.name,
      path: row.path,
      last_modified: row.last_modified,
      file_size: row.file_size

    }

    this.currentDir = row["path"]
    this.setFileAction(currentRow)
  }

  openTextDialog(title: string, content: string, path: string) {
    let dialog = this.dialog.open(TextFileComponent, { disableClose: true })
    dialog.componentInstance.title = title
    dialog.componentInstance.content = content
    dialog.componentInstance.path = path
  }

  openImageDialog(title: string, content: string) {
    let dialog = this.dialog.open(ImageFileComponent, { disableClose: true })
    dialog.componentInstance.title = title
    dialog.componentInstance.content = content
  }

  setRecentFiles() {
    this.file.getRecentFiles().subscribe((data: RecentFiles[]) => {
      this.recentFiles = data
    })
  }

  onRecentFileClicked(name: string, path: string) {
    const currentRow: FileTableRow = {
      position: -1,
      type: "file",
      name: name,
      path: path,
      last_modified: "",
      file_size: "",
    }
    this.setFileAction(currentRow)
  }

  setFileAction(row: FileTableRow) {
    if (row["type"] === "directory") {
      this.setTableData(row.path)
    } else {
      const file_extension: string = row.name.split(".").pop() + ""
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

  onDownloadClicked(selectedItems: FileTableRow[]) {
    console.log(typeof selectedItems)
    console.log(selectedItems)
    if (selectedItems.length === 0) {
      return
    }
    this.file.downloadFiles(selectedItems, this.currentDir).subscribe(data => {
      var element = document.createElement("a")
      const tmpTitle = data.title
      let extension = tmpTitle.split(".").pop()?.toLowerCase()
      if (extension == undefined) {
        extension = ""
      }
      const imgFormats = ["jpg", "jpeg", "png"]       // make global const !!!
      if (imgFormats.includes(extension)) {
        element.setAttribute("href", "data:image/jpeg;base64," + data.body)
      } else {
        element.setAttribute("href", "data:text/plain;base64," + data.body)
      }
      
      element.setAttribute("download", data.title)

      element.style.display = "none"
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
    })
  }

  onFileUploadChanged(event: any) {
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

  onDeleteClicked(row: FileTableRow) {
    this.file.moveObjectToTrash(row.path).subscribe(data => {
      if (data === "ok") {
        this.setTableData(this.currentDir)
      }
    })
  }

  @ViewChild(MatMenuTrigger)
  public contextMenu!: MatMenuTrigger
  
  contextMenuPosition = { x: "0px", y: "0px"}

  // https://stackblitz.com/edit/angular-material-context-menu?file=app%2Fcontext-menu-example.ts
  onContextMenu( event: MouseEvent, element: FileTableRow ) {
    event.preventDefault()
    this.contextMenuPosition.x = event.clientX + "px"
    this.contextMenuPosition.y = event.clientY + "px"
    this.contextMenu.menuData = element
    this.contextMenu.menu.focusFirstItem("mouse")
    this.contextMenu.openMenu()
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////

  onSingleItemDownloadClicked() {
    const data: FileTableRow[] = [this.contextMenu.menuData]
    this.onDownloadClicked(data)
  }
  
  onSingleItemDeleteClicked() {
    this.onDeleteClicked(this.contextMenu.menuData)
  }
}
