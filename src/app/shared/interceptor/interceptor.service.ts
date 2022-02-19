
import { Injectable } from '@angular/core';
import {
    HttpInterceptor,
    HttpRequest,
    HttpResponse,
    HttpHandler,
    HttpEvent,
    HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
@Injectable({
    providedIn: 'root'
  })
export class InterceptorService implements HttpInterceptor {
    constructor( public router: Router ) { }
    idToken = ''
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
            request = request.clone({
                setHeaders: {
                  Authorization: `Bearer ${this.idToken}`
                }
            });
    return next.handle(request).pipe(
        map((event: HttpEvent<any>) => {
             return event;
        }),
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
               // this.router.navigate(['/auth/login']);
            }
            return throwError(error);
        })
        );
}
}
