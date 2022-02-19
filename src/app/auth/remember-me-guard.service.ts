import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import {Observable, of} from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { snackBarMessages } from '../constants/constants';
import { ToastrService } from 'ngx-toastr';
import { CommonHttpService } from '../shared/services/http-services/common-http.service';
/**
 * Handles all the authenticated and un-authenticated routes
 */
@Injectable({
    providedIn: 'root'
  })
export class RememberMeGuardService implements CanActivate {
    constructor(public router: Router,private toastr: ToastrService, private commonHttp: CommonHttpService,private cookieService: CookieService) {
    }
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
          // if(this.cookieService.get('rememberMe')){
          //     const uname = this.cookieService.get('userName');
          //     const password = this.cookieService.get('password');
          //     return this.onSubmit(uname,password).pipe((data: any) => {
          //       this.router.navigate(['/'])
          //       return of(true)
          //   })
          // }else {
              return true;
          // }
      }

      onSubmit(userName: string, password: string) {
        let signInRawData = {
          email: userName,
          password:  password
        };
        return this.commonHttp.signInNew(signInRawData)
    }
}
