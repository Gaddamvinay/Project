import { Component, OnInit,ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { CommonAddModelComponent } from '../../shared/common-add-model/common-add-model.component';
import { FilterComponent } from '../../shared/filter/filter.component';
import { CommonHttpService } from '../../shared/services/http-services/common-http.service';
import { CommonService } from './../../shared/services/common.service';
import { CommonEditModelComponent } from '../../shared/common-edit-model/common-edit-model.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import * as _LODASH from "lodash";
import { environment } from '../../../environments/environment';
import { TokenStorageServiceService } from '../../auth/login/token-storage-service.service';

export interface wards {
  'Registered_rooms': number;
  'Registered_residents': number;
  'Registered_wearables': number;
  'Questionnaire_fall': number;
  'Ward_name': string;
  'Wearable_fall': number;
  'wearableFallIncreased': boolean;
  'fallDiff': number;
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
  widths: string[] = ['12.5%', '12.5%', '12.5%', '12.5%', '12.5%', '12.5%', '12.5%', '12.5%'];
  actions: string[] = ['click', '', '', '', '', '', '', '']
  displayedColumns: string[] = ['Ward_name', 'Wearable_fall', 'Falls_activity', 'Night_walk_activity', 'Critically_low_battery_activity', 'Screen_time_usage', 'Resident_profiles_viewed', 'Notification_response_time'];
  tableData: wards[] = [];
  header:any;
  isLoading = false;
  filterForm: FormGroup;
  @ViewChild('select') private select: MatSelect;
  constructor(private tokenStorage: TokenStorageServiceService,private router: Router, private matDialog: MatDialog, private commonHttp: CommonHttpService, 
    public common: CommonService, private fb: FormBuilder, private http: HttpClient) {
      this.filterForm = this.fb.group({
        caregiver: [['']],
        managerSearch: ''
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
    this.getAllWards();
    this.filterForm.valueChanges.subscribe(() => {
      if(this.caregiver.length === 1){
        if(this.caregiver[0] !== ''){
          this.tableData = this.beforeFilter.filter(value => this.caregiver.includes(value.Ward_number))
          this.filtered = true;
        }else{
          this.tableData = this.beforeFilter;
          if(this.filtered){
            this.clearFilters();
          }
        }
      }else if(this.caregiver.length > 1){
        this.tableData = this.beforeFilter.filter(value => this.caregiver.includes(value.Ward_number));
        this.filtered = true;
      }
    })
  }

  managerList = [];
  // getManagers(orgId: any){
  //   const user = JSON.parse(localStorage.getItem('loggedInUser'));
  //   this.http.get(`${environment.apiUrlNew}/caregivers/get/`).subscribe((data: any) => {
  //     const filteredCaregiver = data.body.filter(value => value.details.facility_id === user.facilities.facility_id);
  //     console.log(filteredCaregiver)
  //     this.managerList = filteredCaregiver.map(value => {
  //       return {
  //         userId: value.details.caregiver_id,
  //         name: `${value.details.caregiver_firstName} ${value.details.caregiver_lastName}`
  //       }
  //     }).sort((a:any, b:any) => {
  //       return a.name > b.name ? 1: -1;
  //     })
  //     console.log(this.managerList)
  //   })
  // }

  getUser(id: string){
    return this.managerList.find(value => value.userId === id).name;
  }

  getFilterManagers(){
    this.filterForm.valueChanges.subscribe(() => {
      this.select.close();
    });
    return this.managerList.filter(value => value.name.toLowerCase().includes(this.filterForm.get('managerSearch').value.toLowerCase()) || this.caregiver.includes(value.userId))
  }

  filtered = false;
  beforeFilter = [];
  clearFilters(){
    this.filtered = false;
    this.tableData = this.beforeFilter;
    this.filterForm.patchValue({
      caregiver: [''],
      managerSearch: ''
    })
  }
  showClear(){
    return this.filterForm.value.caregiver.filter(value => value !== '').length > 0;
  }
  get caregiver(){
    if(this.filterForm.get('caregiver').value.length > 1){
      return this.filterForm.get('caregiver').value.filter(value => value !== '');
    }
    return this.filterForm.get('caregiver').value;
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
           // this.http.get(`${environment.apiUrlNew}/kpi/getYesterdayWearableDetails/`).subscribe((kpi: any) => {  
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
                        totalFalls = parseFloat(value.KPI.totalFalls);
                        Falls_activity = Falls_activity + parseFloat(value.KPI.FallActivity);
                        Night_walk_activity = Night_walk_activity + parseFloat(value.KPI.NightWalkActivity);
                        Critically_low_battery_activity = Critically_low_battery_activity + parseFloat(value.KPI.CriticallyLowBattery);
                        Screen_time_usage = this.transform(value.KPI.ScreenTimeUsage); //+ parseFloat(value.KPI.ScreenTimeUsage);
                        Notification_response_time =this.transforms(value.KPI.NotificationResponseTime);//Notification_response_time + parseFloat(value.KPI.NotificationResponseTime);
                        Resident_profiles_viewed = Resident_profiles_viewed + parseFloat(value.KPI.ResidentProfilesViewed);
                      }
                    })
                    if(customerKpi.length > 0){
                      value.summary.wearableFall = totalFalls;
                      value.summary.reports.Falls_activity = Falls_activity < 0.25 ? (Falls_activity < 0.1 ? (Falls_activity > 0.01 ? 0.1 : 0): (Math.round(Falls_activity * 10) / 10).toFixed(1)) : this.roundingTechnique(Falls_activity);
                      value.summary.reports.Night_walk_activity = Night_walk_activity < 0.25 ? (Night_walk_activity < 0.1 ? (Night_walk_activity > 0.01 ? 0.1 : 0): (Math.round(Night_walk_activity * 10) / 10).toFixed(1)) : this.roundingTechnique(Night_walk_activity);
                      value.summary.reports.Critically_low_battery_activity = Critically_low_battery_activity < 0.25 ? (Critically_low_battery_activity < 0.1 ? (Critically_low_battery_activity > 0.01 ? 0.1 : 0): (Math.round(Critically_low_battery_activity * 10) / 10).toFixed(1)) : this.roundingTechnique(Critically_low_battery_activity);
                      value.summary.reports.Screen_time_usage = Screen_time_usage;// < 0.25 ? (Screen_time_usage < 0.1 ? (Screen_time_usage > 0.01 ? 0.1 : 0): (Math.round(Screen_time_usage * 10) / 10).toFixed(1)) : this.roundingTechnique(Screen_time_usage);
                      value.summary.reports.Notification_response_time =Notification_response_time //Notification_response_time < 0.25 ? (Notification_response_time < 0.1 ? (Notification_response_time > 0.01 ? 0.1 : 0): (Math.round(Notification_response_time * 10) / 10).toFixed(1)) : this.roundingTechnique(Notification_response_time);
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
           // this.http.get(`${environment.apiUrlNew}/kpi/getYesterdayWearableDetails/`).subscribe((kpi: any) => {  
                const kpiLength = kpi.length;
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
                          totalFalls = parseFloat(value.KPI.totalFalls);
                          Falls_activity = Falls_activity + parseFloat(value.KPI.FallActivity);
                          Night_walk_activity = Night_walk_activity + parseFloat(value.KPI.NightWalkActivity);
                          Critically_low_battery_activity = Critically_low_battery_activity + parseFloat(value.KPI.CriticallyLowBattery);
                          Screen_time_usage = this.transform(value.KPI.ScreenTimeUsage);// + parseFloat(value.KPI.ScreenTimeUsage);
                          Notification_response_time = this.transforms(value.KPI.NotificationResponseTime);//Notification_response_time + parseFloat(value.KPI.NotificationResponseTime);
                          Resident_profiles_viewed = Resident_profiles_viewed + parseFloat(value.KPI.ResidentProfilesViewed);
                        }
                      })
                      if(customerKpi.length > 0){
                        value.summary.wearableFall = totalFalls;
                        value.summary.reports.Falls_activity = Falls_activity < 0.25 ? (Falls_activity < 0.1 ? (Falls_activity > 0.01 ? 0.1 : 0): (Math.round(Falls_activity * 10) / 10).toFixed(1)) : this.roundingTechnique(Falls_activity);
                        value.summary.reports.Night_walk_activity = Night_walk_activity < 0.25 ? (Night_walk_activity < 0.1 ? (Night_walk_activity > 0.01 ? 0.1 : 0): (Math.round(Night_walk_activity * 10) / 10).toFixed(1)) : this.roundingTechnique(Night_walk_activity);
                        value.summary.reports.Critically_low_battery_activity = Critically_low_battery_activity < 0.25 ? (Critically_low_battery_activity < 0.1 ? (Critically_low_battery_activity > 0.01 ? 0.1 : 0): (Math.round(Critically_low_battery_activity * 10) / 10).toFixed(1)) : this.roundingTechnique(Critically_low_battery_activity);
                        value.summary.reports.Screen_time_usage = Screen_time_usage;// < 0.25 ? (Screen_time_usage < 0.1 ? (Screen_time_usage > 0.01 ? 0.1 : 0): (Math.round(Screen_time_usage * 10) / 10).toFixed(1)) : this.roundingTechnique(Screen_time_usage);
                        value.summary.reports.Notification_response_time =Notification_response_time //Notification_response_time < 0.25 ? (Notification_response_time < 0.1 ? (Notification_response_time > 0.01 ? 0.1 : 0): (Math.round(Notification_response_time * 10) / 10).toFixed(1)) : this.roundingTechnique(Notification_response_time);
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
      const user = JSON.parse(localStorage.getItem('loggedInUser'));
      if(data.itemCount > 0 && user){
        this.managerList = data.body.filter(value => value.details.facility_id === user.facilities.facility_id).map(value => {
          return {
            userId: value.details.ward_id,
            name: value.details.ward_name
          }
        }).sort((a:any, b:any) => {
          return a.name > b.name ? 1: -1;
        })
        data.body.filter(value => value.details.facility_id === user.facilities.facility_id).forEach(ward => {
          tableData.push({
            Ward_name: ward.details.ward_name,
            Ward_number: ward.details.ward_id,
            Wearable_fall: (ward.summary.wearableFall) || '',
            facilityId: ward.details.facility_id,
            customer_id: ward.details.customer_id,
            nFacilities: ward.summary.reports.facilityCount || 0,
            nWards: ward.summary.reports.wardCount || 0,
            nFWards: ward.summary.reports.FWardCount || 0,
            Customer_name: ward.details.customer_name || '',
            Facility_name: ward.details.facility_name || '',
           // fallDiff: this.getRandomInt(1,5),
            //wearableFallIncreased: this.booleanValue[this.getRandomInt(0,1)],
            position: ward.summary.position,
            Falls_activity: ward.summary.reports.Falls_activity ||  '',
            Night_walk_activity: ward.summary.reports.Night_walk_activity  || '', 
            Critically_low_battery_activity: ward.summary.reports.Critically_low_battery_activity  || '', 
            Screen_time_usage: ward.summary.reports.Screen_time_usage  || '', 
            Resident_profiles_viewed: ward.summary.reports.Resident_profiles_viewed  || '', 
            Notification_response_time: ward.summary.reports.Notification_response_time ||  '',
            registeredResidents: ward.summary.reports && ward.summary.reports.WResidents ? ward.summary.reports.WResidents : 0,
            registeredCaregivers: ward.summary.reports && ward.summary.reports.WCaregivers ? ward.summary.reports.WCaregivers : 0,
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
  }

  navigate(value: any) {
    if (value.selected.Ward_number) {
      this.router.navigate(['/facility/wards', `${value.selected.Ward_number}`])
    }
  }
  toastMessage: string = '';
  showToast: boolean = false;
  addWardDialog() {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    const dialog = this.matDialog.open(CommonAddModelComponent, {
      disableClose: true,
      panelClass: 'dialog-popup',
      width: '920px',
      data: {
        dialogType: 'Add new ward',
        customer_id: user.customers.customer_id,
        facility_id: user.facilities.facility_id,
      }
    })
    dialog.afterClosed().subscribe(data => {
      if (data) {
        this.getAllWards();
        let users: any = localStorage.getItem('caregivers');
        if(users){
          users = JSON.parse(users);
          users.itemCount = 9999;
          localStorage.setItem('caregivers', JSON.stringify(users));
        }
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
