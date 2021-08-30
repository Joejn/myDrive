import { Injectable } from '@angular/core';
import conf from "../config.json"

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  configData = conf

  constructor( ) { }

  getClientConfig() {
    return this.configData
  }

  getAPIAdress() {
    return this.configData["api"]["address"]
  }

  getAPIPort() {
    return this.configData["api"]["port"]
  }
}
