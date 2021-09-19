import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChangePasswordComponent } from 'src/app/dialogs/change-password/change-password.component';
import { ColorThemesService } from 'src/app/services/color-themes.service';
import { UserProfileService } from 'src/app/services/user-profile.service';
import { getErrorMessage } from 'src/app/shared/error-messages';

const DARK_THEME = "my-theme-dark"

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent implements OnInit {
  @Output() profilePictureChanged = new EventEmitter()
  @Output() colorThemeChanged = new EventEmitter()

  imgFile: File = new File([""], "profileImg")
  username = ""
  isDarkMode: boolean = false

  userForm = this.fb.group({
    username: new FormControl("", []),
    firstname: new FormControl("", [
      Validators.required
    ]),
    lastname: new FormControl("", [
      Validators.required
    ]),
    birthday: new FormControl("", [
      Validators.required
    ]),
    email: new FormControl("", [
      Validators.required,
      Validators.email
    ])
  })

  getErrorMessage = getErrorMessage

  constructor(
    private fb: FormBuilder,
    private userProfile: UserProfileService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private colorTheme: ColorThemesService
  ) { }

  ngOnInit(): void {
    this.setThemeTogglePosition(this.colorTheme.getTheme())
    this.resetForm()
  }

  onImgUploadClicked() {
    const fileUploadElement = document.getElementById("img_input")
    fileUploadElement?.click()
  }

  onImgUploadChanged(event: any) {
    const fileUploadElement = document.getElementById("img_input")
    if (fileUploadElement === null) {
      return
    }
    this.imgFile = event.target.files[0]
    const imgUrl = URL.createObjectURL(this.imgFile)

    const div = document.getElementById("user_profile_picture")
    div?.setAttribute("style", `background-image: url(${imgUrl}); background-size: cover; background-position: center;`)
  }

  onChagePasswordClicked() {
    let dialog = this.dialog.open(ChangePasswordComponent)
  }

  onSubmit(event: Event) {
    event.preventDefault()
    const firstname = this.userForm.controls['firstname'].value
    const lastname = this.userForm.controls['lastname'].value
    const birthday = this.userForm.controls['birthday'].value
    const email = this.userForm.controls['email'].value
    this.userProfile.updateGeneralData(firstname, lastname, birthday, email).subscribe((data: any) => {
      if (data["updated"]) {
        this.openSnackbar("successfully updated", "Close")
      }
    })

    // profile picture
    if (this.imgFile.size !== 0) {
      this.userProfile.uploadProfilePicture(this.imgFile).subscribe(data => {
        const div = document.getElementById("user_profile_picture")
        div?.setAttribute("style", `background-image: url(data:image/jpeg;base64,${data}); background-size: cover; background-position: center;`)
        this.profilePictureChanged.emit()
      })
    }
  }

  openSnackbar(message: string, action: string) {
    this.snackbar.open(message, action, {
      horizontalPosition: "end",
      duration: 3000,
    })
  }

  resetForm(): void {
    this.userProfile.getProfilePicture().subscribe(data => {
      const div = document.getElementById("user_profile_picture")
      div?.setAttribute("style", `background-image: url(data:image/jpeg;base64,${data}); background-size: cover; background-position: center;`)
    })

    setTimeout(() => {
      this.userProfile.getGeneralData().subscribe(data => {
        const birthday = new Date(data.birthday)

        this.username = data.username
        this.userForm.controls["firstname"].setValue(data.firstname)
        this.userForm.controls["lastname"].setValue(data.lastname)
        this.userForm.controls["birthday"].setValue(birthday)
        this.userForm.controls["email"].setValue(data.email)
      })
    }, 10)
  }

  onResetButtonClicked(): void {
    this.resetForm()
  }

  onColorThemeChanged(event: MatSlideToggleChange): void {
    const checked = event.checked
    let theme = "my-theme-light"
    if (checked) {
      theme = "my-theme-dark"
    }

    this.colorTheme.setTheme(theme)
    this.userProfile.setColorThemeOnServer(theme).subscribe()
    this.colorThemeChanged.emit(theme)
  }

  setThemeTogglePosition(theme: string) {
    let pos = false
    if(theme === DARK_THEME) {
      pos = true
    }

    this.isDarkMode = pos
  }
}
