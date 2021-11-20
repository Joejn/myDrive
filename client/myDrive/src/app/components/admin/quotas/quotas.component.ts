import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { FileService } from 'src/app/services/file.service';
import { CreateQuotaComponent } from '../dialogs/create-quota/create-quota.component';

export interface QuotaElement {
  name: string;
  size: number;
}

const DATA: QuotaElement[] = [
  {name: "midi", "size": 10740000000},
  {name: "medi", "size": 107400000000},
  {name: "max", "size": 1074000000000}

]

@Component({
  selector: 'app-quotas',
  templateUrl: './quotas.component.html',
  styleUrls: ['./quotas.component.scss']
})

export class QuotasComponent implements OnInit {

  displayedColumns: string[] = ["name", "size", "delete"]
  dataSource = new MatTableDataSource(DATA)

  constructor(public file: FileService, private dialog: MatDialog, private _snackBar: MatSnackBar) { }

  ngOnInit(): void {
  }

  onAddClicked() {
    let dialog = this.dialog.open(CreateQuotaComponent)

    dialog.afterClosed().subscribe(result => {
      if (result) {
        this.openSnackBar("Quota created", "Close")
      }
    })
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      horizontalPosition: "right",
      duration: 3000
    })
  }

}
