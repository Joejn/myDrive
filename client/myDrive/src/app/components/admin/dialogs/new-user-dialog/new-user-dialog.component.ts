import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { User } from 'src/app/interfaces/user';
import { UsersService } from 'src/app/services/users.service';
import { getErrorMessage } from 'src/app/shared/error-messages';

@Component({
  selector: 'app-new-user-dialog',
  templateUrl: './new-user-dialog.component.html',
  styleUrls: ['./new-user-dialog.component.scss']
})
export class NewUserDialogComponent implements OnInit {

  getErrorMessage = getErrorMessage

  tableData: User[] = []

  addUserForm = this.fb.group ({
    username: ["", [Validators.required]],
    firstname: ["", [Validators.required]],
    lastname: ["", [Validators.required]],
    birthday: [new Date(), [Validators.required]],
    email: ["", [Validators.required, Validators.email]],
    password: ["", [Validators.required, Validators.minLength(8)]]
  })

  constructor( private users: UsersService, private fb: FormBuilder, private dialogRef: MatDialogRef<NewUserDialogComponent> ) { }

  ngOnInit(): void {

  }

  onSubmit() {
    const username = this.addUserForm.controls["username"].value
    const firstname = this.addUserForm.controls["firstname"].value
    const lastname = this.addUserForm.controls["lastname"].value
    const birthday = this.addUserForm.controls["birthday"].value
    const email = this.addUserForm.controls["email"].value
    const password = this.addUserForm.controls["password"].value

    this.users.addUser(
      username,
      firstname,
      lastname,
      birthday,
      email,
      password
    ).subscribe(() => {
      this.dialogRef.close(true)
    })
  }

}
