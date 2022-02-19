import { Component, OnInit,ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { CommonAddModelComponent } from '../../shared/common-add-model/common-add-model.component';
import { FilterComponent } from '../../shared/filter/filter.component';
import { CommonEditModelComponent } from '../../shared/common-edit-model/common-edit-model.component';
import { CommonService } from '../../shared/services/common.service';
import { CommonHttpService } from '../../shared/services/http-services/common-http.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as moment from "moment";
import * as _LODASH from "lodash";
import { FormBuilder, FormGroup } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenStorageServiceService } from '../../auth/login/token-storage-service.service';

export interface wards {
  'Facility_name': string;
  'Registered_rooms': number;
  'Registered_residents': number;
  'Registered_wearables': number;
  'Questionnaire_fall': number;
  'Ward_name': string;
  'Wearable_fall': number;
  'Ward_manager_name': string;
  'Ward_telephone_number': string;
  'Ward_number': string;
}
@Component({
  selector: 'app-wards',
  templateUrl: './wards.component.html',
  styleUrls: ['./wards.component.scss']
})

export class WardsComponent implements OnInit {
  widths: string[] = ['10%', '10%', '10%', '10%', '10%', '10%', '10%', '10%','10%','10%'];
  actions: string[] = ['click', 'click', 'click', '', '', '', '', '']
  displayedColumns: string[] = ['Customer_name', 'Facility_name','Ward_name', 'Wearable_fall', 'Falls_activity', 'Night_walk_activity', 'Critically_low_battery_activity', 'Screen_time_usage', 'Resident_profiles_viewed', 'Notification_response_time'];
  tableData: any[] = [];
  isLoading = false;
  header:any;
  filterForm: FormGroup;
  displayFacility = false;
  @ViewChild("multiselect") private multiselect: MatSelect;
  @ViewChild('select') private select: MatSelect;
  constructor(private tokenStorage: TokenStorageServiceService,private router: Router, private matDialog: MatDialog, private commonHttp: CommonHttpService, 
    public common: CommonService, private http: HttpClient, private fb :FormBuilder) {
      this.filterForm = this.fb.group({
        customerSearch: [''],
        facilitySearch: [''],
        facilityId: [['']],
        customer_id: [['']]
      })
  }
 
  ngOnInit(): void {
    this.common.eventCatch().subscribe((data) => {
      if (data && data.page == 'ward') {
        this.getAllWards();
      }
    });
    this.header = new HttpHeaders().set(
      "Authorization",
      this.tokenStorage.getToken()
    );
    localStorage.setItem('previousFPage', '');
    localStorage.setItem('previousWPage', '');
    this.getFacility();
    this.getCustomer();
    this.getAllWards();
    this.filterForm.valueChanges.subscribe(data => {
      if(this.customerIds.length === 1){
        if(this.customerIds[0] !== ''){
          this.tableData = this.beforeFilter.filter(value => this.customerIds.includes(value.customer_id))
          this.filtered = true;
        }else{
          this.tableData = this.beforeFilter;
          if(this.filtered){
            this.clearFilters();
          }
        }
      }else if(this.customerIds.length > 1){
        this.tableData = this.beforeFilter.filter(value => this.customerIds.includes(value.customer_id));
        this.filtered = true;
      }
      if(this.facilityIds.length === 1){
        if(this.facilityIds[0] !== ''){
          this.tableData = this.tableData.filter(value => this.facilityIds.includes(value.facilityId))
          this.filtered = true;
        }
      }else if(this.facilityIds.length > 1){
        this.tableData = this.tableData.filter(value => this.facilityIds.includes(value.facilityId));
        this.filtered = true;
      }
    })
  }

  getAllWards() {
    let data = localStorage.getItem("wards");
    if (data) {
      this.http.get(`${environment.apiUrlNew}/wards/get/`,{headers:this.header}).subscribe((dbWards: any) => {
        this.http.get(`${environment.apiUrlNew}/kpi/getYesterdayWSummary/`,{headers:this.header}).subscribe((kpi: any) => {
          if(data != JSON.stringify(dbWards)){
            forkJoin([this.http.get(`${environment.apiUrlNew}/cdata/getCustomerSummary/`,{headers:this.header}),this.http.get(`${environment.apiUrlNew}/cdata/getFacilitiesSummary/`,{headers:this.header}),this.http.get(`${environment.apiUrlNew}/cdata/getWardsSummary/`,{headers:this.header})]).subscribe((AllStats: any) => {
              if(dbWards.itemCount > 0){
                dbWards.body.forEach((value: any) => {
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
              }
            this.http.get(`${environment.apiUrlNew}/kpi/getYesterdayWSummary/`,{headers:this.header}).subscribe((kpi: any) => {
              const yesterday = new Date();
              yesterday.setDate(new Date().getDate() - 1);
              if(kpi.itemCount > 0){

              }
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
                if(dbWards.itemCount > 0){
                  dbWards.body.forEach((value: any) => {
                    if(kpi.itemCount > 0){
                      const customerKpi = kpi.body.filter(val => val.details.ward_id === value.details.ward_id);
                      value.summary.position = positions.find(val => val.id === value.details.ward_id)? positions.find(val => val.id === value.details.ward_id).position: kpi.itemCount;
                      let Falls_activity = 0;
                      let Night_walk_activity = 0;
                      let Critically_low_battery_activity = 0;
                      let Screen_time_usage = '';
                      let Notification_response_time = '';
                      let Resident_profiles_viewed = 0;
                      let totalFalls = 0;
                      customerKpi.forEach(value => {
                        if(value.KPI){
                          Falls_activity = Falls_activity + parseFloat(value.KPI.FallActivity);
                          Night_walk_activity = Night_walk_activity + parseFloat(value.KPI.NightWalkActivity);
                          Critically_low_battery_activity = Critically_low_battery_activity + parseFloat(value.KPI.CriticallyLowBattery);
                          Screen_time_usage =this.transform(value.KPI.ScreenTimeUsage);// Screen_time_usage + parseFloat(value.KPI.ScreenTimeUsage);
                          Notification_response_time = this.transforms(value.KPI.NotificationResponseTime);//Notification_response_time + parseFloat(value.KPI.NotificationResponseTime);
                          Resident_profiles_viewed = Resident_profiles_viewed + parseFloat(value.KPI.ResidentProfilesViewed);
                          totalFalls = parseFloat(value.KPI.totalFalls)
                        }
                      })
                      if(customerKpi.length > 0){
                        value.summary.wearableFall = totalFalls;
                        value.summary.reports.Falls_activity = Falls_activity < 0.25 ? (Falls_activity < 0.1 ? (Falls_activity > 0.01 ? 0.1 : 0): (Math.round(Falls_activity * 10) / 10).toFixed(1)) : this.roundingTechnique(Falls_activity);
                        value.summary.reports.Night_walk_activity = Night_walk_activity < 0.25 ? (Night_walk_activity < 0.1 ? (Night_walk_activity > 0.01 ? 0.1 : 0): (Math.round(Night_walk_activity * 10) / 10).toFixed(1)) : this.roundingTechnique(Night_walk_activity);
                        value.summary.reports.Critically_low_battery_activity = Critically_low_battery_activity < 0.25 ? (Critically_low_battery_activity < 0.1 ? (Critically_low_battery_activity > 0.01 ? 0.1 : 0): (Math.round(Critically_low_battery_activity * 10) / 10).toFixed(1)) : this.roundingTechnique(Critically_low_battery_activity);
                        value.summary.reports.Screen_time_usage = Screen_time_usage; //< 0.25 ? (Screen_time_usage < 0.1 ? (Screen_time_usage > 0.01 ? 0.1 : 0): (Math.round(Screen_time_usage * 10) / 10).toFixed(1)) : this.roundingTechnique(Screen_time_usage);
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
              this.isLoading = false;
              localStorage.setItem('wards', JSON.stringify(dbWards));
              this.loadWardsDate();
            })
          })
          }
        })
      })
      this.loadWardsDate();
    }else{
      this.isLoading = true;
      this.http.get(`${environment.apiUrlNew}/wards/get/`,{headers:this.header}).subscribe((data: any) => {
        forkJoin([this.http.get(`${environment.apiUrlNew}/cdata/getCustomerSummary/`,{headers:this.header}),this.http.get(`${environment.apiUrlNew}/cdata/getFacilitiesSummary/`,{headers:this.header}),this.http.get(`${environment.apiUrlNew}/cdata/getWardsSummary/`,{headers:this.header})]).subscribe((AllStats: any) => {
          if(data.itemCount > 0){
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
              // const ward = AllStats[2].wards.map(val => {
              //   return val
              // }).find(val => val.ward_id === value.details.ward_id)
              // if(ward){
              //   value.summary.reports.WResidents = ward.residents_count;
              //   value.summary.reports.WWearables = ward.wearables_count;
              // }
  
            })
          }
            this.http.get(`${environment.apiUrlNew}/kpi/getYesterdayWSummary/`,{headers:this.header}).subscribe((kpi: any) => {
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
                if(data.itemCount > 0){
                  data.body.forEach((value: any) => {
                    if(kpi.itemCount > 0){
                      const customerKpi = kpi.body.filter(val => val.details.ward_id === value.details.ward_id);
                      value.summary.position = positions.find(val => val.id === value.details.ward_id)? positions.find(val => val.id === value.details.ward_id).position: kpi.itemCount;
                      let Falls_activity = 0;
                      let Night_walk_activity = 0;
                      let Critically_low_battery_activity = 0;
                      let Screen_time_usage = '';
                      let Notification_response_time = '';
                      let Resident_profiles_viewed = 0;
                      let totalFalls = 0;
                      customerKpi.forEach(value => {
                        if(value.KPI){
                          totalFalls=value.KPI.totalFalls;
                          Falls_activity = Falls_activity + parseFloat(value.KPI.FallActivity);
                          Night_walk_activity = Night_walk_activity + parseFloat(value.KPI.NightWalkActivity);
                          Critically_low_battery_activity = Critically_low_battery_activity + parseFloat(value.KPI.CriticallyLowBattery);
                          Screen_time_usage = this.transform(value.KPI.ScreenTimeUsage);//Screen_time_usage + parseFloat(value.KPI.ScreenTimeUsage);
                          Notification_response_time = this.transforms(value.KPI.NotificationResponseTime);//Notification_response_time + parseFloat(value.KPI.NotificationResponseTime);
                          Resident_profiles_viewed = Resident_profiles_viewed + parseFloat(value.KPI.ResidentProfilesViewed);
                          totalFalls = totalFalls;
                        }
                      })
                      if(customerKpi.length > 0){
                        value.summary.wearableFall = totalFalls;
                        value.summary.reports.Falls_activity = Falls_activity < 0.25 ? (Falls_activity < 0.1 ? (Falls_activity > 0.01 ? 0.1 : 0): (Math.round(Falls_activity * 10) / 10).toFixed(1)) : this.roundingTechnique(Falls_activity);
                        value.summary.reports.Night_walk_activity = Night_walk_activity < 0.25 ? (Night_walk_activity < 0.1 ? (Night_walk_activity > 0.01 ? 0.1 : 0): (Math.round(Night_walk_activity * 10) / 10).toFixed(1)) : this.roundingTechnique(Night_walk_activity);
                        value.summary.reports.Critically_low_battery_activity = Critically_low_battery_activity < 0.25 ? (Critically_low_battery_activity < 0.1 ? (Critically_low_battery_activity > 0.01 ? 0.1 : 0): (Math.round(Critically_low_battery_activity * 10) / 10).toFixed(1)) : this.roundingTechnique(Critically_low_battery_activity);
                        value.summary.reports.Screen_time_usage = Screen_time_usage ;//< 0.25 ? (Screen_time_usage < 0.1 ? (Screen_time_usage > 0.01 ? 0.1 : 0): (Math.round(Screen_time_usage * 10) / 10).toFixed(1)) : this.roundingTechnique(Screen_time_usage);
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
                  this.isLoading = false;
                  localStorage.setItem('wards', JSON.stringify(data));
                  this.loadWardsDate();
              })
          })
      }, (err) => {
        this.isLoading = false;
        localStorage.setItem('wards', JSON.stringify({body: [], itemCount: 0}));
      })
    }
  }
  getCustomerById(id: any){
    if(id !== ''){
      return this.customerList.find(value => value.customer_id === id).customer_name;
    }
  }

  get customerIds(){
    if(this.filterForm.get('customer_id').value.length > 1){
      return this.filterForm.get('customer_id').value.filter(value => value !== '');
    }
    return this.filterForm.get('customer_id').value;
  }

  getFacilityById(id: any){
    if(id !== ''){
      return this.facilityList.find(value => value.facilityId === id).facilityName;
    }
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

  get facilityIds(){
    if(this.filterForm.get('facilityId').value.length > 1){
      return this.filterForm.get('facilityId').value.filter(value => value !== '');
    }
    return this.filterForm.get('facilityId').value;
  }

  filtered: boolean = false;
  beforeFilter = [];
  clearFilters(){
    this.filtered = false;
    this.tableData = this.beforeFilter;
    this.displayFacility = false;
    this.filterForm.patchValue({
      facilitySearch: '',
      customerSearch: '',
      facilityId: [''],
      customer_id: ['']
    })
  }

  getFilterCustomers(){
    this.filterForm.valueChanges.subscribe(() => {
      this.select.close();
    });
    return this.customerList.filter(value => value.customer_name.toLowerCase().includes(this.filterForm.get('customerSearch').value.toLowerCase()) || this.customerIds.includes(value.customer_id));
  }

  getIFilterFacilities(facilities: any[]){
    this.filterForm.valueChanges.subscribe(() => {
      this.multiselect.close();
    });
    return facilities.filter(value => value.facilityName.toLowerCase().includes(this.filterForm.get('facilitySearch').value.toLowerCase()) || this.facilityIds.includes(value.facilityId));
  }
  showClear(){
    return this.filterForm.value.customer_id.filter(value => value !== '').length || this.filterForm.value.customer_id.filter(value => value !== '').length;
  }

  getFilterFacilities(){
    this.filterForm.valueChanges.subscribe(() => {
      this.multiselect.close();
    });
    if(this.filterForm.get('customer_id').value === ''){
      return this.facilityList;
    }
    return this.facilityList.filter(value => this.filterForm.get('customer_id').value.includes(value.customerId))
  }

  initial = true;
  booleanValue = [true, false];
  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  loadWardsDate() {
    let data: any = localStorage.getItem("wards");
    this.clearFilters();
    if (data) {
      data = JSON.parse(data)
      let tableData = [];
      if(data.itemCount > 0){
        data.body.filter(value => value.details.ward_id !== '').forEach(ward => {	
          tableData.push({
            Ward_name: ward.details.ward_name,
            Ward_number: ward.details.ward_id,
            //fallDiff: this.getRandomInt(1,5),
          //  wearableFallIncreased: this.booleanValue[this.getRandomInt(0,1)],
            Wearable_fall: ward.summary.wearableFall || '',
            facilityId: ward.details.facility_id,
            customer_id: ward.details.customer_id,
            position: ward.summary.position,
            nFacilities: ward.summary.reports.facilityCount || 0,
            nWards: ward.summary.reports.wardCount || 0,
            nFWards: ward.summary.reports.FWardCount || 0,
            Customer_name: ward.details.customer_name || '',
            Facility_name: ward.details.facility_name || '',
            caregivers: ward.summary.reports.CCaregivers || 0,
            residents: ward.summary.reports.CResidents || 0,
            wearables: ward.summary.reports.CWearables || 0,
            FCaregivers: ward.summary.reports.FCaregivers || 0,
            FResidents: ward.summary.reports.FResidents || 0,
            FWearables: ward.summary.reports.FWearables || 0,
            Falls_activity: ward.summary.reports.Falls_activity ||  '',
            Night_walk_activity: ward.summary.reports.Night_walk_activity  || '', 
            Critically_low_battery_activity: ward.summary.reports.Critically_low_battery_activity  || '', 
            Screen_time_usage: ward.summary.reports.Screen_time_usage  || '', 
            Resident_profiles_viewed: ward.summary.reports.Resident_profiles_viewed  || '', 
            Notification_response_time: ward.summary.reports.Notification_response_time ||  '',
            registeredResidents: ward.summary.reports && ward.summary.reports.WResidents ? ward.summary.reports.WResidents : 0,
            registeredCaregivers: ward.summary.reports && ward.summary.reports.registeredCaregivers ? ward.summary.reports.registeredCaregivers : 0,
            registeredWearables: ward.summary.reports && ward.summary.reports.WWearables ? ward.summary.reports.WWearables : 0,
          });
        });
        // this.tableData = tableData.sort((a: any,b: any) => {
        //   return a.Falls_activity < b.Falls_activity ? 1: -1
        // });
        this.tableData=_LODASH.orderBy(tableData, ['Falls_activity', 'Night_walk_activity','Critically_low_battery_activity'], ['desc', 'desc','desc']);
        // this.beforeFilter = tableData.sort((a: any,b: any) => {
        //   return a.Falls_activity < b.Falls_activity ? 1: -1
        // });
        this.beforeFilter=_LODASH.orderBy(tableData, ['Falls_activity', 'Night_walk_activity','Critically_low_battery_activity'], ['desc', 'desc','desc']);
       
      }else{
        this.tableData = [];
        this.beforeFilter = [];
      }
    }
    this.initial = false;
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

  navigate(value: any) {
    switch(value.key){
      case 'Ward_name':
        if (value.selected.Ward_number) {
          this.router.navigate(['/ssa/wards', `${value.selected.Ward_number}`])
        }
        break;
      case 'Facility_name' : 
        if (value.selected.facilityId) {
          this.router.navigate(['/ssa/facilities', `${value.selected.facilityId}`])
        }
        break;
      case 'Customer_name' : 
        if (value.selected.customer_id) {
          this.router.navigate(['/ssa/customers', `${value.selected.customer_id}`])
        }
        break;
    }
  }
  toastMessage: string = '';
  showToast: boolean = false;
  customerList = [];
  getCustomer(){
    this.http.get(`${environment.apiUrlNew}/customers/get/`,{headers:this.header}).subscribe((customers: any) => {
      if(customers.itemCount > 0){
        this.customerList = customers.body.map(value => {
          return {
            customer_name: value.details.customer_name,
            customer_id: value.details.customer_id,
          }
        }).sort((a:any, b:any) => {
          return a.customer_name > b.customer_name ? 1: -1;
        });
      }
    });
  }
  facilityList = [];
  getFacility(){
    this.http.get(`${environment.apiUrlNew}/facilities/get/`,{headers:this.header}).subscribe((facilities: any) => {
      if(facilities.itemCount > 0){
        this.facilityList = facilities.body.map(value => {
          return {
            facilityName: value.details.facility_name,
            facilityId: value.details.facility_id,
            customerId: value.details.customer_id
          }
        }).sort((a:any, b:any) => {
          return a.facilityName > b.facilityName ? 1: -1;
        });
      }
    })
  }
  addWardDialog() {
    const dialog = this.matDialog.open(CommonAddModelComponent, {
      disableClose: true,
      panelClass: 'dialog-popup',
      width: '920px',
      data: {
        dialogType: 'Add new ward',
        extraFields: true
      }
    })
    dialog.afterClosed().subscribe(data => {
      if (data) {
        this.getAllWards();
        let users: any = localStorage.getItem('users');
				users = JSON.parse(users);
				users.itemCount = 9999;
        localStorage.setItem('users', JSON.stringify(users));
        let customers: any = localStorage.getItem('customers');
				customers = JSON.parse(customers);
				customers.itemCount = 9999;
        localStorage.setItem('customers', JSON.stringify(customers));
        
        let facilities: any = localStorage.getItem('facilities');
				facilities = JSON.parse(facilities);
				facilities.itemCount = 9999;
				localStorage.setItem('facilities', JSON.stringify(facilities));
        this.showToast = true;
        this.toastMessage = data.message;
        setTimeout(() => {
          this.showToast = false;
        }, 3000);
      }
    })
  }
  doOperation(event: any) {
    if (event.action === 'Edit') {
      const dialog = this.matDialog.open(CommonEditModelComponent, {
        disableClose: true,
        panelClass: 'dialog-popup',
        width: '920px',
        data: {
          dialogType: 'Edit ward',
          wardId: event.selected.Ward_number
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
    } else {
      console.log(event)
    }
  }
  openFilter(event: any) {
    const filters = this.matDialog.open(FilterComponent, {
      disableClose: false,
      panelClass: 'filter-popup',
      backdropClass: 'filter-backdrop',
      width: '490px',
      position: {
        left: `${event.pageX - 435}px`,
        top: `${event.pageY + 30}px`
      },
      data: {
        possibleFilters: ['wardName', 'wardManger']
      }
    })
  }
}