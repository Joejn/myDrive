import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Dir } from 'src/app/interfaces/dir';
import { FileTableRow } from 'src/app/interfaces/file-table-row';
import { FileService } from 'src/app/services/file.service';

let rows: FileTableRow[] = []

@Component({
  selector: 'app-trash',
  templateUrl: './trash.component.html',
  styleUrls: ['./trash.component.scss']
})
export class TrashComponent implements AfterViewInit {

  isTableHidden: boolean = false
  isLoading: boolean = false
  isShowingContent: boolean = false
  timeout: any = () => { }

  displayedColumns: string[] = ["name", "last_modified", "file_size", "delete"]
  dataSource = new MatTableDataSource(rows)

  constructor(private file: FileService) {
    this.timeout = setTimeout(() => {
      this.isLoading = true
    }, 200)
    this.setTableData()
  }

  @ViewChild(MatSort, { static: false }) sort!: MatSort
  ngAfterViewInit() {
    this.dataSource.sort = this.sort
  }

  setTableData() {
    this.file.getObjectsFromTrash().subscribe((data: Dir) => {
      clearTimeout(this.timeout)
      this.isLoading = false
      this.isShowingContent = true
      const numbersOfDirectories = data.directories.length
      const numbersOfFiles = data.files.length

      if (numbersOfDirectories < 1 && numbersOfFiles < 1) {
        this.isTableHidden = true
      } else {
        this.isTableHidden = false
      }

      rows = this.file.formatFileRowContent(data)
      this.dataSource = new MatTableDataSource(rows)
      this.dataSource.sort = this.sort
    })
  }

  onDeleteClicked(row: FileTableRow) {
    this.file.deleteObjectFromTrash(row.path).subscribe(data => {
      if (data === "ok") {
        this.setTableData()
      }
    })
  }

  @ViewChild(MatMenuTrigger)
  public contextMenu!: MatMenuTrigger

  contextMenuPosition = { x: "0px", y: "0px" }

  // https://stackblitz.com/edit/angular-material-context-menu?file=app%2Fcontext-menu-example.ts
  onContextMenu(event: MouseEvent, element: FileTableRow) {
    event.preventDefault()
    this.contextMenuPosition.x = event.clientX + "px"
    this.contextMenuPosition.y = event.clientY + "px"
    this.contextMenu.menuData = element
    this.contextMenu.menu.focusFirstItem("mouse")
    this.contextMenu.openMenu()
  }

  onSingleItemDeleteClicked() {
    this.onDeleteClicked(this.contextMenu.menuData)
  }

}
