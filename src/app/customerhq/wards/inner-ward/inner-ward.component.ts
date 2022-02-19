import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonAddModelComponent } from '../../../shared/common-add-model/common-add-model.component';
import { FilterComponent } from '../../../shared/filter/filter.component';
import { CommonHttpService } from '../../../shared/services/http-services/common-http.service';
import { CommonService } from './../../../shared/services/common.service';
import { forkJoin, Observable, empty } from 'rxjs';

import * as moment from "moment";
import * as _LODASH from 'lodash';
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
	selector: 'app-inner-ward',
	templateUrl: './inner-ward.component.html',
	styleUrls: ['./inner-ward.component.scss']
})
export class InnerWardComponent implements OnInit {

	wardDetails: any = {
		name: ''
	};
	header:any;
	wardOverView: any = {};
	wardId: any = '';
	constructor(private tokenStorage: TokenStorageServiceService,private routeActivate: ActivatedRoute, private matDialog: MatDialog, private commonHttp: CommonHttpService, private http: HttpClient,  public common: CommonService) {

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
	careGiverWidths: string[] = ['16%', '19%', '16%', '16%', '16%', '16%', '1%'];
	careGiverDisplayedColumns: string[] = ['Caregiver_name', 'Wards_assigned', 'Screen_time_usage', 'Residents_profile_viewed', 'Most_visited_page', 'Last_active_time', 'caregiver_id'];
	careGiverTableData: caregivers[] = [];

	residentWidths: string[] = ['12%', '11%', '10%', '9%', '7%', '7%', '7%', '9%', '9%', '9%', '9%', '9%']
	residentDisplayedColumns: string[] = ['Residents_name', 'Last_known_status', 'Questionnaire_fall', 'Wearable_fall', 'Balance', 'Strength', 'Sleep', 'Ward_name', 'Room_name', 'Name_on_wearable', 'Battery_status'];
	residentTableData: residents[] = [];

	wearableWidths: string[] = ['12%', '12%', '12%', '12%', '12%', '12%', '12%'];
	wearableDisplayedColumns: string[] = ['Wearable_serial_number', 'Wearable_fall', 'Falls_activity','Night_walk_activity','Critically_low_battery_activity'];
	wearableTableData: wearables[] = [];

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
	clearPrevious(page: string){
		localStorage.setItem(page, '');
	}
	facilityPrevious = localStorage.getItem('previousFPage');
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
		this.header = new HttpHeaders().set(
			"Authorization",
			this.tokenStorage.getToken()
		  );
		this.common.eventCatch().subscribe((data) => {
			this.init();
			// if (data && data.page == 'room') {
			//   this.getAllRooms(this.wardId);
			// } else if ()
		});
		this.init();
	}

	init() {
		this.getWard(this.wardId);
		this.getWearables();
	}

	getWard(wardNo: string) {
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
				customer_id
			}
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
	getWearables(){
		
		this.isLoading.wearable = true;
		this.http.get(`${environment.apiUrlNew}/wearables/get/`,{headers:this.header}).subscribe((wearables: any) => {
     
      if(wearables.itemCount > 0){
        forkJoin([this.http.get(`${environment.apiUrlNew}/cdata/getCustomerSummary/`,{headers:this.header}),this.http.get(`${environment.apiUrlNew}/cdata/getFacilitiesSummary/`),this.http.get(`${environment.apiUrlNew}/cdata/getWardsSummary/`)]).subscribe((AllStats: any) => {
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
          wearables.body.forEach((value: any) => {
            const stats = AllStats[0].customers.map(val => {
              return val
            }).find(val => val.customer === value.details.customer_id);
  
            value.summary.reports.facilityCount = stats.facilities_count;
            value.summary.reports.wardCount = stats.wards_count;
            value.summary.reports.CCaregivers = stats.caregivers_count;
            value.summary.reports.CResidents = stats.residents_count;
            value.summary.reports.CWearables = stats.wearables_count;
            const facility = AllStats[1].facilities.map(val => {
              return val
            }).find(val => val.facilit_id === value.details.facility_id);
			if(facility){
            value.summary.reports.FWardCount = facility.wards_count;
            value.summary.reports.FCaregivers = facility.caregivers_count;
            value.summary.reports.FResidents = facility.residents_count;
            value.summary.reports.FWearables = facility.wearables_count;
			}
			
          })
		  
              if(wearables.itemCount > 0){
                //this.http.get(`${environment.apiUrlNew}/kpi/getYesterdayWSummary/`).subscribe((kpi: any) => {
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
                      value.summary.position = positions.find(val => val.id === value.details.wearable_id)? positions.find(val => val.id === value.details.wearable_id).position : kpi.itemCount;
                      let Falls_activity = 0;
                      let Night_walk_activity = 0;
                      let totalFalls=0;
                      let Critically_low_battery_activity = 0;
                      let Screen_time_usage = '';
                      let Notification_response_time = '';
                      let Resident_profiles_viewed = 0;
                      customerKpi.forEach(value => {
                        if(value.KPI){
                          totalFalls=value.KPI.totalFalls;
                          Falls_activity = Falls_activity + parseFloat(value.KPI.FallActivity);
                          Night_walk_activity = Night_walk_activity + parseFloat(value.KPI.NightWalkActivity);
                          Critically_low_battery_activity = Critically_low_battery_activity + parseFloat(value.KPI.CriticallyLowBattery);
                          Screen_time_usage =this.transform(value.KPI.ScreenTimeUsage);// Screen_time_usage + parseFloat(value.KPI.ScreenTimeUsage);
                          Notification_response_time = this.transforms(value.KPI.NotificationResponseTime);//Notification_response_time + parseFloat(value.KPI.NotificationResponseTime);
                          Resident_profiles_viewed = Resident_profiles_viewed + parseFloat(value.KPI.ResidentProfilesViewed);
                        }
                      })
                      if(customerKpi.length > 0){
                        value.summary.reports.totalFalls=totalFalls; 
                        value.summary.reports.Falls_activity = ((Falls_activity/customerKpi.length)) < 0.25 ? (((Falls_activity/customerKpi.length)) < 0.1 ? (((Falls_activity/customerKpi.length)) > 0.01 ? 0.1 : 0): (Math.round(((Falls_activity/customerKpi.length)) * 10) / 10).toFixed(1)) : this.roundingTechnique(((Falls_activity/customerKpi.length)));
                        value.summary.reports.Night_walk_activity = ((Night_walk_activity/customerKpi.length)) < 0.25 ? (((Night_walk_activity/customerKpi.length)) < 0.1 ? (((Night_walk_activity/customerKpi.length)) > 0.01 ? 0.1 : 0): (Math.round(((Night_walk_activity/customerKpi.length)) * 10) / 10).toFixed(1)) : this.roundingTechnique(((Night_walk_activity/customerKpi.length)));
                        value.summary.reports.Critically_low_battery_activity = ((Critically_low_battery_activity/customerKpi.length)) < 0.25 ? (((Critically_low_battery_activity/customerKpi.length)) < 0.1 ? (((Critically_low_battery_activity/customerKpi.length)) > 0.01 ? 0.1 : 0): (Math.round(((Critically_low_battery_activity/customerKpi.length)) * 10) / 10).toFixed(1)) : this.roundingTechnique(((Critically_low_battery_activity/customerKpi.length)));
                        value.summary.reports.Screen_time_usage = Screen_time_usage;//((Screen_time_usage/customerKpi.length)) < 0.25 ? (((Screen_time_usage/customerKpi.length)) < 0.1 ? (((Screen_time_usage/customerKpi.length)) > 0.01 ? 0.1 : 0): (Math.round(((Screen_time_usage/customerKpi.length)) * 10) / 10).toFixed(1)) : this.roundingTechnique(((Screen_time_usage/customerKpi.length)));
                        value.summary.reports.Notification_response_time = Notification_response_time//(((Notification_response_time/customerKpi.length))) < 0.25 ? ((((Notification_response_time/customerKpi.length))) < 0.1 ? ((((Notification_response_time/customerKpi.length))) > 0.01 ? 0.1 : 0): (Math.round((((Notification_response_time/customerKpi.length))) * 10) / 10).toFixed(1)) : this.roundingTechnique((((Notification_response_time/customerKpi.length))));
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

                
				const filteredWearables = wearables.body.filter(value => value.details.ward_id === this.wardId);
				this.wearableTableData = filteredWearables.map(value => {
				  return {
					Facility_name: value.details.facility_name,
					facility_id: value.details.facility_id,
					Battery_status: parseInt(value.details.battery_status),
					Wearable_status: value.details.wearable_status,
					ward_id: value.details.ward_id,
					position: value.summary.position,
					Ward_name: value.details.ward_name,
					Wearable_serial_number: value.details.wearable_sno,
					//Wearable_fall: value.details.wearable_status !== 'Ready to use' ? (value.summary.reports.Falls_activity*5) || '' : '',
					Wearable_fall: value.details.wearable_status !== 'Ready to use' ? (value.summary.reports.totalFalls) || '' : '',
					Falls_activity: value.details.wearable_status !== 'Ready to use' ? value.summary.reports.Falls_activity || '' : '',
					Night_walk_activity: value.details.wearable_status !== 'Ready to use' ? value.summary.reports.Night_walk_activity || '' : '', 
					Critically_low_battery_activity: value.details.wearable_status !== 'Ready to use' ? value.summary.reports.Critically_low_battery_activity || '': '',
					nFacilities: value.summary.reports.facilityCount || 0,
					nWards: value.summary.reports.wardCount || 0,
					nFWards: value.summary.reports.FWardCount || 0,
					//fallDiff: this.getRandomInt(1,5),
					//wearableFallIncreased: this.booleanValue[this.getRandomInt(0,1)],
					registeredResidents: value.summary.reports &&  value.summary.reports.WResidents ? value.summary.reports.WResidents : 0,
					registeredCaregivers: value.summary.reports && value.summary.reports.WCaregivers ? value.summary.reports.WCaregivers : 0,
					registeredWearables: value.summary.reports && value.summary.reports.WWearables ? value.summary.reports.WWearables : 0,
				  }
                  }).sort((a: any,b: any) => {
					return a.Falls_activity < b.Falls_activity ? 1: -1
                  })
				  this.wearableTableData=_LODASH.orderBy(this.wearableTableData, ['Falls_activity', 'Night_walk_activity','Critically_low_battery_activity'], ['desc', 'desc','desc']);	  
       			 })
              }
              this.isLoading.wearable = false;
            })
      }else{
        this.isLoading.wearable = false;
      }
		})
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
	getPreviousPage(){
		return localStorage.getItem('previousWPage');
	}
	editWard() {
		const dialog = this.matDialog.open(CommonEditModelComponent, {
			disableClose: true,
			panelClass: 'dialog-popup',
			width: '920px',
			data: {
				dialogType: 'Edit ward',
				wardId: this.wardId
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
	getCareGiverList(wardId: string) {
		this.isLoading.caregiver = true;
		// this.commonHttp.getCareGiverOfWard(orgId, wardId).subscribe((data: any) => {
		// 	console.log("getCareGiverOfWard", data);
		// 	this.isLoading.caregiver = false;
		// 	if (data) {
		// 		let careGiverTableData = [];

		// 		data["data"]["items"].forEach(caregivers => {
		// 			careGiverTableData.push({
		// 				caregiver_id: caregivers.userId,
		// 				firstName: caregivers.firstName,
		// 				lastName: caregivers.lastName,
		// 				Caregiver_name: `${caregivers.firstName} ${caregivers.lastName}`,
		// 				Wards_assigned: Object.keys(caregivers.wards || []).map(key => caregivers.wards[key].wardName).join(", "),
		// 				wards: caregivers.wards || [],
		// 				Phone_number: caregivers.mobile,
		// 				Email_address: caregivers.email,
		// 				Screen_time_usage: caregivers.screenTime ? caregivers.screenTime + ' min' : "0",
		// 				Residents_profile_viewed: caregivers.residentProfileView || "",
		// 				Most_visited_page: caregivers.mostVisitPage || "",
		// 				Last_active_time: caregivers.lastActive
		// 			});
		// 		});
		// 		this.careGiverTableData = careGiverTableData;
		// 	}
		// })
	}

	getResident(wardId: string) {
		this.isLoading.resident = true;
		// this.commonHttp.getResidentOfWard(orgId, wardId).subscribe((data: any) => {
		// 	console.log("getResidentOfWard", data);
		// 	this.isLoading.resident = false;
		// 	let residentTableData = [];
		// 	if (data) {
		// 		data["data"]["items"].forEach(residents => {
		// 			residentTableData.push({
		// 				Ward_name: residents.wardName,
		// 				Last_known_status: residents.status,
		// 				Questionnaire_fall: residents.questionnaire_fall_count > 0 ? 'Yes' : 'No',
		// 				Wearable_fall: 3,
		// 				Balance: residents.Balance,
		// 				Strength: residents.Strength,
		// 				Sleep: residents.Sleep,
		// 				Name_on_wearable: residents.deviceId,
		// 				Room_name: residents.roomName,
		// 				Residents_name: `${residents.firstName} ${residents.lastName}`,
		// 				Battery_status: 80,
		// 				wearableFallIncreased: residents.wearableFallInc,
  		// 				fallDiff: residents.wearableFallDiff
		// 			});
		// 		});
		// 		this.residentTableData = residentTableData;
		// 	}
		// })
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
	selectedTab: number = 0;
	goto(tabIndex: number) {
		this.selectedTab = tabIndex;
	}
	onChangeTab(event: any) {
		this.selectedTab = event.index;
	}
}
