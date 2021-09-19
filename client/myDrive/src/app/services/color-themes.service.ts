import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ColorThemesService {

  constructor() { }

  setTheme(theme: string): void {
    localStorage.setItem("theme", theme)
  }

  getTheme(): string {
    return String(localStorage.getItem("theme"))
  }
}
