import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogDataRename } from 'src/app/components/home/home.component';

@Component({
  selector: 'app-rename',
  templateUrl: './rename.component.html',
  styleUrls: ['./rename.component.scss']
})
export class RenameComponent implements OnInit {

  name: string = ""

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogDataRename
  ) { }

  ngOnInit(): void {
    this.name = this.data.name
  }

}
