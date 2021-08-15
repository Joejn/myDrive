import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private apiUrl = "http://127.0.0.1:5000/users"

  constructor( private http: HttpClient ) { }

  getAllUsers() {
    return this.http.get<User[]>(`${this.apiUrl}/get_all_users`)
  }

  addUser( username: string, firstname: string, lastname: string, birthday: Date, email: string, password: string ) {
    const body = {
      "username": username,
      "firstname": firstname,
      "lastname": lastname,
      "birthday": birthday.getTime() / 1000,
      "email": email,
      "password": password
    }
    return this.http.post<User[]>(`${this.apiUrl}/add_user`, body)
  }

  deleteUser( id: number ) {
    const httpOptions = {
      body: {
        "id": id
      }
    }
    return this.http.delete(`${this.apiUrl}/delete_user`, httpOptions)
  }
}
