import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { LoginData } from 'src/app/interfaces/login-data';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { getErrorMessage } from 'src/app/shared/error-messages';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor( private auth: AuthService, private router: Router, private fb: FormBuilder ) { }
  @Output() loggedIn = new EventEmitter()

  username: string = ""
  password: string = ""
  loginCorrect: boolean = true
  getErrorMessage = getErrorMessage

  loginForm = this.fb.group({
    username: new FormControl("", [Validators.required]),
    password: new FormControl("", [Validators.required])
  })

  ngOnInit(): void {
  }

  onSubmit(event: Event) {
    event.preventDefault()
    this.auth.login(this.username, this.password).subscribe((data: LoginData) => {
      if (!data.login) {
        this.loginCorrect = false
        this.password = ""
        return
      }

      this.loginCorrect = true
      localStorage.setItem("access_token", data.access_token)
      localStorage.setItem("refresh_token", data.refresh_token)
      this.loggedIn.emit()
      this.router.navigate(["main"])
    })
  }
}
