import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoginData } from '../interfaces/login-data';
import { RefreshTokenData } from '../interfaces/refresh-token-data';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor( private http: HttpClient) { }

  authBaseUrl = "http://127.0.0.1:5000/auth"

  login(username: string, password: string) {
    const user_credentials = {
      "username": username,
      "password": password
    }

    return this.http.post<LoginData>(`${this.authBaseUrl}/login`, user_credentials)
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

    return this.http.post<RefreshTokenData>(`${this.authBaseUrl}/refresh`, "", httpOptions)
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
    let base64Url = token.split(".")[1]
    let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const groups = JSON.parse(atob(base64))["groups"]
    return groups
  }

  memberOfGroup(group: string) {
    const userGroups = this.getGroups()
    return userGroups.includes(group) ? true : false
  }

}
