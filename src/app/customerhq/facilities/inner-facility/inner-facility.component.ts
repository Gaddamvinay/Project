import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit,ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CommonService } from '../../../shared/services/common.service';
import { CommonHttpService } from '../../../shared/services/http-services/common-http.service';
import { ViewModalComponent } from '../../../shared/view-modal/view-modal.component';

import * as _LODASH from "lodash";
import { environment } from '../../../../environments/environment';
import { TokenStorageServiceService } from '../../../auth/login/token-storage-service.service';
interface caregivers {
	'Caregiver_name': string,
	'Wards_assigned': string,
	'Phone_number': string,
	'Email_address': string,
	'Screen_time_usage': string,
	'Residents_profile_viewed': number,
	'Most_visited_page': string,
	'Last_active_time': string
}
interface residents {
	'Residents_name': string;
	'Last_known_status': string;
	'Questionnaire_fall': number;
	'Wearable_fall': number;
	wearableFallIncreased: boolean,
  	fallDiff: number,
	'Balance': string;
	'Strength': string;
	'Sleep': string;
	'Name_on_wearable': string;
	'Ward_name': string;
	'Room_name': string;
	'Battery_status': number;
}

interface wearables {
	'Wearables_name': string;
	'Wearable_status': string;
	'Battery_status': string;
	'Resident_name': string;
	'Ward_name': string;
	'Room_name': string;
	'Bed_number': string;
}

interface room {
	'Room_name': string;
	'Residents_Name': string;
	'Total_beds': number;
	'Beds_available': number;
	'Wearable_fall': number
	wearableFallIncreased: boolean,
  	fallDiff: number,
}
@Component({
  selector: 'app-inner-facility',
  templateUrl: './inner-facility.component.html',
  styleUrls: ['./inner-facility.component.scss']
})
export class InnerFacilityComponent implements OnInit {

	facilityDetails: any = {
		name: 'Dummy',
		manager: {
			name: 'James jones'
		},
		ext: '+91',
		phone: '9923468088'
	};
	wardOverView: any = {};
	facilityId: any = '';
	header:any;
	@ViewChild('select') private select: MatSelect;
	constructor(private tokenStorage: TokenStorageServiceService,private routeActivate: ActivatedRoute,private _fb:FormBuilder, private router: Router, private http: HttpClient, private matDialog: MatDialog, private commonHttp: CommonHttpService,  public common: CommonService) {
		this.wearableFilterForm = this._fb.group({
			wardSearch :'',
			ward_id: [['']]
		  })
	}
	navigate(value: any) {
		switch(value.key){
		  case 'Ward_name' : 
			if (value.selected.ward_id) {
				localStorage.setItem('previousWPage', 'Facility')
			  this.router.navigate(['/hq/wards', `${value.selected.ward_id}`])
			}
			break;
		  case 'Facility_name' : 
			if (value.selected.facilityId) {
			  this.router.navigate(['/hq/facilities', `${value.selected.facilityId}`])
			}
			break;
		}
	  }

	isLoading: {
		ward: boolean,
		wearable: boolean
	} = {
			ward: false,
			wearable: false,
		};

	wearableWidths: string[] = ['14%', '20%','16%', '16%', '16%', '18%'];
	wearableDisplayedColumns: string[] = ['Ward_name','Wearable_serial_number','Wearable_fall','Falls_activity','Night_walk_activity','Critically_low_battery_activity'];
	wearableTableData: any[] = [];

	titleShow = false;
	changeTitleShow(value: boolean) {
		this.titleShow = value;
	}

	wardWidths: string[] = ['12.5%', '12.5%', '12.5%', '12.5%', '12.5%', '12.5%','12.5%','12.5%'];
	wardDisplayedColumns: string[] = ['Ward_name','Wearable_fall','Falls_activity','Night_walk_activity','Critically_low_battery_activity','Screen_time_usage','Resident_profiles_viewed','Notification_response_time'];
	wardTableData: any[] = [];
	wearableFilterForm: FormGroup;
	getWardById(id: any){
		if(id !== ''){
		  return this.wardsList.find(value => value.ward_id === id).ward_name;
		}
	  }
	
	  get wardIds(){
		if(this.wearableFilterForm.get('ward_id').value.length > 1){
		  return this.wearableFilterForm.get('ward_id').value.filter(value => value !== '');
		}
		return this.wearableFilterForm.get('ward_id').value;
	  }
	  filtered = false;
	  clearWearableFilters(){
		this.filtered = false;
		this.wearableTableData = this.wearableBefore;
		this.wearableFilterForm.patchValue({
			wardSearch :'',
		  ward_id: ['']
		})
	  }
	
	  showWearableClear(){
		return this.wearableFilterForm.value.ward_id.filter(value => value != '').length > 0;
	  }
	wearableBefore = [];
	getFilterWards(){
		this.wearableFilterForm.valueChanges.subscribe(() => {
			this.select.close();
		  });
		return this.wardsList.filter(value => value.ward_name.toLowerCase().includes(this.wearableFilterForm.get('wardSearch').value.toLowerCase()) || this.wardIds.includes(value.ward_id));
	}
	initial: {
		ward: boolean;
		wearable: boolean
	} = {
		ward: true,
		wearable: true
	}
	ngOnInit(): void {
		this.routeActivate.paramMap.subscribe(data => {
			this.facilityId = data.get('facilityId');
		});
		this.header = new HttpHeaders().set(
			"Authorization",
			this.tokenStorage.getToken()
		  );
		this.init();
		const previousWPage = localStorage.getItem('previousWPage');
		if(previousWPage === 'Facility'){
			this.goto(1)
		} 
		this.wearableFilterForm.valueChanges.subscribe(() => {
			if(this.wardIds.length === 1){
			  if(this.wardIds[0] !== ''){
				this.wearableTableData = this.wearableBefore.filter(value => this.wardIds.includes(value.ward_id))
				this.filtered = true;
			  }else{
				  this.wearableTableData = this.wearableBefore;
				  if(this.filtered){
					  this.clearWearableFilters()
				  }
			  }
			}else if(this.wardIds.length > 1){
			  this.wearableTableData = this.wearableBefore.filter(value => this.wardIds.includes(value.ward_id));
			  this.filtered = true;
			}
		  })
	}

	init() {
		this.getFacility();
		this.getWards();
		this.getWearables();
	}

	getWearables(){
		this.isLoading.wearable = true;
		this.http.get(`${environment.apiUrlNew}/wearables/get/`,{headers:this.header}).subscribe((wearables: any) => {
      forkJoin([this.http.get(`${environment.apiUrlNew}/cdata/getCustomerSummary/`,{headers:this.header}),this.http.get(`${environment.apiUrlNew}/cdata/getFacilitiesSummary/`),this.http.get(`${environment.apiUrlNew}/cdata/getWardsSummary/`)]).subscribe((AllStats: any) => {
		if(wearables.itemCount){

            wearables.body.forEach((value: any) => {
              value.summary.reports = {};
			  const ward = AllStats[2].wards.map(val => {
				return val
			  }).find(val => val.ward_id === value.details.ward_id)
			  if(ward){
				value.summary.reports.WResidents = ward.residents_count;
				value.summary.reports.WWearables = ward.wearables_count;
			  }
            })
		}
			if(wearables.itemCount){
			//  this.http.get(`${environment.apiUrlNew}/kpi/getYesterdayWSummary/`).subscribe((kpi: any) => {
				this.http.get(`${environment.apiUrlNew}/kpi/getYesterdayWearableDetails/`,{headers:this.header}).subscribe((kpi: any) => {  
            	let positions: any;
                if(kpi.itemCount > 0){
                  positions = kpi.body.map((val: any, i: number) => {
                    return {
                      id: val.details.wearable_id,
                      position: i
                    }
                  })
                }else{
                  positions = [];
                }
				wearables.body.forEach((value: any) => {
				  if(kpi.itemCount > 0){
					const customerKpi = kpi.body.filter(val => val.details.wearable_id === value.details.wearable_id);
					value.summary.position = positions.find(val => val.id === value.details.wearable_id)? positions.find(val => val.id === value.details.wearable_id).position: kpi.itemCount;
					let Falls_activity = 0;
					let Night_walk_activity = 0;
					let Critically_low_battery_activity = 0;
					let Screen_time_usage = '';
					let Notification_response_time = '';
					let Resident_profiles_viewed = 0;
					let totalFalls=0;
					customerKpi.forEach(value => {
					  if(value.KPI){
						  totalFalls=value.KPI.totalFalls;
						Falls_activity = Falls_activity + parseFloat(value.KPI.FallActivity);
						Night_walk_activity = Night_walk_activity + parseFloat(value.KPI.NightWalkActivity);
						Critically_low_battery_activity = Critically_low_battery_activity + parseFloat(value.KPI.CriticallyLowBattery);
						Screen_time_usage = this.transform(value.KPI.ScreenTimeUsage);//(value.KScreen_time_usage + parseFloat(value.KPI.ScreenTimeUsage);
						Notification_response_time =this.transforms(value.KPI.NotificationResponseTime);//Notification_response_time + parseFloat(value.KPI.NotificationResponseTime);
						Resident_profiles_viewed = Resident_profiles_viewed + parseFloat(value.KPI.ResidentProfilesViewed);
					  }
					})
					if(customerKpi.length > 0){
						value.summary.reports.totalFalls=totalFalls;
					  value.summary.reports.Falls_activity = ((Falls_activity/customerKpi.length)) < 0.25 ? (((Falls_activity/customerKpi.length)) < 0.1 ? (((Falls_activity/customerKpi.length)) > 0.01 ? 0.1 : 0): (Math.round(((Falls_activity/customerKpi.length)) * 10) / 10).toFixed(1)) : this.roundingTechnique(((Falls_activity/customerKpi.length)));
					  value.summary.reports.Night_walk_activity = ((Night_walk_activity/customerKpi.length)) < 0.25 ? (((Night_walk_activity/customerKpi.length)) < 0.1 ? (((Night_walk_activity/customerKpi.length)) > 0.01 ? 0.1 : 0): (Math.round(((Night_walk_activity/customerKpi.length)) * 10) / 10).toFixed(1)) : this.roundingTechnique(((Night_walk_activity/customerKpi.length)));
					  value.summary.reports.Critically_low_battery_activity = ((Critically_low_battery_activity/customerKpi.length)) < 0.25 ? (((Critically_low_battery_activity/customerKpi.length)) < 0.1 ? (((Critically_low_battery_activity/customerKpi.length)) > 0.01 ? 0.1 : 0): (Math.round(((Critically_low_battery_activity/customerKpi.length)) * 10) / 10).toFixed(1)) : this.roundingTechnique(((Critically_low_battery_activity/customerKpi.length)));
					  value.summary.reports.Screen_time_usage =Screen_time_usage;// ((Screen_time_usage/customerKpi.length)) < 0.25 ? (((Screen_time_usage/customerKpi.length)) < 0.1 ? (((Screen_time_usage/customerKpi.length)) > 0.01 ? 0.1 : 0): (Math.round(((Screen_time_usage/customerKpi.length)) * 10) / 10).toFixed(1)) : this.roundingTechnique(((Screen_time_usage/customerKpi.length)));
					  value.summary.reports.Notification_response_time = Notification_response_time//(((Notification_response_time/customerKpi.length)/3)/60) < 0.25 ? ((((Notification_response_time/customerKpi.length)/3)/60) < 0.1 ? ((((Notification_response_time/customerKpi.length)/3)/60) > 0.01 ? 0.1 : 0): (Math.round((((Notification_response_time/customerKpi.length)/3)/60) * 10) / 10).toFixed(1)) : this.roundingTechnique((((Notification_response_time/customerKpi.length)/3)/60));
					  value.summary.reports.Resident_profiles_viewed = ((Resident_profiles_viewed/customerKpi.length)) < 0.25 ? (((Resident_profiles_viewed/customerKpi.length)) < 0.1 ? (((Resident_profiles_viewed/customerKpi.length)) > 0.01 ? 0.1 : 0): (Math.round(((Resident_profiles_viewed/customerKpi.length)) * 10) / 10).toFixed(1)) : this.roundingTechnique(((Resident_profiles_viewed/customerKpi.length)));
					}else{
					  value.summary.reports.Falls_activity = (Falls_activity);
					  value.summary.reports.Night_walk_activity = (Night_walk_activity);
					  value.summary.reports.Critically_low_battery_activity = (Critically_low_battery_activity);
					  value.summary.reports.Screen_time_usage = (Screen_time_usage);
					  value.summary.reports.Notification_response_time = (Notification_response_time);
					  value.summary.reports.Resident_profiles_viewed = (Resident_profiles_viewed);
					}
				  }
				})
				const filteredWearables = wearables.body.filter(value => value.details.facility_id === this.facilityId);
				this.wearableTableData = filteredWearables.map(value => {
				  return {
					Facility_name: value.details.facility_name,
					facility_id: value.details.facility_id,
					ward_id: value.details.ward_id,
					Ward_name: value.details.ward_name,
					Battery_status: parseInt(value.details.battery_status),
					Wearable_status: value.details.wearable_status,
					Wearable_serial_number: value.details.wearable_sno,
					position: value.summary.position,
					//Wearable_fall: value.details.wearable_status !== 'Ready to use' ? (value.summary.reports.Falls_activity*5) || '' : '',
					Wearable_fall: value.details.wearable_status !== 'Ready to use' ? (value.summary.reports.totalFalls) || '' : '',
					//fallDiff: this.getRandomInt(1,5),
					//wearableFallIncreased: this.booleanValue[this.getRandomInt(0,1)],
					Falls_activity: value.details.wearable_status !== 'Ready to use' ? value.summary.reports.Falls_activity || '' : '',
					Night_walk_activity: value.details.wearable_status !== 'Ready to use' ? value.summary.reports.Night_walk_activity || '' : '', 
					Critically_low_battery_activity: value.details.wearable_status !== 'Ready to use' ? value.summary.reports.Critically_low_battery_activity || '': '',
					nFacilities: value.summary.reports.facilityCount || 0,
					nWards: value.summary.reports.wardCount || 0,
					nFWards: value.summary.reports.FWardCount || 0,
					registeredResidents: value.summary.reports &&  value.summary.reports.WResidents ? value.summary.reports.WResidents : 0,
					registeredCaregivers: value.summary.reports && value.summary.reports.registeredCaregivers ? value.summary.reports.registeredCaregivers : 0,
					registeredWearables: value.summary.reports && value.summary.reports.WWearables ? value.summary.reports.WWearables : 0,
				  }
				}).sort((a: any,b: any) => {
					return a.Falls_activity < b.Falls_activity ? 1: -1
				  })
				  this.wearableTableData=_LODASH.orderBy(this.wearableTableData, ['Falls_activity', 'Night_walk_activity','Critically_low_battery_activity'], ['desc', 'desc','desc']);	  
				  this.wearableBefore = this.wearableTableData;
			  })
			}
		  })
		  this.isLoading.wearable = false
		})
	  }
	  wardsList = [];
	  getWards(){
		this.isLoading.ward = true;
		this.http.get(`${environment.apiUrlNew}/wards/get/`,{headers:this.header}).subscribe((wards: any) => {
			this.isLoading.ward = false;
			if(wards.itemCount > 0){
				forkJoin([this.http.get(`${environment.apiUrlNew}/cdata/getCustomerSummary/`,{headers:this.header}),this.http.get(`${environment.apiUrlNew}/cdata/getFacilitiesSummary/`),this.http.get(`${environment.apiUrlNew}/cdata/getWardsSummary/`)]).subscribe((AllStats: any) => {
					wards.body.forEach((value: any) => {
					  value.summary.reports = {};
					  const ward = AllStats[2].wards.map(val => {
						return val
					  }).find(val => val.ward_id === value.details.ward_id)
					  if(ward){
						value.summary.reports.WResidents = ward.residents_count;
						value.summary.reports.WWearables = ward.wearables_count;
					  }
					})
					this.http.get(`${environment.apiUrlNew}/kpi/getYesterdayWSummary/`,{headers:this.header}).subscribe((kpi: any) => {
					//	this.http.get(`${environment.apiUrlNew}/kpi/getYesterdayWearableDetails/`).subscribe((kpi: any) => {  
               			this.isLoading.ward = false;
						const yesterday = new Date();
						yesterday.setDate(new Date().getDate() - 1);
						let positions: any;
						if(kpi.itemCount > 0){
						positions = kpi.body.map((val: any, i: number) => {
							return {
							id: val.details.ward_id,
							position: i
							}
						})
						}else{
						positions = [];
						}
						wards.body.forEach((value: any) => {
							if(kpi.itemCount > 0){
								const customerKpi = kpi.body.filter(val => val.details.ward_id === value.details.ward_id);
								value.summary.position = positions.find(val => val.id === value.details.ward_id)? positions.find(val => val.id === value.details.ward_id).position: kpi.itemCount;
								let Falls_activity = 0;
								let Night_walk_activity = 0;
								let Critically_low_battery_activity = 0;
								let Screen_time_usage = '';
								let Notification_response_time = '';
								let Resident_profiles_viewed = 0;
								let totalFalls=0;
								customerKpi.forEach(value => {
								  if(value.KPI){
									  totalFalls=value.KPI.totalFalls;
									Falls_activity = Falls_activity + parseFloat(value.KPI.FallActivity);
									Night_walk_activity = Night_walk_activity + parseFloat(value.KPI.NightWalkActivity);
									Critically_low_battery_activity = Critically_low_battery_activity + parseFloat(value.KPI.CriticallyLowBattery);
									Screen_time_usage =this.transform(value.KPI.ScreenTimeUsage);// Screen_time_usage + parseFloat(value.KPI.ScreenTimeUsage);
									Notification_response_time =this.transforms(value.KPI.NotificationResponseTime);// Notification_response_time + parseFloat(value.KPI.NotificationResponseTime);
									Resident_profiles_viewed = Resident_profiles_viewed + parseFloat(value.KPI.ResidentProfilesViewed);
								  }
								})
								if(customerKpi.length > 0){
									value.summary.reports.totalFalls=totalFalls;
								  value.summary.reports.Falls_activity = Falls_activity < 0.25 ? (Falls_activity < 0.1 ? (Falls_activity > 0.01 ? 0.1 : 0): (Math.round(Falls_activity * 10) / 10).toFixed(1)) : this.roundingTechnique(Falls_activity);
								  value.summary.reports.Night_walk_activity = Night_walk_activity < 0.25 ? (Night_walk_activity < 0.1 ? (Night_walk_activity > 0.01 ? 0.1 : 0): (Math.round(Night_walk_activity * 10) / 10).toFixed(1)) : this.roundingTechnique(Night_walk_activity);
								  value.summary.reports.Critically_low_battery_activity = Critically_low_battery_activity < 0.25 ? (Critically_low_battery_activity < 0.1 ? (Critically_low_battery_activity > 0.01 ? 0.1 : 0): (Math.round(Critically_low_battery_activity * 10) / 10).toFixed(1)) : this.roundingTechnique(Critically_low_battery_activity);
								  value.summary.reports.Screen_time_usage = Screen_time_usage;// < 0.25 ? (Screen_time_usage < 0.1 ? (Screen_time_usage > 0.01 ? 0.1 : 0): (Math.round(Screen_time_usage * 10) / 10).toFixed(1)) : this.roundingTechnique(Screen_time_usage);
								  value.summary.reports.Notification_response_time = Notification_response_time//Notification_response_time < 0.25 ? (Notification_response_time < 0.1 ? (Notification_response_time > 0.01 ? 0.1 : 0): (Math.round(Notification_response_time * 10) / 10).toFixed(1)) : this.roundingTechnique(Notification_response_time);
								  value.summary.reports.Resident_profiles_viewed = Resident_profiles_viewed < 0.25 ? (Resident_profiles_viewed < 0.1 ? (Resident_profiles_viewed > 0.01 ? 0.1 : 0): (Math.round(Resident_profiles_viewed * 10) / 10).toFixed(1)) : this.roundingTechnique(Resident_profiles_viewed);
								}else{
									value.summary.reports.totalFalls=(totalFalls);
								  value.summary.reports.Falls_activity = (Falls_activity);
								  value.summary.reports.Night_walk_activity = (Night_walk_activity);
								  value.summary.reports.Critically_low_battery_activity = (Critically_low_battery_activity);
								  value.summary.reports.Screen_time_usage = (Screen_time_usage);
								  value.summary.reports.Notification_response_time = (Notification_response_time);
								  value.summary.reports.Resident_profiles_viewed = (Resident_profiles_viewed);
								}
							  }
						})
						const filteredWards = wards.body.filter(value => value.details.facility_id === this.facilityId);
						this.wardsList = filteredWards.map(value => {
							return {
							ward_id: value.details.ward_id,
							ward_name: value.details.ward_name,
							facility_id: value.details.facility_id
							}
						}).sort((a:any, b:any) => {
							return a.ward_name > b.ward_name ? 1: -1;
						})
						this.wardTableData = filteredWards.map(value => {
							return {
								Ward_name: value.details.ward_name,
								ward_id: value.details.ward_id,
							//	Wearable_fall: value.summary.reports.Falls_activity ? (value.summary.reports.Falls_activity*5) : '',
							Wearable_fall: value.summary.reports.totalFalls ? (value.summary.reports.totalFalls) : '',
								
							//	fallDiff: this.getRandomInt(1,5),
								position: value.summary.position,
							//	wearableFallIncreased: this.booleanValue[this.getRandomInt(0,1)],
								Falls_activity: value.summary.reports.Falls_activity || '',
								Night_walk_activity: value.summary.reports.Night_walk_activity || '', 
								Critically_low_battery_activity: value.summary.reports.Critically_low_battery_activity || '', 
								Screen_time_usage: value.summary.reports.Screen_time_usage || '', 
								Resident_profiles_viewed: value.summary.reports.Resident_profiles_viewed || '', 
								Notification_response_time: value.summary.reports.Notification_response_time || '',
								registeredResidents: value.summary.reports.WResidents || 0,
								registeredCaregivers: value.summary.reports.WCaregivers || 0,
								registeredWearables: value.summary.reports.WWearables || 0,
							}
						}).sort((a: any,b: any) => {
							return a.Falls_activity < b.Falls_activity ? 1: -1
						  })
						  this.wardTableData=_LODASH.orderBy(this.wardTableData, ['Falls_activity', 'Night_walk_activity','Critically_low_battery_activity'], ['desc', 'desc','desc']);	  
					})
				})
			}else{
				this.isLoading.ward= true;
			}
			this.initial.ward = false;
		}, (err) => {
			this.isLoading.ward = false;
		})
	  }
	  booleanValue = [true, false];
	getRandomInt(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	roundingTechnique(numb: number){
		const floor = Math.floor(numb);
		const decimal = (numb - floor) * 100;
		let rounded = 0;
		if(_LODASH.inRange(decimal, 24, 75)){
		  rounded = floor + 0.5;
		}else if(_LODASH.inRange(decimal, 74, 100)){
		  rounded = floor + 1
		}else{
		  rounded = floor;
		}
		return rounded;
	}
	transform(value) {
  
		const decimalTimeString =value;
	  let decimalTime = parseFloat(decimalTimeString);
	  decimalTime = decimalTimeString * 60 * 60;
	  const hours = Math.floor((decimalTime / (60 * 60)));
	  decimalTime = decimalTime - (hours * 60 * 60);
	  const minutes = Math.floor((decimalTime / 60));
	  decimalTime = decimalTime - (minutes * 60);
	  //const seconds = Math.round(decimalTime);
	  const hour = hours< 10 ? '0' + hours : hours;
	  const min = minutes < 10 ? '0' + minutes : minutes;
	 // const sec=seconds<10? '0' + seconds :seconds;
	  if((hour + ':' + min + ':')==='00:00')
	 {
	  return ''; 
	   
	  }else{
	   return hour + ':' + min;
	  }
	}
	  
	  transforms(value: number) {
		let  temp = value * 60;
	   const seconds=Math.floor(temp % 3600 % 60);
	   let  hours= Math.floor(value / 60);
	   let minutes = value % 60;
	   const hour = hours< 10 ? '0' + hours : hours;
	   const min = minutes < 10 ? '0' + minutes : minutes;
	   const sec=seconds<10? '0' + seconds :seconds;
	   if((hour + ':' + min )==='00:00')
	   {
		return ''; 
		 
		}else{
		 return hour + ':' + min ;
		}
	 }
	
	
	getFacility(){
		this.http.get(`${environment.apiUrlNew}/facilities/get/`,{headers:this.header}).subscribe((facilities: any) => {
			if(facilities.itemCount > 0){
				const facility = facilities.body.find(value => value.details.facility_id === this.facilityId);
				this.facilityDetails = facility.details;
				Object.assign(this.facilityDetails, {
					nWards: 0,
					registeredRooms: 0,
					registeredCaregivers: 0,
					registeredResidents: 0,
					registeredWearables: 0,
					todayFallCount: 0,
					fallDiff: 0,
					wearableFallIncreased: false,
					wearableWLB: 0,
				})
				forkJoin([this.http.get(`${environment.apiUrlNew}/cdata/getCustomerSummary/`,{headers:this.header}),this.http.get(`${environment.apiUrlNew}/cdata/getFacilitiesSummary/`)]).subscribe((AllStats: any) => {
					  
					const facility = AllStats[1].facilities.map(val => {
					  return val
					}).find(val => val.facilit_id === this.facilityId);
					if(facility){
					  this.facilityDetails.nWards = facility.total_wards;
					  this.facilityDetails.registeredCaregivers = facility.caregivers_count;
					  this.facilityDetails.registeredResidents = facility.residents_count;
					  this.facilityDetails.registeredWearables = facility.wearables_count;
					}
			  	})
			}
		})
	}
	
	selectedTab: number = 0;
	goto(tabIndex: number) {
		this.selectedTab = tabIndex;
	}
	onChangeTab(event: any) {
		this.selectedTab = event.index;
		localStorage.setItem('previousFPage', '');
    	localStorage.setItem('previousWPage', '');
	}

}
