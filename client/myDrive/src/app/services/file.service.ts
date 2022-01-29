import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Dir } from 'src/app/interfaces/dir';
import { listItem } from '../dialogs/edit-share-access/edit-share-access.component';
import { DefaultResponse } from '../interfaces/default-response';
import { FileTableRow } from '../interfaces/file-table-row';
import { ConfigService } from './config.service';

export interface DownloadFilesStructureInformations {
  "is_share": boolean,
  "shared_folder": string,
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

export interface SharedFolders {
  "state": string,
  "data": [{
    "shared_folder_id": number,
    "name": string,
    "is_owner": boolean
  }]
}

export interface UsersWithAccessResponse {
  "status": string,
  "data": [{
    "id": number,
    "name": string
  }]
}

@Injectable({
  providedIn: 'root'
})
export class FileService {

  currentDirectory: string = "root"
  apiUrl = `http://${this.conf.getAPIAdress()}:${this.conf.getAPIPort()}/file`

  constructor(private http: HttpClient, private conf: ConfigService) { }

  getDir(directory: string = "/"): Observable<Dir> {
    directory = directory.replaceAll("\\", "/")

    if (directory === "..") {
      this.currentDirectory = this.getParentDir(this.currentDirectory)
    } else {
      this.currentDirectory = directory
    }

    return this.http.get<Dir>(`${this.apiUrl}/myFiles?directory=${this.currentDirectory}`)
  }

  getCurrentDir() {
    return this.currentDirectory
  }

  getSpecificFile(filePath: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/get_file?file=${filePath}`,
      { responseType: 'blob' })
  }

  setFileContent(filePath: string, content: string) {
    const body = {
      "filePath": filePath,
      "content": content
    }
    return this.http.post(`${this.apiUrl}/set_file_content`, body)
  }

  getRecentFiles() {
    return this.http.get<Dir>(`${this.apiUrl}/get_recent_files`)
  }

  uploadFiles(files: File[], currentDir: string): Observable<any> {
    const fd = new FormData()
    const httpOptions = {
      headers: new HttpHeaders({
        "current_dir": currentDir
      })
    }

    for (const file of files) {
      fd.append(file.name, file, file.name)
    }

    return this.http.post<any>(`${this.apiUrl}/upload_files`, fd, httpOptions)
  }

  createFolder(currentDir: string, folderName: string) {
    const body = {
      "current_dir": currentDir,
      "folder_name": folderName
    }

    return this.http.post(`${this.apiUrl}/create_folder`, body)
  }

  moveObjectToTrash(path: string) {
    const body = {
      "path": path
    }
    return this.http.post(`${this.apiUrl}/move_to_trash`, body)
  }

  getObjectsFromTrash() {
    return this.http.get<Dir>(`${this.apiUrl}/get_objects_from_trash`)
  }

  deleteObjectFromTrash(path: string) {
    const body = {
      "path": path
    }
    return this.http.post(`${this.apiUrl}/delete_object_from_trash`, body)
  }

  formatFileRowContent(data: Dir): FileTableRow[] {
    const rows: FileTableRow[] = []
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

  getShareFolder() {
    return this.http.get<SharedFolders>(`${this.apiUrl}/get_shared_folder`)
  }

  getShareFolderContent(shared_folder: string, sub_dir: string = "") {
    // const httpOptions = {
    //   headers: new HttpHeaders({
    //     "shared_folder": shared_folder,
    //     "sub_dir": sub_dir
    //   })
    // }

    return this.http.get<Dir>(`${this.apiUrl}/get_shared_folder_content?shared_folder=${shared_folder}&sub_dir=${sub_dir}`)
  }

  createSharedFolder(name: string): Observable<any> {
    const body = {
      "name": name
    }
    return this.http.post<any>(`${this.apiUrl}/create_shared_folder`, body)
  }

  createSharedSubFolder(shared_folder: string, sub_dir: string = ""): Observable<any> {
    const body = {
      "shared_folder": shared_folder,
      "sub_dir": sub_dir
    }
    return this.http.post<any>(`${this.apiUrl}/create_shared_sub_folder`, body)
  }

  uploadFilesToSharedFolder(files: File[], shared_folder: string, sub_dir: string = "") {
    const fd = new FormData()
    const httpOptions = {
      headers: new HttpHeaders({
        "shared_folder": shared_folder,
        "sub_dir": sub_dir
      })
    }
    for (const file of files) {
      if (typeof (file) === "object") {
        fd.append(file.name, file, file.name)
      }
    }
    return this.http.post(`${this.apiUrl}/upload_files_to_shared_folder`, fd, httpOptions)
  }

  getSpecificFileFromShare(filePath: string, shared_folder = ""): Observable<any> {
    filePath = filePath.replaceAll("\\", "/")
    return this.http.get<any>(`http://127.0.0.1:5000/file/get_shared_file?file=${filePath}&shared_folder=${shared_folder}`)
  }

  getUsersWithAccessToSharedFolder(shared_folder: string) {
    return this.http.get<UsersWithAccessResponse>(`http://127.0.0.1:5000/file/get_users_with_access_to_shared_folder?shared_folder=${shared_folder}`)
  }

  deleteSharedFolder(shared_folder: string, sub_dir: string): Observable<any> {
    const body = {
      "shared_folder": shared_folder,
      "sub_dir": sub_dir
    }
    return this.http.post<any>(`${this.apiUrl}/delete_shared_folder`, body)
  }

  renameShareSubFolder(sharedFolder: string, oldPath: string, newPath: string): Observable<any> {
    const body = {
      "shared_folder": sharedFolder,
      "old_path": oldPath,
      "new_path": newPath
    }
    return this.http.post<any>(`${this.apiUrl}/rename_share_sub_folder`, body)
  }

  // https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
  formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) {
      return "0 Bytes"
    }

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
  }

  getParentDir(path: string): string {
    let splitted_path = path.split("/")
    splitted_path.pop()
    if (splitted_path.length !== 0) {
      return splitted_path.join("/")
    } else {
      return "/"
    }
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////

  getModifiedStr(last_modified: Date): string {
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

  createBodyForDownload(rows: FileTableRow[], currentDir: string, isShare: boolean, sharedFolder: string = ""): DownloadFilesStructureInformations {
    const bodyData = []
    for (const row of rows) {
      const dataElement = {
        "type": row.type,
        "path": row.path
      }

      bodyData.push(dataElement)
    }

    const body: DownloadFilesStructureInformations = {
      "is_share": isShare,
      "shared_folder": sharedFolder,
      "currentDir": currentDir,
      data: bodyData
    }

    return body
  }


  downloadFiles(rows: FileTableRow[], currentDir: string) {
    const body = this.createBodyForDownload(rows, currentDir, false)
    return this.http.post<DownloadFilesStructure>(`${this.apiUrl}/download`, body)
  }

  downloadSharedFiles(rows: FileTableRow[], currentDir: string, sharedFolder: string) {
    const body = this.createBodyForDownload(rows, currentDir, true, sharedFolder)
    return this.http.post<DownloadFilesStructure>(`${this.apiUrl}/download_shared_files`, body)
  }


  rename(oldPath: string, newPath: string) {
    const body = {
      "oldPath": oldPath,
      "newPath": newPath
    }
    return this.http.post(`${this.apiUrl}/rename`, body)
  }

  renameSharedFolder(oldName: string, newName: string): Observable<DefaultResponse> {
    const body = {
      "old_name": oldName,
      "new_name": newName
    }

    return this.http.post<DefaultResponse>(`${this.apiUrl}/rename_shared_folder`, body)
  }

  setUserAccess(folderName: string, users: listItem[]): Observable<DefaultResponse> {
    const body = {
      "folder_name": folderName,
      "users": users
    }
    return this.http.post<DefaultResponse>(`${this.apiUrl}/set_user_access`, body)
  }
}
