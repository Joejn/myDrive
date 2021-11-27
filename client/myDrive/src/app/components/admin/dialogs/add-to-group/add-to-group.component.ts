import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { GroupsService } from 'src/app/services/groups.service';
import { DialogData } from '../confirm-user-delete/confirm-user-delete.component';

@Component({
  selector: 'app-add-to-group',
  templateUrl: './add-to-group.component.html',
  styleUrls: ['./add-to-group.component.scss']
})
export class AddToGroupComponent implements OnInit {

  options: string[] = []
  myControl = new FormControl
  filteredOptions: Observable<string[]> = new Observable
  groups: string[] = []

  constructor(
    public dialogRef: MatDialogRef<AddToGroupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string[],
    private group: GroupsService) { }

  ngOnInit(): void {
    this.group.getAllGroups().subscribe(groups => {
      this.options = groups.map(x => x.name_group)
    })
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(""),
      map(value => this._filter(value))
    )
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase()

    const options = this.options.filter(option => option.toLowerCase().includes(filterValue))
    return options.filter(() => !options.some(option => this.groups.indexOf(option) >= 0))
  }

  onAddClicked() {
    const groupName: string = this.myControl.value
    if (!this.groups.includes(groupName) && this.options.includes(groupName)) {
      this.groups.push(groupName)
      this.myControl.setValue("")
    }
  }

  onApplyClicked() {
    this.group.addToGroup(this.groups, this.data).subscribe()
    this.dialogRef.close(true)
  }

  onCanceldClicked() {
    this.dialogRef.close(false)
  }
}
