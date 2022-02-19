import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, ViewChild  } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import * as moment from "moment";
import { MatSelect } from '@angular/material/select';
import * as _LODASH from "lodash";
import { CommonAddModelComponent } from '../../shared/common-add-model/common-add-model.component';
import { forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';
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

  widths: string[] = ['17.5%','17.5%', '8%','8%', '9%','10%', '10%', '10%', '10%'];
  actions: string[] = ['click', 'click', '', '', '', '', '', '']
  displayedColumns: string[] = ['Customer_name', 'Facility_name', 'Wearable_fall', 'Falls_activity', 'Night_walk_activity', 'Critically_low_battery_activity', 'Screen_time_usage', 'Resident_profiles_viewed', 'Notification_response_time'];
  tableData: any[] = [
  ] 
  header:any;
  filterForm: FormGroup;
  filtered = false;
  @ViewChild("multiselect") private multiselect: MatSelect;
  @ViewChild('select') private select: MatSelect;
   constructor(private tokenStorage: TokenStorageServiceService,private router: Router, private matDialog: MatDialog,private http: HttpClient, private fb: FormBuilder) { 
    this.filterForm = this.fb.group({
      customerSearch: [''],
      customer_id: [['']],
      facilityId: [['']],
      facilitySearch: [''],
    })
  }

  ngOnInit(): void {
    this.getCustomer();
    this.getFacilities();
    localStorage.setItem('previousFPage', '');
    localStorage.setItem('previousWPage', '');
    this.header = new HttpHeaders().set(
      "Authorization",
      this.tokenStorage.getToken()
    );
  
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
          this.tableData = this.tableData.filter(value => this.facilityIds.includes(value.facility_number))
          this.filtered = true;
        }
      }else if(this.facilityIds.length > 1){
        this.tableData = this.tableData.filter(value => this.facilityIds.includes(value.facility_number));
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
      customer_id: [''],
      customerSearch: '',
      facilitySearch: ''
    })
  }
  getIFilterFacilities(facilities: any[]){
    this.filterForm.valueChanges.subscribe(() => {
      this.multiselect.close();
    });
    return facilities.filter(value => value.facilityName.toLowerCase().includes(this.filterForm.get('facilitySearch').value.toLowerCase()) || this.facilityIds.includes(value.facilityId));
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

  getFacilityById(id: any){
    if(id !== ''){
      return this.facilityList.find(value => value.facilityId === id).facilityName;
    }
  }
  facilityList = [];
  
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
  customerList = [];
  getSelectedCustomer(){
    if(this.customerIds.filter(value => value !== 'select').length > 0){
      const selectedUser = [];
      const notSelected = [];
      this.customerList.forEach(value => {
        if(this.customerIds.includes(value.userid)){
          selectedUser.push(value)
        }else{
          notSelected.push(value);
        }
      })
      this.customerList = [...selectedUser,...notSelected];
      return this.customerList;
    }else{
      return this.customerList;
    }
  }
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
  showClear(){
    return this.filterForm.value.customer_id.filter(value => value !== '').length > 0;
  }
  navigate(value: any){
    switch(value.key){
      case 'Facility_name' : 
        if (value.selected.facility_number) {
          this.router.navigate(['/ssa/facilities', `${value.selected.facility_number}`])
        }
        break;
      case 'Customer_name' : 
        if (value.selected.customer_id) {
          this.router.navigate(['/ssa/customers', `${value.selected.customer_id}`])
        }
        break;
    }
  }
  initial = true;
  getFacilities(){
    let facilities = localStorage.getItem('facilities');
    if(facilities){
      this.http.get(`${environment.apiUrlNew}/facilities/get/`,{headers:this.header}).subscribe((dbFacilities: any) => {
        if(facilities != JSON.stringify(dbFacilities)){
          forkJoin([this.http.get(`${environment.apiUrlNew}/cdata/getCustomerSummary/`,{headers:this.header}),this.http.get(`${environment.apiUrlNew}/cdata/getFacilitiesSummary/`,{headers:this.header})]).subscribe((AllStats: any) => {
            if(dbFacilities.itemCount > 0){
              dbFacilities.body.forEach((value: any) => {
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
              })
            }
          this.http.get(`${environment.apiUrlNew}/kpi/getYesterdayFSummary/`,{headers:this.header}).subscribe((kpi: any) => {
            const yesterday = new Date();
            yesterday.setDate(new Date().getDate() - 1);
            let positions: any;
                if(kpi.itemCount > 0){
                  positions = kpi.body.map((val: any, i: number) => {
                    return {
                      id: val.details.facility_id,
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
                      const position = positions.find(val => val.id === value.details.facility_id);
                      value.summary.position = position ? position.position: kpi.body.length + 1;
                      let Falls_activity = 0;
                      let Night_walk_activity = 0;
                      let Critically_low_battery_activity = 0;
                      let Screen_time_usage ='';
                      let Notification_response_time = '';
                      let Resident_profiles_viewed = 0;
                      let totalFalls = 0;
                      customerKpi.forEach(value => {
                        if(value.KPI){
                          Falls_activity = Falls_activity + parseFloat(value.KPI.FallActivity);
                          Night_walk_activity = Night_walk_activity + parseFloat(value.KPI.NightWalkActivity);
                          Critically_low_battery_activity = Critically_low_battery_activity + parseFloat(value.KPI.CriticallyLowBattery);
                          Screen_time_usage = this.transform(value.KPI.ScreenTimeUsage);//Screen_time_usage + parseFloat(value.KPI.ScreenTimeUsage);
                          Notification_response_time = this.transforms(value.KPI.NotificationResponseTime);//Notification_response_time + parseFloat(value.KPI.NotificationResponseTime);
                          Resident_profiles_viewed = Resident_profiles_viewed + parseFloat(value.KPI.ResidentProfilesViewed);
                          totalFalls = totalFalls + parseFloat(value.KPI.totalFalls)
                        }
                      })
                      if(customerKpi.length > 0){
                        value.summary.wearableFall = totalFalls;
                        value.summary.reports.Falls_activity = Falls_activity < 0.25 ? (Falls_activity < 0.1 ? (Falls_activity > 0.01 ? 0.1 : 0): (Math.round(Falls_activity * 10) / 10).toFixed(1)) : this.roundingTechnique(Falls_activity);
                        value.summary.reports.Night_walk_activity = Night_walk_activity < 0.25 ? (Night_walk_activity < 0.1 ? (Night_walk_activity > 0.01 ? 0.1 : 0): (Math.round(Night_walk_activity * 10) / 10).toFixed(1)) : this.roundingTechnique(Night_walk_activity);
                        value.summary.reports.Critically_low_battery_activity = Critically_low_battery_activity < 0.25 ? (Critically_low_battery_activity < 0.1 ? (Critically_low_battery_activity > 0.01 ? 0.1 : 0): (Math.round(Critically_low_battery_activity * 10) / 10).toFixed(1)) : this.roundingTechnique(Critically_low_battery_activity);
                        value.summary.reports.Screen_time_usage = Screen_time_usage;//< 0.25 ? (Screen_time_usage < 0.1 ? (Screen_time_usage > 0.01 ? 0.1 : 0): (Math.round(Screen_time_usage * 10) / 10).toFixed(1)) : this.roundingTechnique(Screen_time_usage);
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
        forkJoin([this.http.get(`${environment.apiUrlNew}/cdata/getCustomerSummary/`,{headers:this.header}),this.http.get(`${environment.apiUrlNew}/cdata/getFacilitiesSummary/`,{headers:this.header})]).subscribe((AllStats: any) => {
          if(facilities.itemCount > 0){
            facilities.body.forEach((value: any) => {
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
            })
          }
          this.http.get(`${environment.apiUrlNew}/kpi/getYesterdayFSummary/`,{headers:this.header}).subscribe((kpi: any) => {
              const yesterday = new Date();
              yesterday.setDate(new Date().getDate() - 1);
              let positions: any;
                if(kpi.itemCount > 0){
                  positions = kpi.body.map((val: any, i: number) => {
                    return {
                      id: val.details.facility_id,
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
                      const position = positions.find(val => val.id === value.details.facility_id);
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
                          Screen_time_usage = this.transform(value.KPI.ScreenTimeUsage);//     Screen_time_usage + parseFloat(value.KPI.ScreenTimeUsage);
                          Notification_response_time =this.transforms(value.KPI.NotificationResponseTime);// Notification_response_time + parseFloat(value.KPI.NotificationResponseTime);
                          Resident_profiles_viewed = Resident_profiles_viewed + parseFloat(value.KPI.ResidentProfilesViewed);
                          totalFalls = totalFalls + parseFloat(value.KPI.totalFalls)
                        }
                      })
                      if(customerKpi.length > 0){
                        value.summary.wearableFall = totalFalls;
                        value.summary.reports.Falls_activity = Falls_activity < 0.25 ? (Falls_activity < 0.1 ? (Falls_activity > 0.01 ? 0.1 : 0): (Math.round(Falls_activity * 10) / 10).toFixed(1)) : this.roundingTechnique(Falls_activity);
                        value.summary.reports.Night_walk_activity = Night_walk_activity < 0.25 ? (Night_walk_activity < 0.1 ? (Night_walk_activity > 0.01 ? 0.1 : 0): (Math.round(Night_walk_activity * 10) / 10).toFixed(1)) : this.roundingTechnique(Night_walk_activity);
                        value.summary.reports.Critically_low_battery_activity = Critically_low_battery_activity < 0.25 ? (Critically_low_battery_activity < 0.1 ? (Critically_low_battery_activity > 0.01 ? 0.1 : 0): (Math.round(Critically_low_battery_activity * 10) / 10).toFixed(1)) : this.roundingTechnique(Critically_low_battery_activity);
                        value.summary.reports.Screen_time_usage = Screen_time_usage //< 0.25 ? (Screen_time_usage < 0.1 ? (Screen_time_usage > 0.01 ? 0.1 : 0): (Math.round(Screen_time_usage * 10) / 10).toFixed(1)) : this.roundingTechnique(Screen_time_usage);
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
  isLoading = false;
  booleanValue = [true, false];
  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  loadMoreFacilities(){
    let data: any = localStorage.getItem("facilities");
    this.clearFilters();
    if (data) {
      data = JSON.parse(data);
      if(data.itemCount > 0){
        const tableData = data.body.filter(value => value.details.facility_id !== '').map(value => {
          return {
            Wearable_fall: value.summary.wearableFall || '',
            //fallDiff: this.getRandomInt(1,5),
            //wearableFallIncreased: this.booleanValue[this.getRandomInt(0,1)],
            facility_number: value.details.facility_id,
            customer_id: value.details.customer_id,
            Customer_name: value.details.customer_name || '',
            Facility_name: value.details.facility_name || '',
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
            position: value.summary.position,
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
  get facilityIds(){
    if(this.filterForm.get('facilityId').value.length > 1){
      return this.filterForm.get('facilityId').value.filter(value => value !== '');
    }
    return this.filterForm.get('facilityId').value;
  }
  getFilterCustomer(){
    this.filterForm.valueChanges.subscribe(() => {
      this.select.close();
    });
    return this.customerList.filter(value => value.customer_name.toLowerCase().includes(this.filterForm.get('customerSearch').value.toLowerCase()) || this.customerIds.includes(value.customer_id));
  }

  addDialog(){
    const dialog = this.matDialog.open(CommonAddModelComponent, {
      disableClose: true,
      panelClass: 'dialog-popup',
      width: '920px',
      data: {
        dialogType: 'Add new facility'
      }
    })
    dialog.afterClosed().subscribe(data => {
      if(data){
        this.getFacilities();
      }
    })
  }

}
