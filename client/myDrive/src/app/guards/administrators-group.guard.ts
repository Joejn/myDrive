import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdministratorsGroupGuard implements CanActivate {

  constructor( private auth: AuthService, private router: Router ) {

  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      const isMemberOfGroupAdministrators = this.auth.memberOfGroup("administrators")
      if ( !isMemberOfGroupAdministrators ) {
        this.router.navigate(["/home"])
      }

      return isMemberOfGroupAdministrators
  }
  
}
