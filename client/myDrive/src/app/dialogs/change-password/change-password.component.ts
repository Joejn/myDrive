import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserProfileService } from 'src/app/services/user-profile.service';
import { getErrorMessage } from 'src/app/shared/error-messages';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  passwordStrength: number = 0
  passwordStrengthProgressBarColor: string = "warn"

  currentPassword: string = ""
  newPassword: string = ""
  newPasswordConfirm: string = ""

  currentPasswordCorrect: boolean = true

  changePasswordForm: FormGroup

  getErrorMessage = getErrorMessage

  constructor( private userProfile: UserProfileService, private snackBar: MatSnackBar, private dialogRef: MatDialogRef<ChangePasswordComponent>) {
    this.changePasswordForm = new FormGroup({
      currentPassword: new FormControl(this.currentPassword, [
        Validators.required
      ]),
      newPassword: new FormControl(this.newPassword, [
        Validators.required,
        Validators.minLength(8)
      ]),
      newPasswordConfirm: new FormControl(this.newPasswordConfirm, [
        Validators.required,
        this.passwordConfirmValidator.bind(this)
      ])
    })
  }

  ngOnInit(): void {
    
  }

  private passwordConfirmValidator( formGroup: any ) : ValidationErrors | null {
    const newPassword = formGroup.parent?.controls["newPassword"].value
    const newPasswordConfirm = formGroup.parent?.controls["newPasswordConfirm"].value
    const isEqual: boolean = newPassword !== newPasswordConfirm
    return isEqual ? { passwordConfirm: { value: newPassword }} : null
  }

  onCurrentPasswordInput() {
    this.currentPasswordCorrect = true
  }

  onSubmit( event: Event ) {
    event.preventDefault()

    const currentPassword = this.changePasswordForm.controls["currentPassword"].value
    const newPassword = this.changePasswordForm.controls["newPassword"].value
    this.userProfile.updatePassword(currentPassword, newPassword).subscribe(data => {
      if ( !data.successful ) {
        if (data.error === "wrong current password") {
          this.changePasswordForm.controls['currentPassword'].setValue("")
          this.currentPasswordCorrect = false
        }
      } else {
        this.snackBar.open("Password successfully changed", "Close", {
          horizontalPosition: "end",
          duration: 3000
        })
        this.dialogRef.close()
      }
    })
  }

  setPasswordStrength() {
    const password: string = this.changePasswordForm.controls["currentPassword"].value
    const passwordLenght: number = password.length
    const security_01: number = 30
    const security_02: number = 60
    let score = 0

    let hasLowerCase: boolean = (/[a-z]/.test(password))
    let hasUpperCase: boolean = (/[A-Z]/.test(password))
    let hasNumbers: boolean = (/[0-9]/.test(password))
    // https://stackoverflow.com/questions/32311081/check-for-special-characters-in-string
    let hasSpecialCharacters: boolean = (/[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(password))

    let quotient = 0.1
    if (hasLowerCase) {
      quotient *= 2
    }

    if (hasUpperCase) {
      quotient *= 2
    }

    if (hasNumbers) {
      quotient *= 2
    }

    if (hasSpecialCharacters) {
      quotient *= 2
    }

    for ( let i = 0; i < passwordLenght; ++i ) {
      score += i * quotient
    }

    if ( score < security_01 ) {
      this.passwordStrengthProgressBarColor = "warn"
    } else if ( score < security_02 ) {
      this.passwordStrengthProgressBarColor = "accent"
    } else {
      this.passwordStrengthProgressBarColor = "primary"
    }

    this.passwordStrength = score
  }
}
