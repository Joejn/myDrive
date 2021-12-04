import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Privilege } from '../interfaces/privilege';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class PrivilegeService {

  apiUrl = `http://${this.conf.getAPIAdress()}:${this.conf.getAPIPort()}/privilege`

  constructor(private http: HttpClient, private conf: ConfigService) { }

  getAllPrivileges(): Observable<Privilege[]> {
    console.log(this.apiUrl)
    return this.http.get<Privilege[]>(`${this.apiUrl}/all`)
  }
}
