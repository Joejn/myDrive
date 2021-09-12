import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogDataRename } from 'src/app/components/home/home.component';
import { getErrorMessage } from 'src/app/shared/error-messages';

@Component({
  selector: 'app-rename',
  templateUrl: './rename.component.html',
  styleUrls: ['./rename.component.scss']
})
export class RenameComponent implements OnInit {

  getErrorMessage = getErrorMessage
  name = new FormControl(this.data.name, [Validators.required])

  constructor(
    private dialogRef: MatDialogRef<RenameComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogDataRename
  ) { }

  ngOnInit(): void {

  }

  onRenameClicked() {
    if (this.name.valid) {
      this.dialogRef.close(this.name.value)
    }
  }

}
