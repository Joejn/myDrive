import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { FileService } from 'src/app/services/file.service';
import { UsersService } from 'src/app/services/users.service';
import { getErrorMessage } from 'src/app/shared/error-messages';

@Component({
  selector: 'app-create-shared-folder',
  templateUrl: './create-shared-folder.component.html',
  styleUrls: ['./create-shared-folder.component.scss']
})
export class CreateSharedFolderComponent implements OnInit {

  sharedFolderForm = new FormGroup({
    name: new FormControl("", [
      Validators.required
    ]),
  })

  getErrorMessage = getErrorMessage

  constructor(private dialogRef: MatDialogRef<CreateSharedFolderComponent>, private fileService: FileService) { }

  ngOnInit() {
    
  }

  onCreateClicked() {
    if (!this.sharedFolderForm.valid) {
      return
    }

    const name: string = this.sharedFolderForm.controls["name"].value
    this.fileService.createSharedFolder(name).subscribe((response) => {
      if (response["state"] === "success") {
        this.dialogRef.close(true)
      } else {
        this.dialogRef.close(false)
      }
    })
  }
}
