import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { filter, map, startWith } from 'rxjs/operators';
import { EditGroupsFromUserComponent } from 'src/app/components/admin/dialogs/edit-groups-from-user/edit-groups-from-user.component';
import { FileService } from 'src/app/services/file.service';
import { UsersService } from 'src/app/services/users.service';
import { getErrorMessage } from 'src/app/shared/error-messages';

export interface listItem {
  "id": number,
  "name": string
}

export interface dialogResult {
  "status": string,
  "folderName": string,
  "usersWithAccess": listItem[]
}

@Component({
  selector: 'app-edit-share-access',
  templateUrl: './edit-share-access.component.html',
  styleUrls: ['./edit-share-access.component.scss']
})
export class EditShareAccessComponent implements OnInit {
  options: listItem[] = [];
  filteredOptions: Observable<listItem[]> = new Observable();
  selectedItems: listItem[] = []

  getErrorMessage = getErrorMessage

  editGroup = new FormGroup({
    "folderName": new FormControl("", { validators: [Validators.required] }),
    "userName": new FormControl("")
  })

  constructor(private usersService: UsersService, private fileService: FileService, public dialogRef: MatDialogRef<EditGroupsFromUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: listItem) { }
  ngOnInit() {
    this.usersService.getAllUsernamesAndIds().subscribe((data: listItem[]) => {
      this.options = data
      const autoCompletInput = this.editGroup.controls["userName"]
      this.filteredOptions = autoCompletInput.valueChanges.pipe(
        startWith(''),
        map(value => this._filter(value)),
      );
    })

    this.fileService.getUsersWithAccessToSharedFolder(this.data.name).subscribe(response => {
      if (response.status === "success") {
        const data: listItem[] = response.data
        this.selectedItems = response.data
      }
    })

    this.editGroup.controls["folderName"].setValue(this.data.name)

  }

  private _filter(value: string): listItem[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(option => {
      let match: boolean = option.name.toLowerCase().includes(filterValue)

      let currentlyNotInList = true
      for (const selectedItem of this.selectedItems) {
        if (selectedItem.name === option.name) {
          currentlyNotInList = false
        }
      }

      return (match && currentlyNotInList)
    });
  }

  onAddClicked() {
    const username = this.editGroup.controls["userName"].value
    for (const option of this.options) {
      if ((option.name === username)) {
        let alreadyExists = false

        for (const selectedItem of this.selectedItems) {
          if (selectedItem.name === username) {
            alreadyExists = true
          }
        }
        if (!alreadyExists) {
          this.selectedItems.push(option)
          this.editGroup.controls["userName"].setValue("")
        }
      }
    }
  }

  onItemRemoveClicked(id: number) {
    this.selectedItems = this.selectedItems.filter(item => {
      return item.id !== id
    })

    const autoCompletInput = this.editGroup.controls["userName"]
    this.filteredOptions = autoCompletInput.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value)),
    );
  }

  onSubmit() {
    if (!this.editGroup.valid) {
      return
    }

    const folderName = this.editGroup.controls["folderName"].value

    const result: dialogResult = {
      "status": "submit",
      "folderName": folderName,
      "usersWithAccess": this.selectedItems
    }

    this.dialogRef.close(result)
  }

}
