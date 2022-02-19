import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';
import * as _LODASH from "lodash";
import { ToastrService } from 'ngx-toastr';
import { CommonHttpService } from '../../../../../shared/services/http-services/common-http.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-tug',
  templateUrl: './tug.component.html',
  styleUrls: ['./tug.component.scss']
})
export class TUGComponent implements OnInit {

  distance_covered_in_6_minutes_in_meters = new FormControl("", Validators.required);
  elderly_used_assistive_devise = new FormControl("", Validators.required);
  how_did_the_elderly_feel_rating_scale_1_5 = new FormControl("", Validators.required);
  effort_taken_scale_1_10 = new FormControl("", Validators.required);
  comments_observations = new FormControl("");
  userInfo: any;
  constructor(private dialogRef: MatDialogRef<TUGComponent>, private http: HttpClient, private commonHttp: CommonHttpService,private toastr: ToastrService,@Inject(MAT_DIALOG_DATA) public popUpData: any) { 
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
  postTUG(){
    let body = {};
    let user: any = localStorage.getItem('loggedInUser');
		if(user){
			user = JSON.parse(user);
		}
    body['resident_id'] = this.popUpData.userId;
    body['physiotest_type'] = 'TUG';
    body['physiotest_id']= `${Math.round((Math.pow(36, 15 + 1) - Math.random() * Math.pow(36, 15))).toString(36).slice(1)}`;
    let test_data = {}
    body['created_by'] = user.caregiver_id;
    test_data['hours'] = 0;
    test_data['minutes'] = 0;
    test_data['seconds'] = this.distance_covered_in_6_minutes_in_meters.value;
    body['expected_results'] = '12-17 seconds';
    body['actual_results'] = parseInt(test_data['seconds']);
    test_data['elderly_used_assistive_devise'] = this.elderly_used_assistive_devise.value;
    test_data['how_did_the_elderly_feel_rating'] = this.how_did_the_elderly_feel_rating_scale_1_5.value;
    test_data['effort_taken_scale_1_10'] = this.effort_taken_scale_1_10.value;
    test_data['comments_observations'] = this.comments_observations.value;
    body['test_summary'] = test_data;
    body['interpretation'] = this.showTUGRisk(body['expected_results'],body['actual_results']);

    const date = new Date();
    const notificationBody: any = {
      resident_id: this.popUpData.userId,
      resident_name: `${this.popUpData.payload.firstName} ${this.popUpData.payload.lastName}`,
      contents: [
        {
          date: date,
          action: `${this.popUpData.payload.firstName} ${this.popUpData.payload.lastName} performed the TUG test`
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
  showTUGRisk(expected, actual){
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

}
