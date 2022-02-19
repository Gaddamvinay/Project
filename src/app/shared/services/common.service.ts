import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})

export class CommonService {
  public eventEmitter = new Subject<any>();
  private waEmitter = new BehaviorSubject<any>(false);
  
  public FPage = new BehaviorSubject<any>(null);
  public WPage = new BehaviorSubject<any>(null);
  
  constructor() { }
  eventCatch() {
    return this.eventEmitter.asObservable();
  }
  eventEmit(payload: any) {
    this.eventEmitter.next(payload);
  }

  previousFPageEmit() {
    return this.FPage.asObservable();
  }

  previousFPage(payload: any) {
    this.FPage.next(payload);
  }

  previousWPageEmit() {
    return this.WPage.asObservable();
  }
  
  previousWPage(payload: any) {
    this.WPage.next(payload);
  }
  
  waEmit(data: boolean){
    this.waEmitter.next(data);
  }
  waCatch(){
    return this.waEmitter.asObservable();
  }
}
