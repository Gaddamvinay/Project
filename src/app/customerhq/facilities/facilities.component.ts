import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit,ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import * as moment from 'moment';
import { MatSelect } from '@angular/material/select';
import { FormBuilder, FormGroup } from '@angular/forms';

import * as _LODASH from "lodash";
import { TokenStorageServiceService } from '../../auth/login/token-storage-service.service';

export interface facilities {
  'Registered_rooms': number;
  'Registered_residents': number;
  'Registered_wearables': number;
  'Questionnaire_fall': number;
  'Facility_name': string;
  'Wearable_fall': number;
  'facility_number': string
}
@Component({
  selector: 'app-facilities',
  templateUrl: './facilities.component.html',
  styleUrls: ['./facilities.component.scss']
})
export class FacilitiesComponent implements OnInit {

  widths: string[] = ['25%','9%','9%','9%','9%','10%','9%','10%', '10%'];
  actions: string[] = ['click', 'click', '', '', '', '', '', '']
  displayedColumns: string[] = ['Facility_name', 'Wearable_fall', 'Falls_activity', 'Night_walk_activity', 'Critically_low_battery_activity', 'Screen_time_usage', 'Resident_profiles_viewed', 'Notification_response_time'];
  tableData: any[] = [
  ] 
  filterForm: FormGroup;
  filtered = false;
  header:any;
  @ViewChild('select') private select: MatSelect;
  constructor(private tokenStorage: TokenStorageServiceService,private router: Router,private http: HttpClient, private fb: FormBuilder) { 
    this.filterForm = this.fb.group({
      facilityId: [['']],
      facilitySearch: [''],
    })
  }

  getFilterFacilities(){
    this.filterForm.valueChanges.subscribe(() => {
      this.select.close();
    });
    return this.facilityList.filter(value => value.facilityName.toLowerCase().includes(this.filterForm.get('facilitySearch').value.toLowerCase()))
  }
  ngOnInit(): void {
    this.getFacilities();
    this.header = new HttpHeaders().set(
      "Authorization",
      this.tokenStorage.getToken()
    );
    localStorage.setItem('previousFPage', '');
    localStorage.setItem('previousWPage', '');
    this.filterForm.valueChanges.subscribe(data => {
      if(this.facilityIds.length === 1){
        if(this.facilityIds[0] !== ''){
          this.tableData = this.beforeFilter.filter(value => this.facilityIds.includes(value.facility_number))
          this.filtered = true;
        }else{
          this.tableData = this.beforeFilter;
          if(this.filtered){
            this.clearFilters()
          }
        }
      }else if(this.facilityIds.length > 1){
        this.tableData = this.beforeFilter.filter(value => this.facilityIds.includes(value.facility_number));
        this.filtered = true;
      }
    })
  }
  doOperation(event: string){

  }
  getTableData(){
    return this.tableData;
  }
  beforeFilter = [];
  clearFilters(){
    this.filtered = false;
    this.tableData = this.beforeFilter;
    this.filterForm.patchValue({
      facilityId: [''],
      facilitySearch: ''
    })
  }
  getFacilityById(facilityId: any){
    if(facilityId !== ''){
      return this.facilityList.find(value => value.facilityId ===facilityId).facilityName;
    }
  }

  get facilityIds(){
    if(this.filterForm.get('facilityId').value.length > 1){
      return this.filterForm.get('facilityId').value.filter(value => value !== '');
    }
    return this.filterForm.get('facilityId').value;
  }
  facilityList = [];
  showClear(){
    return this.filterForm.value.facilityId.filter(value => value !== '').length > 0;
  }
  navigate(value: any){
    switch(value.key){
      case 'Ward_name' : 
        if (value.selected.Ward_number) {
          this.router.navigate(['/hq/wards', `${value.selected.Ward_number}`])
        }
        break;
      case 'Facility_name' : 
        if (value.selected.facility_number) {
          this.router.navigate(['/hq/facilities', `${value.selected.facility_number}`])
        }
        break;
      case 'Customer_name' : 
        if (value.selected.customer_id) {
          this.router.navigate(['/hq/customers', `${value.selected.customer_id}`])
        }
        break;
    }
  }
  initial = true;
  getFacilities(){
    let facilities: any = localStorage.getItem('facilities');
    if(facilities){
      facilities = JSON.parse(facilities);
      this.http.get(`${environment.apiUrlNew}/facilities/get/`,{headers:this.header}).subscribe((dbFacilities: any) => {
        if(facilities.itemCount != dbFacilities.itemCount){
          forkJoin([this.http.get(`${environment.apiUrlNew}/cdata/getCustomerSummary/`,{headers:this.header}),this.http.get(`${environment.apiUrlNew}/cdata/getFacilitiesSummary/`)]).subscribe((AllStats: any) => {
            if(dbFacilities.itemCount > 0){
              dbFacilities.body.forEach((value: any) => {
                const stats = AllStats[0].customers.map(val => {
                  return val
                }).find(val => val.customer === value.details.customer_id);
    
                value.summary.reports = {};
                value.summary.reports.facilityCount = stats.facilities_count;
                value.summary.reports.wardCount = stats.wards_count;
                value.summary.reports.CCaregivers = stats.caregivers_count;
                value.summary.reports.CResidents = stats.residents_count;
                value.summary.reports.CWearables = stats.wearables_count;
                
                const facility = AllStats[1].facilities.map(val => {
                  return val
                }).find(val => val.facilit_id === value.details.facility_id);
                value.summary.reports.FWardCount = facility.wards_count;
                value.summary.reports.FCaregivers = facility.caregivers_count;
                value.summary.reports.FResidents = facility.residents_count;
                value.summary.reports.FWearables = facility.wearables_count;
              })
            }
          this.http.get(`${environment.apiUrlNew}/kpi/getYesterdayFSummary/`,{headers:this.header}).subscribe((kpi: any) => {
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
            if(dbFacilities.itemCount > 0){
              dbFacilities.body.forEach((value: any) => {
                if(kpi.itemCount > 0){
                  const customerKpi = kpi.body.filter(val => val.details.facility_id === value.details.facility_id);
                  value.summary.position = positions.find(val => val.id === value.details.facility_id) ? positions.find(val => val.id === value.details.facility_id).position: kpi.itemCount;
                  let Falls_activity = 0;
                  let Night_walk_activity = 0;
                  let Critically_low_battery_activity = 0;
                  let Screen_time_usage = '';
                  let Notification_response_time = '';
                  let Resident_profiles_viewed = 0;
                  customerKpi.forEach((value: any)=> {
                    if(value.KPI){
                      Falls_activity = Falls_activity + parseFloat(value.KPI.FallActivity);
                      Night_walk_activity = Night_walk_activity + parseFloat(value.KPI.NightWalkActivity);
                      Critically_low_battery_activity = Critically_low_battery_activity + parseFloat(value.KPI.CriticallyLowBattery);
                      Screen_time_usage = this.transform(value.KPI.ScreenTimeUsage);//Screen_time_usage + parseFloat(value.KPI.ScreenTimeUsage);
                      Notification_response_time = this.transforms(value.KPI.NotificationResponseTime);//Notification_response_time + parseFloat(value.KPI.NotificationResponseTime);
                      Resident_profiles_viewed = Resident_profiles_viewed + parseFloat(value.KPI.ResidentProfilesViewed);
                    }
                  })
                  if(customerKpi.length > 0){
                    value.summary.reports.Falls_activity = Falls_activity < 0.25 ? (Falls_activity < 0.1 ? (Falls_activity > 0.01 ? 0.1 : 0): (Math.round(Falls_activity * 10) / 10).toFixed(1)) : this.roundingTechnique(Falls_activity);
                    value.summary.reports.Night_walk_activity = Night_walk_activity < 0.25 ? (Night_walk_activity < 0.1 ? (Night_walk_activity > 0.01 ? 0.1 : 0): (Math.round(Night_walk_activity * 10) / 10).toFixed(1)) : this.roundingTechnique(Night_walk_activity);
                    value.summary.reports.Critically_low_battery_activity = Critically_low_battery_activity < 0.25 ? (Critically_low_battery_activity < 0.1 ? (Critically_low_battery_activity > 0.01 ? 0.1 : 0): (Math.round(Critically_low_battery_activity * 10) / 10).toFixed(1)) : this.roundingTechnique(Critically_low_battery_activity);
                    value.summary.reports.Screen_time_usage = Screen_time_usage;// < 0.25 ? (Screen_time_usage < 0.1 ? (Screen_time_usage > 0.01 ? 0.1 : 0): (Math.round(Screen_time_usage * 10) / 10).toFixed(1)) : this.roundingTechnique(Screen_time_usage);
                    value.summary.reports.Notification_response_time = Notification_response_time //Notification_response_time < 0.25 ? (Notification_response_time < 0.1 ? (Notification_response_time > 0.01 ? 0.1 : 0): (Math.round(Notification_response_time * 10) / 10).toFixed(1)) : this.roundingTechnique(Notification_response_time);
                    value.summary.reports.Resident_profiles_viewed = Resident_profiles_viewed < 0.25 ? (Resident_profiles_viewed < 0.1 ? (Resident_profiles_viewed > 0.01 ? 0.1 : 0): (Math.round(Resident_profiles_viewed * 10) / 10).toFixed(1)) : this.roundingTechnique(Resident_profiles_viewed);
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
            }
            localStorage.setItem('facilities', JSON.stringify(dbFacilities));
            this.loadMoreFacilities();
          })
        })
        }
        this.loadMoreFacilities();
      })
      this.loadMoreFacilities();
    }else{
      this.isLoading = true;
      this.http.get(`${environment.apiUrlNew}/facilities/get/`,{headers:this.header}).subscribe((facilities: any) => {
        forkJoin([this.http.get(`${environment.apiUrlNew}/cdata/getCustomerSummary/`,{headers:this.header}),this.http.get(`${environment.apiUrlNew}/cdata/getFacilitiesSummary/`)]).subscribe((AllStats: any) => {
          if(facilities.itemCount > 0){
            facilities.body.forEach((value: any) => {
              const stats = AllStats[0].customers.map(val => {
                return val
              }).find(val => val.customer === value.details.customer_id);
  
              value.summary.reports = {};
              value.summary.reports.facilityCount = stats.facilities_count;
              value.summary.reports.wardCount = stats.wards_count;
              value.summary.reports.CCaregivers = stats.caregivers_count;
              value.summary.reports.CResidents = stats.residents_count;
              value.summary.reports.CWearables = stats.wearables_count;
              
              const facility = AllStats[1].facilities.map(val => {
                return val
              }).find(val => val.facilit_id === value.details.facility_id);
              value.summary.reports.FWardCount = facility.wards_count;
              value.summary.reports.FCaregivers = facility.caregivers_count;
              value.summary.reports.FResidents = facility.residents_count;
              value.summary.reports.FWearables = facility.wearables_count;
            })
          }
          this.http.get(`${environment.apiUrlNew}/kpi/getYesterdayFSummary/`,{headers:this.header}).subscribe((kpi: any) => {
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
            if(facilities.itemCount > 0){
              facilities.body.forEach((value: any) => {
                if(kpi.itemCount > 0){
                  const customerKpi = kpi.body.filter(val => val.details.facility_id === value.details.facility_id);
                  value.summary.position = positions.find(val => val.id === value.details.facility_id) ? positions.find(val => val.id === value.details.facility_id).position: kpi.itemCount;
                  let Falls_activity = 0;
                  let Night_walk_activity = 0;
                  let Critically_low_battery_activity = 0;
                  let Screen_time_usage = '';
                  let totalFalls=0;
                  let Notification_response_time = '';
                  let Resident_profiles_viewed = 0;
                  customerKpi.forEach(value => {
                    if(value.KPI){
                      Falls_activity = Falls_activity + parseFloat(value.KPI.FallActivity);
                      Night_walk_activity = Night_walk_activity + parseFloat(value.KPI.NightWalkActivity);
                      Critically_low_battery_activity = Critically_low_battery_activity + parseFloat(value.KPI.CriticallyLowBattery);
                      Screen_time_usage = this.transform(value.KPI.ScreenTimeUsage);//Screen_time_usage + parseFloat(value.KPI.ScreenTimeUsage);
                      Notification_response_time =this.transforms(value.KPI.NotificationResponseTime);// Notification_response_time + parseFloat(value.KPI.NotificationResponseTime);
                      Resident_profiles_viewed = Resident_profiles_viewed + parseFloat(value.KPI.ResidentProfilesViewed);
                      totalFalls = totalFalls + parseFloat(value.KPI.totalFalls)
                    }
                  })
                  if(customerKpi.length > 0){
                    value.summary.wearableFall = totalFalls;
                    //value.summary.wearableFall = Math.round((Falls_activity * 5) * value.summary.reports.FWardCount)
                    value.summary.reports.Falls_activity = Falls_activity < 0.25 ? (Falls_activity < 0.1 ? (Falls_activity > 0.01 ? 0.1 : 0): (Math.round(Falls_activity * 10) / 10).toFixed(1)) : this.roundingTechnique(Falls_activity);
                    value.summary.reports.Night_walk_activity = Night_walk_activity < 0.25 ? (Night_walk_activity < 0.1 ? (Night_walk_activity > 0.01 ? 0.1 : 0): (Math.round(Night_walk_activity * 10) / 10).toFixed(1)) : this.roundingTechnique(Night_walk_activity);
                    value.summary.reports.Critically_low_battery_activity = Critically_low_battery_activity < 0.25 ? (Critically_low_battery_activity < 0.1 ? (Critically_low_battery_activity > 0.01 ? 0.1 : 0): (Math.round(Critically_low_battery_activity * 10) / 10).toFixed(1)) : this.roundingTechnique(Critically_low_battery_activity);
                    value.summary.reports.Screen_time_usage = Screen_time_usage;// < 0.25 ? (Screen_time_usage < 0.1 ? (Screen_time_usage > 0.01 ? 0.1 : 0): (Math.round(Screen_time_usage * 10) / 10).toFixed(1)) : this.roundingTechnique(Screen_time_usage);
                    value.summary.reports.Notification_response_time = Notification_response_time//Notification_response_time < 0.25 ? (Notification_response_time < 0.1 ? (Notification_response_time > 0.01 ? 0.1 : 0): (Math.round(Notification_response_time * 10) / 10).toFixed(1)) : this.roundingTechnique(Notification_response_time);
                    value.summary.reports.Resident_profiles_viewed = Resident_profiles_viewed < 0.25 ? (Resident_profiles_viewed < 0.1 ? (Resident_profiles_viewed > 0.01 ? 0.1 : 0): (Math.round(Resident_profiles_viewed * 10) / 10).toFixed(1)) : this.roundingTechnique(Resident_profiles_viewed);
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
            }

              localStorage.setItem('facilities', JSON.stringify(facilities));
              this.isLoading = false;
              this.loadMoreFacilities();
          })
        })
      }, () => {
        this.isLoading = false;
        localStorage.setItem('facilities', JSON.stringify({body: [], itemCount: 0}));
      });
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
  isLoading = false;
  booleanValue = [true, false];
  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
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

  loadMoreFacilities(){
    let data: any = localStorage.getItem("facilities");
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (data && user) {
      data = JSON.parse(data);
      if(data.itemCount > 0){
        const tableData = data.body.filter(value => value.details.facility_id !== '').filter(value => value.details.customer_id === user.customers.customer_id).map(value => {
           return {
            Wearable_fall: value.summary.wearableFall || '',
            //fallDiff: this.getRandomInt(1,5),
            //wearableFallIncreased: this.booleanValue[this.getRandomInt(0,1)],
            facility_number: value.details.facility_id,
            customer_id: value.details.customer_id,
            Customer_name: value.details.customer_name || '',
            Facility_name: value.details.facility_name || '',
            position: value.summary.position,
            Falls_activity: value.summary.reports.Falls_activity || '',
            Night_walk_activity: value.summary.reports.Night_walk_activity || '', 
            Critically_low_battery_activity: value.summary.reports.Critically_low_battery_activity || '', 
            Screen_time_usage: value.summary.reports.Screen_time_usage || '', 
            nFacilities: value.summary.reports.facilityCount || 0,
            nWards: value.summary.reports.wardCount || 0,
            nFWards: value.summary.reports.FWardCount || 0,
            caregivers: value.summary.reports.CCaregivers || 0,
            residents: value.summary.reports.CResidents || 0,
            wearables: value.summary.reports.CWearables || 0,
            FCaregivers: value.summary.reports.FCaregivers || 0,
            FResidents: value.summary.reports.FResidents || 0,
            FWearables: value.summary.reports.FWearables || 0,
            Resident_profiles_viewed: value.summary.reports.Resident_profiles_viewed || '', 
            Notification_response_time: value.summary.reports.Notification_response_time || '',
            registeredResidents: value.summary.reports.registeredResidents || 0,
            registeredCaregivers: value.summary.reports.registeredCaregivers || 0,
            registeredWearables: value.summary.reports.registeredWearables || 0,
          };
        })
        // this.tableData = tableData.sort((a: any,b: any) => {
        //   return a.Falls_activity < b.Falls_activity ? 1: -1
        // });
        this.tableData=_LODASH.orderBy(tableData, ['Falls_activity', 'Night_walk_activity','Critically_low_battery_activity'], ['desc', 'desc','desc']);
                  
        this.facilityList = this.tableData.map(value => {
          return {
            facilityName: value.Facility_name,
            facilityId: value.facility_number,
            customerId: value.customer_id
          }
        })
        this.beforeFilter = this.tableData;
      }else{
        this.tableData = [];
        this.beforeFilter = [];
      }
    }
  }

}
