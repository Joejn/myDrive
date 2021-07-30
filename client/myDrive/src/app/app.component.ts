import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { UserProfileService } from './services/user-profile.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  
  title = 'myDrive';

  constructor( public auth: AuthService, private userProfile: UserProfileService ) {
    if (this.auth.isLoggedIn()) {
      this.setProfilePicture()
    }
  }

  onActivated( event: any ) {
    let properties: string[] = []
    for ( const item in event ) {
      properties.push(item)
    }

    if ( properties.includes("loggedIn") ) {
      event["loggedIn"].subscribe(() => {
        this.setProfilePicture()
      })
    }

    if ( properties.includes("profilePictureChanged") ) {
      event["profilePictureChanged"].subscribe(() => {
        this.setProfilePicture()
      })
    }
  }

  setProfilePicture() {
    this.userProfile.getProfilePicture().subscribe(data => {
      const div = document.getElementById("userProfilePictureDiv")
      div?.setAttribute("style", `background-image: url(data:image/jpeg;base64,${data}); background-size: cover; background-position: center;`)
    })
  }
}
