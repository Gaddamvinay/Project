import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonAddModelComponent } from '../../shared/common-add-model/common-add-model.component';
import { FilterComponent } from '../../shared/filter/filter.component';
import { CommonHttpService } from '../../shared/services/http-services/common-http.service';
import { CommonService } from './../../shared/services/common.service'
import * as moment from "moment";
import { MatDialog } from '@angular/material/dialog';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { TokenStorageServiceService } from '../../auth/login/token-storage-service.service';

export interface residents {
  'Resident_name': string;
  'Last_known_status': string;
  'Questionnaire_fall': number;
  'Wearable_fall': number;
  'Balance': string;
  'Strength': string;
  'Sleep': string;
  wearableFallIncreased: boolean,
  fallDiff: number,
  'Wearables_name': string;
  'Ward_name': string;
  'Room_name': string;
  'Battery_status': number;
}
@Component({
  selector: 'app-residents',
  templateUrl: './residents.component.html',
  styleUrls: ['./residents.component.scss']
})

export class ResidentsComponent implements OnInit {
  
  isLoading = false;
  header:any;
  widths: string[] = ['12%', '16%', '10%', '9%', '5%', '5%', '5%', '9%', '9%', '9%', '10%', '9%']
  displayedColumns: string[] = ['Resident_name','Last_known_status','Questionnaire_fall','Wearable_fall','Balance','Strength', 'Sleep', 'Ward_name','Room_name', 'Name_on_wearable', 'Battery_status'];
  tableData: residents[] = [
    
  ];
 
  constructor(private routeActivate: ActivatedRoute, private tokenStorage: TokenStorageServiceService,private http: HttpClient,private matDialog: MatDialog, private commonHttp: CommonHttpService, public common:CommonService) { }

  ngOnInit(): void {
      this.getResidentToOrg();
    }
  
    getHeaders(){
      this.header = new HttpHeaders().set(
        "Authorization",
        this.tokenStorage.getToken()
      );
    }
    getResidentToOrg() {
      this.getHeaders();
      let residents:any = localStorage.getItem('residents');
      if(residents){
        residents = JSON.parse(residents);
        this.http.get(`${environment.apiUrlNew}/residents/get/`,{headers:this.header}).subscribe((data:any) =>{
          if(residents.itemCount != data.itemCount){
            localStorage.setItem('residents', JSON.stringify(data));
            this.loadMoreData();
          }
        })
        this.loadMoreData()
      }else{
        this.isLoading = true;
        this.http.get(`${environment.apiUrlNew}/residents/get/`,{headers:this.header}).subscribe((data:any) =>{
          this.http.get(`${environment.apiUrlNew}/wards/get/`,{headers:this.header}).subscribe((wards: any) => {
            localStorage.setItem('residents', JSON.stringify(data));
            this.loadMoreData();
          })
        })
      }
    }
    wardList = [];
	getWards(orgId: any){
    this.getHeaders()
		this.http.get(`${environment.apiUrlNew}/wards/get/`,{headers:this.header}).subscribe((wards: any) => {
		if(wards.itemCount > 0){
			this.wardList = wards.body.map(value => {
			return {
				name: value.details.ward_name,
				id: value.details.ward_id,
			}
			}).sort((a:any, b:any) => {
			return a.name > b.name ? 1: -1;
			})
		}
		})
  }
  timeZone = moment.parseZone().utcOffset();
 //timeZone = moment.parseZone("2013-01-01T00:00:00-06:00").utcOffset();
 //timeZone = moment.parseZone("2013 01 01 +03:30", 'YYYY MM DD ZZ', 'fr', true).utcOffset();
  loadMoreData(){
		let data:any = localStorage.getItem('residents');
		if(data){
			data = JSON.parse(data);
			let tableData = [];
			if(data.itemCount > 0){ 
				data.body.forEach(residents => {
					tableData.push({
						Ward_name: residents.WardInformation.ward_name,
						Last_known_status: residents.status.last_status || 'unknown',
						Questionnaire_fall: residents.questionnaire.questions!==null?parseInt(this.getFallenData(residents.questionnaire.questions)) > 0 ? 'Yes' : 'No':'-',
						Wearable_fall: residents.scores.total_falls || 0,
						Balance: residents.scores.balance || 'unknown',
						Strength: residents.scores.strength || 'unknown',
					//	wearableFallIncreased: residents.wearableFallInc || true,
					//	fallDiff: residents.wearableFallDiff || 0,
						Sleep: residents.scores.sleep || 'unknown',
						created_at: moment(residents.meta.fall_update).add(this.timeZone, 'minutes').fromNow(),
						updated_at: moment(residents.meta.updated_at).add(this.timeZone, 'minutes').fromNow(),
						Name_on_wearable: residents.GeneralInformation.nick_name,
						Room_name: residents.WardInformation.room_name || 'Room 1',
						Resident_name: `${residents.GeneralInformation.first_name} ${residents.GeneralInformation.last_name}`,
						Battery_status: parseInt(residents.WearableInformation.battery_status),
						ward_id: residents.WardInformation.ward_id,
						room_id: residents.WardInformation.room_id,
					});
				});
			}
      const user = JSON.parse(localStorage.getItem('loggedInUser'));
			this.tableData = tableData.filter(value => value.ward_id === user.wards[0].ward_id);
			this.isLoading = false;
		}
    }
    getFallenData(questions: any[]){
      return questions.find(val => val.question === 'How many times you have fallen?').answerValue
    }
  
  doOperation(event: any){
    console.log(event)
  }
}
