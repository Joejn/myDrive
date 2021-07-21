import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Dir } from 'src/app/interfaces/dir';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  current_directory: string = "root"

  constructor( private http: HttpClient ) { }

  getDir(directory: string = "/") {

    directory = directory.replaceAll("\\", "/")
    
    if (this.current_directory[0] === "\\" || this.current_directory[0] === "/") {
      this.current_directory = this.current_directory.substring(1)
    }
    
    if (directory === "..") {
      let splitted_path = this.current_directory.split("/")
      splitted_path.pop()
      // console.log(splitted_path)
      if (splitted_path.length !== 0) {
        this.current_directory = splitted_path.join("/")
      } else {
        this.current_directory = "/"
      }
    } else {
      this.current_directory = directory
    }

    return this.http.get<Dir>(`http://127.0.0.1:5000/file/myFiles?directory=${this.current_directory}`)
  }

  getCurrentDir () {
    return this.current_directory
  }
}
