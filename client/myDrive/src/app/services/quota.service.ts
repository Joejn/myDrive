import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class QuotaService {

  apiUrl = `http://${this.conf.getAPIAdress()}:${this.conf.getAPIPort()}/quota`
  constructor(private http: HttpClient, private conf: ConfigService) {

  }

  /**
   * 
   * @param name name of Quota
   * @param size size of Quota in bit
   */
  createQuota(name: string, size: number) : Observable<any> {
    const body = {
      "name": name,
      "size": size
    }
    return this.http.post(`${this.apiUrl}/create`, body)
  }
}
