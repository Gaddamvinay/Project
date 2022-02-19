import { Component, OnInit,ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import * as moment from "moment";
import * as _LODASH from "lodash";
import { concat, forkJoin, Observable, of } from 'rxjs';
import { CustomValidators } from '../../../shared/custom-validators';
import { DatePipe } from '@angular/common';
import {environment as ENV, environment } from '../../../../environments/environment';
import { CommonService } from '../../../shared/services/common.service';
import { CommonHttpService } from '../../../shared/services/http-services/common-http.service';
import { ActivatedRoute } from '@angular/router';
import { ResidentService } from '../../../caregiver/residents/resident.service';
import { TokenStorageServiceService } from '../../../auth/login/token-storage-service.service';

@Component({
  selector: 'app-send-commands',
  templateUrl: './send-commands.component.html',
  styleUrls: ['./send-commands.component.css']
})
export class SendCommandsComponent implements OnInit {


  summaryForm: FormGroup;
  sendUserIDForm:FormGroup;
  sendRawDataForm:FormGroup;
  sendDateTimeForm:FormGroup;
  customer: string = 'select resident';
  residentDateTime:string='select resident';
  selectedTime:string='';
  facility: string = '';
  selectedDate:Date;
  selectDate:string;
  ward: string = '';
  rDate: Date;
  currentDate:String='';
 
  selectedRawDataDeviceId:string='';
  selectedDateTimeDeviceId:string='';
  selectedDeviceId:string='';
  interval: string = 'daily';
  customerC: string = '';
  facilityC: string = '';
  sheader:any;
  caregiver: string = '';
  residentR:string='select resident';
  rDateC: Date;
  facilityName:string=''
  intervalC: string = 'daily';
  today = new Date();
  addCaregiverForm: FormGroup;
  showOnly = false;
  extraFields=false;
  constructor(private tokenStorage: TokenStorageServiceService,private http: HttpClient,private router: Router,public datepipe: DatePipe,private datePipe: DatePipe, private _fb: FormBuilder, private routeActivate: ActivatedRoute,public common: CommonService,private commonHttp: CommonHttpService,private toastr: ToastrService, private route: ActivatedRoute,private residentService: ResidentService) {
    this.routeActivate.paramMap.subscribe(data => {
			this.showOnly = data.get('posting') === 'posting' ? true : false;
		});
   
  }
  enableFacility(value: any){
    if(value !== ''){
      this.addCaregiverForm.get('facility').enable();
    }
  }
  enableWard(value: any){
    if(value !== ''){
      this.addCaregiverForm.get('assignWard').enable();
    }
  }
  getSHeader(){
    let accessToken='ODkxZmQ1MzExMGVjYWU3ZTA3ZTkzYWMz7777MmI2NmYxMGE1OWIxYjBmYTNiYzg4MDRkNTMzYjA1ODU1NWM4ZDhlNDEyZDU3NjQxNDBkMjdkOWEwZTIzMzNjMzFhMGU5ODlmYjcwZTkwMGY2N2Y2YzA0ZDc3NmY3M2IwZDc4YmQ5N2YxNjQxNTQ4MjY0';
    this.sheader = new HttpHeaders().set(
      "x-access-token",
      accessToken
    );
  }
  getRndInteger(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
  }
  facilities: any[] = [];
  customers: any[] = [];
  wards: any[] = [];
  titleShow = false;
  ngOnInit(): void {
    this.getSHeader();
    this.http.get(`${environment.apiUrlNew}/wards/get/`,{headers:this.sheader}).subscribe((wards: any) => {
      if(wards.itemCount > 0){
        this.wards = wards.body.map(value => {
          return {
            id: value.details.ward_id,
            name: value.details.ward_name,
            facility_id: value.details.facility_id,
            customer_id: value.details.customer_id,
          }
        })
      }
    })
    this.http.get(`${environment.apiUrlNew}/customers/get/`,{headers:this.sheader}).subscribe((customers: any) => {
      if(customers.itemCount > 0){
        this.customers = customers.body.map(value => {
          return {
            id: value.details.customer_id,
            name: value.details.customer_name
          }
        })
      }
    })
    this.http.get(`${environment.apiUrlNew}/facilities/get/`,{headers:this.sheader}).subscribe((facilities: any) => {
      if(facilities.itemCount > 0){
        this.facilities = facilities.body.map(value => {
          return {
            id: value.details.facility_id,
            customer_id: value.details.customer_id,
            name: value.details.facility_name
          }
        })
      }
	})
	this.notifyCreateForm = this._fb.group({
		'resident': ['select resident'],
    'wearableId': ['', Validators.required],
		'notificationType': [this.notificationType[0].id]
	})
  this.sendUserIDForm = this._fb.group({
		'resident': ['select resident'],
    'wearableId': [{ value: '', disabled: true }],
		'notificationType': [this.notificationType[0].id]
	})
  this.sendRawDataForm = this._fb.group({
		'residentid': ['select resident'],
    'wearableId': [{ value: '', disabled: true }],
		'rawData': ['', Validators.required]
	})
  this.sendDateTimeForm = this._fb.group({
		'residentid': ['select resident'],
    'wearableId': [{ value: '', disabled: true }],
		'sendDate': [{ value: '', disabled: true }],
    'sendTime': [{ value: '', disabled: true }]
	})
	this.getResidents()
  this.getSHeader();
  this.http.get(`${environment.apiUrlNew}/caregivers/get/`,{headers:this.sheader}).subscribe((data: any) => {
		this.caregivers = data.body.map(value => {
			return {
				value : `${value.details.caregiver_firstName} ${value.details.caregiver_lastName}`,
				id: value.details.caregiver_id,
        facility: value.details.facility_id,
        customer: value.details.customer_id
			}
    })
	})
  }
  getResidents(){
    this.getSHeader();
    this.http.get(`${environment.apiUrlNew}/residents/get/`,{headers:this.sheader}).subscribe((data: any) => {
     
      this.residentNames = data.body.map(value => {
        return {
          value : `${value.GeneralInformation.first_name} ${value.GeneralInformation.last_name}`,
          shortName:value.GeneralInformation.nick_name,
          id: value.meta.resident_id,
          status: value.status.last_status,
          deviceId: value.WearableInformation.wearable_id,
          customer: value.meta.customer_id,
          facility: value.meta.facility_id,
          ward: value.WardInformation.ward_id,
          FWStatus: {
            fall_status: value.status.fall_status,
            nightwalk_status: value.status.nightwalk_status 
          }
        }
      })
    })
  }
  getNotificationResident(){
    return this.residentNames.filter(val => val.FWStatus.fall_status === 'false' && val.FWStatus.nightwalk_status === 'false')
  }
  getStatus(id: string){
	if(id){
		return this.residentNames.find(value => value.id === id)?.status;
	}else{	
		return ""
	}
  }

  getFilterFacilities(){
    return this.facilities.filter(value => value.customer_id === this.customer);
  }

  getFilterFacilitiesC(){
    return this.facilities.filter(value => value.customer_id === this.customerC);
  }
  getFilterWearables(){
    let selectedDeviceId='';
if(this.customer!='select resident'){
     selectedDeviceId=this.getDevice(this.customer);
     this.selectedDeviceId=this.getDevice(this.customer);
  }

    return selectedDeviceId;
  }

  getFilterWearablesIDRawData(){
    let selectedDeviceId='';
if(this.residentR!='select resident'){
     selectedDeviceId=this.getDevice(this.residentR);
     this.selectedRawDataDeviceId=this.getDevice(this.residentR);
  }

    return selectedDeviceId;
  }
  getFilterWearablesDateTimeData(){
    const currDate=new Date();
    this.selectedTime=this.datepipe.transform(currDate, 'HH:mm:ss');
    let selectedDeviceId='';
   if(this.residentDateTime!='select resident'){
     selectedDeviceId=this.getDevice(this.residentDateTime);
     this.currentDate = this.datePipe.transform(currDate, 'yyyy-MM-dd');
     this.selectedDateTimeDeviceId=this.getDevice(this.residentDateTime);
  }

   // return selectedDeviceId;
  }
  getFilterFacility(type?: string){
    return this.facilities.filter(value => value.customer_id === this.addCaregiverForm.get('customer').value);
  }

  getFilterWards(){
    return this.wards.filter(value => value.facility_id === this.facility);
  }
  getFilterCaregivers(){
    return this.caregivers.filter(value => value.facility === this.facilityC)
  }

  getFilterWard(type: string){
	const wards = this.wards;
	if(type === 'caregiver'){
		if(this.addCaregiverForm.get('facility').value === ''){
		  return wards.filter(value => value.name.toLowerCase().includes(this.addCaregiverForm.get('wardSearch').value.toLowerCase()));
		}
		return wards.filter(value => value.name.toLowerCase().includes(this.addCaregiverForm.get('wardSearch').value.toLowerCase()) || this.wardIds.includes(value.ward_number)).filter(value => value.facility_id === this.addCaregiverForm.get('facility').value)
	}
  }
  getDevice(id: string){
    return this.residentNames.find(val => val.id === id).deviceId
  }
  actperValues = [2,3,13];
  timeIntervals: string = '0-6';
  
  isLoading = false;
 
  caregivers: any[] = [];
  getMonthly(month: number, year: number){
    const range = [];
    const startDate = new Date(new Date(new Date(new Date(new Date(new Date().setSeconds(0)).setMinutes(0)).setHours(0)).setDate(1)).setMonth(month)).setFullYear(year);
    const lastDay = this.getLastDate(month, year);
    for(let i =0; i < lastDay; i++){
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
  getLastDate(month: number,year: number){
    if(month === this.todayMonth && year === this.presentYear){
      return new Date().getDate();
    }
    return this.month31.includes(this.months[month]) ? 31 : month === 1 ? this.leapYear(year): 30
  }
  leapYear(year: number){
    if(year% 4 === 0 && year%100 !== 0){
      return 29;
    }else if(year% 4 === 0 && year%100 === 0){
      if(year%400 === 0){
        return 29;
      }else {
        return 28;
      }
    }else{
      return 28;
    }
  }
  months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  month31 = ["January", "March", "May", "July", "August", "October", "December"]
  validateW(){
    return this.ward === '' || this.facility === '' || this.customer === '' || !this.rDate;
  }
  validateC(){
    return this.caregiver === '' || this.facilityC === '' || this.customerC === '' || !this.rDateC;
  }
  startDate = new Date();
  rangeValues(interval: string, type: string){
    let range = [];
    if(interval === 'weekly'){
      const weekly: any = {};
      const rDate = type === 'ward' ? this.rDate : this.rDateC;
      switch(rDate.getDay()){
        case 0:
          weekly.startDate = moment(rDate).format('X');
          weekly.endDate = moment(rDate).add(6,'days').add(23,'hours').add(59, 'minutes').format('X')
          break;
        case 1:
          weekly.startDate = moment(rDate).subtract(1, 'days').format('X');
          weekly.endDate = moment(rDate).add(5,'days').add(23,'hours').add(59, 'minutes').format('X')
          break;
        case 2:
          weekly.startDate = moment(rDate).subtract(2, 'days').format('X');
          weekly.endDate = moment(rDate).add(4,'days').add(23,'hours').add(59, 'minutes').format('X')
          break;
        case 3:
          weekly.startDate = moment(rDate).subtract(3, 'days').format('X');
          weekly.endDate = moment(rDate).add(3,'days').add(23,'hours').add(59, 'minutes').format('X')
          break;
        case 4:
          weekly.startDate = moment(rDate).subtract(4, 'days').format('X');
          weekly.endDate = moment(rDate).add(2,'days').add(23,'hours').add(59, 'minutes').format('X')
          break;
        case 5:
          weekly.startDate = moment(rDate).subtract(5, 'days').format('X');
          weekly.endDate = moment(rDate).add(1,'days').add(23,'hours').add(59, 'minutes').format('X')
          break;
        case 6:
          weekly.startDate = moment(rDate).subtract(6, 'days').format('X');
          weekly.endDate = moment(rDate).add(23,'hours').add(59, 'minutes').format('X')
          break;
      }
      this.startDate = new Date(parseInt(weekly.startDate) * 1000);
      range = [0,1,2,3,4,5,6]
    }else if(interval === 'monthly'){
      const rDate = type === 'ward' ? this.rDate : this.rDateC;
      const year = rDate.getFullYear();
      const month = rDate.getMonth()
      const monthData = this.getMonthly(month, year);
      this.startDate = new Date(monthData.startDate);
      range = monthData.range;
    }
    return range;
  }

  getWard(id: string){
    return this.wards.find(value => value.id == id)
  }

  getWards(type: string){
    let wards = [];
    wards = this.getFilterWard(type);
    if(this.wardIds.filter(value => value !== '').length > 0){
      const selectedUser = [];
      const notSelected = [];
      wards.forEach(value => {
        if(this.wardIds.includes(value.ward_number)){
          selectedUser.push(value)
        }else{
          notSelected.push(value);
        }
      })
      wards = [...selectedUser,...notSelected];
      return wards;
    }else{
      return wards;
    }
  }
  get wardIds(){
    if(this.addCaregiverForm.get('assignWard').value.length > 1){
      return this.addCaregiverForm.get('assignWard').value.filter(value => value !== '');
    }
    return this.addCaregiverForm.get('assignWard').value;
  }
  getFacility(id: string){
    return this.facilities.find(value => value.id === id).name
  }
  getCustomer(id: string){
    return this.customers.find(value => value.id === id).name
  }
	residentNames: {id: string, value: string,shortName:string, status: string, deviceId: string, customer: string, facility:string, ward: string, FWStatus: any}[] = [];
  notifyCreateForm: FormGroup;
  notificationType = [
		{
			id: 6,
			value: 'swfalldetection',
      label: 'Fall Alert',
      type: 'Fall',
		},
		{
			id: 14,
			value: 'NightWalkAlert',
      label: 'Night Walk Alert',
      type: 'Nightwalk'
		},
		 {
		  	id: 7,
		  	value: 'Battery empty',
       label: 'Critically Low battery',
      type: 'Battery'
		  },
		//  {
	 	// id: 13,
	 	// value: 'Battery full',
    // label: 'Full Battery',
    // type: 'Battery'
		// //  },
		//  {
		//   	id: 15,
		//   	value: 'Battery low',
    //     label: 'Low Battery',
    //     type: 'Battery'
    //  }
	]
	orgId = '';	
	mobileResident: string = 'select resident';
  fallArray = [];
  dashboardLoading = false;

  getResidentCustomer(id: string){
    return this.residentNames.find(val => val.id == id).customer
  }
  getResidentFacility(id: string){
    return this.residentNames.find(val => val.id == id).facility
  }
  getResidentWard(id: string){
    return this.residentNames.find(val => val.id == id).ward
  }
  /* Push a dashboard notification */
  getLabel(id: any){
    return this.notificationType.find(val => val.id === id).label
  }
  getType(id: any){
    return this.notificationType.find(val => val.id === id).type
  }
  sendUserID(){
	 // this.dashboardLoading = true;
    const residentId = this.sendUserIDForm.get('resident').value;
    const resident = this.residentNames.find(value => value.id === residentId).value;
    const device = this.residentNames.find(value => value.id === residentId).deviceId;
    const postData={
      "1" : residentId,
      "2":resident,
      "deviceID":device,
    }
    this.http.post(`${environment.apiUrlNew}/device/post`,postData,{headers:this.sheader}).subscribe(() => {
      this.getResidents();
      this.selectedDeviceId='';
      this.sendUserIDForm.patchValue({
        'resident': ['select resident'],
        'wearableId': [{ value: '', disabled: true }]
      })
			this.toastr.success(`<div class="action-text"><span class="font-400">Send User Id as command to device sucessfull</span></div>`, "", {
				timeOut: 5000,
				progressBar: true,
				enableHtml: true,
				closeButton: true,
			});
	  })
  }

  sendRawData(){
	//  this.dashboardLoading = true;
    this.selectedRawDataDeviceId='';
    const residentId = this.sendRawDataForm.get('residentid').value;
    const resident = this.residentNames.find(value => value.id === residentId).value;
    const device = this.residentNames.find(value => value.id === residentId).deviceId;
    const rawData= this.sendRawDataForm.get('rawData').value;
    const postData={
      "1" : residentId,
      "deviceID":device,
      "8":rawData,
    }
    this.http.post(`${environment.apiUrlNew}/deviceraw/post`,postData,{headers:this.sheader}).subscribe(() => {
      this.getResidents();
      this.selectedRawDataDeviceId='';
      // this.sendRawDataForm.patchValue({
      //   'residentid': ['select resident'],
      //   'wearableId': ['', Validators.required],
      //   'rawData': ['', Validators.required],
      // })
			this.toastr.success(`<div class="action-text"><span class="font-400">Send rawdata as command to device sucessfull</span></div>`, "", {
				timeOut: 5000,
				progressBar: true,
				enableHtml: true,
				closeButton: true,
			});
	  })
    
  }

  sendDateTime(){
    const currDate=new Date();
	  this.dashboardLoading = true;
  this.selectedDateTimeDeviceId='';
  const residentId = this.sendDateTimeForm.get('residentid').value;
  const resident = this.residentNames.find(value => value.id === residentId).value;
  const device = this.residentNames.find(value => value.id === residentId).deviceId;
  const dayOfWeek = currDate.getUTCDay();
const date=moment(currDate).utc().format("YYYY-MM-YY");
const senddate=this.currentDate.split("-").join("");
const sendtime=this.selectedTime.split(":").join("");
const dateTime="04"+""+senddate+""+"0"+dayOfWeek+""+sendtime;
  // const date= this.sendRawDataForm.get('date').value;
  // const time= this.sendRawDataForm.get('time').value;
  const postData={
    "1" : residentId,
    "deviceID":device,
    "4":dateTime,
  }
  this.http.post(`${environment.apiUrlNew}/device/postDate`,postData,{headers:this.sheader}).subscribe(() => {
    this.getResidents();
    this.selectedDateTimeDeviceId='';
    // this.sendDateTimeForm.patchValue({
    //   'residentid': ['select resident'],
    //   'wearableId': ['', Validators.required],
    //   'rawdateData': ['', Validators.required],
    // })
    this.toastr.success(`<div class="action-text"><span class="font-400">Send rawdata as command to device sucessfull</span></div>`, "", {
      timeOut: 5000,
      progressBar: true,
      enableHtml: true,
      closeButton: true,
    });
  })
  

  }
  mobileLoading = false;
  countLevel = 0;
  updated = false;

  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
  getSourceType(value){
	const notifyType = this.notificationType.find(type => type.id === value);
	if(notifyType){
		return notifyType.value.split(" ").join("_").toUpperCase();
	}
  }
  getName(value){
	  const notifyType = this.notificationType.find(type => type.id === value);
	  if(notifyType){
		  return notifyType.value.split(" ").join("").toLowerCase();
	  }
  }
  getFormControl(formItem){
	return this.sendUserIDForm.get(formItem).value;
  }
  

 
}
