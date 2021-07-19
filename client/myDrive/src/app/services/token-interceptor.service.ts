import { Injectable } from '@angular/core';
import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { AuthService } from './auth.service';
import { catchError } from 'rxjs/operators'
import { throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class TokenInterceptorService implements HttpInterceptor {

  isRefreshing = false

  constructor( private auth: AuthService, private router: Router ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler) {
    if (this.auth.getAccessToken() && !request.headers.has("Authorization")) {
      request = this.addToken(request, this.auth.getAccessToken())
    }

    return next.handle(request).pipe(catchError((error) => {
      if (error.status === 401) {
        this.handle401Error(request, next)
        return throwError(error)
      } else {
        return throwError(error)
      }
    }))
  }

  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    const urlParts = request.url.split("/")
    const apiPath = urlParts[urlParts.length - 2] + "/" + urlParts[urlParts.length - 1]
    if (apiPath === "auth/refresh") {
      this.router.navigate(["login"])
      return
    }

    if (!this.isRefreshing) {
      this.isRefreshing = true
      this.auth.refreshAccessToken().subscribe((data) => {
        if (data.refresh) {
          localStorage.setItem("access_token", data.access_token)
          this.isRefreshing = false
          window.location.reload()
        }
      })
    }
  }
}
