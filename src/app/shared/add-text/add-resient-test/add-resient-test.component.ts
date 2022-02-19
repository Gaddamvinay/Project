import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { StateGroup } from '../../../caregiver/residents/residents.component';
@Component({
  selector: 'app-add-resient-test',
  templateUrl: './add-resient-test.component.html',
  styleUrls: ['./add-resient-test.component.css']
})
export class AddResientTestComponent implements OnInit {
	userForm: FormGroup = this._formBuilder.group({
		stateGroup: "",
	});
	today = new Date();
	minDate = new Date();
	editModeWard: string;
	stateGroups: StateGroup[] = [
	];

	stateGroupOptions: Observable<StateGroup[]>;

	action: string;
	local_data: any;
	constructor(private toastr: ToastrService,public dialogRef: MatDialogRef<AddResientTestComponent>, @Optional() @Inject(MAT_DIALOG_DATA) public data: any, private _formBuilder: FormBuilder) {
    this.local_data = { ...this.data.payload };
		this.local_data.gender = this.local_data.gender ? this.local_data.gender : 'nottosay';
		this.local_data.contact_of = this.local_data.contact_of? this.local_data.contact_of :'myself';
		this.local_data.weight_units = this.local_data.weight_units ? this.local_data.weight_units : 'kg';
		this.local_data.ext = this.local_data.ext ? this.local_data.ext : '+46';
		this.local_data.height_units = this.local_data.height_units ? this.local_data.height_units : 'cm';
		this.local_data.roomId = this.local_data.roomId ? this.local_data.roomId : 'Select room';
		this.local_data.wardId = this.local_data.wardId ? this.local_data.wardId : 'Select ward';
		this.action = this.data.action;
		if(this.action === 'Edit'){
			this.getRoomDetails(this.local_data.wardId);
		}
		this.getInitalData();
	}
	getWardName(id){
		if(this.wardInfo.length > 0){
			const ward = this.wardInfo.find(ward => ward.ward_number === id);
			if(ward){
				return ward.name;
			}else {
				return 'Not Assigned'
			}
		}
	}
	getRoomName(id){
		if(this.roomDetails.length > 0){
      		const room = this.roomDetails.find(room => room.roomId === id);
			if(room){
				return room.RoomName;
			}else {
				return 'Not Assigned';
			}
		}
		return 'Not Assigned';
	}
	disable = false;
	downFallQuestions: any;
	stayQuestions: any;
	
	ngOnInit() {
		this.minDate.setFullYear(1900);
	}
	public wardInfo = [];
	public allDevices = []
	
	getInitalData() {
		let wards: any = localStorage.getItem('wards');
    wards = JSON.parse(wards);
    this.wardInfo = wards;
	}
	public roomDetails = [];
	getRoomDetails(id: any) {
    let rooms: any = localStorage.getItem('rooms');
    rooms = JSON.parse(rooms);
    this.roomDetails = rooms.filter(value => value.ward_number === id);
	}
	getErrors(form: any){
		if(form && form.errors){
			return form.errors;
		}else {
			return false;
		}
	}
	isTouched(formControl: any){
		if(formControl && formControl.touched){
			return formControl.touched
		}else{
			return false;
		}
	}
	wardRoomCheck(){
		return this.local_data.roomId === 'Select room' || this.local_data.wardId === 'Select ward'
	}
	doAction() {
		let PostUser = {}
		PostUser['firstName'] = this.local_data['firstName'];
		PostUser['nickName'] = this.local_data['nickName'];
		PostUser['lastName'] = this.local_data['lastName'];
		PostUser['myAlias'] = `${PostUser['firstName']} ${PostUser['lastName']}`;
		PostUser['gender'] = this.local_data.gender;
		PostUser['status'] = 'ACTIVE';
		PostUser['role'] = 'Guest';
		PostUser['personalId'] = null;
		PostUser['type'] = 'Resident';
		PostUser['loginEnabled'] = false;
		PostUser['isNotifyByEmail'] = false;
		PostUser['isNotifyByMobilePush'] = false;
		PostUser['isNotifyBySMS'] = false;
		PostUser['height'] = this.local_data.height;
		PostUser['height_units'] = this.local_data.height_units;
		PostUser['weight'] = this.local_data.weight;
		PostUser['weight_units'] = this.local_data.weight_units;
		PostUser['birthdate'] = moment(this.local_data['birthdate']).format('DD-MM-YYYY');
		PostUser['username'] = `${PostUser['firstName']}${PostUser['lastName']}`;
		PostUser['email'] = this.local_data.email;
		PostUser['mobile'] = `${this.local_data.ext}${this.local_data.mobile}`;
		PostUser['contact_of'] = this.local_data.contact_of;
		PostUser['Sleep'] = this.local_data.Sleep ? this.local_data.Sleep: 'unknown';
		PostUser['Strength'] = this.local_data.Strength ? this.local_data.Strength : 'unknown';
		PostUser['Balance'] =  this.local_data.Balance ? this.local_data.Balance : 'unknown';
		PostUser['BSSCount'] =  this.local_data.BSSCount || this.local_data.BSSCount>= 0 ? this.local_data.BSSCount:  -1;
    PostUser['ward_id'] = this.local_data['wardId'];
    PostUser['deviceId'] = this.local_data['deviceId'];
    PostUser['ouId'] = '11-11020';
    PostUser['wardNumber'] = this.local_data['wardId'];
    PostUser['wardName'] = this.getWardName(this.local_data['wardId']);
    PostUser['residentName'] = this.local_data['firstName'] + this.local_data['lastName'];
    PostUser['roomName'] = this.getRoomName(this.local_data['roomId']);
    PostUser['roomId'] = this.local_data['roomId'];
    PostUser['room_id'] = this.local_data['roomId']
    PostUser['ward_id'] = this.local_data['wardId']
    PostUser['device_id'] =  this.local_data['deviceId']
    PostUser['adminssion_date_time'] = moment(this.local_data.admissionDate).utc().format();
    PostUser['localData'] = this.local_data;
		if(this.action === 'Add'){
      Object.assign(PostUser, {userId: Math.floor(Math.random() * 100000000)})
      const residents = localStorage.getItem('residents');
      if(residents){
        const values = JSON.parse(residents);
        values.push(PostUser);
        localStorage.setItem('residents', JSON.stringify(values));
      }else{
        const values = [];
        values.push(PostUser);
        localStorage.setItem('residents', JSON.stringify(values))
      }
		}else {
      Object.assign(PostUser, {userId: Math.floor(Math.random() * 100000000)})
			const residents = localStorage.getItem('residents');
		  if(residents){
        const values = JSON.parse(residents);
        const caregiver = values.filter(value => value.userId !== this.data.userId);
        caregiver.push(PostUser);
        localStorage.setItem('residents', JSON.stringify(caregiver))
      }
    }
    this.dialogRef.close(true);
	}
	closeDialog() {
		this.dialogRef.close({ event: "Cancel" });
	}

	panelOpenState = false;
	step = 0;

	setStep(index: number) {
		this.step = index;
	}
	

	nextStep() {
		this.step++;
	}	

	prevStep() {
		this.step--;
	}
	public stayIndependentScore = 0;

}
