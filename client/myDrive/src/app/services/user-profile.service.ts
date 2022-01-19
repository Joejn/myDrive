import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';

export interface ThemeBody {
  theme: string
}

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {

  apiUrl = `http://${this.conf.getAPIAdress()}:${this.conf.getAPIPort()}/user_profile`

  constructor(private http: HttpClient, private conf: ConfigService) { }

  uploadProfilePicture(file: File) {
    const fd = new FormData()
    fd.append("image", file, file.name)
    return this.http.post(`${this.apiUrl}/upload_profile_picture`, fd)
  }

  updateGeneralData(firstname: string, lastname: string,
    birthday: Date, email: string) {

    const birthdayStr = birthday.toLocaleDateString("en-US");

    const data: Object = {
      "firstname": firstname,
      "lastname": lastname,
      "birthday": birthdayStr,
      "email": email
    }
    
    return this.http.post(`${this.apiUrl}/update_general_data`, data)
  }

  updatePassword(currentPassword: string, newPassword: string) {
    interface UpdatePassword {
      "successful": string,
      "error": string
    }

    const body = {
      "currentPassword": currentPassword,
      "newPassword": newPassword
    }
    return this.http.post<UpdatePassword>(`${this.apiUrl}/update_password`, body)
  }

  getProfilePicture() {
    return this.http.get(`${this.apiUrl}/get_profile_picture`)
  }

  getGeneralData() {
    interface GeneralData {
      username: string,
      firstname: string,
      lastname: string,
      birthday: string,
      email: string
    }
    return this.http.get<GeneralData>(`${this.apiUrl}/get_general_data`)
  }

  setColorThemeOnServer(theme: string) {
    const body = {
      "theme": theme
    }

    return this.http.post(`${this.apiUrl}/set_color_theme`, body)
  }

  getColorThemeFromServer() {
    return this.http.get<ThemeBody>(`${this.apiUrl}/get_color_theme`)
  }

}
