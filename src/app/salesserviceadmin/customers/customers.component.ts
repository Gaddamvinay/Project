import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit,ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatSelect } from '@angular/material/select';
import { CommonAddModelComponent } from '../../shared/common-add-model/common-add-model.component';
import { CommonEditModelComponent } from '../../shared/common-edit-model/common-edit-model.component';
import { CommonService } from '../../shared/services/common.service';
import * as moment from "moment";
import * as _LODASH from "lodash";
import { environment } from '../../../environments/environment';
import { stringify } from '@angular/compiler/src/util';
import { TokenStorageServiceService } from '../../auth/login/token-storage-service.service';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit {

  widths: string[] = ['25%','10%','8%','8%', '9%','10%', '10%', '10%', '10%'];
  actions: string[] = ['click', '', '', '', '', '', '', '', ''];
  displayedColumns: string[] = ['Customer_name', 'Customer_status', 'Wearable_fall', 'Falls_activity', 'Night_walk_activity', 'Critically_low_battery_activity', 'Screen_time_usage', 'Resident_profiles_viewed', 'Notification_response_time'];
  tableData: any[] = [
  ] 
  header:any;
  isLoading = false;
  filterForm: FormGroup;
  @ViewChild('select') private select: MatSelect;
  constructor(private tokenStorage: TokenStorageServiceService,private router: Router,private http: HttpClient,private common: CommonService, private matDialog: MatDialog, private fb: FormBuilder) { 
    this.filterForm = this.fb.group({
      status: [['']],
      customerSearch: ['']
    })
  }

  filtered = false;
  beforeFilter = [];
  clearFilters(){
    this.filtered = false;
    this.tableData = this.beforeFilter;
    this.filterForm.patchValue({
      status: [''],
      customerSearch: ''
    })
  }
  showClear(){
    return this.filterForm.value.status.filter(value => value !== '').length > 0;
  }
  get status(){
    if(this.filterForm.get('status').value.length > 1){
      return this.filterForm.get('status').value.filter(value => value !== '');
    }
    return this.filterForm.get('status').value;
  }
  getFilterCustomers(){
    this.filterForm.valueChanges.subscribe(() => {
      this.select.close();
    });
    return this.customerList.filter(value => value.name.toLowerCase().includes(this.filterForm.get('customerSearch').value.toLowerCase()) || this.status.includes(value.id));
  }

  ngOnInit(): void {
    this.getCustomers();
    localStorage.setItem('previousFPage', '');
    localStorage.setItem('previousWPage', '');
    this.header = new HttpHeaders().set(
      "Authorization",
      this.tokenStorage.getToken()
    );
    this.filterForm.valueChanges.subscribe(() => {
      if(this.status.length === 1){
        if(this.status[0] !== ''){
          this.tableData = this.beforeFilter.filter(value => this.status.includes(value.Customer_id))
          this.filtered = true;
        }else{
          this.tableData = this.beforeFilter;
        }
      }else if(this.status.length > 1){
        this.tableData = this.beforeFilter.filter(value => this.status.includes(value.Customer_id));
        this.filtered = true;
      }
    })
  }
  registeredValues: { residents: number, caregivers: number, wearables: number} = {
    residents: 0,
    wearables: 0,
    caregivers: 0
  }
  doOperation(event: any){
    if(event.action === 'hover'){
      const {registeredCaregivers: caregivers, registeredResidents: residents, registeredWearables: wearables} = event.selected;
      this.registeredValues = {
        caregivers,
        residents,
        wearables
      }
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

  getCustomers(){
    let customers = localStorage.getItem('customers');
    if(customers){
      this.http.get(`${environment.apiUrlNew}/customers/get/`,{headers:this.header}).subscribe((dbCustomers: any) => {
        if(customers != JSON.stringify(dbCustomers)){
          this.http.get(`${environment.apiUrlNew}/cdata/getCustomerSummary/`,{headers:this.header}).subscribe((AllStats: any) => {
            if(dbCustomers.itemCount > 0){
              dbCustomers.body.forEach((value: any) => {
                const stats = AllStats.customers.map(val => {
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
              })
            }
          this.http.get(`${environment.apiUrlNew}/kpi/getYesterdayCSummary/`,{headers:this.header}).subscribe((kpi: any) => {
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
            if(dbCustomers.itemCount > 0){
              dbCustomers.body.forEach((value: any) => {
                if(kpi.itemCount > 0){
                  const customerKpi = kpi.body.filter(val => val.details.customer_id === value.details.customer_id);
                  value.summary.position = positions.find(val => val.id === value.details.customer_id) ? positions.find(val => val.id === value.details.customer_id).position : kpi.body.length + 1;
                  let Falls_activity = 0;
                  let Night_walk_activity = 0;
                  let Critically_low_battery_activity = 0;
                  let Screen_time_usage = '';
                  let Notification_response_time = '';
                  let Resident_profiles_viewed = 0;
                  let totalFalls = 0;
                  customerKpi.forEach(value => {
                    if(value.KPI){
                     // console.log("valus nt"+parseFloat(value.KPI.NotificationResponseTime))
                      Falls_activity = Falls_activity + parseFloat(value.KPI.FallActivity);
                      Night_walk_activity = Night_walk_activity + parseFloat(value.KPI.NightWalkActivity);
                      Critically_low_battery_activity = Critically_low_battery_activity + parseFloat(value.KPI.CriticallyLowBattery);
                      Screen_time_usage = this.transform(value.KPI.ScreenTimeUsage);//Screen_time_usage + parseFloat(value.KPI.ScreenTimeUsage);
                      Notification_response_time = this.transforms(value.KPI.NotificationResponseTime);// + parseFloat(value.KPI.NotificationResponseTime);
                      Resident_profiles_viewed = Resident_profiles_viewed + parseFloat(value.KPI.ResidentProfilesViewed);
                      totalFalls = totalFalls + parseFloat(value.KPI.totalFalls)
                      
                    }
                  })
                  value.summary.wearableFall = totalFalls;
                  if(customerKpi.length > 0){
                    value.summary.reports.Falls_activity = Falls_activity < 0.25 ? (Falls_activity < 0.1 ? (Falls_activity > 0.01 ? 0.1 : 0): (Math.round(Falls_activity * 10) / 10).toFixed(1)) : this.roundingTechnique(Falls_activity);
                    value.summary.reports.Night_walk_activity = Night_walk_activity < 0.25 ? (Night_walk_activity < 0.1 ? (Night_walk_activity > 0.01 ? 0.1 : 0): (Math.round(Night_walk_activity * 10) / 10).toFixed(1)) : this.roundingTechnique(Night_walk_activity);
                    value.summary.reports.Critically_low_battery_activity = Critically_low_battery_activity < 0.25 ? (Critically_low_battery_activity < 0.1 ? (Critically_low_battery_activity > 0.01 ? 0.1 : 0): (Math.round(Critically_low_battery_activity * 10) / 10).toFixed(1)) : this.roundingTechnique(Critically_low_battery_activity);
                    value.summary.reports.Screen_time_usage= Screen_time_usage; //< 0.25 ? (Screen_time_usage < 0.1 ? (Screen_time_usage > 0.01 ? 0.1 : 0): (Math.round(Screen_time_usage * 10) / 10).toFixed(1)) : this.roundingTechnique(Screen_time_usage);
                   // value.summary.reports.Notification_response_time = Notification_response_time < 0.25 ? (Notification_response_time < 0.1 ? (Notification_response_time > 0.01 ? 0.1 : 0): (Math.round(Notification_response_time * 10) / 10).toFixed(1)) : this.roundingTechnique(Notification_response_time);
                   value.summary.reports.Notification_response_time = Notification_response_time;// < 0.25 ? (Notification_response_time < 0.1 ? (Notification_response_time > 0.01 ? 0.1 : 0): (Math.round(Notification_response_time * 10) / 10).toFixed(1)) : this.roundingTechnique(Notification_response_time);
                   value.summary.reports.Resident_profiles_viewed = Resident_profiles_viewed < 0.25 ? (Resident_profiles_viewed < 0.1 ? (Resident_profiles_viewed > 0.01 ? 0.1 : 0): (Math.round(Resident_profiles_viewed * 10) / 10).toFixed(1)) : this.roundingTechnique(Resident_profiles_viewed);
                    //console.log("this for NTF"+ Notification_response_time);
                  }else{
                    value.summary.reports.Falls_activity = (Falls_activity);
                    value.summary.reports.Night_walk_activity = (Night_walk_activity);
                    value.summary.reports.Critically_low_battery_activity = (Critically_low_battery_activity);
                    value.summary.reports.Screen_time_usage = (Screen_time_usage);
                    value.summary.reports.Notification_response_time = (Notification_response_time);
                    //value.summary.reports.Notification_response_time = ((Notification_response_time)/60);
                    value.summary.reports.Resident_profiles_viewed = (Resident_profiles_viewed);
                  }
                  
                }
              })
            }
            
            localStorage.setItem('customers', JSON.stringify(dbCustomers));
            this.isLoading = false;
            this.loadMoreCustomer();
        })
        })
        }
      })
      
      this.loadMoreCustomer();
    }else{
      this.isLoading = true;
      this.http.get(`${environment.apiUrlNew}/customers/get/`,{headers:this.header}).subscribe((customers: any) => {
        this.http.get(`${environment.apiUrlNew}/cdata/getCustomerSummary/`,{headers:this.header}).subscribe((AllStats: any) => {
          if(customers.itemCount >0){
            customers.body.forEach((value: any) => {
              const stats = AllStats.customers.map(val => {
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
            })
          }
          this.http.get(`${environment.apiUrlNew}/kpi/getYesterdayCSummary/`,{headers:this.header}).subscribe((kpi: any) => {
              const yesterday = new Date();
              yesterday.setDate(new Date().getDate() - 1);
              let positions: any;
                if(kpi.itemCount > 0){
                  positions = kpi.body.map((val: any, i: number) => {
                    return {
                      id: val.details.customer_id,
                      position: i
                    }
                  })
                }else{
                  positions = [];
                }
                if(customers.itemCount > 0){
                  customers.body.forEach((value: any) => {
                    if(kpi.itemCount > 0){
                      const customerKpi = kpi.body.filter(val => val.details.customer_id === value.details.customer_id);
                      const position = positions.find(val => val.id === value.details.customer_id);
                      value.summary.position = position ? position.position: kpi.itemCount;
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
                      Screen_time_usage =this.transform(value.KPI.ScreenTimeUsage) //Screen_time_usage + parseFloat(value.KPI.ScreenTimeUsage);
                      Notification_response_time = this.transforms(value.KPI.NotificationResponseTime)// + parseFloat(value.KPI.NotificationResponseTime);
                      Resident_profiles_viewed = Resident_profiles_viewed + parseFloat(value.KPI.ResidentProfilesViewed);
                      totalFalls = totalFalls + parseFloat(value.KPI.totalFalls)
                    }
                  })
                  value.summary.wearableFall = totalFalls;
                  if(customerKpi.length > 0){
                        value.summary.reports.Falls_activity = Falls_activity < 0.25 ? (Falls_activity < 0.1 ? (Falls_activity > 0.01 ? 0.1 : 0): (Math.round(Falls_activity * 10) / 10).toFixed(1)) : this.roundingTechnique(Falls_activity);
                        value.summary.reports.Night_walk_activity = Night_walk_activity < 0.25 ? (Night_walk_activity < 0.1 ? (Night_walk_activity > 0.01 ? 0.1 : 0): (Math.round(Night_walk_activity * 10) / 10).toFixed(1)) : this.roundingTechnique(Night_walk_activity);
                        value.summary.reports.Critically_low_battery_activity = Critically_low_battery_activity < 0.25 ? (Critically_low_battery_activity < 0.1 ? (Critically_low_battery_activity > 0.01 ? 0.1 : 0): (Math.round(Critically_low_battery_activity * 10) / 10).toFixed(1)) : this.roundingTechnique(Critically_low_battery_activity);
                        value.summary.reports.Screen_time_usage = Screen_time_usage; //< 0.25 ? (Screen_time_usage < 0.1 ? (Screen_time_usage > 0.01 ? 0.1 : 0): (Math.round(Screen_time_usage * 10) / 10).toFixed(1)) : this.roundingTechnique(Screen_time_usage);
                        value.summary.reports.Notification_response_time = Notification_response_time ;//< 0.25 ? (Notification_response_time < 0.1 ? (Notification_response_time > 0.01 ? 0.1 : 0): (Math.round(Notification_response_time * 10) / 10).toFixed(1)) : this.roundingTechnique(Notification_response_time);
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
              localStorage.setItem('customers', JSON.stringify(customers));
              this.isLoading = false;
              this.loadMoreCustomer();
          })
        })
      }, () => {
        this.isLoading = false;
        localStorage.setItem('customers', JSON.stringify({body: [], itemCount: 0}));
      });
    }
  }
  initial = true;
  customerList = [];
  getCustomer(id: any){
    return this.customerList.find(value => value.id === id).name
  }
  booleanValue = [true, false];
  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  loadMoreCustomer(){
    let data: any = localStorage.getItem("customers");
    this.clearFilters();
    if (data) {
      data = JSON.parse(data);
      if(data.itemCount > 0){
        const tableData = data.body.filter(value => value.details.customer_id !== '').map(value => {
          return {
            Customer_name: value.details.customer_name,
            Customer_id: value.details.customer_id,
            Customer_status: value.details.customer_status || '',
            Wearable_fall: value.summary.wearableFall || '',
           // wearableFallIncreased: this.booleanValue[this.getRandomInt(0,1)],
            registeredResidents: value.details.registeredResidents || 0,
            registeredCaregivers: value.details.registeredCaregivers || 0,
            registeredWearables: value.details.registeredWearables || 0,
            nFacilities: value.summary.reports.facilityCount || 0,
            nWards: value.summary.reports.wardCount || 0,
            position: value.summary.position,
            //fallDiff: this.getRandomInt(1,5),
            Falls_activity: value.summary.reports.Falls_activity || '',
            Night_walk_activity: value.summary.reports.Night_walk_activity || '', 
            caregivers: value.summary.reports.CCaregivers || 0,
            residents: value.summary.reports.CResidents || 0,
            wearables: value.summary.reports.CWearables || 0,
            Critically_low_battery_activity: value.summary.reports.Critically_low_battery_activity || '', 
            Screen_time_usage: value.summary.reports.Screen_time_usage || '', 
            Resident_profiles_viewed: value.summary.reports.Resident_profiles_viewed || '', 
            Notification_response_time: value.summary.reports.Notification_response_time || ''
          }
        })
        // this.tableData = tableData.sort((a: any,b: any) => {
        //   return (a.Falls_activity < b.Falls_activity) ? 1: -1
        // });['type','name'], ['asc', 'desc']);
        this.tableData=_LODASH.orderBy(tableData, ['Falls_activity', 'Night_walk_activity','Critically_low_battery_activity'], ['desc', 'desc','desc']);
        this.beforeFilter = this.tableData;
        this.customerList = this.tableData.map(value => {
          return {
            id: value.Customer_id,
            name: value.Customer_name
          }
        }).sort((a: any, b: any) => {
          return a.name > b.name ? 1 : -1
        })
      }else{
        this.tableData = [];
      }
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
  navigate(value: any) {

    switch(value.key){
      case 'Facility_name' : 
        if (value.selected.facility_number) {
          this.router.navigate(['/ssa/facilities', `${value.selected.facility_number}`])
        }
        break;
      case 'Customer_name' : 
        if (value.selected.Customer_id) {
          this.router.navigate(['/ssa/customers', `${value.selected.Customer_id}`])
        }
        break;
    }
  }
  addDialog(){
    const dialog = this.matDialog.open(CommonAddModelComponent, {
      disableClose: true,
      panelClass: 'dialog-popup',
      width: '920px',
      data: {
        dialogType: 'Add new customer'
      }
    })
    dialog.afterClosed().subscribe(data => {
      if(data){
        this.getCustomers();
      }
    })
  }
  

}
