import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {

  apiUrl = "http://127.0.0.1:5000/user_profile"

  constructor( private http: HttpClient ) { }

  uploadProfilePicture( file: File ) {
    const fd = new FormData()
    fd.append("image", file, file.name)
    return this.http.post(`${this.apiUrl}/upload_profile_picture`, fd)
  }

  updateGeneralData( firstname: string, lastname: string, birthday: Date, email: string) {
    const date = birthday.getDate() < 10 ? `0${birthday.getDate()}` : birthday.getDate()
    const month = (birthday.getMonth() + 1) < 10 ? `0${birthday.getMonth() + 1}` : birthday.getMonth() + 1
    const year = birthday.getFullYear()
    const birthdayStr = `${month}/${date}/${year}`

    const data: Object = {
      "firstname": firstname,
      "lastname": lastname,
      "birthday": birthdayStr,
      "email": email
    }
    return this.http.post(`${this.apiUrl}/update_general_data`, data)
  }

  updatePassword( currentPassword: string, newPassword: string) {
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
      firstname: string,
      lastname: string,
      birthday: string,
      email: string
    }
    return this.http.get<GeneralData>(`${this.apiUrl}/get_general_data`)
  }

}
