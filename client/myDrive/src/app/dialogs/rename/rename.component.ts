import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogDataRename } from 'src/app/components/home/home.component';
import { getErrorMessage } from 'src/app/shared/error-messages';
import { forbiddenNameValidator } from 'src/app/shared/forbidden-filename.directive';

@Component({
  selector: 'app-rename',
  templateUrl: './rename.component.html',
  styleUrls: ['./rename.component.scss']
})
export class RenameComponent implements OnInit {

  getErrorMessage = getErrorMessage
  rename = new FormGroup({
    name: new FormControl(this.data.name, [
      forbiddenNameValidator()
    ])
  })

  constructor(
    private dialogRef: MatDialogRef<RenameComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogDataRename
  ) { }

  ngOnInit(): void {

  }

  onRenameClicked() {
    if (this.rename.valid) {
      this.dialogRef.close(this.rename.controls.name.value)
    }
  }

}
