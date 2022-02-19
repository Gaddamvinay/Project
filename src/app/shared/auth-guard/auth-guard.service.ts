import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
/**
 * Handles all the authenticated and un-authenticated routes
 */
@Injectable({
    providedIn: 'root'
  })
export class AuthGuardService implements CanActivate {
    constructor(
        public router: Router) {
    }

    /**
     * Gets called when `canActivate` is called from any spacified route.
     * @param route Router Service
     * @param state Router state snapshot
     */
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      let user: any = localStorage.getItem('loggedInUser');
      if(user){
        user = JSON.parse(user);
        return true;
      }else{
        this.router.navigate(['auth','login']);
        return false;
      }
    }
}

@Injectable({
    providedIn: 'root'
  })
export class UnAuthGuardService implements CanActivate {
    constructor(
        public router: Router) {
    }

    /**
     * Gets called when `canActivate` is called from any spacified route.
     * @param route Router Service
     * @param state Router state snapshot
     */
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
            let user: any = localStorage.getItem('loggedInUser');
            if(user){
              user = JSON.parse(user);
              let routerId= "";
              switch(user.user_type){
                case "Caregiver" : {
                  routerId= 'ca';
                  break;
                }
                case "CA" : {
                  routerId= 'hq'
                  break;
                }

                case "FA" : {
                  routerId= 'facility'
                  break;
                }
                case "SSA": {
                  routerId= 'ssa'
                  break;
                }
                case "WA": {
                  routerId= 'wa'
                  break;
                }
              }
              this.router.navigate([routerId]);
              return true;
            }else{
              return true;
            }
    }
}
