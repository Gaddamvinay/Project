import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { mergeMap } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { CommonHttpService } from '../../../../shared/services/http-services/common-http.service';
@Component({
  selector: 'app-discharge-resident',
  templateUrl: './discharge-resident.component.html',
  styleUrls: ['./discharge-resident.component.css']
})
export class DischargeResidentComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DischargeResidentComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: any,private router: Router,
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
  dischargeResident(){
   this.commonHttp.updateWearablesDetails({
      "wearable_id": this.profileDetails.deviceId,
      "wearable_status": "Ready to use"
    }).subscribe(data => {
      
    })
const date = new Date();
    this.commonHttp.dischargeResident({
      "resident_id": this.profileDetails.user_id,
      "status":"1",
      "discharge_date":moment(date).utc().format("YYYY-MM-DD HH:mm:ss")
    }).subscribe(() => {})
    this.toastr.success('<div class="action-text"><span class="font-400">Resident is Discharged Successfully</span></div><div class="action-buttons"></div>', "", {
      timeOut: 2000,
      progressBar: true,
      enableHtml: true,
      closeButton: false,
    });
    //this.router.navigate(['/','ca','residents'])
    this.dialogRef.close({refresh: true})
  }
  

}
