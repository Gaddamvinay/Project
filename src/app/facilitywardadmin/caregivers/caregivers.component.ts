import { Component, OnInit,ViewChild } from '@angular/core';
import * as moment from "moment";
import * as _LODASH from "lodash";
import { MatDialog } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { CommonAddModelComponent } from '../../shared/common-add-model/common-add-model.component';
import { CommonHttpService } from '../../shared/services/http-services/common-http.service';
import { CommonService } from './../../shared/services/common.service';
import { ConformationPopComponent } from '../../shared/conformation-pop/conformation-pop.component';
import { CommonEditModelComponent } from '../../shared/common-edit-model/common-edit-model.component';
import { ViewModalComponent } from '../../shared/view-modal/view-modal.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { TokenStorageServiceService } from '../../auth/login/token-storage-service.service';

export interface caregivers {
  'Caregiver_name': string,
  'mode': string,
  'Wards_assigned': string,
  'Phone_number': string,
  'Email_address': string,
  'Screen_time_usage': string,
  'Resident_profiles_viewed': number,
  'Most_visited_page': string,
  'Last_active': string
}

@Component({
  selector: 'app-caregivers',
  templateUrl: './caregivers.component.html',
  styleUrls: ['./caregivers.component.scss']
})
export class CaregiversComponent implements OnInit {
  widths: string[] = ['15%', '27%', '12.5%', '17.5%', '17.5%'];
  displayedColumns: string[] = ['Caregiver_name','Wards_assigned', '_Screen_time_usage', 'Resident_profiles_viewed', 'Most_visited_page', 'Last_active'];
  tableData: caregivers[] = []
  filterForm: FormGroup;
  header:any;
  @ViewChild('select') private select: MatSelect;
  constructor(private tokenStorage: TokenStorageServiceService,private matDialog: MatDialog, private http: HttpClient,private commonHttp: CommonHttpService,  public common:CommonService, private fb: FormBuilder) { 
    this.filterForm = this.fb.group({
      ward: [['']],
      wardSearch: ''
    })
  }

  ngOnInit(): void {
    this.common.eventCatch().subscribe((data) => {
      if (data && data.page == 'caregiver') {
        this.getAllCareGiver();
      }
		})
    this.getAllCareGiver();
    this.getNewWards();
    this.filterForm.valueChanges.subscribe(() => {
      if(this.ward.length === 1){
        if(this.ward[0] !== ''){
          this.tableData = this.beforeFilter.filter(value => {
            const exists = value.wardArray.find(value => this.ward.includes(value));
            if(exists){
              return true;
            }
            else{
              return false;
            }
          })
          this.filtered = true;
        }else{
          this.tableData = this.beforeFilter;
        }
      }else if(this.ward.length > 1){
        this.tableData = this.beforeFilter.filter(value => {
          const exists = value.wardArray.find(value => this.ward.includes(value));
          if(exists){
            return true;
          }
          else{
            return false;
          }
        });
        this.filtered = true;
      }
    })
  }
  getHeaders(){
    this.header = new HttpHeaders().set(
      "Authorization",
      this.tokenStorage.getToken()
    );
  }
  wardList = [];
  getNewWards(){
    this.getHeaders();
		this.http.get(`${environment.apiUrlNew}/wards/get/`,{headers:this.header}).subscribe((wards: any) => {
      const user = JSON.parse(localStorage.getItem('loggedInUser'));
      if(wards.itemCount > 0 && user){
        this.wardList = wards.body.filter(val => val.details.facility_id === user.facilities.facility_id).map(value => {
          return {
            name: value.details.ward_name,
            id: value.details.ward_id,
          }
        }).sort((a:any, b:any) => {
          return a.name > b.name ? 1: -1;
        })
      }
		})
  }
  convertHours(mins:number){
    let h = Math.floor(mins / 60);
    let m = mins % 60;
    // h = h < 10 ? '0' + h : h;
    // m = m < 10 ? '0' + m : m;
    return `${h}:${m}`;
  }
  getWard(id: string){
    return this.wardList.find(value => value.id === id).name;
  }

  getFilterWards(){
    this.filterForm.valueChanges.subscribe(() => {
      this.select.close();
    });
    return this.wardList.filter(value => value.name.toLowerCase().includes(this.filterForm.get('wardSearch').value.toLowerCase()) || this.ward.includes(value.id))
  }

  filtered = false;
  beforeFilter = [];
  clearFilters(){
    this.filtered = false;
    this.tableData = this.beforeFilter;
    this.filterForm.patchValue({
      ward: [''],
      wardSearch: ''
    })
  }
  showClear(){
    return this.filterForm.value.ward.filter(value => value !== '').length > 0;
  }
  get ward(){
    if(this.filterForm.get('ward').value.length > 1){
      return this.filterForm.get('ward').value.filter(value => value !== '');
    }
    return this.filterForm.get('ward').value;
  }
  isLoading = false;
  getAllCareGiver() {
    this.getHeaders();
    this.isLoading = true;
    let caregivers: any = localStorage.getItem('caregivers');
    if(caregivers){
      caregivers = JSON.parse(caregivers);
      caregivers.body.forEach(val => {
        delete val['others']
      })
      const local = JSON.stringify(caregivers.body);
      const user = JSON.parse(localStorage.getItem('loggedInUser'));
      this.http.get(`${environment.apiUrlNew}/caregivers/get/`,{headers:this.header}).subscribe((dbWards:any) => {
        const dbData = dbWards.body ? dbWards.body.filter(value => value.details.facility_id === user.facilities.facility_id): [];
        if(local != JSON.stringify(dbData) && user){
          const data = dbWards.body ? dbWards.body.filter(value => value.details.facility_id === user.facilities.facility_id) : [];
          this.http.get(`${environment.apiUrlNew}/cdata/getYesterday/`,{headers:this.header}).subscribe((kpi: any) => {
            data.forEach((value: any) => {
              if(kpi.itemCount > 0){
                const customerKpi = kpi.body.filter(val => val.details.caregiver_id === value.details.caregiver_id);
                let Screen_time_usage = '';
                let Notification_response_time = 0;
                let Resident_profiles_viewed = 0;
                customerKpi.forEach(value => {
                  if(value.KPI){
                    Screen_time_usage =this.transform(value.KPI.ScreenTimeUsage);//value.KPI.ScreenTimeUsage;// 
                    Notification_response_time = Notification_response_time + parseFloat(value.KPI.NotificationResponseTime);
                    Resident_profiles_viewed = Resident_profiles_viewed + parseFloat(value.KPI.ResidentProfilesViewed);
                  }
                })
                value.others = {};
                if(customerKpi.length > 0){
                  value.others.Screen_time_usage = Screen_time_usage;// < 0.25 ? (Screen_time_usage < 0.1 ? (Screen_time_usage > 0.01 ? 0.1 : 0): (Math.round(Screen_time_usage * 10) / 10).toFixed(1)) : this.roundingTechnique(Screen_time_usage);
                  value.others.Notification_response_time = Notification_response_time < 0.25 ? (Notification_response_time < 0.1 ? (Notification_response_time > 0.01 ? 0.1 : 0): (Math.round(Notification_response_time * 10) / 10).toFixed(1)) : this.roundingTechnique(Notification_response_time);
                  value.others.Resident_profiles_viewed = Resident_profiles_viewed < 0.25 ? (Resident_profiles_viewed < 0.1 ? (Resident_profiles_viewed > 0.01 ? 0.1 : 0): (Math.round(Resident_profiles_viewed * 10) / 10).toFixed(1)) : this.roundingTechnique(Resident_profiles_viewed);
                }else{
                  value.others.Screen_time_usage = (Screen_time_usage);
                  value.others.Notification_response_time = ((Notification_response_time)/60);
                  value.others.Resident_profiles_viewed = (Resident_profiles_viewed);
                }
              }
            })
            localStorage.setItem('caregivers', JSON.stringify({body: data, itemCount: data.length}));
            this.loadMoreData()
          })
        }
      })
      this.loadMoreData();
    }else{
      this.http.get(`${environment.apiUrlNew}/caregivers/get/`,{headers:this.header}).subscribe((wards: any) => {
        const user = JSON.parse(localStorage.getItem('loggedInUser'));
        if(user){
          const data = wards.body ? wards.body.filter(value => value.details.facility_id === user.facilities.facility_id): [];
          this.http.get(`${environment.apiUrlNew}/cdata/getYesterday/`,{headers:this.header}).subscribe((kpi: any) => {
            data.forEach((value: any) => {
              if(kpi.itemCount > 0){
                const customerKpi = kpi.body.filter(val => val.details.caregiver_id === value.details.caregiver_id);
                let Screen_time_usage = '';
                let Notification_response_time = 0;
                let Resident_profiles_viewed = 0;
                customerKpi.forEach(value => {
                  if(value.KPI){
                    Screen_time_usage = this.transform(value.KPI.ScreenTimeUsage);//value.KPI.ScreenTimeUsage;//
                    Notification_response_time = Notification_response_time + (parseFloat(value.KPI.NRT_CriticallyLowActivity) + parseFloat(value.KPI.NRT_FallActivity) + parseFloat(value.KPI.NRT_NightWalkActivity) / 3);
                    Resident_profiles_viewed = Resident_profiles_viewed + parseFloat(value.KPI.ResidentProfilesViewed);
                  }
                })
                value.others = {};
                if(customerKpi.length > 0){
                  value.others.Screen_time_usage = Screen_time_usage;//< 0.25 ? (Screen_time_usage < 0.1 ? (Screen_time_usage > 0.01 ? 0.1 : 0): (Math.round(Screen_time_usage * 10) / 10).toFixed(1)) : this.roundingTechnique(Screen_time_usage);
                  value.others.Notification_response_time = Notification_response_time < 0.25 ? (Notification_response_time < 0.1 ? (Notification_response_time > 0.01 ? 0.1 : 0): (Math.round(Notification_response_time * 10) / 10).toFixed(1)) : this.roundingTechnique(Notification_response_time);
                  value.others.Resident_profiles_viewed = Resident_profiles_viewed < 0.25 ? (Resident_profiles_viewed < 0.1 ? (Resident_profiles_viewed > 0.01 ? 0.1 : 0): (Math.round(Resident_profiles_viewed * 10) / 10).toFixed(1)) : this.roundingTechnique(Resident_profiles_viewed);
                }else{
                  value.others.Screen_time_usage = (Screen_time_usage);
                  value.others.Notification_response_time = ((Notification_response_time)/60);
                  value.others.Resident_profiles_viewed = (Resident_profiles_viewed);
                }
              }
            })
            localStorage.setItem('caregivers', JSON.stringify({body: data, itemCount: data.length}));
            this.loadMoreData()
          })
        }
      })
    }
  }
  
  transform(value: number) {
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
  loadMoreData(){
    let tableData = [];
    this.isLoading = false;
    let data: any = localStorage.getItem('caregivers');
    this.clearFilters();
    const timeZone = moment.parseZone().utcOffset();
    if(data){
      data = JSON.parse(data);
      data.body.forEach(caregivers => {
        tableData.push({
          caregiver_id: caregivers.details.caregiver_id,
          Caregiver_name: `${caregivers.details.caregiver_firstName} ${caregivers.details.caregiver_lastName}`,
          firstName: caregivers.details.caregiver_firstName,
          lastName: caregivers.details.caregiver_lastName,
          Wards_assigned: caregivers.details.assigned_wards.map(value => {return value.ward_name}).toString(),
          wardArray: caregivers.details.assigned_wards.map(value => {return value.ward_id}),
          wards: caregivers.details.assigned_wards,
          Email_address: caregivers.details.caregiver_email,
          Phone_number: caregivers.details.caregiver_phone,
          _Screen_time_usage: caregivers.others ? caregivers.others.Screen_time_usage || "" : "",
          Resident_profiles_viewed: caregivers.others ? caregivers.others.Resident_profiles_viewed || "" : "",
          Most_visited_page: caregivers.mostVisitPage || "Residents",
          Last_active: parseInt(caregivers.meta.currently_active) === 1 ? 'Currently logged in': (caregivers.meta.last_active === null ? 'Not yet logged in': moment(caregivers.meta.last_active).add(timeZone, 'minutes').fromNow() || ""),
        });
      });
      this.tableData = tableData;
      this.beforeFilter = tableData;
    }
  }

  addDialog() {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    const dialog =this.matDialog.open(CommonAddModelComponent, {
      disableClose: true,
      panelClass: 'dialog-popup',
      width: '920px',
      data: {
        dialogType: 'Add new caregiver',
        customer_id: user.customers.customer_id,
        facility_id: user.facilities.facility_id
      }
    })
    dialog.afterClosed().subscribe(data => {
      if(data){
        this.getAllCareGiver();
      }
    })
  }
  showToast: boolean;
  toastMessage: string = 'no message';
  doOperation(event: any){
    if(event.action === 'view'){
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
        if(data === 'Edit'){
          const user = JSON.parse(localStorage.getItem('loggedInUser'));
          const dialog = this.matDialog.open(CommonEditModelComponent, {
            disableClose: true,
            panelClass: 'dialog-popup',
            width: '920px',
            data: {
              dialogType: 'Edit caregiver',
              userId: event.selected.caregiver_id,
              customer_id: user.customers.customer_id,
              facility_id: user.facilities.facility_id
            }
          })
          dialog.afterClosed().subscribe(data => {
            if(data){
              let caregivers: any = localStorage.getItem('caregivers');
              caregivers = JSON.parse(caregivers);
              caregivers.itemCount = 9999;
              localStorage.setItem('caregivers', JSON.stringify(caregivers));
              this.getAllCareGiver();
              this.showToast = true;
              this.toastMessage = data.message;
              setTimeout(() => {
                this.showToast = false;
              }, 3000);
            }
          })
        }
      })
    }else if(event.action === 'Delete'){
      const caregiver = 'caregiver 1';
      const del = this.matDialog.open(ConformationPopComponent,{
        disableClose: true,
        panelClass: 'dialog-popup',
        width: '448px',
        data: {
          title: 'Delete caregiver',
          message: `Are you sure you want to delete the <strong>${caregiver}</strong>? This action cannot undo.`
        }
      })
      del.afterClosed().subscribe(data => {
        if(data){
          console.log('deleted')
        }
      })
    }
  }
}
