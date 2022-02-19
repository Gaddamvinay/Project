import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TimeFormatService {

  constructor() { }
  getFormat(){
		return localStorage.getItem('dateFormat') ? localStorage.getItem('dateFormat') : 'EEEE, MMMM d, y'
	}
	getTimeFormat(){
		return localStorage.getItem('timeFormat') ? localStorage.getItem('timeFormat') : 'HH:mm'
	}
	getFilterFormat(){
		return localStorage.getItem('filterFormat') ? localStorage.getItem('filterFormat') : 'dd/MM/yyyy'
  }
  changeFormat(format: string){
		localStorage.setItem('dateFormat', format);
  }
  changeTimeFormat(format: string){
		localStorage.setItem('timeFormat', format);
  }
  changeFilterFormat(format: string){
		localStorage.setItem('filterFormat', format);
	}
}
