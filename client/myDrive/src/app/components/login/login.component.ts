import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { LoginData } from 'src/app/interfaces/login-data';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor( private auth: AuthService, private router: Router ) { }
  @Output() loggedIn = new EventEmitter()

  username: string = ""
  password: string = ""

  ngOnInit(): void {
  }

  onSubmit(event: Event) {
    event.preventDefault()
    this.auth.login(this.username, this.password).subscribe((data: LoginData) => {
      if (!data.login) {
        this.password = ""
        return
      }

      localStorage.setItem("access_token", data.access_token)
      localStorage.setItem("refresh_token", data.refresh_token)
      this.loggedIn.emit()
      this.router.navigate(["home"])
    })
  }
}
