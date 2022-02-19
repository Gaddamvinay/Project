import { Injectable } from "@angular/core";
import { forkJoin } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment as ENV} from '../../../environments/environment';
@Injectable()
export class questionnireService {
	public questionnire: any[] = [];

	constructor (private http: HttpClient) {}
	public getQuestionnire() {
		return this.questionnire;
	}
}
