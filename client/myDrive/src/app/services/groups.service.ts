import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Group } from '../interfaces/group';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class GroupsService {

  apiUrl = `http://${this.conf.getAPIAdress()}:${this.conf.getAPIPort()}/group`

  constructor(private http: HttpClient, private conf: ConfigService) { }

  getAllGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(`${this.apiUrl}/get_all`)
  }

  addToGroup(groups: string[], users: string[]): Observable<any>{
    const body = JSON.stringify({
      "groups": groups,
      "users": users
    })

    return this.http.post<any>(`${this.apiUrl}/add_to_group`, body)
  }

  getGroupsOfUser(id: number): Observable<string[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        "user_id": String(id)
      })
    }

    return this.http.get<string[]>(`${this.apiUrl}/get_groups_of_user`, httpOptions)
  }

  setGroupsOfUser(user_id: number, groups: string[]) {
    const body = {
      "user_id": String(user_id),
      groups: groups
    }

    return this.http.post(`${this.apiUrl}/set_groups_of_user`, body)
  }
}
