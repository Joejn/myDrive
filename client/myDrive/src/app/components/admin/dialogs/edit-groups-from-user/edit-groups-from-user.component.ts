import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from 'src/app/interfaces/user';
import { GroupsService } from 'src/app/services/groups.service';

@Component({
  selector: 'app-edit-groups-from-user',
  templateUrl: './edit-groups-from-user.component.html',
  styleUrls: ['./edit-groups-from-user.component.scss']
})

export class EditGroupsFromUserComponent implements OnInit {

  availableGroups: string[] = []
  memberOfGroups: string[] = []

  constructor(private group: GroupsService,
    public dialogRef: MatDialogRef<EditGroupsFromUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: User) {
    let allGroups: string[] = []
    this.group.getAllGroups().subscribe(data => {
      allGroups = data.map(x => x.name)

      this.group.getGroupsOfUser(this.data.id).subscribe(memberships => {
        this.memberOfGroups = memberships.filter(group => allGroups.includes(group))
        this.availableGroups = allGroups.filter(group => !this.memberOfGroups.includes(group))
      })
    })
  }

  ngOnInit(): void { }

  onApplyClicked() {
    this.group.setGroupsOfUser(this.data.id, this.memberOfGroups).subscribe(() => {
      this.dialogRef.close(true)
    })
  }

  onCanceldClicked() {
    this.dialogRef.close(false)
  }

  // Source: https://material.angular.io/cdk/drag-drop/overview
  drop(event: CdkDragDrop<any>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex)
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex)
    }
  }

}
