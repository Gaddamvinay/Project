import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
import * as _LODASH from "lodash";
import { CommonHttpService } from '../../../../../shared/services/http-services/common-http.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-thirty-scs',
  templateUrl: './thirty-scs.component.html',
  styleUrls: ['./thirty-scs.component.scss']
})
export class ThirtySCSComponent implements OnInit {

  distance_covered_in_6_minutes_in_meters = new FormControl("", Validators.required);
  elderly_used_assistive_devise = new FormControl("", Validators.required);
  how_did_the_elderly_feel_rating_scale_1_5 = new FormControl("", Validators.required);
  effort_taken_scale_1_10 = new FormControl("", Validators.required);
  comments_observations = new FormControl(""); 
  userInfo: any;
  constructor(private dialogRef: MatDialogRef<ThirtySCSComponent>, private http: HttpClient, private commonHttp: CommonHttpService,private toastr: ToastrService,@Inject(MAT_DIALOG_DATA) public popUpData: any) {
	this.userInfo = {...this.popUpData.payload};
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
  post30SCS(){
	let body = {};
	let user: any = localStorage.getItem('loggedInUser');
	if(user){
		user = JSON.parse(user);
	}
	body['resident_id'] = this.popUpData.userId;
    body['physiotest_type'] = '30SCS';
    body['physiotest_id']= `${Math.round((Math.pow(36, 15 + 1) - Math.random() * Math.pow(36, 15))).toString(36).slice(1)}`;
	let test_data = {}
	body['created_by'] = user.caregiver_id;
    body['actual_results'] =  parseInt(this.distance_covered_in_6_minutes_in_meters.value);
    //const age = this.getAge(this.userInfo['birthdate']) ? parseInt(this.getAge(this.userInfo['birthdate'])) : 30;
    const age = this.getAge(this.userInfo['birthdate']) ? this.getAge(this.userInfo['birthdate']) : 30;
	const gender = this.userInfo['gender'] ? this.userInfo['gender'] : 'Male';
    const maleExpected = this.getMaleTransitions(age);
    const femaleExpected = this.getFemaleTransitions(age);
    body['expected_results'] = gender.toLowerCase() === 'male' ? `${maleExpected} transitions` : `${femaleExpected} transitions`;
    test_data['transitions_performed'] = this.distance_covered_in_6_minutes_in_meters.value;	
    test_data['how_did_the_elderly_feel_rating'] = this.how_did_the_elderly_feel_rating_scale_1_5.value;
    test_data['effort_taken_scale_1_10'] = this.effort_taken_scale_1_10.value;
    test_data['comments_observations'] = this.comments_observations.value;
    body['test_summary'] = test_data;
	body['interpretation'] = this.showRisk(body['expected_results'],body['actual_results']);

	const date = new Date();
    const notificationBody: any = {
      resident_id: this.popUpData.userId,
      resident_name: `${this.popUpData.payload.firstName} ${this.popUpData.payload.lastName}`,
      contents: [
        {
          date: date,
          action: `${this.popUpData.payload.firstName} ${this.popUpData.payload.lastName} performed the 30SCS test`
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
			this.toastr.success('<div class="action-text"><span class="font-400">Physio test is Successfully Added</span></div><div class="action-buttons"></div>', "", {
				timeOut: 2000,
				progressBar: true,
				enableHtml: true,
				closeButton: false,
			});
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
			this.dialogRef.close(true)
		},(error) => {
			this.toastr.error('Something went wrong', "", {
				timeOut: 30000,
				progressBar: false,
				enableHtml: true,
				closeButton: false,
			});
		}) 
  }
  getAge(dob: string){
	let dateofbirth=dob.split('-')
	let currentDate=new Date();
	let curren=moment(currentDate).format('YYYY-MM-DD')
	let currentdate=curren.split('-');
	var curyear:number=+currentdate[0];
	var curmonth:number=+currentdate[1];
	var cursDay:number=+currentdate[2];
	var dateofYear:number=+dateofbirth[2];
	var dateofMonth:number=+dateofbirth[1];
	var dateofDay:number=+dateofbirth[0];
	if(dateofMonth===12){
		var age=this.findAge(currentdate[2],currentdate[1],currentdate[0],dateofbirth[0],dateofbirth[1],dateofbirth[2])
		 var year: number = +age;
	}else{
	var current = moment([curyear, curmonth, cursDay]);
   var dateOfBirth = moment([dateofYear, dateofMonth, dateofDay]);
	
	var years = current.diff(dateOfBirth, 'year');
	dateOfBirth.add(years, 'years');
	var year: number = +years;
	}
	return year;
		// if(dob !== null){
		// 	console.log(dob)
		// 	const age = moment(dob).fromNow(true);
		// 	console.log(age)
		// 	if(age && age.includes('years')){
		// 		return parseInt(age.split('years')[0]) < 60 ? '60' : age.split('years')[0];
		// 	}
		// }
	}
	findAge(current_date, current_month, current_year, birth_date, birth_month, birth_year)
	{
      // days of every month
      let month = [31, 28, 31, 30, 31, 30, 31,
                  31, 30, 31, 30, 31 ]

      // if birth date is greater then current birth
      // month then do not count this month and add 30
      // to the date so as to subtract the date and
      // get the remaining days
      if (birth_date > current_date) {
      // var value: number = +month[birth_month - 1]
       var value: number = +month[birth_month-1];
       var curdate: number = +current_date;
       current_date = curdate + value;
       current_month = current_month - 1;
      }

      // if birth month exceeds current month, then do
      // not count this year and add 12 to the month so
      // that we can subtract and find out the difference
      if (birth_month > current_month) {
      current_year = current_year - 1;
      current_month = current_month + 12;
      }

      // calculate date, month, year
      var calculated_date = current_date - birth_date;
      var calculated_month = current_month - birth_month;
      var calculated_year = current_year - birth_year;
      return calculated_year

	}
	showRisk(expected, actual){
		const value = actual;
		let range = expected.split(" ")[0];
		range = range.split('-');
		range = range.map(val => {
			return parseInt(val)
		})
		if(range.length > 0){
			if(_LODASH.inRange(parseInt(value), range[0], range[1] + 1)){
				return 'Normal'
			}else{
				return 'High'
			}
		}
	}
	getMaleTransitions(age){
		let value = "";
		if( _LODASH.inRange(age,60,65) )
		value = '14-19';
		else if( _LODASH.inRange(age,65,70))
		value = '12-18';
		else if(_LODASH.inRange(age, 70, 75))
		value = '12-17';
		else if(_LODASH.inRange(age, 75, 80))
		value = '11-17';
		else if(_LODASH.inRange(age, 80, 85))
		value = '10-15';
		else if(_LODASH.inRange(age, 85, 90))
		value = '8-14';
		else if(_LODASH.inRange(age, 90, 95))
		value = '7-12';
		return value;
	}
	getFemaleTransitions(age){
		let value = "";
		if( _LODASH.inRange(age,60,65) )
		value = '12-17';
		else if( _LODASH.inRange(age,65,70))
		value = '11-16';
		else if(_LODASH.inRange(age, 70, 75))
		value = '10-15';
		else if(_LODASH.inRange(age, 75, 80))
		value = '10-15';
		else if(_LODASH.inRange(age, 80, 85))
		value = '9-14';
		else if(_LODASH.inRange(age, 85, 90))
		value = '8-13';
		else if(_LODASH.inRange(age, 90, 95))
		value = '4-11';
		return value;
	}	
	
}
