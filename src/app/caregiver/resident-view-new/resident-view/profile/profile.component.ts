import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { CommonHttpService } from '../../../../shared/services/http-services/common-http.service';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {NativeDateAdapter, DateAdapter,	MAT_DATE_FORMATS} from '@angular/material/core';
import { formatDate } from '@angular/common';
export const PICK_FORMATS = {
	parse: {dateInput: {month: 'short', year: 'numeric', day: 'numeric'}},
	display: {
		dateInput: 'input',
		monthYearLabel: {year: 'numeric', month: 'short'},
		dateA11yLabel: {year: 'numeric', month: 'long', day: 'numeric'},
		monthYearA11yLabel: {year: 'numeric', month: 'long'}
	}
  };
  class PickDateAdapter extends NativeDateAdapter {
    format(date: Date, displayFormat: Object): string {
      if (displayFormat === 'input') {
        return formatDate(date,'dd-MM-yyyy',this.locale);
      } else {
        return date.toDateString();
      }
    }
    }
@Component({
  selector: 'app-view-resident',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  providers: [
		{provide: DateAdapter, useClass: PickDateAdapter},
		{provide: MAT_DATE_FORMATS, useValue: PICK_FORMATS}
]
})

export class ProfileComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ProfileComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: any,
    private commonHttp: CommonHttpService,
    private http: HttpClient,
    private toastr: ToastrService
  ) { }

  roomDetails: any[] = [];
  wardInfo: any[] = []
  getWard(id: string){
    return this.wardInfo.find(value => value.ward_number === id)?.name
  }
  getRoom(id: string){
    return this.roomDetails.find(value => value.details.room_id === id)?.name
  }
  profileDetails: any = {};
  mode: 'view' | 'edit' = 'view';
  today = new Date();
  minDate = new Date();
  userId: string = '';
  feet = [
		1,
		2,
		3,
		4,
		5,
		6,
		7,
		8,
		9,
		10
	]
	inch = [
		0,
		1,
		2,
		3,
		4,
		5,
		6,
		7,
		8,
		9,
		10,
		11
	]
  ngOnInit(): void {
    this.profileDetails = {...this.data.payload};
    if(this.profileDetails['height_units'] === 'feet'){
      const realFeet = ((this.profileDetails.height *0.393700) / 12);
      const feet = Math.floor(realFeet);
      const inches = Math.round((realFeet - feet) * 12);
      this.profileDetails.height_feet = feet;
      this.profileDetails.height_inch = inches;
   
    }
    
    
    let user: any = localStorage.getItem('loggedInUser');
		if(user){
			user = JSON.parse(user);
		}
		this.wardInfo = user.wards ? user.wards : [];
    this.userId = this.profileDetails.user_id;
    this.getRoomDetails(this.profileDetails.wardId);
  }
  changeHeightValues(){
    const realFeet = ((this.profileDetails.height *0.393700) / 12);
    const feet = Math.floor(realFeet);
    const inches = Math.round((realFeet - feet) * 12);
    this.profileDetails.height_feet = feet;
    this.profileDetails.height_inch = inches;
  }
  wardSearch: string = '';
  roomSearch: string = '';
  getWards(){
		return this.wardInfo.filter(value => value.ward_name.toLowerCase().includes(this.wardSearch.toLowerCase()) || value.ward_id === this.profileDetails.wardId);
	}
	getRooms(){
		return this.roomDetails.filter(value => value.details.room_name.toLowerCase().includes(this.roomSearch.toLowerCase()) || value.details.room_id === this.profileDetails.roomId);
  }
  deviceSearch = '';
  getDevices(){
		return this.allDevices.filter(value => value.details.wearable_sno.toLowerCase().includes(this.deviceSearch.toLowerCase()));
	}
  allDevices = [];
  getRoomDetails(event: any) {
		this.commonHttp.getRoomDetails().subscribe((roomDetails: any) => {
			this.roomDetails = roomDetails.body.filter(value => value.details.ward_id === event).sort((a,b) => {
				return a.details.room_name > b.details.room_name ? 1 : -1;
			})
		});
		this.commonHttp.getWearableDetails().subscribe((devices: any) => {
			this.allDevices = devices.body.filter(value => value.details.ward_id === event);
		})
	}
  editMode(){
    this.mode = 'edit'
    //this.profileDetails.birthdate=moment(this.profileDetails.birthdate).format('YYYY-DD-MM');
    
  }
  isLoading = false;
  getAge(dob: string){
		if(dob !== null){
			const age = moment(dob).fromNow(true);
			if(age && age.includes('years')){
				return parseInt(age.split('years')[0]) < 60 ? '60' : age.split('years')[0];
			}
		}
  }
 
  getRoomByID(id: any){
		return this.roomDetails?.find(value => value.details.room_id === id)?.details.room_name
	}
	getWardByID(id: any){
		return this.wardInfo?.find(value => value.ward_id === id)?.ward_name
  }
  changeHeight(){
    this.profileDetails.height = this.profileDetails.height_feet * 30.48 + this.profileDetails.height_inch * 2.54;
  }
  editDetails(){
    this.isLoading = true;
    const prevValues = Object.keys(this.data.payload);
    const presValues = Object.values(this.profileDetails);
    const keys = Object.keys(this.profileDetails);
    const diff = presValues.filter((val: any, i: number) => this.data.payload[keys[i]] !== val);
    const obj2: any = {};
    const keysValue = {
        "firstName": 'first_name',
        "lastName": 'last_name',
        "nickName": 'nick_name',
        "height": "height_value",
        "height_units": "height_units",
        "weight": "weight_value",
        "weight_units": "weight_units",
        "gender": "gender",
        "contact_of": "contact_of",
        "email": "contact_email",
        "wardId": "ward_assigned",
        "roomId": "room_assigned"
    }
    presValues.forEach((val: any, i) => {
      const exists = diff.find(value => val === value);
      if(exists && this.data.payload[keys[i]] !== exists){
        if(keys[i] === 'birthdate'){
          Object.assign(obj2, {dob: moment(this.profileDetails['birthdate']).format('YYYY-MM-DD')})
        }else if(keys[i] === 'ext' || keys[i] === 'mobile'){
          obj2.phone_number = `${this.profileDetails.ext} ${this.profileDetails.mobile}`
        }else if(keys[i]=== 'roomId'){
          obj2[keysValue[keys[i]]] = this.getRoomByID(exists);
        }else if(keys[i]=== 'wardId'){
          obj2[keysValue[keys[i]]] = this.getWardByID(exists);
        }else if(keys[i] === 'height'){
          obj2[keysValue[keys[i]]] = this.profileDetails.height_units === 'feet' ? `${this.profileDetails.height_feet} feet - ${this.profileDetails.height_inch} inch`: exists;
        }else if(keys[i] !== 'height_feet' && keys[i] !== 'height_inch'){
          obj2[keysValue[keys[i]]] = exists;
        }
      }
    })

    const obj = {
      "resident_id": this.profileDetails.user_id,
      "first_name": this.profileDetails.firstName,
      "last_name": this.profileDetails.lastName,
      "nick_name": this.profileDetails.nickName,
      "dob": moment(this.profileDetails['birthdate']).format('YYYY-MM-DD'),
      "height_value": this.profileDetails.height,
      "height_units": this.profileDetails.height_units,
      "weight_value": this.profileDetails.weight,
      "weight_units": this.profileDetails.weight_units,
      "gender": this.profileDetails.gender,
      "contact_of": this.profileDetails.contact_of,
      "contact_email": this.profileDetails.email,
      "phone_number": `${this.profileDetails.ext} ${this.profileDetails.mobile}`,
      "ward_assigned": this.profileDetails.wardId,
      "room_assigned": this.profileDetails.roomId,
      "deviceId":this.profileDetails.wearable_id
    };
		const date = new Date();
    this.commonHttp.updateProfileDetails(obj).subscribe((data) => {
      const notificationBody: any = {
				resident_id: this.profileDetails.user_id,
				resident_name: `${this.profileDetails.firstName} ${this.profileDetails.lastName}`,
				contents: [
					{
						date: date,
						action: `${this.profileDetails.firstName} ${this.profileDetails.lastName}'s profile has been updated`
					},
					{
						date: date,
						action: 'Following details has been updated',
					},
				]
      }
      const updatedKeys = Object.keys(obj2);
      //console.log(updatedKeys)
			updatedKeys.forEach(val => {
        notificationBody.contents.push({
          action: `${val.split("_").join(" ")} : ${obj2[val]}`
        })
      })
			const user = JSON.parse(localStorage.getItem('loggedInUser'));
			this.commonHttp.storeNotificationsData({
        "resident_id": this.profileDetails.user_id,
				"notification_id": `${Math.round((Math.pow(36, 15 + 1) - Math.random() * Math.pow(36, 15))).toString(36).slice(1)}`,
				"customer_id": user.customers.customer_id,
				"facility_id": user.facilities[0].facility_id,
				"ward_id": this.profileDetails.wardId,
				"notification_category": "Dashboard",
				"notification_type": 'ResidentUpdated',
				"notification_class": "Success",
				"notification_body": notificationBody
			}).subscribe(() => {})
      this.toastr.success('<div class="action-text"><span class="font-400">Resident is Successfully Updated</span></div><div class="action-buttons"></div>', "", {
        timeOut: 2000,
        progressBar: true,
        enableHtml: true,
        closeButton: false,
      });
      this.dialogRef.close({refresh: true})
    }, (err) => {
      this.isLoading = false;
      this.toastr.error('<div class="action-text"><span class="font-400">Please try again</span></div><div class="action-buttons"></div>', "", {
        timeOut: 2000,
        progressBar: true,
        enableHtml: true,
        closeButton: false,
      });
    })
  }
}
