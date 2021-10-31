import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoginData } from '../interfaces/login-data';
import { RefreshTokenData } from '../interfaces/refresh-token-data';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor( private http: HttpClient, private conf: ConfigService ) { }

  apiUrl = `http://${this.conf.getAPIAdress()}:${this.conf.getAPIPort()}/auth`

  login(username: string, password: string) {
    const user_credentials = {
      "username": username,
      "password": password
    }

    return this.http.post<LoginData>(`${this.apiUrl}/login`, user_credentials)
  }

  logout() {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
  }

  refreshAccessToken() {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.getRefreshToken()}`
      })
    }

    return this.http.post<RefreshTokenData>(`${this.apiUrl}/refresh`, "", httpOptions)
  }

  isLoggedIn() {
    const refreshToken = localStorage.getItem("refresh_token")
    if (!refreshToken) {
      return false
    }

    return !this.tokenExpired(refreshToken)
  }

  getAccessToken(): string {
    let access_token = ""
    if (localStorage.getItem("access_token")) {
      access_token = String(localStorage.getItem("access_token"))
    }
    return access_token
  }

  getRefreshToken(): string {
    let refresh_token = ""
    if (localStorage.getItem("refresh_token")) {
      refresh_token = String(localStorage.getItem("refresh_token"))
    }
    return refresh_token
  }

  tokenExpired(token: string) {
    const expiry = (JSON.parse(atob(token.split(".")[1]))).exp
    return (Math.floor((new Date).getTime() / 1000)) >= expiry
  }

  getGroups() {
    const token = this.getAccessToken()
    return this.jwtToObject(token)["groups"]
  }

  memberOfGroup(group: string) {
    const userGroups = this.getGroups()
    return userGroups.includes(group) ? true : false
  }

  getUserId() {
    const token = this.getAccessToken()
    return this.jwtToObject(token)["id"]
  }

  jwtToObject(token: string) {
    let base64Url = token.split(".")[1]
    let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jwt = JSON.parse(atob(base64))
    return jwt
  }
}
