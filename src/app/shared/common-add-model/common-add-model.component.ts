import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';
import { CommonHttpService } from '../services/http-services/common-http.service';
import { CommonService } from './../../shared/services/common.service';
import { CustomValidators } from '../../shared/custom-validators';
import { concat, forkJoin } from 'rxjs';
import * as _LODASH from "lodash";

import { distinct } from 'rxjs/operators';
import { MatSelect } from '@angular/material/select';
import { TokenStorageServiceService } from '../../auth/login/token-storage-service.service';

export interface caregivers {
  'name': string,
  'userid': string
}

export interface ward {
  'name': string,
  'ward_number': string,
  'facility_id'?: string
}

export class CSVCreateRoomRecord {
  public name: any;
}

@Component({
  selector: 'app-common-add-model',
  templateUrl: './common-add-model.component.html',
  styleUrls: ['./common-add-model.component.scss']
})
export class CommonAddModelComponent implements OnInit {

  careGiversList: any[] = [];
  wardList: any[] = [];
  header:any;
  addWardForm: FormGroup;
  addRoomForm: FormGroup;
  addCaregiverForm: FormGroup;
  addFacilityForm: FormGroup;
  addCustomerForm: FormGroup;
  addWearableForm: FormGroup;
  customerHqForm: FormGroup;
  facilityAdminForm: FormGroup;
  wardAdminForm: FormGroup;
  caregiverForm: FormGroup;
  userForm: FormGroup;
  dialogType: string = '';
  extraFields: boolean = false;
  previousValues: any;

  @ViewChild('inputFileReader') inputFileReader: any;
  @ViewChild('select') private select: MatSelect;
  @ViewChild('careSelect') private careSelect: MatSelect;
  @ViewChild('wadAdSelect') private wadAdSelect: MatSelect;
  public records: any[] = [];
  facilityDisable = true;
  constructor(private _fb: FormBuilder,
    public common: CommonService,private tokenStorage: TokenStorageServiceService,
    private http: HttpClient,
    public dialogRef: MatDialogRef<CommonAddModelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private commonHttp: CommonHttpService,
    private toastr: ToastrService) {
    this.previousValues = this.data;
    this.customerHqForm = this._fb.group({
      customerSearch: [''],
      customer: ['', Validators.required],
      username: ['', Validators.required],
      firstName: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9äåö_]*$')]],
      lastName: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9äåö_]*$')]],
      email: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')]],
      ext: ['+91', Validators.required],
      phoneNumber: ['', Validators.required]
    })
    this.facilityAdminForm = this._fb.group({
      customerSearch: [''],
      customer: ['', Validators.required],
      facility: [{ value: '', disabled: true }, Validators.required],
      facilitySearch: [''],
      username: ['', Validators.required],
      firstName: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9äåö_]*$')]],
      lastName: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9äåö_]*$')]],
      email: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')]],
      ext: ['+91', Validators.required],
      phoneNumber: ['', Validators.required]
    })
    this.wardAdminForm = this._fb.group({
      customerSearch: [''],
      username: ['', Validators.required],
      customer: ['', Validators.required],
      facility: [{ value: '', disabled: true }, Validators.required],
      facilitySearch: [''],
      firstName: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9äåö_]*$')]],
      lastName: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9äåö_]*$')]],
      ward: [{ value: '', disabled: true }, Validators.required],
      wardSearch: [''],
      email: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')]],
      ext: ['+91', Validators.required],
      phoneNumber: ['', Validators.required]
    })
    this.caregiverForm = this._fb.group({
      customerSearch: [''],
      customer: ['', Validators.required],
      username: ['', Validators.required],
      facility: [{ value: '', disabled: true }, Validators.required],
      facilitySearch: [''],
      ward: [{ value: [''], disabled: true }, Validators.required],
      wardSearch: [''],
      firstName: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9äåö_]*$')]],
      lastName: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9äåö_]*$')]],
      email: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')]],
      ext: ['+91', Validators.required],
      phoneNumber: ['', Validators.required]
    })
    this.addWearableForm = this._fb.group({
      customerSearch: [''],
      customer_id: [{ value: this.data.customer_id ? this.data.customer_id : '', disabled: this.data.customer_id ? true : false }, Validators.required],
      facility_id: [{ value: this.data.facility_id ? this.data.facility_id : '', disabled: this.data.facility_id ? true : false }, Validators.required],
      facilitySearch: [''],
      ward_id: [{ value: this.data.ward_id ? this.data.ward_id : '', disabled: this.data.ward_id ? true : false }, Validators.required],
      wardSearch: [''],
      wearable_sno: ['', Validators.required]
    })
    this.addWardForm = this._fb.group({
      customerSearch: [''],
      customer_name: this.data.extraFields ? ([{ value: this.data.customer_id ? this.data.customer_id : '', disabled: this.data.customer_id ? true : false }, Validators.required]) : [{ value: this.data.customer_id ? this.data.customer_id : '', disabled: this.data.customer_id ? true : false }],
      facilityName: [{ value: this.data.facility_id ? this.data.facility_id : '', disabled: this.data.facility_id ? true : false }, Validators.required],
      facilitySearch: [''],
      wardManager: [''],
      managerSearch: [''],
      name: ['', Validators.required],
      caregiverUserid: [['select'], Validators.required],
      caregiverSearch: [''],
      contactPhone: this._fb.array([this._fb.group({
        phone: ['', Validators.required],
        ext: ['+91', Validators.required]
      })])
    })
    this.addRoomForm = this._fb.group({
      rooms: this._fb.array([this._fb.group({
        roomNumber: ['', Validators.required],
        totalBedsAvailable: ['20', Validators.required]
      })])
    })
    this.addCaregiverForm = this._fb.group({
      username: ['', Validators.required],
      customer: [{ value: this.data.customer_id ? this.data.customer_id : '', disabled: this.data.customer_id ? true : false }, Validators.required],
      facility: [{ value: this.data.facility_id ? this.data.facility_id : '', disabled: this.data.facility_id ? true : false }, Validators.required],
      firstName: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9äåö_]*$')]],
      lastName: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9äåö_]*$')]],
      // caregiverQualification: ['select', Validators.required],
      ext: ['+91', Validators.required],
      caregiverPhoneNumber: ['', [Validators.required, CustomValidators.patternValidator(/^[0-9]{3,14}$/, { hasNumber: true })]],
      caregiverEmail: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')]],
      assignWard: [[''], Validators.required],
      wardSearch: ['']
    })
    this.addFacilityForm = this._fb.group({
      customerSearch: [''],
      caregiverSearch: [''],
      customer_name: [{ value: this.data.customer_id ? this.data.customer_id : '', disabled: this.data.customer_id ? true : false }, Validators.required],
      facilityName: ['', Validators.required],
      facilityAddress: ['', Validators.required],
      wardCount: ['', Validators.required],
      facilityAdmin: ['']
    })
    this.addCustomerForm = this._fb.group({
      customer_name: ['', Validators.required],
      username: ['', Validators.required],
      firstName: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9äåö_]*$')]],
      lastName: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9äåö_]*$')]],
      customer_status: ['', Validators.required],
      customerAddress: ['', Validators.required],
      email: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')]],
      ext: ['+91', Validators.required],
      phoneNumber: ['', [Validators.required, CustomValidators.patternValidator(/^[0-9]{3,14}$/, { hasNumber: true })]]
    })
    this.dialogType = this.data.dialogType;
    this.extraFields = this.data.extraFields ? this.data.extraFields : false;
    if (this.extraFields) {
      if (!this.data.customer_id) {
        this.addWardForm.get('facilityName').disable();
      }
    }
    if (this.data.customer_id && this.dialogType === 'Add new facility') {
      this.addFacilityForm.patchValue({
        customer_name: this.data.customer_id
      })
    }
    if (this.dialogType === 'Add new wearable' && !this.data.facility_id) {
      this.addWearableForm.get('ward_id').disable()
    }
  }
  enableWardW() {
    this.addWearableForm.get('ward_id').enable()
  }

  getFFilterCustomer() {
    return this.customerList.filter(value => value.customer_name.toLowerCase().includes(this.addFacilityForm.get('customerSearch').value.toLowerCase()));
  }

  getWFilterCustomer() {
    return this.customerList.filter(value => value.customer_name.toLowerCase().includes(this.addWardForm.get('customerSearch').value.toLowerCase()));
  }

  getHQCustomers() {
    return this.customerList.filter(value => value.customer_name.toLowerCase().includes(this.customerHqForm.get('customerSearch').value.toLowerCase()));
  }

  getFACustomers() {
    return this.customerList.filter(value => value.customer_name.toLowerCase().includes(this.facilityAdminForm.get('customerSearch').value.toLowerCase()));
  }

  getWACustomers() {
    return this.customerList.filter(value => value.customer_name.toLowerCase().includes(this.wardAdminForm.get('customerSearch').value.toLowerCase()));
  }

  getCACustomers() {
    return this.customerList.filter(value => value.customer_name.toLowerCase().includes(this.caregiverForm.get('customerSearch').value.toLowerCase()));
  }

  getFFilterCaregiver() {
    if (this.addFacilityForm.get('customer_name').value !== '') {
      return this.careGiversList.filter(value => value.name.toLowerCase().includes(this.addFacilityForm.get('caregiverSearch').value.toLowerCase()) && value.customer_id === this.addFacilityForm.get('customer_name').value);
    }
  }
  getFFilterFacilityAdmin() {
    if (this.addFacilityForm.get('customer_name').value !== '') {
      //remove duplicate values
    let obj = {};
    const unique = () => {
      let result = [];

      this.facilityList.forEach((item, i) => {
        obj[item['facilityAdmin']] = i;
      });

      for (let key in obj) {
        let index = obj[key];
        result.push(this.facilityList[index])
      }

      return result;
    }

    this.facilityList = unique();
    //
    
      const facilityadmin = this.facilityList.filter(value => value.facilityAdmin.toLowerCase().includes(this.addFacilityForm.get('caregiverSearch').value.toLowerCase()) && value.customerId === this.addFacilityForm.get('customer_name').value);
      return facilityadmin.filter(value => value.facilityAdmin.toLowerCase() != '')
    }
  }





  getWFilterManager() {
    return this.careGiversList.filter(value => value.name.toLowerCase().includes(this.addWardForm.get('managerSearch').value.toLowerCase()) && value.facility_id === this.addWardForm.get('facilityName').value);
  }
  getWardFilterManager() {
        //remove duplicate values
        let obj = {};
        const unique = () => {
          let result = [];
    
          this.wardList.forEach((item, i) => {
            obj[item['managername']] = i;
          });
    
          for (let key in obj) {
            let index = obj[key];
            result.push(this.wardList[index])
          }
    
          return result;
        }
    
        this.wardList = unique();
        //
        const wards = this.wardList.filter(value => value.managername.toLowerCase().includes(this.addWardForm.get('managerSearch').value.toLowerCase()) && value.facility_id === this.addWardForm.get('facilityName').value);
        return wards.filter(value => value.managername.toLowerCase() != '')
    
  }
  enableFacility(value: any) {

    if (value !== '') {
      this.addWardForm.get('facilityName').setValue('');
      this.addWardForm.get('facilityName').enable();
    }

  }

  enableCaregivers(value: any[]) {
    if ((this.addWardForm.get('caregiverUserid').value !== 'select') && (this.addWardForm.get('caregiverUserid').value !== '')) {
      this.addWardForm.get('caregiverUserid').setValue([]);
      this.addWardForm.get('caregiverUserid').setValue(['select']);
      //  this.addWardForm.get('caregiverUserid').disable();
    }

  }


  enableFacilityUser(value: any) {
    if (value === 'fwa') {
      this.facilityAdminForm.get('facility').setValue('');
      this.facilityAdminForm.get('facility').enable();
    } else if (value === 'ca') {
      this.caregiverForm.get('facility').setValue('');
      this.caregiverForm.get('facility').enable();
    } else if (value === 'wa') {
      this.wardAdminForm.get('facility').setValue('');
      this.wardAdminForm.get('facility').enable();
    }
  }
  enableWardUser(value: any) {
    if (value === 'ca') {
      this.caregiverForm.get('ward').setValue(['']);
      this.caregiverForm.get('ward').enable();
    } else if (value === 'wa') {
      this.wardAdminForm.get('ward').setValue('');
      this.wardAdminForm.get('ward').enable();
    }
  }
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

  getCaregivers() {
    this.addWardForm.valueChanges.subscribe(() => {
      this.select.close();
    });
    if (this.addWardForm.get('facilityName').value !== '') {
      const selectedUser = [];
      const notSelected = [];
      this.careGiversList.forEach(value => {
        if (this.caregiverUserIds.filter(value => value !== 'select').includes(value.id)) {
          selectedUser.push(value)
        } else {
          notSelected.push(value);
        }
      })
      this.careGiversList = [...selectedUser, ...notSelected];
      return this.careGiversList.filter(value => value.name.toLowerCase().includes(this.addWardForm.get('caregiverSearch').value.toLowerCase()) && value.facility_id === this.addWardForm.get('facilityName').value);
    }
  }

  getWards() {
    this.addCaregiverForm.valueChanges.subscribe(() => {
      this.wadAdSelect.close();
    });
    this.caregiverForm.valueChanges.subscribe(() => {
      this.careSelect.close();
    });
    let wards = [];
    if (this.dialogType === 'Add new caregiver user') {
    
      wards = this.getFilterWards('caregiver');
    } else {
    
      wards = this.wardList.filter(value => (value.name.toLowerCase().includes(this.addCaregiverForm.get('wardSearch').value.toLowerCase()) || this.wardIds.includes(value.ward_number)) && value.facility_id === this.data.facility_id);
    }
    if (this.wardIds.filter(value => value !== '').length > 0) {
      const selectedUser = [];
      const notSelected = [];
      wards.forEach(value => {
        if (this.wardIds.includes(value.ward_number)) {
          selectedUser.push(value)
        } else {
          notSelected.push(value);
        }
      })
      wards = [...selectedUser, ...notSelected];
      return wards;
    } else {
      return wards;
    }
  }

  getName(caregiverId: string) {
    return this.careGiversList?.find(value => value.id === caregiverId).name;
  }

  get caregiverUserIds() {
    if (this.addWardForm.get('caregiverUserid').value.length > 1) {
      return this.addWardForm.get('caregiverUserid').value.filter(value => value !== 'select');
    }
    return this.addWardForm.get('caregiverUserid').value;
  }

  get wardIds() {
    if (this.addCaregiverForm.get('assignWard').value.length > 1) {
      return this.addCaregiverForm.get('assignWard').value.filter(value => value !== '');
    }
    return this.addCaregiverForm.get('assignWard').value;
  }
  get userWardIds() {
    if (this.caregiverForm.get('ward').value.length > 1) {
      return this.caregiverForm.get('ward').value.filter(value => value !== '');
    }
    return this.caregiverForm.get('ward').value;
  }

  get contactPhone() {
    return this.addWardForm.get('contactPhone') as FormArray
  }

  get rooms() {
    return this.addRoomForm.get('rooms') as FormArray
  }

  addRoom() {
    this.rooms.push(this._fb.group({
      roomNumber: ['', Validators.required],
      totalBedsAvailable: ['20', Validators.required]
    }));
  }

  importRoom($event: any): void {
    this.disable = false;
    let text = [];
    let files = $event.srcElement.files;

    if (this.isValidCSVFile(files[0])) {

      let input = $event.target;
      let reader = new FileReader();
      reader.readAsText(input.files[0]);

      reader.onload = () => {
        let csvData = reader.result;
        let csvRecordsArray = (<string>csvData).split(/\r\n|\n/);

        let headersRow = this.getHeaderArray(csvRecordsArray);

        this.records = this.getDataRecordsArrayFromCSVFile(csvRecordsArray, headersRow.length);
      };

      reader.onerror = function () {
        console.log('error is occured while reading file!');
      };

    } else {
      alert("Please import valid .csv file.");
      this.inputFileReader.nativeElement.value = "";
      this.records = [];
    }
  }

  getDataRecordsArrayFromCSVFile(csvRecordsArray: any, headerLength: any) {
    let csvArr = [];

    for (let i = 1; i < csvRecordsArray.length; i++) {
      let curruntRecord = (<string>csvRecordsArray[i]).split(',');
      if (curruntRecord.length == headerLength) {
        let csvRecord: CSVCreateRoomRecord = new CSVCreateRoomRecord();
        csvRecord.name = curruntRecord[0].trim();
        csvArr.push(csvRecord);
      }
    }
    return csvArr;
  }

  isValidCSVFile(file: any) {
    return file.name.endsWith(".csv");
  }

  getHeaderArray(csvRecordsArr: any) {
    let headers = (<string>csvRecordsArr[0]).split(',');
    let headerArray = [];
    for (let j = 0; j < headers.length; j++) {
      headerArray.push(headers[j]);
    }
    return headerArray;
  }

  removeRoom(index: number) {
    this.rooms.removeAt(index)
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
   this.header = new HttpHeaders().set(
      "Authorization",
      this.tokenStorage.getToken()
    );
    if (this.dialogType === 'Add new ward') {
      this.getCustomer();
      this.getNewCaregiver();
      this.getFacility();
      this.getNewWards();
    } else if (this.dialogType === 'Add new caregiver') {
      this.getCustomer();
      this.getNewWards();
      this.getFacility();
    } else if (this.dialogType === 'Add new facility') {
      this.getCustomer();
      this.getFacility();
      this.getNewCaregiver();
    } else if (this.dialogType === 'Add new wearable') {
      this.getNewWards();
      this.getFacility();
      this.getCustomer();
      this.getWearables();
    } else if (this.dialogType === 'Add new customer') {
      this.getCustomer();
    } else if (this.dialogType === 'Add new customer admin') {
      this.getCustomer();
    } else if (this.dialogType === 'Add new facility admin') {
      this.getCustomer();
      this.getFacility();
    } else if (this.dialogType === 'Add new ward admin') {
      this.getFacility();
      this.getCustomer();
      this.getNewWards();
    } else if (this.dialogType === 'Add new caregiver user') {
      this.getNewWards();
      this.getCustomer();
      this.getFacility();
    }
    this.commonHttp.getUserDetails().subscribe((dbusers: any) => {
      if (dbusers.itemCount > 0) {
        this.users = dbusers.body.map(val => {
          return {
            email: val.details.email,
            username: val.details.username
          }
        })
      }
    })
  }
  prevMedication: any[];
  wearables = [];
  getWearables() {
    this.http.get(`${environment.apiUrlNew}/wearables/get/`,{headers:this.header}).subscribe((wearables: any) => {
      if (wearables.itemCount > 0) {
        this.wearables = wearables.body.map(value => {
          return {
            facility_id: value.details.facility_id,
            wearable_sno: value.details.wearable_sno
          }
        })
      }
    })
  }
  checkWearableExists() {
    const wearables = this.wearables;
    const exists = wearables.find(value => value.wearable_sno === this.addWearableForm.get('wearable_sno').value);
    if (exists) {
      return true;
    }
    return false;
  }
  users: any[] = [];
  emailCheck = true;
  checkEmails(email: string) {
    const exists = this.users.find(val => val.email === email);
    if (exists) {
      this.emailCheck = false;
      return true;
    } else {
      this.emailCheck = true;
      return false;
    }
  }
  usernameCheck = true;
  checkUserName(username: string) {
    const exists = this.users.find(val => val.username === username);
    if (exists) {
      this.usernameCheck = false;
      return true;
    } else {
      this.usernameCheck = true;
      return false;
    }
  }
  changeUsername(form: any) {
    form.get('username').setValue(form.value.firstName.toLowerCase() + form.value.lastName.toLowerCase())
  }

  checkWardExists() {
    if (this.addWardForm.get('facilityName').value !== '') {
      const wards = this.wardList.filter(ward => ward.facility_id === this.addWardForm.get('facilityName').value);
      const exists = wards.find(value => value.name.toLowerCase() === this.addWardForm.get('name').value.toLowerCase());
      if (exists) {
        return true;
      }
    }
    return false;
  }
  checkFacilityExists() {
    if (this.addFacilityForm.get('customer_name').value !== '') {
      const facilities = this.facilityList.filter(facility => facility.customerId === this.addFacilityForm.get('customer_name').value);
      const exists = facilities.find(value => value.facilityName.toLowerCase() === this.addFacilityForm.get('facilityName').value.toLowerCase());
      if (exists) {
        return true;
      }
    }
    return false;
  }
  checkCustomerExists() {
    if (this.addCustomerForm.get('customer_name').value !== '') {
      const exists = this.customerList.find(value => value.customer_name.toLowerCase() === this.addCustomerForm.get('customer_name').value.toLowerCase());
      if (exists) {
        return true;
      }
    }
    return false;
  }
  getNewWards() {
    this.http.get(`${environment.apiUrlNew}/wards/get/`,{headers:this.header}).subscribe((wards: any) => {
      if (wards.itemCount > 0) {
        this.wardList = wards.body.map(value => {
          return {
            name: value.details.ward_name,
            ward_number: value.details.ward_id,
            facility_id: value.details.facility_id,
            managername: value.details.manager_name,
            managerid: value.details.manager_id,
            all: value
          }
        }).sort((a: any, b: any) => {
          return a.name > b.name ? 1 : -1;
        })
      }
    })
  }
  getFilterWards(formType: string) {
    const wards = this.wardList;
    if (formType === 'caregiver') {
      if (this.caregiverForm.get('facility').value === '') {
        return wards.filter(value => value.name.toLowerCase().includes(this.caregiverForm.get('wardSearch').value.toLowerCase()));
      }
      return wards.filter(value => value.name.toLowerCase().includes(this.caregiverForm.get('wardSearch').value.toLowerCase()) || this.userWardIds.includes(value.ward_number)).filter(value => value.facility_id === this.caregiverForm.get('facility').value)
    } else {
      if (this.wardAdminForm.get('facility').value === '') {
        return wards.filter(value => value.name.toLowerCase().includes(this.wardAdminForm.get('wardSearch').value.toLowerCase()));
      }
      return wards.filter(value => value.name.toLowerCase().includes(this.wardAdminForm.get('wardSearch').value.toLowerCase())).filter(value => value.facility_id === this.wardAdminForm.get('facility').value)
    }
  }
  getFilterWard() {
    if (this.addWearableForm.get('facility_id').value === '') {
      return this.wardList;
    }
    return this.wardList.filter(value => value.name.toLowerCase().includes(this.addWearableForm.get('wardSearch').value.toLowerCase())).filter(value => value.facility_id === this.addWearableForm.get('facility_id').value)
  }
  customerList = [];
  getCustomer() {
    this.http.get(`${environment.apiUrlNew}/customers/get/`,{headers:this.header}).subscribe((customers: any) => {
      if (customers.itemCount > 0) {
        this.customerList = customers.body.map(value => {
          return {
            customer_name: value.details.customer_name,
            customer_id: value.details.customer_id,
          }
        }).sort((a: any, b: any) => {
          return a.customer_name > b.customer_name ? 1 : -1;
        });
      }
    });
  }

  facilityList = [];
  getFacility() {
    this.http.get(`${environment.apiUrlNew}/facilities/get/`,{headers:this.header}).subscribe((facilities: any) => {
      if (facilities.itemCount > 0) {
        this.facilityList = facilities.body.map(value => {
          return {
            facilityName: value.details.facility_name,
            facilityId: value.details.facility_id,
            customerId: value.details.customer_id,
            facilityAdmin: value.details.facility_admin,
            facilityAdminid: value.details.facility_adminid
          }
        }).sort((a: any, b: any) => {
          return a.facilityName > b.facilityName ? 1 : -1;
        });
      }
    })
  }


  getFilterFacilities() {
    if (this.dialogType === 'Add new ward') {
      if (this.addWardForm.get('customer_name').value !== '') {


        return this.facilityList.filter(value => value.facilityName.toLowerCase().includes(this.addWardForm.get('facilitySearch').value.toLowerCase())).filter(value => value.customerId === this.addWardForm.get('customer_name').value)
      }
    } else if (this.dialogType === 'Add new wearable') {
      if (this.addWearableForm.get('customer_id').value !== '') {
        return this.facilityList.filter(value => value.facilityName.toLowerCase().includes(this.addWearableForm.get('facilitySearch').value.toLowerCase())).filter(value => value.customerId === this.addWearableForm.get('customer_id').value)
      }
    } else if (this.dialogType === 'Add new facility admin') {
      if (this.facilityAdminForm.get('customer').value !== '') {
        return this.facilityList.filter(value => value.facilityName.toLowerCase().includes(this.facilityAdminForm.get('facilitySearch').value.toLowerCase())).filter(value => value.customerId === this.facilityAdminForm.get('customer').value)
      }
    } else if (this.dialogType === 'Add new ward admin') {
      if (this.wardAdminForm.get('customer').value !== '') {
        return this.facilityList.filter(value => value.facilityName.toLowerCase().includes(this.wardAdminForm.get('facilitySearch').value.toLowerCase())).filter(value => value.customerId === this.wardAdminForm.get('customer').value)
      }
    } else if (this.dialogType === 'Add new caregiver user') {
      if (this.caregiverForm.get('customer').value !== '') {
        return this.facilityList.filter(value => value.facilityName.toLowerCase().includes(this.caregiverForm.get('facilitySearch').value.toLowerCase())).filter(value => value.customerId === this.caregiverForm.get('customer').value)
      }
    }
  }

  role: string = 'select';
  getRole() {
    return this.role;
  }
  getNewCaregiver() {
    this.http.get(`${environment.apiUrlNew}/caregivers/get/`,{headers:this.header}).subscribe((data: any) => {
      this.careGiversList = data.body.map(value => {
        return {
          id: value.details.caregiver_id,
          name: `${value.details.caregiver_firstName} ${value.details.caregiver_lastName}`,
          facility_id: value.details.facility_id,
          customer_id: value.details.customer_id,
          assigned_wards: value.details.assigned_wards,
        }
      }).sort((a: any, b: any) => {
        return a.name > b.name ? 1 : -1;
      })
    })
  }
  questionnaire = ['Add stay independent', 'Add down fall risk index'];
  disable: boolean = true;
  downFallQuestions: any;
  stayQuestions: any;
  getDownFallValues(values: any, type: string) {
    this.disable = !values.disable;
    let user: any = localStorage.getItem('loggedInUser');
    if (user) {
      user = JSON.parse(user);
    }
    if (type === 'down fall') {
      this.downFallQuestions = {
        created_by: user.caregiver_id,
        resident_id: '',
        questionnaire_id: `${Math.round((Math.pow(36, 15 + 1) - Math.random() * Math.pow(36, 15))).toString(36).slice(1)}`,
        questionnaire_type: "Downton Fall Risk Index",
        questionnaire_score: values.risk,
        questions: [...values.questions]
      }
    } else {
      this.stayQuestions = {
        created_by: user.caregiver_id,
        resident_id: '',
        questionnaire_id: `${Math.round((Math.pow(36, 15 + 1) - Math.random() * Math.pow(36, 15))).toString(36).slice(1)}`,
        questionnaire_type: "Stay Independent",
        questionnaire_score: values.risk,
        questions: [...values.questions]
      };
    }
  }
  generateP(str: string, length: number) {
    let pass = '';
    for (let i = 1; i <= length; i++) {
      let char = Math.floor(Math.random() * str.length + 1);
      pass += str.charAt(char)
    }
    return pass;
  }
  getCustomerName(id: any) {
    return this.customerList.find(value => value.customer_id === id).customer_name;
  }
  getFacilityName(id: any) {
    return this.facilityList.find(value => value.facilityId === id).facilityName;
  }
  getFacilityValue(id: any) {
    return this.facilityList.find(value => value.facilityId === id);
  }
  isLoading = false;
  calculateQues(scoreValue: Number) {
    let value = '';
    if (_LODASH.inRange(scoreValue, 0, 3))
      value = 'Normal';
    // else if( _LODASH.inRange(scoreValue,2,5))
    //   value = 'Medium Risk';
    else
      value = 'High';
    return value;
  }
  updateCaregiverWards = [];
  doAction() {
    this.disable = true;
    this.isLoading = true;
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890/;[]\=-)(*&^%$#@!~";
    const lengthOfCode = 10
    const password = this.generateP(possible, lengthOfCode);
    if (this.dialogType === 'Add downton fall risk index') {
      let DowntonFallRiskIndexBody = this.downFallQuestions;
      DowntonFallRiskIndexBody.resident_id = this.data.userId;
      this.http.post(`${environment.apiUrlNew}/nursing/questionnaries/post`, DowntonFallRiskIndexBody,{headers:this.header}).subscribe((data) => {
        this.toastr.success('<div class="action-text"><span class="font-400">Questionnaires are Successfully Added</span></div><div class="action-buttons"></div>', "", {
          timeOut: 2000,
          progressBar: true,
          enableHtml: true,
          closeButton: false,
        });
        const user = JSON.parse(localStorage.getItem('loggedInUser'));
        const notificationBody = {
          resident_id: this.data.userId,
          resident_name: `${this.data.firstName} ${this.data.lastName}`,
          contents: [
            {
              date: new Date(),
              action: `${this.data.firstName} ${this.data.lastName} completed the Downton fall risk index questionnaire`,
            },
            {
              date: new Date(),
              action: `The result indicates ${this.calculateQues(this.downFallQuestions.questionnaire_score)} risk (${this.downFallQuestions.questionnaire_score} points)`
            },
            {
              date: new Date(),
              action: `${user.first_name} ${user.last_name} initiated the questionnaire for ${this.data.firstName} ${this.data.lastName}`
            }
          ]
        }
        this.http.post(`${environment.apiUrlNew}/notifications/post/`, {
          resident_id: this.data.userId,
          "notification_id": `${Math.round((Math.pow(36, 15 + 1) - Math.random() * Math.pow(36, 15))).toString(36).slice(1)}`,
          "customer_id": user.customers.customer_id,
          "facility_id": user.facilities[0].facility_id,
          "ward_id": this.data.wardId,
          "notification_category": "Dashboard",
          "notification_type": 'Questionnaire',
          "notification_class": "Success",
          "notification_body": notificationBody
        },{headers:this.header}).subscribe(() => { })
        this.common.eventEmit(true);
        this.dialogRef.close(true);
      });
    } else if (this.dialogType === 'Add stay independent') {
      let stayIndependent = this.stayQuestions;
      stayIndependent.resident_id = this.data.userId;
      this.http.post(`${environment.apiUrlNew}/nursing/questionnaries/post`, stayIndependent,{headers:this.header}).subscribe((data) => {
        this.toastr.success('<div class="action-text"><span class="font-400">Questionnaires are Successfully Added</span></div><div class="action-buttons"></div>', "", {
          timeOut: 2000,
          progressBar: true,
          enableHtml: true,
          closeButton: false,
        });
        const user = JSON.parse(localStorage.getItem('loggedInUser'));
        const notificationBody = {
          resident_id: this.data.userId,
          resident_name: `${this.data.firstName} ${this.data.lastName}`,
          contents: [
            {
              date: new Date(),
              action: `${this.data.firstName} ${this.data.lastName} completed the stay independent questionnaire`,
            },
            {
              date: new Date(),
              action: `The result indicates ${this.calculateQues(this.stayQuestions.questionnaire_score)} risk (${this.stayQuestions.questionnaire_score} points)`
            },
            {
              date: new Date(),
              action: `${user.first_name} ${user.last_name} initiated the questionnaire for ${this.data.firstName} ${this.data.lastName}`
            }
          ]
        }
        this.http.post(`${environment.apiUrlNew}/notifications/post/`, {
          resident_id: this.data.userId,
          "notification_id": `${Math.round((Math.pow(36, 15 + 1) - Math.random() * Math.pow(36, 15))).toString(36).slice(1)}`,
          "customer_id": user.customers.customer_id,
          "facility_id": user.facilities[0].facility_id,
          "ward_id": this.data.wardId,
          "notification_category": "Dashboard",
          "notification_type": 'Questionnaire',
          "notification_class": "Success",
          "notification_body": notificationBody
        },{headers:this.header}).subscribe(() => { })
        this.common.eventEmit(true);
        this.dialogRef.close(true)
      })
    } else if (this.dialogType === 'Edit medications') {
      this.updatePreExisting()
    } else if (this.dialogType === 'Add new ward') {
      const phoneNumbers = this.addWardForm.get('contactPhone').value.map(value => {
        return `${value.ext} ${value.phone}`;
      })
      const caregivers = this.getCaregiver(this.addWardForm.get('caregiverUserid').value);
      const postData = {
        customer_id: this.addWardForm.get('customer_name').value,
        customer_name: this.getCustomerName(this.addWardForm.get('customer_name').value),
        facility_id: this.addWardForm.get('facilityName').value,
        facility_name: this.getFacilityName(this.addWardForm.get('facilityName').value),
        ward_id: `${Math.round((Math.pow(36, 15 + 1) - Math.random() * Math.pow(36, 15))).toString(36).slice(1)}`,
        ward_name: this.addWardForm.get('name').value,
        manager_id: this.addWardForm.get('wardManager').value,
        manager_name: this.addWardForm.get('wardManager').value !== '' ? this.getWardManager(this.addWardForm.get('wardManager').value).managername : '',
        caregivers,
        ward_number: phoneNumbers.toString()
      }
      const range = this.rangeValues('month');
      const dates = [];
      range.forEach(time => {
        const date = moment(new Date(this.startDate)).add(time, 'days').format();
        dates.push(new Date(date));
      })
      const apiCalls = [];
      this.http.post(`${environment.apiUrlNew}/wards/post/`, postData,{headers:this.header}).subscribe((data: any) => {
        dates.forEach(date => {
          const post = this.prepareData(date, postData.customer_id, postData.facility_id, postData.ward_id);

         // apiCalls.push(this.http.post(`${environment.apiUrlNew}/kpi/post/`, post))
        })
        forkJoin(apiCalls).subscribe((data: any) => { console.log(data[0].message) })
        const apiCallWards = [];
        caregivers.forEach(data => {
          const exists = this.caregiverUserIds.includes(data.userid);
          if (exists) {
            const assignedWards = this.careGiversList.find(val => val.id == data.userid).assigned_wards;
            const exist = assignedWards.find(val => val.ward_id === this.data.wardId)
            if (!exist) {
              assignedWards.push({
                ward_id: postData.ward_id,
                ward_name: this.addWardForm.get('name').value
              })
            }
            this.updateCaregiverWards.push({
              caregiver_id: data.userid,
              assigned_wards: assignedWards
            })
            apiCallWards.push(this.http.put(`${environment.apiUrlNew}/caregivers/update-wards/`, {
              caregiver_id: data.userid,
              assigned_wards: assignedWards
            },{headers:this.header}))
          } else {
            const assignedWards = this.careGiversList.find(val => val.id == data.userid).assigned_wards;
            this.updateCaregiverWards.push({
              caregiver_id: data,
              assigned_wards: assignedWards.filter(val => val.ward_id !== this.data.wardId)
            })
            apiCallWards.push(this.http.put(`${environment.apiUrlNew}/caregivers/update-wards/`, {
              caregiver_id: data.userid,
              assigned_wards: assignedWards.filter(val => val.ward_id !== this.data.wardId)
            },{headers:this.header}))
          }
        })
        if (apiCallWards.length > 0) {
          forkJoin(apiCallWards).subscribe((ward) => {
            this.toastr.success(`<div class="action-text"><span class="font-400">${data.message}</span></div><div class="action-buttons"></div>`, "", {
              timeOut: 2000,
              progressBar: true,
              enableHtml: true,
              closeButton: false,
            });
            this.dialogRef.close(true);
          })
        } else {
          this.toastr.success(`<div class="action-text"><span class="font-400">${data.message}</span></div><div class="action-buttons"></div>`, "", {
            timeOut: 2000,
            progressBar: true,
            enableHtml: true,
            closeButton: false,
          });
          this.dialogRef.close(true);
        }
      }, (error) => {
        console.log(error);
      });
    } else if (this.dialogType === 'Add new caregiver') {
      const assigned_wards = [];
      this.wardIds.forEach((item) => {
        let ward = this.getWard(item);
        assigned_wards.push({
          ward_id: item,
          ward_name: ward.name
        })
      });
      const id = `${Math.round((Math.pow(36, 15 + 1) - Math.random() * Math.pow(36, 15))).toString(36).slice(1)}`;
      const post = {
        "caregiver_id": id,
        "customer_id": this.addCaregiverForm.get('customer').value,
        "customer_name": this.getCustomerName(this.addCaregiverForm.get('customer').value),
        "facility_id": this.addCaregiverForm.get('facility').value,
        "facility_name": this.getFacilityName(this.addCaregiverForm.get('facility').value),
        "caregiver_firstName": this.addCaregiverForm.get('firstName').value,
        "caregiver_lastName": this.addCaregiverForm.get('lastName').value,
        "caregiver_email": this.addCaregiverForm.get('caregiverEmail').value,
        "caregiver_phone": `${this.addCaregiverForm.get('ext').value} ${this.addCaregiverForm.get('caregiverPhoneNumber').value}`,
        assigned_wards
      }
      const postData = {
        username: this.addCaregiverForm.value.username,
        user_type: "Caregiver",
        first_name: this.addCaregiverForm.get('firstName').value,
        last_name: this.addCaregiverForm.get('lastName').value,
        email: this.addCaregiverForm.get('caregiverEmail').value,
        phone_number: `${this.addCaregiverForm.get('ext').value} ${this.addCaregiverForm.get('caregiverPhoneNumber').value}`,
        login_enabled: "Yes",
        customers: this.getOrganization(this.addCaregiverForm.get('customer').value),
        customer_id: this.getOrganization(this.addCaregiverForm.get('customer').value).customer_id,
        facilities: [{
          facility_id: this.getFacilityValue(this.addCaregiverForm.get('facility').value).facilityId,
          facility_name: this.getFacilityValue(this.addCaregiverForm.get('facility').value).facilityName
        }],
        facility_id: this.getFacilityValue(this.addCaregiverForm.get('facility').value).facilityId,
        wards: assigned_wards,
        caregiver_id: id,
        password: password,
        email_otp: password
      }

      this.http.post(`${environment.apiUrlNew}/caregivers/post/`, post,{headers:this.header}).subscribe((data: any) => {
        this.http.post(`${environment.apiUrlNew}/users/post/`, postData,{headers:this.header}).subscribe(() => {
          const apiCalls = [];
          this.wardIds.forEach(item => {
            let ward = this.getWard(item);
            const caregivers = ward.all.details.caregivers.map(val => {
              if (val.id) {
                return {
                  userid: val.id,
                  name: val.name
                }
              } else if (val.userid) {
                return {
                  userid: val.userid,
                  name: val.name
                }
              }
            })
            caregivers.push({
              userid: post.caregiver_id,
              name: `${post.caregiver_firstName} ${post.caregiver_lastName}`
            })
            let updateData = {
              ward_id: item,
              ward_name: ward.name,
              manager_id: ward.all.details.manager_id,
              manager_name: ward.all.details.manager_name,
              caregivers,
              ward_number: ward.all.details.ward_number
            };
            apiCalls.push(this.http.put(`${environment.apiUrlNew}/wards/put/`, updateData,{headers:this.header}))
          })
          if (apiCalls.length > 0) {
            forkJoin(apiCalls).subscribe(() => {
              this.toastr.success(`<div class="action-text"><span class="font-400">${data.message}</span></div><div class="action-buttons"></div>`, "", {
                timeOut: 2000,
                progressBar: true,
                enableHtml: true,
                closeButton: false,
              });
              this.dialogRef.close(true)
            })
          } else {
            this.toastr.success(`<div class="action-text"><span class="font-400">${data.message}</span></div><div class="action-buttons"></div>`, "", {
              timeOut: 2000,
              progressBar: true,
              enableHtml: true,
              closeButton: false,
            });
            this.dialogRef.close(true)
          }
        })
      }, (err) => {
        this.isLoading = false;
        this.toastr.error(`<div class="action-text"><span class="font-400">${err.error.message}</span></div><div class="action-buttons"></div>`, "", {
          timeOut: 2000,
          progressBar: true,
          enableHtml: true,
          closeButton: false,
        });
      })
    } else if (this.dialogType === 'Import rooms') {
      let body = {
        // "OrgUId": this.auth.userInfo["custom:org_unit_id"],
        "Rooms": []
      };
      this.records.forEach((record) => {
        body.Rooms.push({
          "ward_number": this.data.wardId,
          "name": record.name
        });
      })
      // this.commonHttp.builkCreateRoom(body).subscribe((data) => {
      //   this.toastr.success('<div class="action-text"><span class="font-400">Rooms are Successfully Added</span></div><div class="action-buttons"></div>', "", {
      //     timeOut: 2000,
      //     progressBar: true,
      //     enableHtml: true,
      //     closeButton: false,
      //   });
      //   this.common.eventEmit({ page: "room" });
      //   this.dialogRef.close(true);
      // });
    } else if (this.dialogType === 'Add new facility') {
      const dbPostData = {
        customer_id: this.addFacilityForm.get('customer_name').value,
        customer_name: this.getOrganization(this.addFacilityForm.get('customer_name').value).customer_name,
        facility_id: `${Math.round((Math.pow(36, 15 + 1) - Math.random() * Math.pow(36, 15))).toString(36).slice(1)}`,
        facility_name: this.addFacilityForm.get('facilityName').value,
        facility_address: this.addFacilityForm.get('facilityAddress').value,
        facility_admin: this.addFacilityForm.get('facilityAdmin').value !== "" ? this.getFacilityAdmin(this.addFacilityForm.get('facilityAdmin').value).facilityAdmin : '',

        //  facility_adminid: this.addFacilityForm.get('facilityAdmin').value !== "" ? this.getManager(this.addFacilityForm.get('facilityAdmin').value).facilityAdmin : '',
        facility_adminid: this.addFacilityForm.get('facilityAdmin').value,
        total_wards: this.addFacilityForm.get('wardCount').value,
      }
      this.http.post(`${environment.apiUrlNew}/facilities/post/`, dbPostData,{headers:this.header}).subscribe(data => {
        this.toastr.success(`<div class="action-text"><span class="font-400">Facility added successfully</span></div><div class="action-buttons"></div>`, "", {
          timeOut: 2000,
          progressBar: true,
          enableHtml: true,
          closeButton: false,
        });
        this.dialogRef.close(true);
      }, (err) => {
        this.toastr.error(`<div class="action-text"><span class="font-400">${err.error.message}</span></div><div class="action-buttons"></div>`, "", {
          timeOut: 2000,
          progressBar: true,
          enableHtml: true,
          closeButton: false,
        });
        this.dialogRef.close(false);
      })
    } else if (this.dialogType === 'Add new customer') {
      const dbPostData = {
        customer_id: `${Math.round((Math.pow(36, 15 + 1) - Math.random() * Math.pow(36, 15))).toString(36).slice(1)}`,
        customer_name: this.addCustomerForm.get('customer_name').value,
        customer_status: this.addCustomerForm.get('customer_status').value,
        customer_address: this.addCustomerForm.get('customerAddress').value,
        contact_firstname: this.addCustomerForm.get('firstName').value,
        contact_lastname: this.addCustomerForm.get('lastName').value,
        contact_email: this.addCustomerForm.get('email').value,
        contact_phone: `${this.addCustomerForm.get('ext').value} ${this.addCustomerForm.get('phoneNumber').value}`,
      }
      const userPostData = {
        username: `${this.addCustomerForm.get('username').value}`,
        user_type: "CA",
        first_name: this.addCustomerForm.get('firstName').value,
        last_name: this.addCustomerForm.get('lastName').value,
        email: this.addCustomerForm.get('email').value,
        phone_number: `${this.addCustomerForm.get('ext').value} ${this.addCustomerForm.get('phoneNumber').value}`,
        login_enabled: "Yes",
        customers: {
          customer_id: dbPostData.customer_id,
          customer_name: dbPostData.customer_name
        },
        customer_id: dbPostData.customer_id,
        password: password,
        email_otp: password
      }
      this.http.post(`${environment.apiUrlNew}/users/post/`, userPostData,{headers:this.header}).subscribe((data: any) => {
       // console.log(data);
      })
      this.http.post(`${environment.apiUrlNew}/customers/post/`, dbPostData,{headers:this.header}).subscribe(data => {
        this.toastr.success(`<div class="action-text"><span class="font-400">Customer added successfully</span></div><div class="action-buttons"></div>`, "", {
          timeOut: 2000,
          progressBar: true,
          enableHtml: true,
          closeButton: false,
        });
        this.dialogRef.close(true);
      }, (err) => {
        this.toastr.error(`<div class="action-text"><span class="font-400">${err.error.text}</span></div><div class="action-buttons"></div>`, "", {
          timeOut: 2000,
          progressBar: true,
          enableHtml: true,
          closeButton: false,
        });
        this.dialogRef.close(false);
      })
    } else if (this.dialogType === 'Add new wearable') {
      const postData = {
        facility_id: this.addWearableForm.get('facility_id').value,
        ward_id: this.addWearableForm.get('ward_id').value,
        customer_id: this.addWearableForm.get('customer_id').value,
        wearable_id: this.addWearableForm.get('wearable_sno').value,
        wearable_status: 'Ready to use',
        wearable_sno: this.addWearableForm.get('wearable_sno').value,
        battery_status: '100',
        ward_name: this.getWard(this.addWearableForm.get('ward_id').value).name,
        facility_name: this.getFacilityName(this.addWearableForm.get('facility_id').value),
        customer_name: this.getCustomerName(this.addWearableForm.get('customer_id').value),
      }
      this.http.post(`${environment.apiUrlNew}/wearables/post/`, postData,{headers:this.header}).subscribe(data => {
        this.toastr.success(`<div class="action-text"><span class="font-400">Wearable added successfully</span></div><div class="action-buttons"></div>`, "", {
          timeOut: 2000,
          progressBar: true,
          enableHtml: true,
          closeButton: false,
        });
        this.dialogRef.close(true);
      }, (err) => {
        this.toastr.error(`<div class="action-text"><span class="font-400">${err.error.message}</span></div><div class="action-buttons"></div>`, "", {
          timeOut: 2000,
          progressBar: true,
          enableHtml: true,
          closeButton: false,
        });
        this.dialogRef.close(false);
      })
    } else if (this.dialogType === 'Add new customer admin') {
      const postData = {
        username: this.customerHqForm.value.username,
        user_type: "CA",
        first_name: this.customerHqForm.get('firstName').value,
        last_name: this.customerHqForm.get('lastName').value,
        email: this.customerHqForm.get('email').value,
        phone_number: `${this.customerHqForm.get('ext').value} ${this.customerHqForm.get('phoneNumber').value}`,
        login_enabled: "Yes",
        customers: this.getOrganization(this.customerHqForm.get('customer').value),
        caregiver_id: '',
        customer_id: this.getOrganization(this.customerHqForm.get('customer').value).customer_id,
        password: password,
        email_otp: password
      }
      this.http.post(`${environment.apiUrlNew}/users/post/`, postData,{headers:this.header}).subscribe((data: any) => {
        this.toastr.success(`<div class="action-text"><span class="font-400">${data.message}</span></div><div class="action-buttons"></div>`, "", {
          timeOut: 2000,
          progressBar: true,
          enableHtml: true,
          closeButton: false,
        });
        this.dialogRef.close(true);
      }, (err) => {
        this.toastr.error(`<div class="action-text"><span class="font-400">${err.error.text}</span></div><div class="action-buttons"></div>`, "", {
          timeOut: 2000,
          progressBar: true,
          enableHtml: true,
          closeButton: false,
        });
        this.dialogRef.close(false);
      })
    } else if (this.dialogType === 'Add new facility admin') {
      const postData = {
        username: this.facilityAdminForm.value.username,
        user_type: "FA",
        first_name: this.facilityAdminForm.get('firstName').value,
        last_name: this.facilityAdminForm.get('lastName').value,
        email: this.facilityAdminForm.get('email').value,
        phone_number: `${this.facilityAdminForm.get('ext').value} ${this.facilityAdminForm.get('phoneNumber').value}`,
        login_enabled: "Yes",
        customers: this.getOrganization(this.facilityAdminForm.get('customer').value),
        facilities: {
          facility_id: this.getFacilityValue(this.facilityAdminForm.get('facility').value).facilityId,
          facility_name: this.getFacilityValue(this.facilityAdminForm.get('facility').value).facilityName
        },
        customer_id: this.getOrganization(this.facilityAdminForm.get('customer').value).customer_id,
        facility_id: this.getFacilityValue(this.facilityAdminForm.get('facility').value).facilityId,
        caregiver_id: '',
        password: password,
        email_otp: password
      }
      this.http.post(`${environment.apiUrlNew}/users/post/`, postData,{headers:this.header}).subscribe((data: any) => {
        const adminfid = `${Math.round((Math.pow(36, 15 + 1) - Math.random() * Math.pow(36, 15))).toString(36).slice(1)}`;
        const dbPostData1 = {
          customer_id: this.getOrganization(this.facilityAdminForm.get('customer').value).customer_id,
          //customer_name: this.getOrganization(this.facilityAdminForm.get('customer_name').value).customer_name,
          facility_id: this.getFacilityValue(this.facilityAdminForm.get('facility').value).facilityId,
          facility_name: this.getFacilityValue(this.facilityAdminForm.get('facility').value).facilityName,
          facility_admin: this.facilityAdminForm.value.username,
          facility_adminid: adminfid,
        }
        this.http.post(`${environment.apiUrlNew}/facilities/fcilityadmin-put/`, dbPostData1,{headers:this.header}).subscribe(data => {
        })
        this.toastr.success(`<div class="action-text"><span class="font-400">${data.message}</span></div><div class="action-buttons"></div>`, "", {
          timeOut: 2000,
          progressBar: true,
          enableHtml: true,
          closeButton: false,
        });
        this.dialogRef.close(true);
      }, (err) => {
        this.toastr.error(`<div class="action-text"><span class="font-400">${err.error.text}</span></div><div class="action-buttons"></div>`, "", {
          timeOut: 2000,
          progressBar: true,
          enableHtml: true,
          closeButton: false,
        });
        this.dialogRef.close(false);
      })
    } else if (this.dialogType === 'Add new ward admin') {
      const id = `${Math.round((Math.pow(36, 15 + 1) - Math.random() * Math.pow(36, 15))).toString(36).slice(1)}`;
      const postData = {
        username: this.wardAdminForm.value.username,
        user_type: "WA",
        first_name: this.wardAdminForm.get('firstName').value,
        last_name: this.wardAdminForm.get('lastName').value,
        email: this.wardAdminForm.get('email').value,
        phone_number: `${this.wardAdminForm.get('ext').value} ${this.wardAdminForm.get('phoneNumber').value}`,
        login_enabled: "Yes",
        customers: this.getOrganization(this.wardAdminForm.get('customer').value),
        facilities: [{
          facility_id: this.getFacilityValue(this.wardAdminForm.get('facility').value).facilityId,
          facility_name: this.getFacilityValue(this.wardAdminForm.get('facility').value).facilityName
        }],
        customer_id: this.getOrganization(this.wardAdminForm.get('customer').value).customer_id,
        facility_id: this.getFacilityValue(this.wardAdminForm.get('facility').value).facilityId,
        wards: [{
          ward_id: this.getWard(this.wardAdminForm.get('ward').value).ward_number,
          ward_name: this.getWard(this.wardAdminForm.get('ward').value).name
        }],
        caregiver_id: '',
        password: password,
        email_otp: password
      }
      this.http.post(`${environment.apiUrlNew}/users/post/`, postData,{headers:this.header}).subscribe((data: any) => {
        const id = `${Math.round((Math.pow(36, 15 + 1) - Math.random() * Math.pow(36, 15))).toString(36).slice(1)}`;
        const dbPostData1 = {
          ward_id: this.getWard(this.wardAdminForm.get('ward').value).ward_number,
          ward_name: this.getWard(this.wardAdminForm.get('ward').value).name,
          manager_id: id,
          manager_name: this.wardAdminForm.value.username
        }
        this.http.post(`${environment.apiUrlNew}/wards/wardsadmin-put/`, dbPostData1,{headers:this.header}).subscribe(data => {
        })
        this.dialogRef.close(true);
      }, (err) => {
        this.toastr.error(`<div class="action-text"><span class="font-400">${err.error.text}</span></div><div class="action-buttons"></div>`, "", {
          timeOut: 2000,
          progressBar: true,
          enableHtml: true,
          closeButton: false,
        });
        this.dialogRef.close(false);
      })

    } else if (this.dialogType === 'Add new caregiver user') {
      const id = `${Math.round((Math.pow(36, 15 + 1) - Math.random() * Math.pow(36, 15))).toString(36).slice(1)}`;
      const postData = {
        username: this.caregiverForm.value.username,
        user_type: "Caregiver",
        first_name: this.caregiverForm.get('firstName').value,
        last_name: this.caregiverForm.get('lastName').value,
        email: this.caregiverForm.get('email').value,
        phone_number: `${this.caregiverForm.get('ext').value} ${this.caregiverForm.get('phoneNumber').value}`,
        login_enabled: "Yes",
        customers: this.getOrganization(this.caregiverForm.get('customer').value),
        facilities: [{
          facility_id: this.getFacilityValue(this.caregiverForm.get('facility').value).facilityId,
          facility_name: this.getFacilityValue(this.caregiverForm.get('facility').value).facilityName
        }],
        customer_id: this.getOrganization(this.caregiverForm.get('customer').value).customer_id,
        facility_id: this.getFacilityValue(this.caregiverForm.get('facility').value).facilityId,
        wards: this.userWardIds.map(value => {
          return {
            ward_id: this.getWard(value).ward_number,
            ward_name: this.getWard(value).name
          }
        }),
        caregiver_id: id,

        password: password,
        email_otp: password
      }
      
      
      const post = {
        "caregiver_id": id,
        "customer_id": this.caregiverForm.get('customer').value,
        "customer_name": this.getCustomerName(this.caregiverForm.get('customer').value),
        "facility_id": this.caregiverForm.get('facility').value,
        "facility_name": this.getFacilityName(this.caregiverForm.get('facility').value),
        "caregiver_firstName": this.caregiverForm.get('firstName').value,
        "caregiver_lastName": this.caregiverForm.get('lastName').value,
        "caregiver_email": this.caregiverForm.get('email').value,
        "caregiver_phone": `${this.caregiverForm.get('ext').value} ${this.caregiverForm.get('phoneNumber').value}`,
        assigned_wards: this.userWardIds.map(value => {
          return {
            ward_id: this.getWard(value).ward_number,
            ward_name: this.getWard(value).name
          }
        })
      }
      this.http.post(`${environment.apiUrlNew}/users/post/`, postData, {headers:this.header}).subscribe((data: any) => {

        this.http.post(`${environment.apiUrlNew}/caregivers/post/`, post,{headers:this.header}).subscribe(() => {
          const apiCalls = [];
          this.userWardIds.forEach(item => {
            let ward = this.getWard(item);
            const caregivers = ward.all.details.caregivers.map(val => {
              if (val.id) {
                return {
                  userid: val.id,
                  name: val.name
                }
              } else if (val.userid) {
                return {
                  userid: val.userid,
                  name: val.name
                }
              }
            })
            caregivers.push({
              userid: post.caregiver_id,
              name: `${post.caregiver_firstName} ${post.caregiver_lastName}`
            })
            let updateData = {
              ward_id: item,
              ward_name: ward.name,
              manager_id: ward.all.details.manager_id,
              manager_name: ward.all.details.manager_name,
              caregivers,
              ward_number: ward.all.details.ward_number
            };
            apiCalls.push(this.http.put(`${environment.apiUrlNew}/wards/put/`, updateData,{headers:this.header}))
          })
          
          forkJoin(apiCalls).subscribe(() => { })
          this.toastr.success(`<div class="action-text"><span class="font-400">${data.message}</span></div><div class="action-buttons"></div>`, "", {
            timeOut: 2000,
            progressBar: true,
            enableHtml: true,
            closeButton: false,
          });
          this.dialogRef.close(true);
        }, (err) => {
          this.toastr.error(`<div class="action-text"><span class="font-400">${err.error.text}</span></div><div class="action-buttons"></div>`, "", {
            timeOut: 2000,
            progressBar: true,
            enableHtml: true,
            closeButton: false,
          });
          this.dialogRef.close(false);
        })
      })
    } else if (this.dialogType === 'Add new room') {
      const apiCalls = [];
      this.rooms.controls.forEach(room => {
        const postData = {
          "room_id": `${Math.round((Math.pow(36, 15 + 1) - Math.random() * Math.pow(36, 15))).toString(36).slice(1)}`,
          "room_name": room.value.roomNumber,
          "customer_id": this.data.customer_id,
          "facility_id": this.data.facility_id,
          "ward_id": this.data.ward_id,
          "beds_count": room.value.totalBedsAvailable
        };
        apiCalls.push(this.http.post(`${environment.apiUrlNew}/rooms/post/`, postData,{headers:this.header}));
      })
      forkJoin(apiCalls).subscribe((data: any) => {
        this.toastr.success(`<div class="action-text"><span class="font-400">${data[0].message}</span></div><div class="action-buttons"></div>`, "", {
          timeOut: 2000,
          progressBar: true,
          enableHtml: true,
          closeButton: false,
        });
        this.dialogRef.close(true);
      }, (err) => {
        this.toastr.error(`<div class="action-text"><span class="font-400">${err.error.text}</span></div><div class="action-buttons"></div>`, "", {
          timeOut: 2000,
          progressBar: true,
          enableHtml: true,
          closeButton: false,
        });
        this.dialogRef.close(false);
      })
    } else if (this.dialogType === 'Change password') {
      this.header='ODkxZmQ1MzExMGVjYWU3ZTA3ZTkzYWMzMmI2NmYxMGE1OWIxYjBmYTNiYzg4MDRkNTMzYjA1ODU1NWM4ZDhlNDEyZDU3NjQxNDBkMjdkOWEwZTIzMzNjMzFhMGU5ODlmYjcwZTkwMGY2N2Y2YzA0ZDc3NmY3M2IwZDc4YmQ5N2YxNjQxNTQ4MjY0';
      const user = JSON.parse(localStorage.getItem('loggedInUser'))
      this.http.put(`${environment.apiUrlNew}/users/password/`, {
        username: user.username,
        password: this.password
      },{headers:this.header}).subscribe(data => {
        this.toastr.success(`<div class="action-text"><span class="font-400">${data}</span></div><div class="action-buttons"></div>`, "", {
          timeOut: 2000,
          progressBar: true,
          enableHtml: true,
          closeButton: false,
        });
        this.dialogRef.close(true);
      })
    }

  }
  getMonthly(month: number, year: number) {
    const range = [];
    const startDate = new Date(new Date(new Date(new Date(new Date(new Date().setSeconds(0)).setMinutes(0)).setHours(0)).setDate(1)).setMonth(month)).setFullYear(year);
    const lastDay = this.getLastDate(month, year);
    for (let i = 0; i < lastDay; i++) {
      range.push(i);
    }
    const monthData = {
      range,
      startDate
    }
    return monthData;
  }
  todayMonth = new Date().getMonth();
  presentYear = new Date().getFullYear();
  getLastDate(month: number, year: number) {
    if (month === this.todayMonth && year === this.presentYear) {
      return new Date(new Date().setDate(new Date().getDate() - 1)).getDate();
    }
    return this.month31.includes(this.months[month]) ? 31 : month === 1 ? this.leapYear(year) : 30
  }
  leapYear(year: number) {
    if (year % 4 === 0 && year % 100 !== 0) {
      return 29;
    } else if (year % 4 === 0 && year % 100 === 0) {
      if (year % 400 === 0) {
        return 29;
      } else {
        return 28;
      }
    } else {
      return 28;
    }
  }
  months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  month31 = ["January", "March", "May", "July", "August", "October", "December"]
  startDate = new Date();
  rangeValues(interval: string) {
    let range = [];
    const year = new Date().getFullYear();
    const month = new Date().getMonth();
    const monthData = this.getMonthly(month, year);
    this.startDate = new Date(monthData.startDate);
    range = monthData.range;
    return range;
  }
  getRndInteger(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  prepareData(date: any, customer: string, facility: string, ward: string) {
    const fallActivity = `${this.getRndInteger(1, 3)}`;
    const nightWalkActivity = `${this.getRndInteger(1, 3)}`;
    const criticalLowBatteryActivity = `${this.getRndInteger(1, 3)}`;
    const screenTimeUsage = `${this.getRndInteger(35, 50)}`;
    const residentProfileViewed = `${this.getRndInteger(5, 10)}`;
    const uniqueProfileViewed = `${this.getRndInteger(1, 4)}`;
    const NRTFallActivity = `${this.getRndInteger(60, 300)}`;
    const NRTNightWalkActivity = `${this.getRndInteger(60, 300)}`;
    const NRTCriticalLowActivity = `${this.getRndInteger(300, 3000)}`;
    const wearablesInUse = `${this.getRndInteger(20, 50)}`;
    const wearablesNotInUse = `${this.getRndInteger(10, 40)}`;
    const wearablesReadyToUse = `${this.getRndInteger(1, 5)}`;
    const BSTimeOnCharger = `${this.getRndInteger(60, 200)}`;
    const BSMaxTimeToResident = `${this.getRndInteger(40, 200)}`;
    const RSQuestionnaire = `${this.getRndInteger(1, 2)}`;
    const RSPhysioTest = `${this.getRndInteger(1, 2)}`;
    const postData = {
      customer_id: customer,
      facility_id: facility,
      ward_id: ward,
      ScreenTimeUsage: screenTimeUsage,
      ResidentProfilesViewed: residentProfileViewed,
      UniqueProfilesViewed: uniqueProfileViewed,
      FallActivity: fallActivity,
      NightWalkActivity: nightWalkActivity,
      CriticallyLowBattery: criticalLowBatteryActivity,
      NRT_FallActivity: NRTFallActivity,
      NRT_NightWalkActivity: NRTNightWalkActivity,
      NRT_CriticallyLowActivity: NRTCriticalLowActivity,
      wearables_InUse: wearablesInUse,
      wearables_NotInUse: wearablesNotInUse,
      wearables_ReadyToUse: wearablesReadyToUse,
      battery_TimeOnCharger: BSTimeOnCharger,
      battery_MaxTimeToResident: BSMaxTimeToResident,
      Questionnaires_performed: RSQuestionnaire,
      PhysioTests_performed: RSPhysioTest,
      totalFalls: parseInt(fallActivity) * 5,
      summary: {
        fallActivity,
        nightWalkActivity,
        criticalLowBatteryActivity,
        screenTimeUsage,
        residentProfileViewed,
        uniqueProfileViewed,
        NRTFallActivity,
        NRTNightWalkActivity,
        NRTCriticalLowActivity,
        wearablesInUse,
        wearablesNotInUse,
        wearablesReadyToUse,
        BSTimeOnCharger,
        BSMaxTimeToResident,
        RSQuestionnaire,
        RSPhysioTest,
      },
      timestamp: new Date(date).getTime(),
      Rdate: moment(date).format('YYYY-MM-DD')
    };
    return postData;
  }
  medicationData: any;
  medicationId: any;
  getMedication(medication: any) {
    this.medicationData = medication.data;
    this.prevMedication = medication.prevQuestions;
    this.medicationId = medication.id;
  }

  getWard(ward_number: string) {
    return this.wardList.find(it => it.ward_number === ward_number)
  }

  getCaregiver(caregiverId) {
    const returnValue = []
    caregiverId.forEach(value => {
      if (value !== "select") {
        let { name, id } = this.careGiversList.find(it => it.id === value)
        returnValue.push({ name, userid: id });
      }
    });
    return returnValue
  }

  getManager(caregiverId: string) {
    return this.careGiversList.find(it => it.id === caregiverId)
  }
  getFacilityAdmin(id: string) {
    return this.facilityList.find(it => it.facilityAdminid === id)
  }
  getOrganization(id: string) {
    return this.customerList.find(it => it.customer_id === id)
  }
  getWardManager(id: string) {
    return this.wardList.find(it => it.managerid === id)
  }
  getMobile(mobiles: any[]) {
    return mobiles.map(mobile => {
      return `${mobile.ext}${mobile.phone}`
    })
  }

  close() {
    this.data = this.previousValues;
    this.dialogRef.close();
  }

  updatePreExisting() {
    let PreExistingConditions = {
      resident_id: this.data.userId,
      medical_history: this.medicationData
    };
    this.http.get(`${environment.apiUrlNew}/residents/summary/?resident_id=${this.data.userId}`,{headers:this.header}).subscribe((data: any) => {
      const residentData = data;
      const date = new Date();
      const notificationBody: any = {
        resident_id: this.data.userId,
        resident_name: `${data.GeneralInformation.first_name} ${data.GeneralInformation.last_name}`,
        contents: [
          {
            date: date,
            action: `${data.GeneralInformation.first_name} ${data.GeneralInformation.last_name}'s profile has been updated`
          },
          {
            date: date,
            action: 'Following details has been updated',
          },
          {
            action: 'Previous medications:',
          },
          {
            action: this.prevMedication.filter(val => val.answerValue).map(val => val.question).join(", ")
          },
          {
            action: 'Updated medications:',
          },
          {
            action: this.medicationData.questions.filter(val => val.answerValue).map(val => val.question).join(", ")
          }
        ]
      }
      this.http.put(`${environment.apiUrlNew}/residents/update-medication/`, PreExistingConditions,{headers:this.header}).subscribe((data) => {
        this.dialogRef.close(true)
        this.http.post(`${environment.apiUrlNew}/notifications/post/`, {
          "resident_id": this.data.userId,
          "notification_id": `${Math.round((Math.pow(36, 15 + 1) - Math.random() * Math.pow(36, 15))).toString(36).slice(1)}`,
          "customer_id": residentData.meta.customer_id,
          "facility_id": residentData.meta.facility_id,
          "ward_id": residentData.WardInformation.ward_id,
          "notification_category": "Dashboard",
          "notification_type": 'ResidentUpdated',
          "notification_class": "Success",
          "notification_body": notificationBody
        },{headers:this.header}).subscribe(() => { })
      })
    })
  }
  password = '';
  getPassword(event: any) {
    this.password = event;
  }

  handleFAddressChange(event: any) {
    this.addFacilityForm.get('facilityAddress').setValue(event.formatted_address);
  }
  handleCAddressChange(event: any) {
    this.addCustomerForm.get('customerAddress').setValue(event.formatted_address);
  }
  validate() {
    if (this.dialogType === 'Add downton fall risk index' ||
      this.dialogType === 'Add stay independent') {
      return this.disable
    } else if (this.dialogType === 'Change password') {
      return this.password === ''
    } else if (this.dialogType === 'Edit medications') {
      return false;
    } else if (this.dialogType === 'Add new ward') {
      return !(this.addWardForm.valid) || this.isLoading || this.checkWardExists();
    } else if (this.dialogType === 'Add new caregiver') {
      return !(this.addCaregiverForm.valid) || this.wardIds.filter(value => value !== '').length < 1 || this.isLoading;
    } else if (this.dialogType === 'Import rooms') {
      return !(this.records.length && !this.disable);
    } else if (this.dialogType === 'Add new room') {
      return this.rooms.length < 1 || this.isLoading;
    } else if (this.dialogType === 'Add new facility') {
      return (this.addFacilityForm.invalid || this.checkFacilityExists()) || this.isLoading;
    } else if (this.dialogType === 'Add new customer') {
      return this.addCustomerForm.invalid || this.checkCustomerExists() || this.isLoading;
    } else if (this.dialogType === 'Add new wearable') {
      return this.addWearableForm.invalid || this.isLoading || this.checkWearableExists();
    } else if (this.dialogType === 'Add new customer admin') {
      return this.customerHqForm.invalid || this.isLoading
    } else if (this.dialogType === 'Add new facility admin') {
      return this.facilityAdminForm.invalid || this.isLoading
    } else if (this.dialogType === 'Add new ward admin') {
      return this.wardAdminForm.invalid || this.isLoading
    } else if (this.dialogType === 'Add new caregiver user') {
      return this.caregiverForm.invalid || this.isLoading || this.userWardIds.filter(value => value !== '').length < 1
    }
  }
}
