import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { CustomValidators } from '../../custom-validators';
import { wards } from '../add-text.component';
export interface caregivers {
  'name': string,
  'userid': string
}

export interface facilities {
  'facilityName': string,
  'facilityNumber': string
}

export interface ward {
  'name': string,
  'ward_number': string
}
@Component({
  selector: 'app-common-test-add',
  templateUrl: './common-test-add.component.html',
  styleUrls: ['./common-test-add.component.scss']
})
export class CommonTestAddComponent implements OnInit {

  careGiversList: caregivers[] = [];
  wardList: ward[] = [];
  facilityList: facilities[] = [];
  addWardForm: FormGroup;
  addRoomForm: FormGroup;
  addWearableForm: FormGroup;
  addCustomerForm: FormGroup;
  addCaregiverForm: FormGroup;
  addFacilityForm: FormGroup;
  dialogType: string = '';
  previousValues: any;

  @ViewChild('inputFileReader') inputFileReader: any;

  public records: any[] = []
  constructor(private _fb: FormBuilder,
    public dialogRef: MatDialogRef<CommonTestAddComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private toastr: ToastrService) {
    this.previousValues = this.data;
    this.addWardForm = this._fb.group({
      facilityName: ['select', Validators.required],
      name: ['', Validators.required],
      contactPhone: this._fb.array([this._fb.group({
        phone: ['', Validators.required],
        ext: ['+91', Validators.required]
      })])
    })
    this.addRoomForm = this._fb.group({
      ward: ['select', Validators.required],
      rooms: this._fb.array([this._fb.control('', Validators.required)])
    })
    this.addWearableForm = this._fb.group({
      ward: ['select', Validators.required],
      wearables: this._fb.array([this._fb.control('', Validators.required)])
    })
    this.addCaregiverForm = this._fb.group({
      firstName: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9äåö_]*$')]],
      lastName: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9äåö_]*$')]],
      role: ['select', Validators.required],
      ext: ['+91', Validators.required],
      caregiverPhoneNumber: ['', [Validators.required, CustomValidators.patternValidator(/^[0-9]{3,14}$/, { hasNumber: true })]],
      caregiverEmail: ['', Validators.required],
      assignWard: [[''], Validators.required]
    })
    this.addFacilityForm = this._fb.group({
      facilityName: ['', Validators.required],
      email: ['', Validators.required],
      ext: ['+91', Validators.required],
      phoneNumber: ['', [Validators.required, CustomValidators.patternValidator(/^[0-9]{3,14}$/, { hasNumber: true })]],
      organization: ['select', Validators.required],
      organization_unit: ['select', Validators.required],
      manager: ['', Validators.required]
    })
    this.addCustomerForm = this._fb.group({
      customer_name: ['', Validators.required],
      contactName: ['', Validators.required],
      email: ['', Validators.required],
      ext: ['+91', Validators.required],
      phoneNumber: ['', [Validators.required, CustomValidators.patternValidator(/^[0-9]{3,14}$/, { hasNumber: true })]]
    })
    this.dialogType = this.data.dialogType
  }

  showVerifyNum = false;
  getNum(index: number){
    const value = this.contactPhone.at(index).value;
    return value.phone !== '' && value.ext !== '';
  }
  otpLength = 4;
  verifyOpen(index: number){
    this.showVerifyNum = true;
  }
  otp: any;
  onOtpChange(value: any){
    this.otp = value;
  }
  verify(){
    this.showVerifyNum = false;
  }

  getWards(){
    if(this.wardIds.filter(value => value !== '').length > 0){
      const selectedUser = [];
      const notSelected = [];
      this.wardList.forEach(value => {
        if(this.wardIds.includes(value.ward_number)){
          selectedUser.push(value)
        }else{
          notSelected.push(value);
        }
      })
      this.wardList = [...selectedUser,...notSelected];
      return this.wardList;
    }else{
      return this.wardList;
    }
  }

  getName(caregiverId: string){
    return this.careGiversList?.find(value => value.userid === caregiverId).name;
  }

  get wardIds(){
    if(this.addCaregiverForm.get('assignWard').value.length > 1){
      return this.addCaregiverForm.get('assignWard').value.filter(value => value !== '');
    }
    return this.addCaregiverForm.get('assignWard').value;
  }

  get contactPhone() {
    return this.addWardForm.get('contactPhone') as FormArray
  }

  get rooms() {
    return this.addRoomForm.get('rooms') as FormArray
  }

  get wearables() {
    return this.addWearableForm.get('wearables') as FormArray
  }

  addRoom() {
    this.rooms.push(this._fb.control('', Validators.required));
  }

  removeRoom(index: number) {
    this.rooms.removeAt(index)
  }

  addWearable() {
    this.wearables.push(this._fb.control('', Validators.required));
  }

  removeWearable(index: number) {
    this.wearables.removeAt(index)
  }

  addPhoneNumber() {
    this.contactPhone.push(this._fb.group({
      phone: ['', Validators.required],
      ext: ['+91', Validators.required]
    }));
  }

  removePhoneNumber(index: number) {
    this.contactPhone.removeAt(index)
  }

  ngOnInit(): void {
    if (this.dialogType === 'Add new ward') {
      this.getAllFacilities();
    } else if (this.dialogType === 'Add new caregiver') {
      this.getAllWards();
    }else if(this.dialogType === 'Add new facility'){
      this.getAllCareGiver();
    }else if(this.dialogType === 'Add new room'){
      this.getAllWards();
    }else if(this.dialogType === 'Add new wearable'){
      this.getAllWards();
    }
  }

  getAllCareGiver() {
    this.disable = false;
    const data = localStorage.getItem('caregivers')
    if(data){
      this.careGiversList = JSON.parse(data) as caregivers[];
    }
  }

  getAllFacilities(){
    this.disable = false;
    const data = localStorage.getItem('testFacilities')
    if(data){
      this.facilityList = JSON.parse(data) as facilities[];
    }
  }

  getAllWards() {
    this.disable = false;
    const data = localStorage.getItem('wards')
    if(data){
      this.wardList = JSON.parse(data) as ward[];
    }
  }
  questionnaire = ['Add stay independent', 'Add down fall risk index'];
  disable: boolean = true;
  downFallQuestions: any;
  stayQuestions: any;
  doAction() {
    this.disable = true;
    if (this.dialogType === 'Add new ward') {
      let postData = {
        "organisation_unit_number": '11-11020',
        "facility_name": this.addWardForm.get('facilityName').value,
        "contactPhone": this.addWardForm.get('contactPhone').value,
        "name": this.addWardForm.get('name').value
      };
      Object.assign(postData, {ward_number: Math.floor(Math.random() * 100000)})
      const wards = localStorage.getItem('wards');
      if(wards){
        const values = JSON.parse(wards);
        values.push(postData);
        localStorage.setItem('wards', JSON.stringify(values));
      }else{
        const values = [];
        values.push(postData);
        localStorage.setItem('wards', JSON.stringify(values))
      }
    } else if (this.dialogType === 'Add new caregiver') {
      let username = (this.addCaregiverForm.get('firstName').value + this.addCaregiverForm.get('lastName').value).replace(/[^A-Z0-9]/ig,'').toLowerCase();
      let wardsMapArray = []
      this.wardIds.forEach((item) => {
        let ward = this.getWard(item);
        wardsMapArray.push({wardName: ward.name, wardNumber: item})
      });
      let body = {
        "email": this.addCaregiverForm.get('caregiverEmail').value,
        "firstName": this.addCaregiverForm.get('firstName').value,
        "isNotifyByEmail": false,
        "isNotifyByMobilePush": false,
        "isNotifyBySMS": false,
        "lastName": this.addCaregiverForm.get('lastName').value,
        "loginEnabled": false,
        "phone": {
          "ext": this.addCaregiverForm.get('ext').value,
          "phone": this.addCaregiverForm.get('caregiverPhoneNumber').value
        },
        "mobile": `${this.addCaregiverForm.get('ext').value}${this.addCaregiverForm.get('caregiverPhoneNumber').value}`,
        "myAlias": username,
        // "wardName": this.getWard(this.addCaregiverForm.get('assignWard').value).name,
        // "wardId": this.addCaregiverForm.get('assignWard').value,
        "wardArray": this.addCaregiverForm.get('assignWard').value,
        "wards": wardsMapArray,
        "org_unit_id": '11-11020',
        "username": username,
        "role": "Caregiver",
        "status": "Active",
        "type": "Administrator",
        "createdBy": 'asif@nextstepdynamics.com'
      };
      Object.assign(body, {caregiverId: Math.floor(Math.random() * 100000000)})
      const caregivers = localStorage.getItem('caregivers');
      if(caregivers){
        const values = JSON.parse(caregivers);
        values.push(body);
        localStorage.setItem('caregivers', JSON.stringify(values));
      }else{
        const values = [];
        values.push(body);
        localStorage.setItem('caregivers', JSON.stringify(values))
      }
    } else if (this.dialogType === 'Import rooms') {
      let body = {
        "OrgUId": '11-11020',
        "Rooms": []
      };
      
    }else if(this.dialogType === 'Add new room'){
      const addRooms = this.addRoomForm.value.rooms.map(value => {
        return {
          ward_number: this.addRoomForm.get('ward').value,
          wardName: this.getWard(this.addRoomForm.get('ward').value).name,
          RoomName: value,
          roomId: Math.floor(Math.random() * 100000)
        }
      })
      let wards: any = localStorage.getItem('wards');
      wards = JSON.parse(wards);
      const exists = wards.find(ward => ward.ward_number === this.addRoomForm.get('ward').value);
      if(exists){
        if(exists.roomCount){
          exists.roomCount = exists.roomCount + addRooms.length;
        }else{
          exists.roomCount = addRooms.length;
        }
      }
      localStorage.setItem('wards', JSON.stringify(wards));
      const rooms = localStorage.getItem('rooms');
      if(rooms){
        const values = JSON.parse(rooms);
        values.push(...addRooms);
        localStorage.setItem('rooms', JSON.stringify(values));
      }else{
        const values = [];
        values.push(...addRooms);
        localStorage.setItem('rooms', JSON.stringify(values))
      }
    }else if(this.dialogType === 'Add new wearable'){
      const addWearables = this.addWearableForm.value.wearables.map(value => {
        return {
          ward_number: this.addWearableForm.get('ward').value,
          wardName: this.getWard(this.addWearableForm.get('ward').value).name,
          serialNo: value,
          serialId: Math.floor(Math.random() * 100000)
        }
      })
      const wearables = localStorage.getItem('wearables');
      if(wearables){
        const values = JSON.parse(wearables);
        values.push(...addWearables);
        localStorage.setItem('wearables', JSON.stringify(values));
      }else{
        const values = [];
        values.push(...addWearables);
        localStorage.setItem('wearables', JSON.stringify(values))
      }
    }else if(this.dialogType === 'Add new facility'){
      const postData = this.addFacilityForm.value;
      Object.assign(postData, {
        historyFalls: 20,
        noOfFalls: 30,
        registeredRooms: 3,
        registeredResidents: 10,
        registeredWearables: 10,
        facilityNumber: Math.floor(Math.random() * 1000000)
      })
      const facilities = localStorage.getItem('testFacilities');
      if(facilities){
        const values = JSON.parse(facilities);
        values.push(postData);
        localStorage.setItem('testFacilities', JSON.stringify(values));
      }else{
        const values = [];
        values.push(postData);
        localStorage.setItem('testFacilities', JSON.stringify(values))
      }
    }else if(this.dialogType === 'Add new customer'){
      const postData = this.addCustomerForm.value;
      Object.assign(postData, {
        customerNumber: Math.floor(Math.random() * 1000000)
      })
      const customers = localStorage.getItem('testCustomers');
      if(customers){
        const values = JSON.parse(customers);
        values.push(postData);
        localStorage.setItem('testCustomers', JSON.stringify(values));
      }else{
        const values = [];
        values.push(postData);
        localStorage.setItem('testCustomers', JSON.stringify(values))
      }
    }
    this.dialogRef.close(true);
  }
  medicationData: any;
  medicationId: any;

  getWard(ward_number: string) {
    return this.wardList.find(it => it.ward_number === ward_number)
  }

  getCaregiver(caregiverId) {
    const returnValue = []
    caregiverId.forEach(value => {
      if (value !== "select") {
        let {name, userid} = this.careGiversList.find(it => it.userid === value)
        returnValue.push({name, userid});
      }
    });
    return returnValue
  }

  getManager(caregiverId: string) {
    return this.careGiversList.find(it => it.userid === caregiverId)
  }

  getMobile(mobiles: any[]){
    return mobiles.map(mobile => {
      return `${mobile.ext}${mobile.phone}`
    })
  }

  close() {
    this.data = this.previousValues;
    this.dialogRef.close();
  }

  validate() {
    if (this.dialogType === 'Add down fall risk index' ||
      this.dialogType === 'Add stay independent' ||
      this.dialogType === 'Edit medications') {
      return this.questionnaire.includes(this.dialogType) ? this.disable : false
    } else if (this.dialogType === 'Add new ward') {
      return !(this.addWardForm.valid && !this.disable);
    } else if (this.dialogType === 'Add new caregiver') {
      return !(this.addCaregiverForm.valid && !this.disable && this.wardIds.filter(value => value !== '').length > 0);
    } else if (this.dialogType === 'Import rooms') {
      return !(this.records.length && !this.disable);
    }else if(this.dialogType === 'Add new facility'){
      return this.addFacilityForm.invalid && !this.disable
    }else if(this.dialogType === 'Add new customer'){
      return this.addCustomerForm.invalid
    }
  }
}
