import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
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

  isTableHidden : boolean = false

  displayedColumns: string[] = ["name", "last_modified", "file_size", "delete"]
  dataSource = new MatTableDataSource(rows)

  constructor( private file: FileService ) {
    this.setTableData()
  }

  @ViewChild(MatSort, {static: false}) sort!: MatSort
  ngAfterViewInit() {
    this.dataSource.sort = this.sort
  }

  setTableData() {

    this.file.getObjectsFromTrash().subscribe((data: Dir) => {
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

  onDeleteClicked( row : FileTableRow ) {
    console.log("Row:", row)
    this.file.deleteObjectFromTrash(row.path).subscribe(data => {
      if (data === "ok") {
        this.setTableData()
      }
    })
  }

}
