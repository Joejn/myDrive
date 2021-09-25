import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ColorThemesService {

  private DARK_THEME: string = "my-theme-dark"

  constructor() { }

  setTheme(theme: string): void {
    localStorage.setItem("theme", theme)
  }

  getTheme(): string {
    return String(localStorage.getItem("theme"))
  }

  isDarkTheme(): boolean {
    return this.getTheme() === this.DARK_THEME
  }
}
