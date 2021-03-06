import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { listItem } from '../dialogs/edit-share-access/edit-share-access.component';
import { User } from '../interfaces/user';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  apiUrl = `http://${this.conf.getAPIAdress()}:${this.conf.getAPIPort()}/users`

  constructor( private http: HttpClient, private conf: ConfigService ) { }

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

  deleteUser( id: number, username: string ) {
    const httpOptions = {
      body: {
        "id": id,
        "username": username
      }
    }
    return this.http.delete(`${this.apiUrl}/delete_user`, httpOptions)
  }

  getUserCount() {
    return this.http.get(`${this.apiUrl}/get_registerd_users_count`)
  }

  getAllUsernamesAndIds() {
    return this.http.get<listItem[]>(`${this.apiUrl}/get_all_usernames_and_ids`)
  }
}
