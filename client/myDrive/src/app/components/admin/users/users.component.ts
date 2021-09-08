import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { User } from 'src/app/interfaces/user';
import { UsersService } from 'src/app/services/users.service';
import { ConfirmUserDeleteComponent } from '../dialogs/confirm-user-delete/confirm-user-delete.component';
import { NewUserDialogComponent } from '../dialogs/new-user-dialog/new-user-dialog.component';

const USERDATA: User[] = [
  {id: 1, username: "admin", firstname: "admin", lastname: "admin", birthday:"11/08/2002", email: "admin@myDrive.at"},
  {id: 2, username: "jonas", firstname: "Jonas", lastname: "Neuhauser", birthday:"11/08/2002", email: "jonas.neuhauser@gmx.at"},
]

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements AfterViewInit {

  allUsers: User[] = []

  @ViewChild(MatPaginator) paginator: any = ""

  displayColumns: string[] = ["id", "username", "firstname", "lastname", "birthday", "email", "delete"]
  dataSource = new MatTableDataSource(this.allUsers)

  constructor( private users: UsersService, private dialog: MatDialog, private _snackBar: MatSnackBar ) {
    this.setTableData()
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator
  }

  setTableData() {
    this.users.getAllUsers().subscribe((data: User[]) => {
      let user_data = data
      for ( let item of user_data ) {
        const birthday_date = new Date(item.birthday)
        item.birthday = `${birthday_date.getMonth() + 1}/${birthday_date.getDate()}/${birthday_date.getFullYear()}`
      }

      this.dataSource = new MatTableDataSource(user_data)
      this.dataSource.paginator = this.paginator
    })
  }

  applyFilter( event: Event ) {
    const filterValue = (event.target as HTMLInputElement).value
    this.dataSource.filter = filterValue.trim().toLowerCase()
    console.log(this.dataSource)
  }

  onDeleteClicked( user: User ) {
    const dialogRef = this.dialog.open(ConfirmUserDeleteComponent, {
      disableClose: true,
      data: {
        "username": user.username
      }
    })

    dialogRef.afterClosed().subscribe(isConfirmed => {
      if (isConfirmed) {
        this.users.deleteUser(user.id, user.username).subscribe((data: any) => {
          let user_data = data
          for ( let item of user_data ) {
            const birthday_date = new Date(item.birthday)
            item.birthday = `${birthday_date.getMonth() + 1}/${birthday_date.getDate()}/${birthday_date.getFullYear()}`
          }

          this.openSnackBar(`successfully deleted user "${user.username}"`, "Close")
          this.dataSource = new MatTableDataSource(user_data)
          this.dataSource.paginator = this.paginator
        })
      }
    })
  }

  openDialog() {
    const dialogRef = this.dialog.open(NewUserDialogComponent, {
      disableClose: true
    })

    dialogRef.afterClosed().subscribe((status) => {
      if (status) {
        this.setTableData()
      }
    })
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      horizontalPosition: "right",
      duration: 3000
    })
  }
}
