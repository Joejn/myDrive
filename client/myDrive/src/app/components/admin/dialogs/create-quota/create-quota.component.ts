import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { QuotaService } from 'src/app/services/quota.service';
import { getErrorMessage } from 'src/app/shared/error-messages';

@Component({
  selector: 'app-create-quota',
  templateUrl: './create-quota.component.html',
  styleUrls: ['./create-quota.component.scss']
})
export class CreateQuotaComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<CreateQuotaComponent>, private quota: QuotaService, private fb: FormBuilder) { }

  getErrorMessage = getErrorMessage

  quotaForm = this.fb.group ({
    name: ["", [Validators.required]],
    size: ["", [
      Validators.required,
      Validators.pattern("[0-9]+"),
    ]],

  })

  ngOnInit(): void {
  }

  onCanceldClicked() {
    this.dialogRef.close(false)
  }

  onCreateClicked() {
    const name = this.quotaForm.controls["name"].value
    const size = this.quotaForm.controls["size"].value
    this.quota.createQuota(name, size).subscribe(() => {
      
    })
    this.dialogRef.close(true)
  }

}
