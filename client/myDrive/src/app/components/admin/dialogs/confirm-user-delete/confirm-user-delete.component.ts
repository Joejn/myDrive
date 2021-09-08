import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  username: string
}

@Component({
  selector: 'app-confirm-user-delete',
  templateUrl: './confirm-user-delete.component.html',
  styleUrls: ['./confirm-user-delete.component.scss']
})
export class ConfirmUserDeleteComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  ngOnInit(): void {

  }

}
