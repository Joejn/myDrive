import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Dir } from 'src/app/interfaces/dir';
import { FileTableRow } from '../interfaces/file-table-row';
import { RecentFiles } from '../interfaces/recent-files';
import { ConfigService } from './config.service';

export interface DownloadFilesStructureInformations {
  currentDir: string,
  data: 
    {
      type: string,
      path: string
    }[]
  
}

export interface DownloadFilesStructure {
  mimeType: string
  data: {
    title: string,
    body: string
  }
}

@Injectable({
  providedIn: 'root'
})
export class FileService {

  currentDirectory: string = "root"
  apiUrl = `http://${this.conf.getAPIAdress()}:${this.conf.getAPIPort()}/file`

  constructor( private http: HttpClient, private conf: ConfigService ) { }

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

    return this.http.get<Dir>(`${this.apiUrl}/myFiles?directory=${this.currentDirectory}`)
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
    return this.http.post(`${this.apiUrl}/set_file_content`, body)
  }

  getRecentFiles() {
    return this.http.get<RecentFiles[]>(`${this.apiUrl}/get_recent_files`)
  }

  uploadFiles( files: File[], currentDir: string) {
    const fd = new FormData()
    const httpOptions = {
      headers: new HttpHeaders({
        "current_dir": currentDir
      })
    }
    for (const file of files) {
      if (typeof(file) === "object") {
        fd.append(file.name, file, file.name)
      }
    }
    return this.http.post(`${this.apiUrl}/upload_files`, fd, httpOptions)
  }

  createFolder(currentDir: string, folderName: string) {
    const body = {
      "current_dir": currentDir,
      "folder_name": folderName
    }

    return this.http.post(`${this.apiUrl}/create_folder`, body)
  }

  moveObjectToTrash( path : string ) {
    const body = {
      "path": path
    }
    return this.http.post(`${this.apiUrl}/move_to_trash`, body)
  }

  getObjectsFromTrash() {
    return this.http.get<Dir>(`${this.apiUrl}/get_objects_from_trash`)
  }

  deleteObjectFromTrash( path : string ) {
    const body = {
      "path": path
    }
    return this.http.post(`${this.apiUrl}/delete_object_from_trash`, body)
  }

  formatFileRowContent( data : Dir ) : FileTableRow[] {
    const rows : FileTableRow[] = []
    let pos = 0
    for (const item of data.directories) {
      const last_modified = new Date(item.last_modified * 1000)
      rows.push(
        {
          "position": pos++,
          "type": "directory",
          "name": item.name,
          "path": item.path,
          "last_modified": this.getModifiedStr(last_modified),
          "file_size": this.formatBytes(item.file_size)
        }
      )
    }

    for (const item of data.files) {
      const last_modified = new Date(item.last_modified * 1000)
      
      rows.push(
        {
          "position": pos++,
          "type": "file",
          "name": item.name,
          "path": item.path,
          "last_modified": this.getModifiedStr(last_modified),
          "file_size": this.formatBytes(item.file_size),
        }
      )
    }

    return rows
  }

  // https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
  formatBytes( bytes: number, decimals: number = 2 ): string {
    if (bytes === 0) {
      return "0 Bytes"
    }

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////

  getModifiedStr( last_modified: Date): string {
    const last_modified_date = new Date(last_modified).setHours(0, 0, 0, 0)
    const today = new Date().setHours(0, 0, 0, 0)
    let display_last_modified = ""
    if (today !== last_modified_date) {
      let day = last_modified.getDate() < 10 ? "0" + String(last_modified.getDate()) : last_modified.getDate()
      let month = last_modified.getMonth() < 10 ? "0" + String(last_modified.getMonth()) : last_modified.getMonth()
      let year = last_modified.getFullYear()

      display_last_modified = `${day}.${month}.${year}`
    } else {
      let houre = last_modified.getHours() < 10 ? "0" + String(last_modified.getHours()) : last_modified.getHours()
      let minutes = last_modified.getMinutes() < 10 ? "0" + String(last_modified.getMinutes()) : last_modified.getMinutes()

      display_last_modified = `${houre}:${minutes}`
    }

    return display_last_modified
  }

  /**
   * 
   * @param files releative path to object
   */
  downloadFiles( rows: FileTableRow[], currentDir: string ) {
    const bodyData = []
    for (const row of rows) {
      const dataElement = {
        "type": row.type,
        "path": row.path
      }

      bodyData.push(dataElement)
    }

    const body: DownloadFilesStructureInformations = {
      "currentDir": currentDir,
      data: bodyData
    }


    return this.http.post<DownloadFilesStructure>(`${this.apiUrl}/download`, body)
  }

  rename( oldPath: string, newPath: string ) {
    const body = {
      "oldPath": oldPath,
      "newPath": newPath
    }
    return this.http.post(`${this.apiUrl}/rename`, body)
  }
}
