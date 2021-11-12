import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { getErrorMessage } from 'src/app/shared/error-messages';

@Component({
  selector: 'app-create-quota',
  templateUrl: './create-quota.component.html',
  styleUrls: ['./create-quota.component.scss']
})
export class CreateQuotaComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<CreateQuotaComponent>) { }

  getErrorMessage = getErrorMessage
  
  quotaFormControl = new FormControl("", [
    Validators.required
  ])

  ngOnInit(): void {
  }

  onCanceldClicked() {
    this.dialogRef.close(false)
  }

  onCreateClicked() {
    this.dialogRef.close(true)
  }

}
