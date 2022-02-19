import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonAddModelComponent } from '../../../shared/common-add-model/common-add-model.component';
import { FilterComponent } from '../../../shared/filter/filter.component';
import { CommonHttpService } from '../../../shared/services/http-services/common-http.service';
import { CommonService } from './../../../shared/services/common.service';
import { forkJoin, Observable, empty } from 'rxjs';
import * as _LODASH from "lodash";

import * as moment from "moment";
import { MatDialog } from '@angular/material/dialog';
import { CommonEditModelComponent } from '../../../shared/common-edit-model/common-edit-model.component';
import { ConformationPopComponent } from '../../../shared/conformation-pop/conformation-pop.component';
import { ViewModalComponent } from '../../../shared/view-modal/view-modal.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
	'Last_active': string
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
	selector: 'app-inner-ward',
	templateUrl: './inner-ward.component.html',
	styleUrls: ['./inner-ward.component.scss']
})
export class InnerWardComponent implements OnInit {

	wardDetails: any = {
		name: ''
	};
	wardOverView: any = {};
	wardId: any = '';
	header:any;
	constructor(private tokenStorage: TokenStorageServiceService,private routeActivate: ActivatedRoute,private http: HttpClient, private matDialog: MatDialog, private commonHttp: CommonHttpService,  public common: CommonService) {

	}

	isLoading: {
		caregiver: boolean,
		resident: boolean,
		wearable: boolean,
		room: boolean
	} = {
			caregiver: false,
			resident: false,
			wearable: false,
			room: false
		};
	careGiverWidths: string[] = ['16%', '20%', '16%', '16%', '16%', '16%'];
	careGiverDisplayedColumns: string[] = ['Caregiver_name', 'Wards_assigned', 'Screen_time_usage', 'Resident_profiles_viewed', 'Most_visited_page', 'Last_active'];
	careGiverTableData: any[] = [];

	residentWidths: string[] = ['12%', '11%', '10%', '9%', '7%', '7%', '7%', '9%', '9%', '9%', '9%', '9%']
	residentDisplayedColumns: string[] = ['Resident_name', 'Last_known_status', 'Questionnaire_fall', 'Wearable_fall', 'Balance', 'Strength', 'Sleep', 'Ward_name', 'Room_name', 'Name_on_wearable', 'Battery_status'];
	residentTableData: any[] = [];

	wearableWidths: string[] = ['12%', '12%', '12%', '12%', '12%', '12%', '12%'];
	wearableDisplayedColumns: string[] = ['Wearable_serial_number','Wearable_status', 'Battery_status','Wearable_fall','Falls_activity','Night_walk_activity','Critically_low_battery_activity'];
	wearableTableData: any[] = [];

	titleShow = false;
	changeTitleShow(value: boolean) {
		this.titleShow = value;
	}
	showToast = false;
	toastMessage: string;
	doOperation(event: any, tab: string) {
		const room = 'Room 001';
		if (tab === 'rooms') {
			if (event.action === 'Delete') {
				const del = this.matDialog.open(ConformationPopComponent, {
					disableClose: true,
					panelClass: 'dialog-popup',
					width: '448px',
					data: {
						title: 'Delete room',
						message: `Are you sure you want to delete the <strong>${room}</strong>? This action cannot undo.`
					}
				})
				del.afterClosed().subscribe(data => {
					if (data) {
						console.log('deleted')
					}
				})
			} else if (event.action === 'Edit') {
				const dialog = this.matDialog.open(CommonEditModelComponent, {
					disableClose: true,
					panelClass: 'dialog-popup',
					width: '448px',
					data: {
						dialogType: 'Edit room',
						roomData: event.selected
					}
				})
				dialog.afterClosed().subscribe(data => {
					if (data) {
						this.showToast = true;
						this.toastMessage = data.message;
						setTimeout(() => {
							this.showToast = false;
						}, 3000);
					}
				})
			}
		}
	}
	doOperation1(event: any) {
		if (event.action === 'view') {
			const dialog = this.matDialog.open(ViewModalComponent, {
				disableClose: true,
				panelClass: 'dialog-popup',
				width: '448px',
				data: {
					dialogType: 'View caregiver',
					payload: event.selected
				}
			})
			dialog.afterClosed().subscribe(data => {
				if (data === 'Edit') {
					const dialog = this.matDialog.open(CommonEditModelComponent, {
						disableClose: true,
						panelClass: 'dialog-popup',
						width: '920px',
						data: {
							dialogType: 'Edit caregiver',
							userId: event.selected.caregiver_id
						}
					})
					dialog.afterClosed().subscribe(data => {
						if (data) {
							this.showToast = true;
							this.toastMessage = data.message;
							setTimeout(() => {
								this.showToast = false;
							}, 3000);
						}
					})
				}
			})
		} else if (event.action === 'Delete') {
			const caregiver = 'caregiver 1';
			const del = this.matDialog.open(ConformationPopComponent, {
				disableClose: true,
				panelClass: 'dialog-popup',
				width: '448px',
				data: {
					title: 'Delete caregiver',
					message: `Are you sure you want to delete the <strong>${caregiver}</strong>? This action cannot undo.`
				}
			})
			del.afterClosed().subscribe(data => {
				if (data) {
					console.log('deleted')
				}
			})
		}
	}

	roomWidths: string[] = ['20%', '60%', '20%'];
	// roomDisplayedColumns: string[] = ['Room_name', 'Residents_Name', 'Total_beds', 'Beds_available', 'Number_of_falls'];
	roomDisplayedColumns: string[] = ['Room_name', 'Residents_Name', 'Wearable_fall', 'room_id'];
	roomTableData: room[] = [];

	ngOnInit(): void {
		this.routeActivate.paramMap.subscribe(data => {
			this.wardId = data.get('wardId');
		});

		this.common.eventCatch().subscribe((data) => {
			this.init();
		});
		this.init();
	}

	init() {
		this.getWard(this.wardId);
		this.getResident(this.wardId);
		this.getWearables(this.wardId);
		this.getCareGiverList(this.wardId);
		let wards: any = localStorage.getItem('wards');
        if(wards){
          wards = JSON.parse(wards);
          wards.itemCount = 9999;
          localStorage.setItem('wards', JSON.stringify(wards));
        }
	}

	getWard(wardNo: string) {
		this.getHeaders();
		this.http.get(`${environment.apiUrlNew}/wards/get/`,{headers:this.header}).subscribe((data: any) => {
			const ward = data.body.find(value => value.details.ward_id === wardNo);
			const {ward_name: name, manager_name: wardManagerName, ward_number: contactPhone, facility_name, facility_id, customer_name, customer_id} = ward.details;
			this.wardDetails = {
				name,
				wardManagerName,
				contactPhone,
				facility_id,
				facility_name,
				customer_name,
				customer_id,
			};
			Object.assign(this.wardDetails, {
				registeredRooms: 0,
				registeredCaregivers: 0,
				registeredResidents: 0,
				registeredWearables: 0,
				todayFallCount: 0,
				fallDiff: 0,
				wearableFallIncreased: false,
				wearableWLB: 0,
			})
		})
	}
	getContact(contactPhone: {ext: string; phone: string}[]){
		if(contactPhone){
			return contactPhone.map(value => {
				return `${value.ext} ${value.phone}`
			})
		}
	}
	booleanValue = [true, false];
	getRandomInt(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	getWearables(wardNo: string) {
		this.getHeaders();
		this.isLoading.wearable = true;
		this.http.get(`${environment.apiUrlNew}/wearables/get/`,{headers:this.header}).subscribe((data: any) => {
			if(data.itemCount > 0){
				forkJoin([this.http.get(`${environment.apiUrlNew}/cdata/getCustomerSummary/`,{headers:this.header}),this.http.get(`${environment.apiUrlNew}/cdata/getFacilitiesSummary/`,{headers:this.header}),this.http.get(`${environment.apiUrlNew}/cdata/getWardsSummary/`,{headers:this.header})]).subscribe((AllStats: any) => {
					data.body.forEach((value: any) => {
					value.summary.reports = {};
					const ward = AllStats[2].wards.map(val => {
						return val
					}).find(val => val.ward_id === value.details.ward_id)
					if(ward){
						value.summary.reports.WResidents = ward.residents_count;
						value.summary.reports.WWearables = ward.wearables_count;
					}
					})
					
				//	this.http.get(`${environment.apiUrlNew}/kpi/getYesterdayWSummary/`).subscribe((kpi: any) => {
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
						data.body.forEach((value: any) => {
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
								Screen_time_usage =  this.transform(value.KPI.ScreenTimeUsage);//Screen_time_usage + parseFloat(value.KPI.ScreenTimeUsage);
								Notification_response_time = Notification_response_time + this.transforms(value.KPI.NotificationResponseTime);
								Resident_profiles_viewed = Resident_profiles_viewed + parseFloat(value.KPI.ResidentProfilesViewed);
							}
							})
							if(customerKpi.length > 0){
								value.summary.reports.totalFalls=totalFalls;
							value.summary.reports.Falls_activity = ((Falls_activity/customerKpi.length)) < 0.25 ? (((Falls_activity/customerKpi.length)) < 0.1 ? (((Falls_activity/customerKpi.length)) > 0.01 ? 0.1 : 0): (Math.round(((Falls_activity/customerKpi.length)) * 10) / 10).toFixed(1)) : this.roundingTechnique(((Falls_activity/customerKpi.length)));
							value.summary.reports.Night_walk_activity = ((Night_walk_activity/customerKpi.length)) < 0.25 ? (((Night_walk_activity/customerKpi.length)) < 0.1 ? (((Night_walk_activity/customerKpi.length)) > 0.01 ? 0.1 : 0): (Math.round(((Night_walk_activity/customerKpi.length)) * 10) / 10).toFixed(1)) : this.roundingTechnique(((Night_walk_activity/customerKpi.length)));
							value.summary.reports.Critically_low_battery_activity = ((Critically_low_battery_activity/customerKpi.length)) < 0.25 ? (((Critically_low_battery_activity/customerKpi.length)) < 0.1 ? (((Critically_low_battery_activity/customerKpi.length)) > 0.01 ? 0.1 : 0): (Math.round(((Critically_low_battery_activity/customerKpi.length)) * 10) / 10).toFixed(1)) : this.roundingTechnique(((Critically_low_battery_activity/customerKpi.length)));
							value.summary.reports.Screen_time_usage = Screen_time_usage;//((Screen_time_usage/customerKpi.length)) < 0.25 ? (((Screen_time_usage/customerKpi.length)) < 0.1 ? (((Screen_time_usage/customerKpi.length)) > 0.01 ? 0.1 : 0): (Math.round(((Screen_time_usage/customerKpi.length)) * 10) / 10).toFixed(1)) : this.roundingTechnique(((Screen_time_usage/customerKpi.length)));
							value.summary.reports.Notification_response_time = Notification_response_time;//(((Notification_response_time/customerKpi.length)/3)/60) < 0.25 ? ((((Notification_response_time/customerKpi.length)/3)/60) < 0.1 ? ((((Notification_response_time/customerKpi.length)/3)/60) > 0.01 ? 0.1 : 0): (Math.round((((Notification_response_time/customerKpi.length)/3)/60) * 10) / 10).toFixed(1)) : this.roundingTechnique((((Notification_response_time/customerKpi.length)/3)/60));
							value.summary.reports.Resident_profiles_viewed = ((Resident_profiles_viewed/customerKpi.length)) < 0.25 ? (((Resident_profiles_viewed/customerKpi.length)) < 0.1 ? (((Resident_profiles_viewed/customerKpi.length)) > 0.01 ? 0.1 : 0): (Math.round(((Resident_profiles_viewed/customerKpi.length)) * 10) / 10).toFixed(1)) : this.roundingTechnique(((Resident_profiles_viewed/customerKpi.length)));
							}else{
							value.summary.reports.Falls_activity = (Falls_activity);
							value.summary.reports.Night_walk_activity = (Night_walk_activity);
							value.summary.reports.Critically_low_battery_activity = (Critically_low_battery_activity);
							value.summary.reports.Screen_time_usage = (Screen_time_usage);
							value.summary.reports.Notification_response_time = Notification_response_time;
							value.summary.reports.Resident_profiles_viewed = (Resident_profiles_viewed);
							}
						}
						})
						this.isLoading.wearable = false;
						let wearableTable = [];
						if(data.itemCount > 0){
							data.body.filter(value => value.details.ward_id === this.wardId).forEach(wearable => {
								wearableTable.push({
									ward_id: wearable.details.ward_id,
									Ward_name: wearable.details.ward_name,
									Wearable_serial_number: wearable.details.wearable_sno,
									Battery_status: parseInt(wearable.details.battery_status),
									Wearable_status: wearable.details.wearable_status,
									//Wearable_fall: wearable.details.wearable_status !== 'Ready to use' ? (wearable.summary.reports.Falls_activity*5) || '' : '',
									Wearable_fall: wearable.details.wearable_status !== 'Ready to use' ? (wearable.summary.reports.totalFalls) || '' : '',
								//	fallDiff: this.getRandomInt(1,5),
									//wearableFallIncreased: this.booleanValue[this.getRandomInt(0,1)],
									position: wearable.summary.position,
									Falls_activity: wearable.details.wearable_status !== 'Ready to use' ? wearable.summary.reports.Falls_activity || '' : '',
									Night_walk_activity: wearable.details.wearable_status !== 'Ready to use' ? wearable.summary.reports.Night_walk_activity || '' : '', 
									Critically_low_battery_activity: wearable.details.wearable_status !== 'Ready to use' ? wearable.summary.reports.Critically_low_battery_activity || '': '',
									nFacilities: wearable.summary.reports.facilityCount || 0,
									nWards: wearable.summary.reports.wardCount || 0,
									nFWards: wearable.summary.reports.FWardCount || 0,
									registeredResidents: wearable.summary.reports &&  wearable.summary.reports.WResidents ? wearable.summary.reports.WResidents : 0,
									registeredCaregivers: wearable.summary.reports && wearable.summary.reports.WCaregivers ? wearable.summary.reports.WCaregivers : 0,
									registeredWearables: wearable.summary.reports && wearable.summary.reports.WWearables ? wearable.summary.reports.WWearables : 0,
								});
							});
						}
						// this.wearableTableData = wearableTable.sort((a: any,b: any) => {
						// 	return a.Falls_activity < b.Falls_activity ? 1: -1
						// });
						this.wearableTableData=_LODASH.orderBy(wearableTable, ['Falls_activity', 'Night_walk_activity','Critically_low_battery_activity'], ['desc', 'desc','desc']);	  
        			})
				})
			}else{
				this.isLoading.wearable = false;
			}
		});
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

	getAllRooms() {
		this.getHeaders();
		this.isLoading.room = true;
		this.http.get(`${environment.apiUrlNew}/rooms/get/`,{headers:this.header}).subscribe((data: any) => {
			this.isLoading.room = false;
			let roomTableData = [];
			data.body.filter(value => value.details.ward_id === this.wardId).forEach(room => {
				const residents = this.residentTableData.filter(val => val.room_id === room.details.room_id).map(val => {
					return val.Resident_name
				});
				const falls = this.residentTableData.filter(val => val.room_id === room.details.room_id).map(val => {
					return val.Wearable_fall
				});
				let totalFalls = 0;
				falls.forEach(val => {
					totalFalls = totalFalls + val
				})
				roomTableData.push({
					ward_id: room.details.ward_id,
					room_id: room.details.room_id,
					Room_name: room.details.room_name,
					Residents_Name: residents.length > 0 ? residents.join(", ") : '',
					Wearable_fall: totalFalls,
					//wearableFallIncreased: room.details.wearableFallInc || true,
  					//fallDiff: room.wearableFallDiff || 0
				});
			});
			this.roomTableData = roomTableData;
		});
	}
	editWard() {
		const dialog = this.matDialog.open(CommonEditModelComponent, {
			disableClose: true,
			panelClass: 'dialog-popup',
			width: '920px',
			data: {
				dialogType: 'Edit ward',
				wardId: this.wardId,
				customer_id: this.wardDetails.customer_id,
        		facility_id: this.wardDetails.facility_id
			}
		})
		dialog.afterClosed().subscribe(data => {
			if (data) {
				this.init();
				let wards: any = localStorage.getItem('wards');
				wards = JSON.parse(wards);
				wards.itemCount = 9999;
				localStorage.setItem('wards', JSON.stringify(wards));
				this.showToast = true;
				this.toastMessage = data.message;
				setTimeout(() => {
					this.showToast = false;
				}, 3000);
			}
		})
	}
	getHeaders(){
		this.header = new HttpHeaders().set(
		  "Authorization",
		  this.tokenStorage.getToken()
		);
	  }
	getCareGiverList( wardId: string) {
		this.getHeaders();
		this.isLoading.caregiver = true;
		this.http.get(`${environment.apiUrlNew}/caregivers/get/`,{headers:this.header}).subscribe((data: any) => {
			if(data.itemCount > 0){
				this.http.get(`${environment.apiUrlNew}/cdata/getYesterday/`,{headers:this.header}).subscribe((kpi: any) => {
					data.body.forEach((value: any) => {
						value.others = {};
						if(kpi.itemCount > 0){
							const customerKpi = kpi.body.filter(val => val.details.caregiver_id === value.details.caregiver_id);
							let Screen_time_usage = '';
							let Notification_response_time = '';
							let Resident_profiles_viewed = 0;
							customerKpi.forEach(value => {
								if(value.KPI){
									Screen_time_usage =this.transform(value.KPI.ScreenTimeUsage); //Screen_time_usage + parseFloat(value.KPI.ScreenTimeUsage);
									Notification_response_time = Notification_response_time + this.transforms(value.KPI.NotificationResponseTime);// + parseFloat(value.KPI.NRT_FallActivity) + parseFloat(value.KPI.NRT_NightWalkActivity) / 3);
									Resident_profiles_viewed = Resident_profiles_viewed + parseFloat(value.KPI.ResidentProfilesViewed);
								}
							})
							if(customerKpi.length > 0){
								value.others.Screen_time_usage = Screen_time_usage;// < 0.25 ? (Screen_time_usage < 0.1 ? (Screen_time_usage > 0.01 ? 0.1 : 0): (Math.round(Screen_time_usage * 10) / 10).toFixed(1)) : this.roundingTechnique(Screen_time_usage);
								value.others.Notification_response_time = Notification_response_time; //< 0.25 ? (Notification_response_time < 0.1 ? (Notification_response_time > 0.01 ? 0.1 : 0): (Math.round(Notification_response_time * 10) / 10).toFixed(1)) : this.roundingTechnique(Notification_response_time);
						  value.others.Resident_profiles_viewed = Resident_profiles_viewed < 0.25 ? (Resident_profiles_viewed < 0.1 ? (Resident_profiles_viewed > 0.01 ? 0.1 : 0): (Math.round(Resident_profiles_viewed * 10) / 10).toFixed(1)) : this.roundingTechnique(Resident_profiles_viewed);
						}else{
							value.others.Screen_time_usage = (Screen_time_usage);
							value.others.Notification_response_time = Notification_response_time//((Notification_response_time)/60);
							value.others.Resident_profiles_viewed = (Resident_profiles_viewed);
						}
					}
					})
					if(data.itemCount > 0){
						let careGiverTableData = [];
						//const timeZone = moment.parseZone().utcOffset();
					const timeZone = moment.parseZone("2013 01 01 +03:30", 'YYYY MM DD ZZ', 'fr', true).utcOffset();
						const user = JSON.parse(localStorage.getItem('loggedInUser'));
						if(user){
							data.body.filter(value => value.details.facility_id === user.facilities.facility_id).forEach(caregivers => {
								careGiverTableData.push({
									caregiver_id: caregivers.details.caregiver_id,
									Caregiver_name: `${caregivers.details.caregiver_firstName} ${caregivers.details.caregiver_lastName}`,
									firstName: caregivers.details.caregiver_firstName,
									lastName: caregivers.details.caregiver_lastName,
									Wards_assigned: caregivers.details.assigned_wards.filter(value => value.ward_name).map(value => {return value.ward_name}).toString(),
									wardArray: caregivers.details.assigned_wards.map(value => {return value.ward_id}),
									wards: caregivers.details.assigned_wards,
									Email_address: caregivers.details.caregiver_email,
									Phone_number: caregivers.details.caregiver_phone,
									Screen_time_usage: caregivers.others ? caregivers.others.Screen_time_usage || "" : "",
									Resident_profiles_viewed: caregivers.others ? caregivers.others.Resident_profiles_viewed || "" : "",
									Most_visited_page: caregivers.mostVisitPage || "Residents",
									Last_active: parseInt(caregivers.meta.currently_active) === 1 ? 'Currently logged in': (caregivers.meta.last_active === null ? 'Not yet logged in': moment(caregivers.meta.last_active).add(timeZone, 'minutes').fromNow() || ""),
								});
							});
						}
						careGiverTableData = careGiverTableData.filter(value => {
							const exists = value.wardArray.includes(this.wardId);
							if(exists){
							  return true;
							}
							else{
							  return false;
							}
						  })
						this.careGiverTableData = careGiverTableData;
					}
					this.isLoading.caregiver = false;
				})
			}else{
				this.isLoading.caregiver = false;
			}
		})
	}
	// transform(value: number) {
	// 	let  temp = value * 60;
	//    const seconds=Math.floor(temp % 3600 % 60);
	//    let  hours= Math.floor(value / 60);
	//    let minutes = value % 60;
	//    const hour = hours< 10 ? '0' + hours : hours;
	//    const min = minutes < 10 ? '0' + minutes : minutes;
	//    const sec=seconds<10? '0' + seconds :seconds;
	//    if((hour + ':' + min )==='00:00')
	//    {
	// 	return ''; 
		 
	// 	}else{
	// 	 return hour + ':' + min ;
	// 	}
	//  }
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
//	timeZone = moment.parseZone().utcOffset();
timeZone = moment.parseZone("2013 01 01 +03:30", 'YYYY MM DD ZZ', 'fr', true).utcOffset();
						
	getResident(wardId: string) {
		this.getHeaders();
		this.isLoading.resident = true;
		this.http.get(`${environment.apiUrlNew}/residents/get/`,{headers:this.header}).subscribe((data:any) =>{
			this.isLoading.resident = false;
			let residentTableData = [];
			if (data.itemCount > 0) {
				data.body.filter(value => value.WardInformation.ward_id === this.wardId).forEach(residents => {
					residentTableData.push({
						Ward_name: residents.WardInformation.ward_name,
						Last_known_status: residents.status.last_status || 'unknown',
						Questionnaire_fall: parseInt(this.getFallenData(residents.questionnaire.questions)) > 0 ? 'Yes' : 'No',
						Wearable_fall: residents.scores.total_falls ? parseInt(residents.scores.total_falls) : 0,
						Balance: residents.scores.balance || 'unknown',
						Strength: residents.scores.strength || 'unknown',
						//wearableFallIncreased: residents.wearableFallInc || true,
						//fallDiff: residents.wearableFallDiff || 0,
						Sleep: residents.scores.sleep || 'unknown',
						created_at: moment(residents.meta.fall_update).add(this.timeZone, 'minutes').fromNow(),
						updated_at: moment(residents.meta.updated_at).add(this.timeZone, 'minutes').fromNow(),
						Name_on_wearable: residents.GeneralInformation.nick_name,
						Room_name: residents.WardInformation.room_name || 'Room 1',
						Resident_name: `${residents.GeneralInformation.first_name} ${residents.GeneralInformation.last_name}`,
						Battery_status: parseInt(residents.WearableInformation.battery_status),
						ward_id: residents.WardInformation.ward_id,
						room_id: residents.WardInformation.room_id,
					});
				});
				this.residentTableData = residentTableData.filter(value => value.ward_id === this.wardId);
				this.getAllRooms();
			}
		})
	}
	getFallenData(questions: any[]){
		return questions.find(val => val.question === 'How many times you have fallen?').answerValue
	}
	addDialogRoom() {
		this.matDialog.open(CommonAddModelComponent, {
			disableClose: true,
			panelClass: 'dialog-popup',
			width: '920px',
			data: {
				dialogType: 'Import rooms',
				wardId: this.wardId
			}
		})
	}
	addRoom(){
		const dialog = this.matDialog.open(CommonAddModelComponent, {
			disableClose: true,
			panelClass: 'dialog-popup',
			width: '448px',
			data: {
				dialogType: 'Add new room',
				ward_id: this.wardId,
				facility_id: this.wardDetails.facility_id,
				customer_id: this.wardDetails.customer_id
			}
		})
		dialog.afterClosed().subscribe(data => {
			if(data){
				this.getAllRooms();
			}
		})
	}
	selectedTab: number = 0;
	goto(tabIndex: number) {
		this.selectedTab = tabIndex;
	}
	onChangeTab(event: any) {
		this.selectedTab = event.index;
	}
}
