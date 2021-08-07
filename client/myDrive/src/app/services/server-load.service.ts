import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ServerLoadService {

  private apiUrl = "http://127.0.0.1:5000/server_info"

  constructor( private http: HttpClient ) { }

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
