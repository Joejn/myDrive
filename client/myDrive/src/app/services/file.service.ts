import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Dir } from 'src/app/interfaces/dir';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor( private http: HttpClient ) { }

  getHomeDir() {
    return this.http.get<Dir>("http://127.0.0.1:5000/file/myFiles")
  }

}
