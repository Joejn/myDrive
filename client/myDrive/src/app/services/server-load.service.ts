import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class ServerLoadService {

  apiUrl = `http://${this.conf.getAPIAdress()}:${this.conf.getAPIPort()}/server_info`

  constructor( private http: HttpClient, private conf: ConfigService ) { }

  get_server_load() {
    interface ServerLoad {
      "cpu_usage": [{
        "time": string
        "value": number
      }],
      "cpu_freq_current": [{
        "time": string
        "value": number
      }],
      "memory_usage": [{
        "time": string
        "value": number
      }]
    }

    return this.http.get<ServerLoad>(`${this.apiUrl}/usage`)
  }
}
