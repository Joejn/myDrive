import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GroupRow } from '../../groups/groups.component';

@Component({
  selector: 'app-delete-group',
  templateUrl: './delete-group.component.html',
  styleUrls: ['./delete-group.component.scss']
})
export class DeleteGroupComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: GroupRow
  ) {}

  ngOnInit(): void {
    
  }

}
