import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { getErrorMessage } from 'src/app/shared/error-messages';
import { forbiddenNameValidator } from 'src/app/shared/forbidden-filename.directive';

@Component({
  selector: 'app-create-folder',
  templateUrl: './create-folder.component.html',
  styleUrls: ['./create-folder.component.scss']
})
export class CreateFolderComponent implements OnInit {

  getErrorMessage = getErrorMessage

  createFolder = new FormGroup({
    name: new FormControl("", [
      forbiddenNameValidator()
    ])
  })

  

  constructor( public dialogRef: MatDialogRef<CreateFolderComponent>) { }

  ngOnInit(): void {
    console.log(this.createFolder)
  }

  onCreateClicked() {
    if(this.createFolder.valid) {
      this.dialogRef.close(this.createFolder.controls.name.value)
    }
  }
}
