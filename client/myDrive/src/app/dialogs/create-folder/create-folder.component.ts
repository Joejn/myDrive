import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-create-folder',
  templateUrl: './create-folder.component.html',
  styleUrls: ['./create-folder.component.scss']
})
export class CreateFolderComponent implements OnInit {

  folderName: string = ""

  constructor( public dialogRef: MatDialogRef<CreateFolderComponent>) { }

  ngOnInit(): void {
  }
}
