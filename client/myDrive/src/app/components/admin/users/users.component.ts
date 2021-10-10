import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { User } from 'src/app/interfaces/user';
import { UsersService } from 'src/app/services/users.service';
import { AddToGroupComponent } from '../dialogs/add-to-group/add-to-group.component';
import { ConfirmUserDeleteComponent } from '../dialogs/confirm-user-delete/confirm-user-delete.component';
import { EditGroupsFromUserComponent } from '../dialogs/edit-groups-from-user/edit-groups-from-user.component';
import { NewUserDialogComponent } from '../dialogs/new-user-dialog/new-user-dialog.component';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements AfterViewInit {

  allUsers: User[] = []

  @ViewChild(MatPaginator) paginator: any = ""

  displayColumns: string[] = ["select", "id", "username", "firstname", "lastname", "birthday", "email", "delete"]
  dataSource = new MatTableDataSource(this.allUsers)
  selection = new SelectionModel<User>(true, []);

  

  constructor(private users: UsersService, private dialog: MatDialog, private _snackBar: MatSnackBar) {
    this.setTableData()
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator
  }

  @ViewChild(MatMenuTrigger)
  public contextMenu!: MatMenuTrigger

  contextMenuPosition = { x: "0px", y: "0px" }

  setTableData() {
    this.users.getAllUsers().subscribe((data: User[]) => {
      let user_data = data
      for (let item of user_data) {
        const birthday_date = new Date(item.birthday)
        item.birthday = `${birthday_date.getMonth() + 1}/${birthday_date.getDate()}/${birthday_date.getFullYear()}`
      }

      this.dataSource = new MatTableDataSource(user_data)
      this.dataSource.paginator = this.paginator
    })
  }

  applyFilter(event: Event) {
    this.selection.clear()
    const filterValue = (event.target as HTMLInputElement).value
    this.dataSource.filter = filterValue.trim().toLowerCase()
  }

  onDeleteClicked(user: User) {
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
          for (let item of user_data) {
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

  onAddGroupClicked() {
    const dialogRef = this.dialog.open(AddToGroupComponent, {
      disableClose: true,
      data: this.selection.selected.map(x => x.username)
    })
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      horizontalPosition: "right",
      duration: 3000
    })
  }

  // Source: https://material.angular.io/components/table/examples also used code from the same source in HTML file /////////////////////////////////////
  isAllSelected() {
    const numSelected = this.selection.selected.length
    const numRows = this.dataSource.data.length
    return numSelected == numRows
  }

  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear()
      return
    }

    this.selection.select(...this.dataSource.data)
  }

  checkboxLabel(row?: User): string {
    if (!row) {
      return `${this.isAllSelected() ? "deselect" : "select"} all`
    }
    return `${this.selection.isSelected(row) ? "deselect" : "select"} row ${row.id + 1}`
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // https://stackblitz.com/edit/angular-material-context-menu?file=app%2Fcontext-menu-example.ts
  onContextMenu(event: MouseEvent, element: User) {
    event.preventDefault()
    this.contextMenuPosition.x = event.clientX + "px"
    this.contextMenuPosition.y = event.clientY + "px"
    this.contextMenu.menuData = element
    this.contextMenu.menu.focusFirstItem("mouse")
    this.contextMenu.openMenu()
  }

  onGroupsClicked() {
    const dialogRef = this.dialog.open(EditGroupsFromUserComponent, {
      disableClose: true,
      data: this.contextMenu.menuData
    })
  }

  onSingleUserDeleteClicked() {
    this.onDeleteClicked(this.contextMenu.menuData)
  }
}
