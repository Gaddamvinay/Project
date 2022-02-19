import { Component, OnInit,ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonAddModelComponent } from '../../shared/common-add-model/common-add-model.component';
import { FilterComponent } from '../../shared/filter/filter.component';
import { CommonHttpService } from '../../shared/services/http-services/common-http.service';
import { CommonService } from './../../shared/services/common.service'
import * as moment from "moment";
import * as _LODASH from "lodash";
import { MatDialog } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { FormBuilder, FormGroup } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TokenStorageServiceService } from '../../auth/login/token-storage-service.service';
import { environment } from '../../../environments/environment';

export interface wearables {
  'Wearable_serial_no': string;
  'Wearable_status': string;
  'Battery_status': string;
  'Resident_name': string;
  'Ward_name': string;
  'Room_name': string;
  'Bed_number': string;
}
@Component({
  selector: 'app-wearables',
  templateUrl: './wearables.component.html',
  styleUrls: ['./wearables.component.scss']
})
export class WearablesComponent implements OnInit {

  widths: string[] = ['12.5%', '12.5%', '12.5%', '12.5%', '12.5%', '12.5%', '12.5%','12.5%'];
  actions: string[] = ['click', '', '', '', '', '', '', '']
  displayedColumns: string[] = ['Ward_name', 'Wearable_serial_number','Wearable_status', 'Battery_status','Wearable_fall','Falls_activity','Night_walk_activity','Critically_low_battery_activity'];
  isLoading = false;
  tableData: any[] = [ ];
  header:any;
  filterForm: FormGroup;
  @ViewChild('select') private select: MatSelect;
  @ViewChild('roomSelect') private roomSelect: MatSelect;
  constructor(private tokenStorage: TokenStorageServiceService, routeActivate: ActivatedRoute, private router: Router, private http: HttpClient,private matDialog: MatDialog, private commonHttp: CommonHttpService,  public common: CommonService, private fb: FormBuilder) { 
    this.filterForm = this.fb.group({
      ward_id: [['']],
      wardSearch: [''],
      room_id: [['']],
      roomSearch: ['']
    })
    this.getNewWards();
  }
  getNewWards(){
		this.http.get(`${environment.apiUrlNew}/wards/get/`,{headers:this.header}).subscribe((wards: any) => {
      const user = JSON.parse(localStorage.getItem('loggedInUser'));
      if(wards.itemCount > 0 && user){
        this.wardList = wards.body.filter(val => val.details.facility_id === user.facilities.facility_id).map(value => {
          return {
            name: value.details.ward_name,
            id: value.details.ward_id
          }
        }).sort((a:any, b:any) => {
          return a.name > b.name ? 1: -1;
        })
      }
		})
  }

  get wardIds(){
    if(this.filterForm.get('ward_id').value.length > 1){
      return this.filterForm.get('ward_id').value.filter(value => value !== '');
    }
    return this.filterForm.get('ward_id').value;
  }
  wardList = [];
  getWardByID(id: any){
    return this.wardList.find(value => value.id === id).name
  }

  getFilterWards(){
    this.filterForm.valueChanges.subscribe(() => {
      this.select.close();
    });
    return this.wardList.filter(value => value.name.toLowerCase().includes(this.filterForm.get('wardSearch').value.toLowerCase()));
  }

  get roomIds(){
    if(this.filterForm.get('room_id').value.length > 1){
      return this.filterForm.get('room_id').value.filter(value => value !== '');
    }
    return this.filterForm.get('room_id').value;
  }

  roomList = [];
  getRoomByID(id: any){
    return this.roomList.find(value => value.id === id).name
  }

  getFilterRooms(){
    this.filterForm.valueChanges.subscribe(() => {
      this.roomSelect.close();
    });
    return this.roomList.filter(value =>{
      return value.name.toLowerCase().includes(this.filterForm.get('roomSearch').value.toLowerCase())
    });
  }

  showClear(){
    return this.filterForm.value.ward_id.filter(value => value !== '').length > 0;
  }

  getRoomValues(){
    this.http.get(`${environment.apiUrlNew}/rooms/get/`,{headers:this.header}).subscribe((roomDetails: any) => {
      this.wardIds.forEach(event => {
        this.roomList = [...this.roomList,...roomDetails.body.filter(value => value.details.ward_id === event)
          .map(value => {return {id: value.details.room_id, name: value.details.room_name}})
          .sort((a,b) => {
          return a.name > b.name ? 1 : -1;
        })]
        const unique = [];
        this.roomList.forEach(val => {
          const exists = unique.find(value => value.id === val.id)
          if(!exists){
            unique.push(val)
          }
        })
        this.roomList = unique;
      })
		});
  }

  filtered = false;
  clearFilters(){
    this.filtered = false;
    this.filterForm.patchValue({
      room_id: [''],
      ward_id: [''],
      roomSearch: '',
      wardSearch: ''
    })
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

  ngOnInit(): void {
    this.getWearables();
    this.header = new HttpHeaders().set(
      "Authorization",
      this.tokenStorage.getToken()
    );
    this.filterForm.valueChanges.subscribe(data => {
      if(this.wardIds.length === 1){
        if(this.wardIds[0] !== ''){
          this.tableData = this.beforeFilter.filter(value => {
            return this.wardIds.includes(value.ward_id) 
          })
          this.filtered = true;
        }else{
          this.tableData = this.beforeFilter;
          if(this.filtered){
            this.clearFilters();
          }
        }
      }else if(this.wardIds.length > 1){
        this.tableData = this.beforeFilter.filter(value => this.wardIds.includes(value.ward_id));
        this.filtered = true;
      }
      if(this.roomIds.length === 1){
        if(this.roomIds[0] !== ''){
          this.tableData = this.tableData.filter(value => this.roomIds.includes(value.room_id))
          this.filtered = true;
        }
      }else if(this.roomIds.length > 1){
        this.tableData = this.tableData.filter(value => this.roomIds.includes(value.room_id));
        this.filtered = true;
      }
    })
  }

  doOperation(event: any){
    console.log(event)
  }

  booleanValue = [true, false];
  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  getWearables() {
    let wearables:any = localStorage.getItem('wearables');
    if(wearables){
      this.http.get(`${environment.apiUrlNew}/wearables/get/`,{headers:this.header}).subscribe((data: any) => {
        if(wearables != JSON.stringify(data)){
          forkJoin([this.http.get(`${environment.apiUrlNew}/cdata/getCustomerSummary/`,{headers:this.header}),this.http.get(`${environment.apiUrlNew}/cdata/getFacilitiesSummary/`,{headers:this.header}),this.http.get(`${environment.apiUrlNew}/cdata/getWardsSummary/`,{headers:this.header})]).subscribe((AllStats: any) => {
            data.body.forEach((value: any) => {
              const stats = AllStats[0].customers.map(val => {
                return val
              }).find(val => val.customer === value.details.customer_id);
  
              value.summary.reports = {};
              if(stats){
                value.summary.reports.facilityCount = stats.facilities_count;
                value.summary.reports.wardCount = stats.wards_count;
                value.summary.reports.CCaregivers = stats.caregivers_count;
                value.summary.reports.CResidents = stats.residents_count;
                value.summary.reports.CWearables = stats.wearables_count;
              }
              
              const facility = AllStats[1].facilities.map(val => {
                return val
              }).find(val => val.facilit_id === value.details.facility_id);
              if(facility){
                value.summary.reports.FWardCount = facility.wards_count;
                value.summary.reports.FCaregivers = facility.caregivers_count;
                value.summary.reports.FResidents = facility.residents_count;
                value.summary.reports.FWearables = facility.wearables_count;
              }
              const ward = AllStats[2].wards.map(val => {
                return val
              }).find(val => val.ward_id === value.details.ward_id)
              if(ward){
                value.summary.reports.WResidents = ward.residents_count;
                value.summary.reports.WWearables = ward.wearables_count;
              }
  
            })
            
            //  this.http.get(`${environment.apiUrlNew}/kpi/getYesterdayWSummary/`).subscribe((kpi: any) => {
              this.http.get(`${environment.apiUrlNew}/kpi/getYesterdayWearableDetails/`,{headers:this.header}).subscribe((kpi: any) => {  
               
            data.body.forEach((value: any) => {
                  if(kpi.itemCount > 0){
                    const customerKpi = kpi.body.filter(val => val.details.wearable_id === value.details.wearable_id);
                    let Falls_activity = 0;
                    let Night_walk_activity = 0;
                    let Critically_low_battery_activity = 0;
                    let Screen_time_usage = 0;
                    let Notification_response_time = 0;
                    let Resident_profiles_viewed = 0;
                    let totalFalls=0;
                    customerKpi.forEach(value => {
                      if(value.KPI){
                        totalFalls=value.KPI.totalFalls;
                        Falls_activity = Falls_activity + parseFloat(value.KPI.FallActivity);
                        Night_walk_activity = Night_walk_activity + parseFloat(value.KPI.NightWalkActivity);
                        Critically_low_battery_activity = Critically_low_battery_activity + parseFloat(value.KPI.CriticallyLowBattery);
                        Screen_time_usage = Screen_time_usage + parseFloat(value.KPI.ScreenTimeUsage);
                        Notification_response_time = Notification_response_time + parseFloat(value.KPI.NotificationResponseTime);
                        Resident_profiles_viewed = Resident_profiles_viewed + parseFloat(value.KPI.ResidentProfilesViewed);
                      }
                    })
                    if(customerKpi.length > 0){
                      value.summary.reports.totalFalls =totalFalls;
                      value.summary.reports.Falls_activity = ((Falls_activity/customerKpi.length)) < 0.25 ? (((Falls_activity/customerKpi.length)) < 0.1 ? (((Falls_activity/customerKpi.length)) > 0.01 ? 0.1 : 0): (Math.round(((Falls_activity/customerKpi.length)) * 10) / 10).toFixed(1)) : this.roundingTechnique(((Falls_activity/customerKpi.length)));
                      value.summary.reports.Night_walk_activity = ((Night_walk_activity/customerKpi.length)) < 0.25 ? (((Night_walk_activity/customerKpi.length)) < 0.1 ? (((Night_walk_activity/customerKpi.length)) > 0.01 ? 0.1 : 0): (Math.round(((Night_walk_activity/customerKpi.length)) * 10) / 10).toFixed(1)) : this.roundingTechnique(((Night_walk_activity/customerKpi.length)));
                      value.summary.reports.Critically_low_battery_activity = ((Critically_low_battery_activity/customerKpi.length)) < 0.25 ? (((Critically_low_battery_activity/customerKpi.length)) < 0.1 ? (((Critically_low_battery_activity/customerKpi.length)) > 0.01 ? 0.1 : 0): (Math.round(((Critically_low_battery_activity/customerKpi.length)) * 10) / 10).toFixed(1)) : this.roundingTechnique(((Critically_low_battery_activity/customerKpi.length)));
                      value.summary.reports.Screen_time_usage = ((Screen_time_usage/customerKpi.length)) < 0.25 ? (((Screen_time_usage/customerKpi.length)) < 0.1 ? (((Screen_time_usage/customerKpi.length)) > 0.01 ? 0.1 : 0): (Math.round(((Screen_time_usage/customerKpi.length)) * 10) / 10).toFixed(1)) : this.roundingTechnique(((Screen_time_usage/customerKpi.length)));
                      value.summary.reports.Notification_response_time = (((Notification_response_time/customerKpi.length)/3)/60) < 0.25 ? ((((Notification_response_time/customerKpi.length)/3)/60) < 0.1 ? ((((Notification_response_time/customerKpi.length)/3)/60) > 0.01 ? 0.1 : 0): (Math.round((((Notification_response_time/customerKpi.length)/3)/60) * 10) / 10).toFixed(1)) : this.roundingTechnique((((Notification_response_time/customerKpi.length)/3)/60));
                      value.summary.reports.Resident_profiles_viewed = ((Resident_profiles_viewed/customerKpi.length)) < 0.25 ? (((Resident_profiles_viewed/customerKpi.length)) < 0.1 ? (((Resident_profiles_viewed/customerKpi.length)) > 0.01 ? 0.1 : 0): (Math.round(((Resident_profiles_viewed/customerKpi.length)) * 10) / 10).toFixed(1)) : this.roundingTechnique(((Resident_profiles_viewed/customerKpi.length)));
                    }else{
                      value.summary.reports.Falls_activity = (Falls_activity);
                      value.summary.reports.Night_walk_activity = (Night_walk_activity);
                      value.summary.reports.Critically_low_battery_activity = (Critically_low_battery_activity);
                      value.summary.reports.Screen_time_usage = (Screen_time_usage);
                      value.summary.reports.Notification_response_time = ((Notification_response_time)/60);
                      value.summary.reports.Resident_profiles_viewed = (Resident_profiles_viewed);
                    }
                  }
                })
                localStorage.setItem('wearables', JSON.stringify(data));
                this.loadMoreData();
              })
            })
        }
      });
      this.loadMoreData();
    }else{
      this.isLoading = true;
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
                  data.body.forEach((value: any) => {
                  if(kpi.itemCount > 0){
                    const customerKpi = kpi.body.filter(val => val.details.wearable_id === value.details.wearable_id);
                    value.summary.position = positions.find(val => val.id === value.details.wearable_id)? positions.find(val => val.id === value.details.wearable_id).position: kpi.itemCount;
                    let Falls_activity = 0;
                    let Night_walk_activity = 0;
                    let Critically_low_battery_activity = 0;
                    let Screen_time_usage = 0;
                    let Notification_response_time = 0;
                    let Resident_profiles_viewed = 0;
                    let totalFalls=0;
                    customerKpi.forEach(value => {
                      if(value.KPI){
                        totalFalls=value.KPI.totalFalls;
                        Falls_activity = Falls_activity + parseFloat(value.KPI.FallActivity);
                        Night_walk_activity = Night_walk_activity + parseFloat(value.KPI.NightWalkActivity);
                        Critically_low_battery_activity = Critically_low_battery_activity + parseFloat(value.KPI.CriticallyLowBattery);
                        Screen_time_usage = Screen_time_usage + parseFloat(value.KPI.ScreenTimeUsage);
                        Notification_response_time = Notification_response_time + parseFloat(value.KPI.NotificationResponseTime);
                        Resident_profiles_viewed = Resident_profiles_viewed + parseFloat(value.KPI.ResidentProfilesViewed);
                      }
                    })
                    if(customerKpi.length > 0){
                      value.summary.reports.totalFalls=totalFalls;
                      value.summary.reports.Falls_activity = ((Falls_activity/customerKpi.length)) < 0.25 ? (((Falls_activity/customerKpi.length)) < 0.1 ? (((Falls_activity/customerKpi.length)) > 0.01 ? 0.1 : 0): (Math.round(((Falls_activity/customerKpi.length)) * 10) / 10).toFixed(1)) : this.roundingTechnique(((Falls_activity/customerKpi.length)));
                      value.summary.reports.Night_walk_activity = ((Night_walk_activity/customerKpi.length)) < 0.25 ? (((Night_walk_activity/customerKpi.length)) < 0.1 ? (((Night_walk_activity/customerKpi.length)) > 0.01 ? 0.1 : 0): (Math.round(((Night_walk_activity/customerKpi.length)) * 10) / 10).toFixed(1)) : this.roundingTechnique(((Night_walk_activity/customerKpi.length)));
                      value.summary.reports.Critically_low_battery_activity = ((Critically_low_battery_activity/customerKpi.length)) < 0.25 ? (((Critically_low_battery_activity/customerKpi.length)) < 0.1 ? (((Critically_low_battery_activity/customerKpi.length)) > 0.01 ? 0.1 : 0): (Math.round(((Critically_low_battery_activity/customerKpi.length)) * 10) / 10).toFixed(1)) : this.roundingTechnique(((Critically_low_battery_activity/customerKpi.length)));
                      value.summary.reports.Screen_time_usage = ((Screen_time_usage/customerKpi.length)) < 0.25 ? (((Screen_time_usage/customerKpi.length)) < 0.1 ? (((Screen_time_usage/customerKpi.length)) > 0.01 ? 0.1 : 0): (Math.round(((Screen_time_usage/customerKpi.length)) * 10) / 10).toFixed(1)) : this.roundingTechnique(((Screen_time_usage/customerKpi.length)));
                      value.summary.reports.Notification_response_time = (((Notification_response_time/customerKpi.length)/3)/60) < 0.25 ? ((((Notification_response_time/customerKpi.length)/3)/60) < 0.1 ? ((((Notification_response_time/customerKpi.length)/3)/60) > 0.01 ? 0.1 : 0): (Math.round((((Notification_response_time/customerKpi.length)/3)/60) * 10) / 10).toFixed(1)) : this.roundingTechnique((((Notification_response_time/customerKpi.length)/3)/60));
                      value.summary.reports.Resident_profiles_viewed = ((Resident_profiles_viewed/customerKpi.length)) < 0.25 ? (((Resident_profiles_viewed/customerKpi.length)) < 0.1 ? (((Resident_profiles_viewed/customerKpi.length)) > 0.01 ? 0.1 : 0): (Math.round(((Resident_profiles_viewed/customerKpi.length)) * 10) / 10).toFixed(1)) : this.roundingTechnique(((Resident_profiles_viewed/customerKpi.length)));
                    }else{
                      value.summary.reports.Falls_activity = (Falls_activity);
                      value.summary.reports.Night_walk_activity = (Night_walk_activity);
                      value.summary.reports.Critically_low_battery_activity = (Critically_low_battery_activity);
                      value.summary.reports.Screen_time_usage = (Screen_time_usage);
                      value.summary.reports.Notification_response_time = ((Notification_response_time)/60);
                      value.summary.reports.Resident_profiles_viewed = (Resident_profiles_viewed);
                    }
                  }
                })
                localStorage.setItem('wearables', JSON.stringify(data));
                this.loadMoreData();
              })
            })
        }else{
          this.isLoading = false
        }
      });
    }
  }
  
  beforeFilter = [];
  showRoomFilter = false;
  loadMoreData(){
    let data :any = localStorage.getItem('wearables');
    if(data){
      this.isLoading = false;
      data = JSON.parse(data);
      let tableData = [];
      this.clearFilters();
      const user = JSON.parse(localStorage.getItem('loggedInUser'));
      if(data.itemCount > 0 && user){
        data.body.filter(value => value.details.facility_id === user.facilities.facility_id).forEach(wearable => {
          tableData.push({
            ward_id: wearable.details.ward_id,
            Ward_name: wearable.details.ward_name,
            Wearable_serial_number: wearable.details.wearable_sno,
            Battery_status: parseInt(wearable.details.battery_status),
            position: wearable.summary.position,
            Wearable_status: wearable.details.wearable_status,
          //  Wearable_fall: wearable.details.wearable_status !== 'Ready to use' ? (wearable.summary.reports.Falls_activity*5) || '' : '',
          Wearable_fall: wearable.details.wearable_status !== 'Ready to use' ? (wearable.summary.reports.totalFalls) || '' : '', 
           //fallDiff: this.getRandomInt(1,5),
            //wearableFallIncreased: this.booleanValue[this.getRandomInt(0,1)],
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
      const exists = this.tableData.find(value => value.room_id !== '')
      if(exists){
        this.showRoomFilter = true;
      }
      // this.tableData = tableData.sort((a: any,b: any) => {
      //   return a.Falls_activity < b.Falls_activity ? 1: -1
      // });
      this.tableData=_LODASH.orderBy(tableData, ['Falls_activity', 'Night_walk_activity','Critically_low_battery_activity'], ['desc', 'desc','desc']);	  
        			
      // this.beforeFilter = tableData.sort((a: any,b: any) => {
      //   return a.Falls_activity < b.Falls_activity ? 1: -1
      // });
      this.beforeFilter=_LODASH.orderBy(tableData, ['Falls_activity', 'Night_walk_activity','Critically_low_battery_activity'], ['desc', 'desc','desc']);	  
        
    }
  }
  navigate(value: any){
    switch(value.key){
      case 'Ward_name' : 
        if (value.selected.ward_id) {
          localStorage.setItem('previousWPage', 'Customer');
          this.router.navigate(['/facility/wards', `${value.selected.ward_id}`])
        }
        break;
    }
  }
}
