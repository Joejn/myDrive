import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CreateSharedFolderComponent } from 'src/app/dialogs/create-shared-folder/create-shared-folder.component';
import { dialogResult, EditShareAccessComponent } from 'src/app/dialogs/edit-share-access/edit-share-access.component';
import { FileService, SharedFolders } from 'src/app/services/file.service';
import { FileTableComponent } from '../shares/file-table/file-table.component';

interface FolderEntry {
  "shared_folder_id": number,
  "name": string
}



@Component({
  selector: 'app-shared-with-me',
  templateUrl: './shared-with-me.component.html',
  styleUrls: ['./shared-with-me.component.scss']
})
export class SharedWithMeComponent implements OnInit {
  shares = []
  myShares: FolderEntry[] = []
  sharedWithMe: FolderEntry[] = []
  selectedSharedFolder = ""
  @ViewChild("table") table!: FileTableComponent

  constructor(public dialog: MatDialog, private _snackbar: MatSnackBar, private fileService: FileService) {

  }

  ngOnInit(): void {
    this.setSharedFolders().then((sharedFolders: any) => {
      if (sharedFolders.length > 0) {
        this.selectedSharedFolder = sharedFolders[0].name
      }
    })
  }

  setSharedFolders() {
    return new Promise((resolve, reject) => {
      let sharedFolders: any = []
      this.fileService.getShareFolder().subscribe((folders) => {
        sharedFolders = folders.data
        this.myShares = []
        this.sharedWithMe = []
        for (const sharedFolder of sharedFolders) {
          if (sharedFolder.is_owner) {
            this.myShares.push({"shared_folder_id": sharedFolder.shared_folder_id, "name": sharedFolder.name})
          } else {
            this.sharedWithMe.push({"shared_folder_id": sharedFolder.shared_folder_id, "name": sharedFolder.name})
          }
        }

        resolve(sharedFolders)
      })
    })
  }
  
  openCreateSharedFolderDialog() {
    const dialogRef = this.dialog.open(CreateSharedFolderComponent)

    dialogRef.afterClosed().subscribe((state: boolean) => {
      if (state) {
        this._openSnackbar("Shared folder created")

        this.setSharedFolders().then(() => {})
        this.table.setTableData
      }
    })
  }

  onShareButtonClicked(share: string) {
    this.selectedSharedFolder = share
    this.table.shared_folder_name = this.selectedSharedFolder
    this.table.setTableData()
  }

  onEditClicked(shared_folder_id: number, name: string) {
    const dialogRef = this.dialog.open(EditShareAccessComponent, {
      data: {
        id: shared_folder_id,
        name: name
      }
    })

    const oldName = name
    dialogRef.afterClosed().subscribe((data: dialogResult) => {
      if (data.status === "canceld") {
        return
      }
      
      if (oldName !== data.folderName) {
        this.fileService.renameSharedFolder(oldName, data.folderName).subscribe((result) => {
          if (result.state === "faild") {
            this._openSnackbar("update faild")
            return
          }

          this.setSharedFolders()

          this.fileService.setUserAccess(data.folderName, data.usersWithAccess).subscribe(result => {
            if (result.state === "success") {
              this._openSnackbar("updated successfully")
            } else {
              this._openSnackbar("update faild")
            }
          })

          
        })
      } else {
        this.fileService.setUserAccess(data.folderName, data.usersWithAccess).subscribe(result => {
          if (result.state === "success") {
            this._openSnackbar("updated successfully")
          } else {
            this._openSnackbar("update faild")
          }
        })
      }

      
    })
  }

  private _openSnackbar(msg: string, action: string = "Close") {
    this._snackbar.open(msg, action, {
      horizontalPosition: "end",
      duration: 3000
    })
  }

}
