import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { CustomValidators } from '../../custom-validators';

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
  selector: 'app-common-test-edit',
  templateUrl: './common-test-edit.component.html',
  styleUrls: ['./common-test-edit.component.scss']
})
export class CommonTestEditComponent implements OnInit {

  careGiversList: caregivers[];
  wardList: ward[];
  editWardForm: FormGroup;
  editCaregiverForm: FormGroup;
  editFacilityForm: FormGroup;
  editWearableForm: FormGroup;
  editRoomForm: FormGroup;
  editCustomerForm: FormGroup;
  dialogType: string = '';
  previousValues: any;

  @ViewChild('inputFileReader') inputFileReader: any;

  showVerifyNum = false;
  getNum(index: number) {
    const value = this.contactPhone.at(index).value;
    return value.phone !== '' && value.ext !== '';
  }
  otpLength = 4;
  verifyOpen(index: number) {
    this.showVerifyNum = true;
  }
  otp: any;
  onOtpChange(value: any) {
    this.otp = value;
  }
  verify() {
    this.showVerifyNum = false;
  }
  public records: any[] = []
  constructor(private _fb: FormBuilder,
    public dialogRef: MatDialogRef<CommonTestEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private toastr: ToastrService) {
    this.previousValues = this.data;
    this.editWardForm = this._fb.group({
      facilityName: [''],
      name: ['', Validators.required],
      contactPhone: this._fb.array([
        this._fb.group({
          phone: ['', Validators.required],
          ext: ['+91', Validators.required]
        })
      ])
    })
    this.editRoomForm = this._fb.group({
      ward: ['select', Validators.required],
      rooms: this._fb.array([this._fb.control('', Validators.required)])
    })
    this.editWearableForm = this._fb.group({
      ward: ['select', Validators.required],
      wearables: this._fb.array([this._fb.control('', Validators.required)])
    })
    this.editCaregiverForm = this._fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      ext: ['+91', Validators.required],
      caregiverPhoneNumber: ['', [Validators.required, CustomValidators.patternValidator(/^[0-9]{3,14}$/, { hasNumber: true })]],
      caregiverEmail: ['', Validators.required],
      assignWard: [[''], Validators.required]
    })
    this.editFacilityForm = this._fb.group({
      facilityName: ['', Validators.required],
      email: ['', Validators.required],
      ext: ['+91', Validators.required],
      phoneNumber: ['', [Validators.required, CustomValidators.patternValidator(/^[0-9]{3,14}$/, { hasNumber: true })]],
      organization: ['select', Validators.required],
      organization_unit: ['select', Validators.required],
      manager: ['select', Validators.required]
    })
    this.editCustomerForm = this._fb.group({
      customer_name: ['', Validators.required],
      contactName: ['', Validators.required],
      email: ['', Validators.required],
      ext: ['+91', Validators.required],
      phoneNumber: ['', [Validators.required, CustomValidators.patternValidator(/^[0-9]{3,14}$/, { hasNumber: true })]]
    })
    this.dialogType = this.data.dialogType
  }
  get caregiverUserIds() {
    if (this.editWardForm.get('caregiverUserid').value.length > 1) {
      return this.editWardForm.get('caregiverUserid').value.filter(value => value !== 'select');
    }
    return this.editWardForm.get('caregiverUserid').value;
  }
  get contactPhone() {
    return this.editWardForm.get('contactPhone') as FormArray
  }

  get rooms() {
    return this.editRoomForm.get('rooms') as FormArray
  }

  get wardIds() {
    if (this.editCaregiverForm.get('assignWard').value.length > 1) {
      return this.editCaregiverForm.get('assignWard').value.filter(value => value !== '');
    }
    return this.editCaregiverForm.get('assignWard').value;
  }

  get wearables() {
    return this.editWearableForm.get('wearables') as FormArray
  }

  addRoom() {
    this.rooms.push(this._fb.group({
      roomNumber: ['', Validators.required],
    }));
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

  ngOnInit(): void {
    if (this.dialogType === 'Edit ward') {
      this.getAllFacilities()
    } else if (this.dialogType === 'Edit caregiver') {
      this.getAllWards('caregiver');
    } else if (this.dialogType === 'Edit room') {
      this.getAllWards('room');
    }else if(this.dialogType === 'Edit facility'){
      this.getAllCareGiver();
    }else if(this.dialogType === 'Edit wearable'){
      this.getAllWards('wearable')
    }else if(this.dialogType === 'Edit customer'){
      this.getCustomerById(this.data.customer_id)
    }
  }

  getWardById(id: any){
    const wards = localStorage.getItem('wards');
		if(wards){
			const values = JSON.parse(wards);
      const ward = values.find(value => value.ward_number === id);
      const {name, facility_name: facilityName, contactPhone} = ward;
      this.editWardForm.patchValue({
        facilityName,
        name,
        contactPhone
      })
    }
  }

  getCustomerById(id: any){
    const customers = localStorage.getItem('testCustomers');
		if(customers){
			const values = JSON.parse(customers);
      const customer = values.find(value => value.customerNumber === id);
      const {customer_name, contactName, email, ext, phoneNumber } = customer;
      this.editCustomerForm.patchValue({
        customer_name,
        contactName,
        ext,
        phoneNumber,
        email
      })
    }
  }

  getFacility(facilityId: any){
		const facilities = localStorage.getItem('facilities');
		if(facilities){
			const values = JSON.parse(facilities);
			const facility = values.find(value => value.facilityNumber === facilityId);
      const {facilityName , email, ext, phoneNumber, organization, organization_unit, manager} = facility;
      this.editFacilityForm.patchValue({
        facilityName,
        manager,
        ext,
        phoneNumber,
        email,
        organization_unit,
        organization
      })
		}
	}
  getCaregivers() {
    if (this.caregiverUserIds.filter(value => value !== 'select').length > 0) {
      const selectedUser = [];
      const notSelected = [];
      this.careGiversList.forEach(value => {
        if (this.caregiverUserIds.includes(value.userid)) {
          selectedUser.push(value)
        } else {
          notSelected.push(value);
        }
      })
      this.careGiversList = [...selectedUser, ...notSelected];
      return this.careGiversList;
    } else {
      return this.careGiversList;
    }
  }

  getName(caregiverId: string) {
    return this.careGiversList.find(value => value.userid === caregiverId).name;
  }

  getAllCareGiver() {
    const data = localStorage.getItem('caregivers')
    if(data){
      this.careGiversList = JSON.parse(data) as caregivers[];
      this.getFacility(this.data.facilityId);
    }
  }

  facilityList: facilities[] = [];
  getAllFacilities(){
    const data = localStorage.getItem('testFacilities')
    if(data){
      this.facilityList = JSON.parse(data) as facilities[];
      this.getWardById(this.data.wardId);
    }
  }

  getAllWards(forTab: string) {
    const data = localStorage.getItem('wards')
    if(data){
      this.wardList = JSON.parse(data) as ward[];
      if(forTab === 'caregiver'){
        this.getCaregiver(this.data.caregiverId)
      }else if(forTab === 'room'){
        this.getRoom(this.data.roomId);
      }else if(forTab === 'wearable'){
        this.getWearable(this.data.serialId)
      }
    }
  }

  getWearable(id: any){
    const wearables = localStorage.getItem('wearables');
		if(wearables){
			const values = JSON.parse(wearables);
      const wearable = values.find(value => value.serialId === id);
      const {ward_number: ward, serialNo} = wearable;
      const wearableValues = [serialNo]
      this.editWearableForm.patchValue({
        ward,
        wearables: wearableValues
      })
    }
  }

  getRoom(id: any){
    const rooms = localStorage.getItem('rooms');
		if(rooms){
			const values = JSON.parse(rooms);
      const room = values.find(value => value.roomId === id);
      const {ward_number: ward, RoomName} = room;
      const roomValues = [RoomName]
      this.editRoomForm.patchValue({
        ward,
        rooms: roomValues
      })
    }
  }

  getCaregiver(id: any){
		const caregivers = localStorage.getItem('caregivers');
		if(caregivers){
			const values = JSON.parse(caregivers);
      const caregiver = values.find(value => value.caregiverId === id);
      const {firstName , lastName,email: caregiverEmail, phone, wards} = caregiver;
      const {ext, phone: caregiverPhoneNumber} = phone;
      const assignWard = wards.map(value => {
        return value.wardNumber
      })
      this.editCaregiverForm.patchValue({
        firstName,
        lastName,
        ext,
        caregiverPhoneNumber,
        caregiverEmail,
        assignWard
      })
		}
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

  getWards() {
    if (this.wardIds.filter(value => value !== '').length > 0) {
      const selectedUser = [];
      const notSelected = [];
      this.wardList.forEach(value => {
        if (this.wardIds.includes(value.ward_number)) {
          selectedUser.push(value)
        } else {
          notSelected.push(value);
        }
      })
      this.wardList = [...selectedUser, ...notSelected];
      return this.wardList;
    } else {
      return this.wardList;
    }
  }
  getWard(ward_number: string) {
    return this.wardList.find(it => it.ward_number === ward_number) || { name: "No ward" }
  }
  doAction() {
    if (this.dialogType === 'Edit caregiver') {
      let username = (this.editCaregiverForm.get('firstName').value + this.editCaregiverForm.get('lastName').value).replace(/[^A-Z0-9]/ig,'').toLowerCase();
      let wardsMapArray = [];
      this.wardIds.forEach((item) => {
        let ward = this.getWard(item);
        wardsMapArray.push({ wardName: ward.name, wardNumber: item })
      });
      let updateData = {
        "email": this.editCaregiverForm.get('caregiverEmail').value,
        "firstName": this.editCaregiverForm.get('firstName').value,
        "isNotifyByEmail": false,
        "isNotifyByMobilePush": false,
        "isNotifyBySMS": false,
        "lastName": this.editCaregiverForm.get('lastName').value,
        "loginEnabled": false,
        "phone": {
          "ext": this.editCaregiverForm.get('ext').value,
          "phone": this.editCaregiverForm.get('caregiverPhoneNumber').value
        },
        "mobile": `${this.editCaregiverForm.get('ext').value}${this.editCaregiverForm.get('caregiverPhoneNumber').value}`,
        "myAlias": username,
        // "wardName": this.getWard(this.addCaregiverForm.get('assignWard').value).name,
        // "wardId": this.addCaregiverForm.get('assignWard').value,
        "wardArray": this.editCaregiverForm.get('assignWard').value,
        "wards": wardsMapArray,
        "org_unit_id": '11-11020',
        "username": username,
        "role": "Caregiver",
        "status": "Active",
        "type": "Administrator",
        "createdBy": 'asif@nextstepdynamics.com',
        caregiverId: this.data.caregiverId
      };
      const caregivers = localStorage.getItem('caregivers');
		  if(caregivers){
        const values = JSON.parse(caregivers);
        const caregiver = values.filter(value => value.caregiverId !== this.data.caregiverId);
        caregiver.unshift(updateData);
        localStorage.setItem('caregivers', JSON.stringify(caregiver))
      }
      
    } else if (this.dialogType === 'Edit ward') {
      let updateData = {
        "organisation_unit_number": '11-11020',
        "facility_name": this.editWardForm.get('facilityName').value,
        "contactPhone": this.editWardForm.get('contactPhone').value,
        "name": this.editWardForm.get('name').value
      };
      Object.assign(updateData, {ward_number: Math.floor(Math.random() * 100000)})
      const wards = localStorage.getItem('wards');
		  if(wards){
        const values = JSON.parse(wards);
        const ward = values.filter(value => value.ward_number !== this.data.wardId);
        ward.unshift(updateData);
        localStorage.setItem('wards', JSON.stringify(ward))
      }
      
    } else if (this.dialogType === 'Edit room') {
      const rooms = localStorage.getItem('rooms');
		  if(rooms){
        const addRooms = this.editRoomForm.value.rooms.map(value => {
          return {
            ward_number: this.editRoomForm.get('ward').value,
            wardName: this.getWard(this.editRoomForm.get('ward').value).name,
            RoomName: value,
            roomId: this.data.roomId
          }
        })
        const values = JSON.parse(rooms);
        const room = values.filter(value => value.roomId !== this.data.roomId);
        room.unshift(addRooms[0]);
        localStorage.setItem('rooms', JSON.stringify(room))
      }
      
    } else if (this.dialogType === 'Edit wearable') {
      const wearables = localStorage.getItem('wearables');
		  if(wearables){
        const addWearables = this.editRoomForm.value.wearables.map(value => {
          return {
            ward_number: this.editRoomForm.get('ward').value,
            wardName: this.getWard(this.editRoomForm.get('ward').value).name,
            RoomName: value,
            roomId: this.data.serialId
          }
        })
        const values = JSON.parse(wearables);
        const room = values.filter(value => value.roomId !== this.data.serialId);
        room.unshift(addWearables[0]);
        localStorage.setItem('wearables', JSON.stringify(room))
      }
      
    }else if(this.dialogType === 'Edit facility'){
      const facilities = localStorage.getItem('testFacilities');
		  if(facilities){
        const values = JSON.parse(facilities);
        const facility = values.filter(value => value.facilityNumber !== this.data.facilityId);
        const postData = this.editFacilityForm.value;
        Object.assign(postData, {
          historyFalls: 20,
          noOfFalls: 30,
          registeredRooms: 3,
          registeredResidents: 10,
          registeredWearables: 10,
          facilityNumber: this.data.facilityId
        })
        facility.unshift(postData);
        localStorage.setItem('testFacilities', JSON.stringify(facility))
      }
    }else if(this.dialogType === 'Edit customer'){
      const customers = localStorage.getItem('testCustomers');
		  if(customers){
        const values = JSON.parse(customers);
        const customer = values.filter(value => value.customerNumber !== this.data.customer_id);
        const postData = this.editCustomerForm.value;
        Object.assign(postData, {customerNumber: this.data.customer_id});
        customer.unshift(postData);
        localStorage.setItem('testCustomers', JSON.stringify(customer))
      }
    }
    this.dialogRef.close(true);
  }
  validate() {
    if (this.dialogType === 'Edit ward') {
      return !(this.editWardForm.valid);
    } else if (this.dialogType === 'Edit room') {
      return !(this.editRoomForm.valid);
    } else if (this.dialogType === 'Edit caregiver') {
      return !(this.editCaregiverForm.valid);
    } else if(this.dialogType === 'Edit facility'){
      return this.editFacilityForm.invalid;
    }else if(this.dialogType === 'Edit wearable'){
      return this.editWearableForm.invalid;
    }else if(this.dialogType === 'Edit customer'){
      return this.editCustomerForm.invalid
    }
  }
  close() {
    this.dialogRef.close();
  }
}
