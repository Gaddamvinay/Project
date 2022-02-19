import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
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
  selector: 'app-ward-summary',
  templateUrl: './ward-summary.component.html',
  styleUrls: ['./ward-summary.component.scss']
})
export class WardSummaryComponent implements OnInit {

  summaryForm: FormGroup;
  customer: string = '';
  facility: string = '';
  ward: string = '';
  rDate: Date;
  interval: string = 'daily';
  customerC: string = '';
  facilityC: string = '';
  caregiver: string = '';
  rDateC: Date;
  intervalC: string = 'daily';
  today = new Date();
  addCaregiverForm: FormGroup;
  showOnly = false;
  header:any;
  constructor(private http: HttpClient,private tokenStorage: TokenStorageServiceService,private datePipe: DatePipe, private _fb: FormBuilder, private routeActivate: ActivatedRoute,public common: CommonService,private commonHttp: CommonHttpService,private toastr: ToastrService, private route: ActivatedRoute,private residentService: ResidentService) {
    this.routeActivate.paramMap.subscribe(data => {
			this.showOnly = data.get('posting') === 'posting' ? true : false;
		});
    this.addCaregiverForm = this._fb.group({
      customer: ['', Validators.required],
      facility: ['', Validators.required],
      firstName: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9äåö_]*$')]],
      lastName: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9äåö_]*$')]],
      // caregiverQualification: ['select', Validators.required],
      ext: ['+91', Validators.required],
      caregiverPhoneNumber: ['', [Validators.required, CustomValidators.patternValidator(/^[0-9]{3,14}$/, { hasNumber: true })]],
      caregiverEmail: ['', Validators.required],
      assignWard: [[''], Validators.required],
      wardSearch: ['']
    })
    this.addCaregiverForm.get('facility').disable();
    this.addCaregiverForm.get('assignWard').disable();
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
  getRndInteger(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
  }
  facilities: any[] = [];
  customers: any[] = [];
  wards: any[] = [];
  titleShow = false;
  ngOnInit(): void {
    this.getHeaders();
    this.http.get(`${environment.apiUrlNew}/wards/get/`,{headers:this.header}).subscribe((wards: any) => {
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
    this.http.get(`${environment.apiUrlNew}/customers/get/`,{headers:this.header}).subscribe((customers: any) => {
      if(customers.itemCount > 0){
        this.customers = customers.body.map(value => {
          return {
            id: value.details.customer_id,
            name: value.details.customer_name
          }
        })
      }
    })
    this.http.get(`${environment.apiUrlNew}/facilities/get/`,{headers:this.header}).subscribe((facilities: any) => {
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
		'notificationType': [this.notificationType[0].id]
	})
	
	this.getResidents()
  this.http.get(`${environment.apiUrlNew}/caregivers/get/`,{headers:this.header}).subscribe((data: any) => {
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
  getHeaders(){
    let accessToken='ODkxZmQ1MzExMGVjYWU3ZTA3ZTkzYWMz7777MmI2NmYxMGE1OWIxYjBmYTNiYzg4MDRkNTMzYjA1ODU1NWM4ZDhlNDEyZDU3NjQxNDBkMjdkOWEwZTIzMzNjMzFhMGU5ODlmYjcwZTkwMGY2N2Y2YzA0ZDc3NmY3M2IwZDc4YmQ5N2YxNjQxNTQ4MjY0';
    this.header = new HttpHeaders().set(
      "x-access-token",
      accessToken
    );
  }
  getResidents(){
    this.getHeaders()
    this.http.get(`${environment.apiUrlNew}/residents/get/`,{headers:this.header}).subscribe((data: any) => {
      this.residentNames = data.body.map(value => {
        return {
          value : `${value.GeneralInformation.first_name} ${value.GeneralInformation.last_name}`,
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
  updateLoaData(resident_id: string, date: any, hours: string,status:string){
   this.getHeaders();
    const startHour = parseInt(this.timeIntervals.split('-')[0]);
    const endHour = parseInt(this.timeIntervals.split("-")[1]);
    const startDate = new Date(date);
    const endDate = new Date(date);
    let requiredLength: any;
    if(hours === '24hrs'){
      startDate.setMinutes(0);
      startDate.setHours(0);
      endDate.setHours(23);
      endDate.setMinutes(59);
      requiredLength = 1440;
    }else{
      requiredLength = 60;
      startDate.setHours(startHour);
      startDate.setMinutes(0);
      endDate.setMinutes(59);
      endDate.setHours(endHour - 1);
    }
    const obj: any = {
      "resident_id": resident_id,
      "wearable_id": this.getDevice(resident_id),
      "data_from": moment(startDate).format('X'),
      "data_to": moment(endDate).format('X'),
      "date_from": moment(startDate).format('YYYY-MM-DD HH:mm:ss'),
      "date_to": moment(endDate).format('YYYY-MM-DD HH:mm:ss'),
      "device_data": [],
      "graph_data": [],
      "ddate": moment(date).format('YYYY-MM-DD')
    }
    const deviceData = [];
    const sleepNight = new Date(date);
    sleepNight.setHours(23);
    const sleepEndNight = new Date(date);
    sleepEndNight.setHours(23);
    sleepEndNight.setMinutes(59);
    const sleepDay = new Date(date);
    sleepDay.setHours(0);
    const sleepEndDay = new Date(date);
    sleepEndDay.setHours(7);
    sleepEndDay.setMinutes(0);
    let actper: any;
    let count=0;
    if(status==='sleeping')
    {
      actper=1;
    }else if(status==='sitting'){
      actper=2;
    }else if(status==='walking'){
      actper=3;
    }else if(status==='active'){
      actper=13;
    }
    else if(status==='run'){
      actper=4;
    }else if(status==='doffed'){
      actper=16;
    }else if(status==='charging')
    {
      actper=255;
    }else if(status==='unknown'){
      actper=0;
    }
    for(let i =0; deviceData.length < requiredLength; i++){
      const startTime = parseInt(moment(startDate).format("X")) + i * 60;
      const exists = deviceData.find(val => val.stmp === startTime);
      if(!exists){

        // if(deviceData.length % 30 === 0){
        //    actper = this.actperValues[this.getRandomInt(0,this.actperValues.length - 1)];
        // }
        // if((startTime <= parseInt(moment(sleepEndDay).format("X")) && startTime >= parseInt(moment(sleepDay).format("X"))) || (startTime <= parseInt(moment(sleepEndNight).format("X")) && startTime >= parseInt(moment(sleepNight).format("X")))){
        //   actper = 1;
        // }
        const obj = {
          actper: actper,
          actvar: this.getRandomInt(0,2),
          btry: 80,
          dwalk: this.getRandomInt(0,14),
          etmp: startTime + 60,
          impt: this.getRandomInt(0,2),
          inscr: this.getRandomInt(0,2),
          slen: this.getRandomInt(0,2),
          stmp: startTime,
          swalk: this.getRandomInt(0,50)
        }
        deviceData.push(obj)
      }
    }
    deviceData.sort((a:any,b: any) => {
      return a.stmp > b.stmp ? 1: -1
    })
    const graphData = deviceData.map(val => {
      return {
        actper: val.actper,
        etmp: val.etmp,
        stmp: val.stmp
      }
    })

    obj.graph_data = graphData,
    obj.device_data = deviceData;
    this.isLoading = true;
      
    this.http.post(`http://lambda-dev.nsdcare.com:5000/v1/api/cronsjobs/storemaxtimeloadata/`, obj,{headers:this.header}).subscribe((data: any) => {
      this.postOtherValues(deviceData,resident_id,moment(date).format('YYYY-MM-DD'),hours);
      this.isLoading =false;
      this.toastr.success(`<div class="action-text"><span class="font-400">${data.message}</span></div><div class="action-buttons"></div>`, "", {
        timeOut: 2000,
        progressBar: true,
        enableHtml: true,
        closeButton: false,
      });
      this.isLoading = false;
    })
      this.http.post(`${environment.apiUrlNew}/ddata/post/`, obj,{headers:this.header}).subscribe((data: any) => {
        this.postOtherValues(deviceData,resident_id,moment(date).format('YYYY-MM-DD'),hours);
        this.isLoading =false;
        this.toastr.success(`<div class="action-text"><span class="font-400">${data.message}</span></div><div class="action-buttons"></div>`, "", {
          timeOut: 2000,
          progressBar: true,
          enableHtml: true,
          closeButton: false,
        });
        this.isLoading = false;
      }, (err) => {
        this.isLoading = false;
        this.toastr.error(`<div class="action-text"><span class="font-400">${err.error.message}</span></div><div class="action-buttons"></div>`, "", {
          timeOut: 2000,
          progressBar: true,
          enableHtml: true,
          closeButton: false,
        });
      })
  }
  postOtherValuesData(){
    this.getHeaders()
    this.http.get(`${environment.apiUrlNew}/ddata/get/`,{headers:this.header}).subscribe((data: any) => {
      if(data.itemCount > 0){
        data.body.forEach(val => {
          this.postOtherValues(val.LOA.device_data, val.details.resident_id,val.meta.ddate, '24hrs');
        })
      }
    })
  }
  postOtherValues(deviceData: any[],resident_id: string,date: string,hours: string){
   this.getHeaders();
    const other: any = {}
    let balance = 0;
    let sleep = 0;
    let strength = 0;
    let unknown = 0;
    let run = 0;
    let active = 0;
    let doffed = 0;
    let charging = 0;
    let steps = 0;
    deviceData.forEach(val => {
      switch(val.actper){
        case 1:
          sleep = sleep + 1;
          break;
        case 2: 
          strength = strength + 1;
          break;
        case 3:
          balance = balance + 1;
          steps = steps + val.swalk;
          break;
        case 0:
          unknown = unknown + 1;
          break;
        case 4:
          run = run + 1;
          break;
        case 13:
          active = active + 1;
          break;
        case 16:
          doffed = doffed + 1;
          break;
        case 255:
          charging = charging + 1;
          break;
      }
    })
    const obj = {
      "resident_id": resident_id,
      "active_time": active,
      "sitting_time": strength,
      "sleeping_time": sleep,
      "walking_time": balance,
      "walking_steps": steps,
      "battery_time": charging,
      "doffed_time": doffed,
      "total_active": active + balance,
      "total_inactive": strength + sleep + unknown,
      "total_notuse": charging + doffed,
      "balance_percentage": balance,
      "strength_percentage": strength,
      "sleep_percentage": sleep,
      "Rdate": date
    }
      this.http.post(`${environment.apiUrlNew}/rdata/post/`, obj,{headers:this.header}).subscribe((data: any) => {
  
      })
  }
  
  isLoading = false;
  updateSummary(){
    this.getHeaders();
    this.isLoading = true;
    const fallActivity = `${this.getRndInteger(1,3)}`; 
    const nightWalkActivity = `${this.getRndInteger(1,3)}`;
    const criticalLowBatteryActivity = `${this.getRndInteger(1,3)}`;
    const screenTimeUsage = `${this.getRndInteger(35, 50)}`;
    const residentProfileViewed = `${this.getRndInteger(5,10)}`;
    const uniqueProfileViewed = `${this.getRndInteger(1,4)}`;
    const NRTFallActivity = `${this.getRndInteger(60,300)}`;
    const NRTNightWalkActivity = `${this.getRndInteger(60,300)}`;
    const NRTCriticalLowActivity = `${this.getRndInteger(300,3000)}`;
    const wearablesInUse = `${this.getRndInteger(20,50)}`;
    const wearablesNotInUse = `${this.getRndInteger(10,40)}`;
    const wearablesReadyToUse = `${this.getRndInteger(1,5)}`;
    const BSTimeOnCharger = `${this.getRndInteger(60,200)}`;
    const BSMaxTimeToResident = `${this.getRndInteger(40,200)}`;
    const RSQuestionnaire = `${this.getRndInteger(1,2)}`;
    const RSPhysioTest = `${this.getRndInteger(1,2)}`;
    const postData = {
      customer_id: this.customer,
      facility_id: this.facility,
      ward_id: this.ward,
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
      totalFalls: `${parseInt(fallActivity) * 5}`,
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
      timestamp: new Date(this.rDate).getTime(),
      Rdate: moment(this.rDate).format('YYYY-MM-DD')
    };
    if(this.interval === 'daily'){
      this.http.post(`${environment.apiUrlNew}/kpi/post/`, postData,{headers:this.header}).subscribe((data: any) => {
        this.toastr.success(`<div class="action-text"><span class="font-400">${data.message}</span></div><div class="action-buttons"></div>`, "", {
          timeOut: 2000,
          progressBar: true,
          enableHtml: true,
          closeButton: false,
        });
        this.ward = '';
        this.facility = '';
        this.customer = '';
        this.rDate = null;
        this.isLoading = false;
      }, (err) => {
        this.isLoading = false;
        this.toastr.error(`<div class="action-text"><span class="font-400">${err.error.message}</span></div><div class="action-buttons"></div>`, "", {
          timeOut: 2000,
          progressBar: true,
          enableHtml: true,
          closeButton: false,
        });
      })
    }else{
      const range = this.rangeValues(this.interval, 'ward');
      const dates = [];
      range.forEach(time => {
        const date = moment(new Date(this.startDate)).add(time,'days').format();
        dates.push(new Date(date));
      })
      const apiCalls = [];
      dates.forEach(date => {
        const postData = this.prepareData(date);
        apiCalls.push(this.http.post(`${environment.apiUrlNew}/kpi/post/`, postData,{headers:this.header}))
      })
      forkJoin(apiCalls).subscribe((data: any) => {
        this.toastr.success(`<div class="action-text"><span class="font-400">${data[0].message}</span></div><div class="action-buttons"></div>`, "", {
          timeOut: 2000,
          progressBar: true,
          enableHtml: true,
          closeButton: false,
        });
        this.ward = '';
        this.facility = '';
        this.customer = '';
        this.rDate = null;
        this.isLoading = false;
      }, (err) => {
        this.isLoading = false;
        this.toastr.error(`<div class="action-text"><span class="font-400">${err.error.message}</span></div><div class="action-buttons"></div>`, "", {
          timeOut: 2000,
          progressBar: true,
          enableHtml: true,
          closeButton: false,
        });
      })
    }
  }
  updateCSummary(){
    this.getHeaders();
    this.isLoading = true;
    const screenTimeUsage = this.getRndInteger(35, 50);
    const residentProfileViewed = this.getRndInteger(5,10);
    const uniqueProfileViewed = this.getRndInteger(1,4);
    const NRTFallActivity = this.getRndInteger(60,300);
    const NRTNightWalkActivity = this.getRndInteger(60,300);
    const NRTCriticalLowActivity = this.getRndInteger(300,3000);
    const postData = {
      customer_id: this.customerC,
      facility_id: this.facilityC,
      caregiver_id: this.caregiver,
      ScreenTimeUsage: screenTimeUsage,
      ResidentProfilesViewed: residentProfileViewed,
      UniqueProfilesViewed: uniqueProfileViewed,
      NRT_FallActivity: NRTFallActivity,
      NRT_NightWalkActivity: NRTNightWalkActivity,
      NRT_CriticallyLowActivity: NRTCriticalLowActivity,
      Cdate: moment(this.rDateC).format('YYYY-MM-DD')
    };
    if(this.intervalC === 'daily'){
      this.http.post(`${environment.apiUrlNew}/cdata/post/`, postData,{headers:this.header}).subscribe((data: any) => {
        this.toastr.success(`<div class="action-text"><span class="font-400">${data.message}</span></div><div class="action-buttons"></div>`, "", {
          timeOut: 2000,
          progressBar: true,
          enableHtml: true,
          closeButton: false,
        });
        this.caregiver = '';
        this.facilityC = '';
        this.customerC = '';
        this.rDateC = null;
        this.isLoading = false;
      }, (err) => {
        this.isLoading = false;
        this.toastr.error(`<div class="action-text"><span class="font-400">${err.error.message}</span></div><div class="action-buttons"></div>`, "", {
          timeOut: 2000,
          progressBar: true,
          enableHtml: true,
          closeButton: false,
        });
      })
    }else{
      const range = this.rangeValues(this.intervalC, 'caregiver');
      const dates = [];
      range.forEach(time => {
        const date = moment(new Date(this.startDate)).add(time,'days').format();
        dates.push(new Date(date));
      })
      const apiCalls = [];
      dates.forEach(date => {
        const postData = this.prepareDataC(date);
        apiCalls.push(this.http.post(`${environment.apiUrlNew}/cdata/post/`, postData,{headers:this.header}))
      })
      forkJoin(apiCalls).subscribe((data: any) => {
        this.toastr.success(`<div class="action-text"><span class="font-400">${data[0].message}</span></div><div class="action-buttons"></div>`, "", {
          timeOut: 2000,
          progressBar: true,
          enableHtml: true,
          closeButton: false,
        });
        this.caregiver = '';
        this.facilityC = '';
        this.customerC = '';
        this.rDateC = null;
        this.isLoading = false;
      }, (err) => {
        this.isLoading = false;
        this.toastr.error(`<div class="action-text"><span class="font-400">${err.error.message}</span></div><div class="action-buttons"></div>`, "", {
          timeOut: 2000,
          progressBar: true,
          enableHtml: true,
          closeButton: false,
        });
      })
    }
  }
  updateAll(){
	const apiCalls = [];
	if(this.interval === 'daily'){
		this.wards.forEach(value => {
			  const {id: ward, customer_id: customer, facility_id: facility} = value;
			const postData = this.prepareData(this.rDate, customer, facility, ward);
			apiCalls.push(this.http.post(`${environment.apiUrlNew}/kpi/post/`, postData,{headers:this.header}))
		})
	}else{
		const range = this.rangeValues(this.interval, 'ward');
		const dates = [];
		range.forEach(time => {
			const date = moment(new Date(this.startDate)).add(time,'days').format();
			dates.push(new Date(date));
		})
		this.wards.forEach(value => {
			const {id: ward, customer_id: customer, facility_id: facility} = value;
			dates.forEach(date => {
				const postData = this.prepareData(date, customer, facility, ward);
				apiCalls.push(this.http.post(`${environment.apiUrlNew}/kpi/post/`, postData,{headers:this.header}))
			})
	  	})
  }
  this.isLoading = true;
    forkJoin(apiCalls).subscribe((data: any) => {
      this.isLoading = false;
      this.toastr.success(`<div class="action-text"><span class="font-400">${data[0].message}</span></div><div class="action-buttons"></div>`, "", {
        timeOut: 2000,
        progressBar: true,
        enableHtml: true,
        closeButton: false,
      });
    })
  }
  caregivers: any[] = [];
  updateAllCaregiver(){
    const apiCalls = [];
    if(this.intervalC === 'daily'){
      this.caregivers.forEach(value => {
        const {id: caregiver, customer, facility} = value;
        const postData = this.prepareDataC(this.rDateC, customer, facility, caregiver);
        apiCalls.push(this.http.post(`${environment.apiUrlNew}/cdata/post/`, postData,{headers:this.header}))
      })
    }else{
      const range = this.rangeValues(this.intervalC, 'caregiver');
      const dates = [];
      range.forEach(time => {
        const date = moment(new Date(this.startDate)).add(time,'days').format();
        dates.push(new Date(date));
      })
      this.caregivers.forEach(value => {
        const {id: caregiver, customer, facility} = value;
        dates.forEach(date => {
          const postData = this.prepareDataC(date, customer, facility, caregiver);
          apiCalls.push(this.http.post(`${environment.apiUrlNew}/cdata/post/`, postData,{headers:this.header}))
        })
        })
    }
    this.isLoading = true;
    forkJoin(apiCalls).subscribe((data: any) => {
      this.isLoading = false;
      this.toastr.success(`<div class="action-text"><span class="font-400">${data[0].message}</span></div><div class="action-buttons"></div>`, "", {
        timeOut: 2000,
        progressBar: true,
        enableHtml: true,
        closeButton: false,
      });
    })
    }
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

  prepareDataC(date: any, customer?: string, facility?: string, caregiver?: string){
      const screenTimeUsage = this.getRndInteger(35, 50);
      const residentProfileViewed = this.getRndInteger(5,10);
      const uniqueProfileViewed = this.getRndInteger(1,5);
      const NRTFallActivity = this.getRndInteger(60,300);
      const NRTNightWalkActivity = this.getRndInteger(60,300);
      const NRTCriticalLowActivity = this.getRndInteger(300,3000);
      const postData = {
        customer_id: customer? customer: this.customerC,
        facility_id: facility? facility: this.facilityC,
        caregiver_id: caregiver ? caregiver: this.caregiver,
        ScreenTimeUsage: screenTimeUsage,
        ResidentProfilesViewed: residentProfileViewed,
        UniqueProfilesViewed: uniqueProfileViewed,
        NRT_FallActivity: NRTFallActivity,
        NRT_NightWalkActivity: NRTNightWalkActivity,
        NRT_CriticallyLowActivity: NRTCriticalLowActivity,
        timestamp: new Date(date).getTime(),
        Cdate: moment(date).format('YYYY-MM-DD')
      };
      return postData;
  }



  prepareData(date: any, customer?: string, facility?: string, ward?: string){
    const fallActivity = `${this.getRndInteger(1,3)}`;
      const nightWalkActivity = `${this.getRndInteger(1,3)}`;
      const criticalLowBatteryActivity = `${this.getRndInteger(1,3)}`;
      const screenTimeUsage = `${this.getRndInteger(35, 50)}`;
      const residentProfileViewed = `${this.getRndInteger(5,10)}`;
      const uniqueProfileViewed = `${this.getRndInteger(1,4)}`;
      const NRTFallActivity = `${this.getRndInteger(60,300)}`;
      const NRTNightWalkActivity = `${this.getRndInteger(60,300)}`;
      const NRTCriticalLowActivity = `${this.getRndInteger(300,3000)}`;
      const wearablesInUse = `${this.getRndInteger(20,50)}`;
      const wearablesNotInUse = `${this.getRndInteger(10,40)}`;
      const wearablesReadyToUse = `${this.getRndInteger(1,5)}`;
      const BSTimeOnCharger = `${this.getRndInteger(60,200)}`;
      const BSMaxTimeToResident = `${this.getRndInteger(40,200)}`;
      const RSQuestionnaire = `${this.getRndInteger(1,2)}`;
      const RSPhysioTest = `${this.getRndInteger(1,2)}`;
      const postData = {
        customer_id: customer? customer: this.customer,
        facility_id: facility? facility: this.facility,
        ward_id: ward ? ward: this.ward,
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
	residentNames: {id: string, value: string, status: string, deviceId: string, customer: string, facility:string, ward: string, FWStatus: any}[] = [];
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
  createNotification(){
	  this.dashboardLoading = true;
	  const date = new Date();
    const residentId = this.notifyCreateForm.get('resident').value;
    const resident = this.residentNames.find(value => value.id === residentId).value;
    const device = this.residentNames.find(value => value.id === residentId).deviceId;
    const notificationBody: any = {
      resident_id: residentId,
      resident_name: `${resident}`,
      contents: [
        {
          date: date,
          action: `${resident} has ${this.getLabel(this.notifyCreateForm.get('notificationType').value).toLowerCase()}`
        },
      ]
    }
    this.http.post(`${environment.apiUrlNew}/alerts/post/`, {
        "alert_id" : `${Math.round((Math.pow(36, 15 + 1) - Math.random() * Math.pow(36, 15))).toString(36).slice(1)}`,
        "customer_id" : this.getResidentCustomer(residentId),
        "facility_id": this.getResidentFacility(residentId),
        "ward_id" : this.getResidentWard(residentId),
        "resident_id" : residentId,
        "wearable_id" : device,
        "alert_type" : this.getType(this.notifyCreateForm.get('notificationType').value),
        "alert_class" : this.getType(this.notifyCreateForm.get('notificationType').value) === 'Fall'|| this.getType(this.notifyCreateForm.get('notificationType').value) === 'Nightwalk' ? "Critical": 'Warning',
        "alert_body" : notificationBody,
        "created_at":this.datePipe.transform(new Date(), 'YYYY-MM-dd HH:mm:ss', 'UTC+2'),
    },{headers:this.header}).subscribe((notification: any) => {
      this.getResidents();
      this.notifyCreateForm.patchValue({
        'resident': ['select resident'],
        'notificationType': [this.notificationType[0].id]
      })
			this.toastr.success(`<div class="action-text"><span class="font-400">Notification created</span></div>`, "", {
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

  /* Function to update the resident score */
  updateScores(residentId: string, walkScore: string, sitScore: string, sleepScore: string,totalFalls: any, questionnaireFalls: any, lkStatus: string){
	this.countLevel = 0;
	this.updated = true;
	const putData = {
		"resident_id": residentId,
		"fall_status": "false",
		"nightwalk_status": "false",
		"total_falls": parseInt(totalFalls),
		"questionnaire_falls": parseInt(questionnaireFalls),
		"balance": this.calculateScore(parseInt(walkScore)),
		"sleep": this.calculateScore(parseInt(sleepScore)),
		"strength": this.calculateScore(parseInt(sitScore)),
		"bss_count": this.countLevel,
		"last_status": lkStatus
	}
	this.http.put(`${environment.apiUrlNew}/residents/update-scores/`, putData,{headers:this.header}).subscribe((res:any) => {
		this.updated =false;
		this.toastr.success(`<div class="action-text"><span class="font-400">${res}</span></div>`, "", {
			timeOut: 5000,
			progressBar: true,
			enableHtml: true,
			closeButton: true,
		});
	}, (err) => {
		this.updated = false;
		this.toastr.error(`<div class="action-text"><span class="font-400">Something went wrong</span></div>`, "", {
			timeOut: 5000,
			progressBar: true,
			enableHtml: true,
			closeButton: true,
		});
	})
  }
  calculateScore(scoreValue: Number) {
	let value = '';
	if(scoreValue == 0){
		value = 'low';
	}
	else if( scoreValue == 1){
		value = 'medium';
		this.countLevel = this.countLevel + 1;
	}else{
		this.countLevel = this.countLevel + 4;
		value = 'high';
	}
	return value;
}
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
	return this.notifyCreateForm.get(formItem).value;
  }
  showSuccess() {
		this.toastr.success('<div class="action-text"><span class="font-400">Resident is Successfully Added</span><br><span>Ward A Room 319 has alloted</span></div><div class="action-buttons"></div>', "", {
			timeOut: 2000,
			progressBar: true,
			enableHtml: true,
			closeButton: false,
		});
	}
  saveConfig() {
		this.toastr.success('<div class="action-text"><span class="font-400">Profile settings are successfully saved</span></div><div class="action-buttons"></div>', "", {
			timeOut: 2000,
			progressBar: true,
			enableHtml: true,
			closeButton: false,
		});
	}
	showInfo() {
		this.toastr.info(`<div class="action-text"><span class="font-400">John Wick has worn the watch again.</span></div><div class="action-buttons"></div>`, "", {
			timeOut: 5000,
			progressBar: true,
			enableHtml: true,
			closeButton: true,
		});
  }
  showFullBattery(){
    this.toastr.info(`<div class="action-text"><span class="font-400">John wick's wearable is fully charged. Please return it to John.</span></div><div class="action-buttons"></div>`, "", {
			timeOut: 5000,
			progressBar: true,
			enableHtml: true,
			closeButton: true,
		});
  }
	residentAddIncomplete() {
		this.toastr.warning('<div class="action-text"><span class="font-400">Resident is saved with incomplete details</span><br><span>Please fill the incomplete information</span></div><div class="action-buttons"></div>', "", {
			timeOut: 300000000,
			progressBar: false,
			enableHtml: true,
			closeButton: true,
			disableTimeOut: false,
		});
  }
  showWatchRemoved() {
		this.toastr.warning(`<div class="action-text"><span class="font-400">John wick is not wearing the wearable</span><div class="action-buttons"></div>`, "", {
			timeOut: 300000,
			progressBar: false,
			enableHtml: true,
			closeButton: true,
			disableTimeOut: true,
		});
  }
	showWarning() {
		this.toastr.warning(`<div class="action-text"><span class="font-400">John wick's wearable has low battery (<15%). Please charge the wearable soon.</span><div class="action-buttons"></div>`, "", {
			timeOut: 300000,
			progressBar: false,
			enableHtml: true,
			closeButton: true,
			disableTimeOut: true,
		});
  }
  showNoData(){
    this.toastr.error(`<div class="action-text"><span class="font-400">John wick's wearable has not sent any data in 3 hours.</span></div><div class="action-buttons"><a class="white-act-btn" href="./residents">Action</a></div>`, "", {
			timeOut: 300000,
			progressBar: false,
			enableHtml: true,
			closeButton: false,
			toastClass: "toast-critical other",
		});
  }
  showNightWalkAlert(){
    this.toastr.error('<div class="action-text"><span class="font-400">John wick is up walking since 23:00</span></div><div class="action-buttons"><a class="white-act-btn" href="./residents">Action</a></div>', "", {
			timeOut: 300000,
			progressBar: false,
			enableHtml: true,
			closeButton: false,
			toastClass: "toast-critical other",
		});
  }
  showCriticalBattery(){
    this.toastr.error(`<div class="action-text"><span class="font-400">John wick's wearable has critically low battery</span></div><div class="action-buttons"><a class="white-act-btn" href="./residents">Action</a></div>`, "", {
			timeOut: 300000,
			progressBar: false,
			enableHtml: true,
			closeButton: false,
			toastClass: "toast-critical other",
		});
  }
	showCritical() {
		this.toastr.error('<div class="action-text"><span class="font-400">John wick is Falling Down</span></div><div class="action-buttons"><a class="white-act-btn">Attend</a><r/> <br/><a class="white-act-btn" (click)="closeToast()">Log</a></div>', "", {
			timeOut: 300000,
			progressBar: false,
			enableHtml: true,
			closeButton: false,
			toastClass: "toast-critical fall",
		});
  }

  storeAlertsData(){
    this.http.post(`${environment.apiUrlNew}/alerts/getalerts/`,"alerts").subscribe((data: any) => {
      this.toastr.success(`<div class="action-text"><span class="font-400">${data.message}</span></div><div class="action-buttons"></div>`, "", {
        timeOut: 2000,
        progressBar: true,
        enableHtml: true,
        closeButton: false,
      });
    })
    this.http.post(`${environment.apiUrlNew}/alerts/storeCaregiveData/`,"alertsincaregiverdata").subscribe((data: any) => {
      this.toastr.success(`<div class="action-text"><span class="font-400">${data.message}</span></div><div class="action-buttons"></div>`, "", {
        timeOut: 2000,
        progressBar: true,
        enableHtml: true,
        closeButton: false,
      });
    })

    this.http.post(`${environment.apiUrlNew}/kpi/updateFallavoidance/`,"fallavoidance").subscribe((data: any) => {      
      this.toastr.success(`<div class="action-text"><span class="font-400">${data.message}</span></div><div class="action-buttons"></div>`, "", {
        timeOut: 5000,
        progressBar: true,
        enableHtml: true,
        closeButton: false,
      });
    })
  
  }
  storeScreenTimeUsage(){

    this.http.post(`${environment.apiUrlNew}/kpi/updateSTUInKpi/`,"ScreenTimeUsage").subscribe((data1: any) => {
      this.toastr.success(`<div class="action-text"><span class="font-400">${data1.message}</span></div><div class="action-buttons"></div>`, "", {
        timeOut: 5000,
        progressBar: true,
        enableHtml: true,
        closeButton: false,
      });
    })
    this.http.post(`${environment.apiUrlNew}/cdata/storeSTUInCaregiverData/`,"screentimeusageincaregiverdata").subscribe((data: any) => {
      this.toastr.success(`<div class="action-text"><span class="font-400">${data.message}</span></div><div class="action-buttons"></div>`, "", {
        timeOut: 2000,
        progressBar: true,
        enableHtml: true,
        closeButton: false,
      });
    })
  }  
    storeResidentProfileDetails(){
     this.http.post(`${environment.apiUrlNew}/kpi/storeResidentProfileView/`,"ResidentProfileView").subscribe((data: any) => {
      this.toastr.success(`<div class="action-text"><span class="font-400">${data.message}</span></div><div class="action-buttons"></div>`, "", {
        timeOut: 2000,
        progressBar: true,
        enableHtml: true,
        closeButton: false,
      });
    })
    this.http.post(`${environment.apiUrlNew}/kpi/updateWearableDetailsKpi/`,"WearableDetails").subscribe((data: any) => {
      this.toastr.success(`<div class="action-text"><span class="font-400">${data.message}</span></div><div class="action-buttons"></div>`, "", {
        timeOut: 2000,
        progressBar: true,
         enableHtml: true,
         closeButton: false,
       });
     })
     this.http.post(`${environment.apiUrlNew}/kpi/storePhysioTestDetails/`,"PhysioTest").subscribe((data: any) => {
      this.toastr.success(`<div class="action-text"><span class="font-400">${data.message}</span></div><div class="action-buttons"></div>`, "", {
        timeOut: 2000,
        progressBar: true,
        enableHtml: true,
        closeButton: false,
      });
    })
   this.http.post(`${environment.apiUrlNew}/kpi/storeQuestionaryDetailsKpi/`,"QuestionaryDetails").subscribe((data: any) => {
    this.toastr.success(`<div class="action-text"><span class="font-400">${data.message}</span></div><div class="action-buttons"></div>`, "", {
      timeOut: 2000,
      progressBar: true,
      enableHtml: true,
      closeButton: false,
    });
  })
  
    
   this.http.post(`${environment.apiUrlNew}/cdata/storeResidentProfileViewedCaregiverData/`,"residentprofileviewedcaregiverdata").subscribe((data: any) => {
    this.toastr.success(`<div class="action-text"><span class="font-400">${data.message}</span></div><div class="action-buttons"></div>`, "", {
      timeOut: 2000,
      progressBar: true,
      enableHtml: true,
      closeButton: false,
    });
  })

  this.http.post(`${environment.apiUrlNew}/kpi/storeSummaryDetailsInKpi/`,"summarydetails").subscribe((data: any) => {
    this.toastr.success(`<div class="action-text"><span class="font-400">${data.message}</span></div><div class="action-buttons"></div>`, "", {
      timeOut: 2000,
      progressBar: true,
      enableHtml: true,
      closeButton: false,
    });
  })

 }

}
