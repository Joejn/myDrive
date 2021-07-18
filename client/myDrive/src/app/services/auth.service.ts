import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoginData } from '../interfaces/login-data';


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

  }

  isLoggedIn() {
    const refreshToken = localStorage.getItem("refresh_token")
    if (!refreshToken) {
      return false
    }

    return !this.tokenExpired(refreshToken)
  }

  getAccessToken() {

  }

  getRefreshToken() {

  }

  tokenExpired(token: string) {
    const expiry = (JSON.parse(atob(token.split(".")[1]))).exp
    return (Math.floor((new Date).getTime() / 1000)) >= expiry
  }

}
