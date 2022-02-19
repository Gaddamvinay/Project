import { Component, Inject, OnInit } from '@angular/core';
import { Validators, FormControl } from '@angular/forms';

import * as moment from 'moment';
import * as _LODASH from "lodash";
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonHttpService } from '../../../../../shared/services/http-services/common-http.service';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-six-mwt',
  templateUrl: './six-mwt.component.html',
  styleUrls: ['./six-mwt.component.scss']
})
export class SixMWTComponent implements OnInit {

  distance_covered_in_6_minutes_in_meters = new FormControl("", Validators.required);
  elderly_used_assistive_devise = new FormControl("", Validators.required);
  how_did_the_elderly_feel_rating_scale_1_5 = new FormControl("", Validators.required);
  effort_taken_scale_1_10 = new FormControl("", Validators.required);
  comments_observations = new FormControl("");
  userInfo: any;
  constructor(private dialogRef: MatDialogRef<SixMWTComponent>, private http: HttpClient, private commonHttp: CommonHttpService,private toastr: ToastrService,@Inject(MAT_DIALOG_DATA) public popUpData: any) {
      this.userInfo = {...this.popUpData.payload};
      if(this.userInfo['weight_units'] === 'lbs'){
        this.userInfo['weight'] = this.userInfo['weight'] * 0.45;
      }
  }

  ngOnInit(): void {
  }
  selectedIndex = 0;
  event(value: any){
    this.selectedIndex = value.selectedIndex;
  }

  validate(){
		return this.distance_covered_in_6_minutes_in_meters.hasError('required') || this.elderly_used_assistive_devise.hasError('required') || this.how_did_the_elderly_feel_rating_scale_1_5.hasError('required') || this.effort_taken_scale_1_10.hasError('required') || this.comments_observations.hasError('required')
  }
  post6MWT(){
    let body = {};
    let user: any = localStorage.getItem('loggedInUser');
		if(user){
			user = JSON.parse(user);
		}
		body['resident_id'] = this.popUpData.userId;
    body['physiotest_type'] = '6MWT';
    body['physiotest_id']= `${Math.round((Math.pow(36, 15 + 1) - Math.random() * Math.pow(36, 15))).toString(36).slice(1)}`;
		let test_data = {}
		body['created_by'] = user.caregiver_id;
    body['actual_results'] =  parseInt(this.distance_covered_in_6_minutes_in_meters.value);
			// 6MWD(th-men) = (7.57 X height cm) – (1.76 x weight kg) – (5.02 X age) – 309 m
    const height = this.userInfo['height'] ? this.userInfo['height'] : 160;
    const weight = this.userInfo['weight'] ? this.userInfo['weight'] : 60;
    const age = this.getAge(this.userInfo['birthdate']) ? parseInt(this.getAge(this.userInfo['birthdate'])) : 30;
    const gender = this.userInfo['gender'] ? this.userInfo['gender'] : 'male'; 
    const maleCalc = (7.57 * height) - ( 1.76 * weight) - (5.02 * age) - 309;
    const femaleCalc = (2.11 * height) - (2.29 * weight) - (5.78 * age) + 667;
    body['expected_results'] = gender === 'male' ? Math.round(maleCalc) + ' meters' : Math.round(femaleCalc) + ' meters';
    test_data['distance_covered_in_6_minutes_in_meters'] = this.distance_covered_in_6_minutes_in_meters.value;
    test_data['elderly_used_assistive_devise'] = this.elderly_used_assistive_devise.value;
    test_data['how_did_the_elderly_feel_rating_scale_1_5'] = this.how_did_the_elderly_feel_rating_scale_1_5.value;
    test_data['effort_taken_scale_1_10'] = this.effort_taken_scale_1_10.value;
    test_data['comments_observations'] = this.comments_observations.value;
    body['test_summary'] = test_data;
    body['interpretation'] = this.show6mwt(body['expected_results'],body['actual_results']);
    const date = new Date();
    const notificationBody: any = {
      resident_id: this.popUpData.userId,
      resident_name: `${this.popUpData.payload.firstName} ${this.popUpData.payload.lastName}`,
      contents: [
        {
          date: date,
          action: `${this.popUpData.payload.firstName} ${this.popUpData.payload.lastName} performed the 6MWT test`
        },
        {
          date: date,
          action: `The result indicates ${body['interpretation']} risk`
        },
        {
          date: date,
          action: `${user.first_name} ${user.last_name} oversaw the physio test for ${this.popUpData.payload.firstName} ${this.popUpData.payload.lastName}`
        }
      ]
    }
		this.commonHttp.storePhysioTestData(body).subscribe((data) => {
      this.commonHttp.storeNotificationsData({
        "resident_id": this.popUpData.userId,
        "notification_id": `${Math.round((Math.pow(36, 15 + 1) - Math.random() * Math.pow(36, 15))).toString(36).slice(1)}`,
        "customer_id": user.customers.customer_id,
        "facility_id": user.facilities[0].facility_id,
        "ward_id": this.popUpData.payload.wardId,
        "notification_category": "Dashboard",
        "notification_type": 'PhysioTest',
        "notification_class": "Success",
        "notification_body": notificationBody
      }).subscribe(() => {})
			this.toastr.success('<div class="action-text"><span class="font-400">Physio test is Successfully Added</span></div><div class="action-buttons"></div>', "", {
				timeOut: 2000,
				progressBar: true,
				enableHtml: true,
				closeButton: false,
			});
			this.dialogRef.close(true);
		},(error) => {
			this.toastr.error('Something went wrong', "", {
				timeOut: 30000,
				progressBar: false,
				enableHtml: true,
				closeButton: false,
			});
		}) 
  }
  show6mwt(expected, actual){
		const value = actual;
		const range = parseInt(expected.split(" ")[0]);
		if(_LODASH.inRange(value, range - 29, range + 31)){
			return 'Normal';
		}else{
			return 'High'
		}
  }
  getAge(dob: string){
		if(dob !== null){
			const age = moment(dob).fromNow(true);
			if(age && age.includes('years')){
				return parseInt(age.split('years')[0]) < 60 ? '60' : age.split('years')[0];
			}
		}
	}

}
