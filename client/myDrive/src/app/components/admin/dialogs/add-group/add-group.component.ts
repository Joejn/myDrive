import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Privilege } from 'src/app/interfaces/privilege';
import { GroupsService } from 'src/app/services/groups.service';
import { PrivilegeService } from 'src/app/services/privilege.service';

@Component({
  selector: 'app-add-group',
  templateUrl: './add-group.component.html',
  styleUrls: ['./add-group.component.scss']
})
export class AddGroupComponent implements OnInit {

  @ViewChild("myInput") myInput: any

  groupForm = new FormGroup({
    name: new FormControl("", [
      Validators.required
    ]),
    privilege: new FormControl("")
  })

  options: Privilege[] = []
  filteredOptions: Observable<Privilege[]> = new Observable
  selectedPrivileges: Privilege[] = []

  constructor(private privilege: PrivilegeService, private group: GroupsService, private dialogRef: MatDialogRef<AddGroupComponent>) { }

  ngOnInit(): void {
    this.privilege.getAllPrivileges().subscribe(privileges => {
      this.options = privileges
      console.log(this.groupForm.controls.name.valueChanges)
      this.filteredOptions = this.groupForm.controls.privilege.valueChanges.pipe(
        startWith(""),
        map(value => (typeof value === "string" ? value : value.name)),
        map(name => (name ? this._filter(name) : this.options.slice()))
      )
    })
  }

  private _filter(name: string) {
    const filterValue = name.toLowerCase()

    return this.options.filter(option => option.name.toLowerCase().includes(filterValue))
  }

  private _checkIfPrivilegeExists(id: number): boolean {
      return this.options.filter(option => option.id === id).length > 0
  }

  /**
   * Get the index of the searched privilege
   * @param {Privilege} privilage the privilege which should be searched
   * @returns {number} returns the index in this.options of the privilege. If the privilege does not exist, the return value will be -1
   */
  private _getPrivilegePosFromId(id: number): number {
    let privilegeId: number = -1
    for (const [i, option] of this.options.entries()) {
      if (option.id === id) {
        privilegeId = i
      }
    }

    return privilegeId
  }

  displayFn(privileges: string): string {
    return privileges
  }

  onAddClicked() {

    let selectedPrivilegeId: number = -1
    try {
      selectedPrivilegeId = Number(this.myInput._element.nativeElement.dataset.privilegeId)
    } catch {
      return
    }

    let privilegeId: number = this._getPrivilegePosFromId(selectedPrivilegeId)

    if (privilegeId === -1) {
      return
    }

    const privilege = this.options[privilegeId]
    const privilegeExists = (this.options.filter(option => option === privilege).length > 0)
    const isPrivilegeAlreadyAdded = (this.selectedPrivileges.filter(addedPrivilege => addedPrivilege === privilege).length > 0)

    if (privilegeExists && !isPrivilegeAlreadyAdded) {
      this.selectedPrivileges.push(privilege)
      this.groupForm.controls.privilege.setValue("")
    }
  }

  onDeleteClicked(id: number) {
    this.selectedPrivileges = this.selectedPrivileges.filter(privilege => privilege.id !== id)
  }

  onCreateClicked() {
    if (this.groupForm.status !== "VALID" || this.selectedPrivileges.length === 0) {
      return
    }

    const name = this.groupForm.value.name
    this.group.addGroup(name, this.selectedPrivileges).subscribe(() => {
      this.groupForm.controls.name.setValue("")
      this.groupForm.controls.privilege.setValue("")
      this.selectedPrivileges = []
      this.dialogRef.close(true)
    })
  }

}
