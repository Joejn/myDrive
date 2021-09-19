import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { ColorThemesService } from './services/color-themes.service';
import { UserProfileService } from './services/user-profile.service';

interface links {
  "name": string,
  "routerLink": string
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'myDrive';

  loggedInLinks: links[] = [
    {
      name: "myDrive",
      routerLink: "/main"
    },
    {
      name: "Settings",
      routerLink: "/user_settings"
    }
  ]

  logoutLinks: links[] = [
    {
      name: "Logout",
      routerLink: "/login"

    }
  ]

  administratorsLinks: links[] = [
    {
      name: "Dashboard",
      routerLink: "/administrators/dashboard"
    }
  ]

  constructor(public auth: AuthService, private userProfile: UserProfileService, public colorTheme: ColorThemesService, private _overlayContainer: OverlayContainer) {
    this.userProfile.getColorThemeFromServer().subscribe((data) => {
      this.onColorThemeChanged(data.theme)
    })
    if (this.auth.isLoggedIn()) {
      this.setProfilePicture()
    }
  }

  onActivated(event: any) {
    let properties: string[] = []
    for (const item in event) {
      properties.push(item)
    }

    if (properties.includes("loggedIn")) {
      event["loggedIn"].subscribe(() => {
        this.setProfilePicture()
      })
    }

    if (properties.includes("profilePictureChanged")) {
      event["profilePictureChanged"].subscribe(() => {
        this.setProfilePicture()
      })
    }

    if (properties.includes("colorThemeChanged")) {
      event["colorThemeChanged"].subscribe((theme: string) => {
        this.onColorThemeChanged(theme)
      })
    }
  }

  setProfilePicture() {
    this.userProfile.getProfilePicture().subscribe(data => {
      const div = document.getElementById("userProfilePictureDiv")
      div?.setAttribute("style", `background-image: url(data:image/jpeg;base64,${data}); background-size: cover; background-position: center;`)
    })
  }

  onColorThemeChanged(theme: string = this.colorTheme.getTheme()): void {
    this.colorTheme.setTheme(theme)
    const overlayContainerClasses = this._overlayContainer.getContainerElement().classList
    const classesToRemove = Array.from(overlayContainerClasses)
      .filter((item: string) => item.includes("my-theme-"))
    if (classesToRemove.length) {
      overlayContainerClasses.remove(...classesToRemove)
    }

    overlayContainerClasses.add(theme)
  }
}
