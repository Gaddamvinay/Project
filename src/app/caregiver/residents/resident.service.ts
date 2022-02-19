import { Injectable } from "@angular/core";
import { resident } from "./resident";
import { residentList } from "./resident-data";
import { HttpClient } from '@angular/common/http';
import {environment as ENV } from './../../../environments/environment';
import { forkJoin, of, BehaviorSubject, Observable} from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import * as _LODASH from "lodash";
import { CommonService } from "../../shared/services/common.service";
import * as moment from "moment";
@Injectable()
export class ResidentService {
	items: [] = [];
	public resident: resident[] = residentList;
	private residentNameSubject = new BehaviorSubject(null);
	residentName$ = this.residentNameSubject.asObservable();

	private dominateMonthlySubject = new BehaviorSubject(null);
	dominateMonthly$ = this.dominateMonthlySubject.asObservable();

	private fallResidentsSubject = new BehaviorSubject(false);
	fallResidents$ = this.fallResidentsSubject.asObservable();
	loa: Observable<any[]>;

	constructor(private http: HttpClient, private common : CommonService) {
	}
	setFallResidents(data: boolean){
		this.fallResidentsSubject.next(data);
	}
	setResidentName(data: string){
		this.residentNameSubject.next(data);
	}
	setDominateData(data: any[]){
		this.dominateMonthlySubject.next(data);
	}
}
