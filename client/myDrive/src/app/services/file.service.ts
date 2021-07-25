import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Dir } from 'src/app/interfaces/dir';
import { RecentFiles } from '../interfaces/recent-files';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  currentDirectory: string = "root"
  fileApiUrl = "http://127.0.0.1:5000/file"

  constructor( private http: HttpClient ) { }

  getDir(directory: string = "/") {

    directory = directory.replaceAll("\\", "/")
    
    if (this.currentDirectory[0] === "\\" || this.currentDirectory[0] === "/") {
      this.currentDirectory = this.currentDirectory.substring(1)
    }
    
    if (directory === "..") {
      let splitted_path = this.currentDirectory.split("/")
      splitted_path.pop()
      if (splitted_path.length !== 0) {
        this.currentDirectory = splitted_path.join("/")
      } else {
        this.currentDirectory = "/"
      }
    } else {
      this.currentDirectory = directory
    }

    return this.http.get<Dir>(`${this.fileApiUrl}/myFiles?directory=${this.currentDirectory}`)
  }

  getCurrentDir () {
    return this.currentDirectory
  }

  getSpecificFile(filePath: string) {
    console.log(filePath)
    filePath = filePath.replaceAll("\\", "/")
    console.log(`http://127.0.0.1:5000/file/get_file?file=${filePath}`)
    return this.http.get<any>(`http://127.0.0.1:5000/file/get_file?file=${filePath}`)
  }

  setFileContent(filePath: string, content: string) {
    const body = {
      "filePath": filePath,
      "content": content
    }
    return this.http.post(`${this.fileApiUrl}/set_file_content`, body)
  }

  getRecentFiles() {
    return this.http.get<RecentFiles[]>(`${this.fileApiUrl}/get_recent_files`)
  }
}
