import { Component, OnInit } from '@angular/core';
import * as moment from "moment";
import { MatDialog } from '@angular/material/dialog';
import { CommonAddModelComponent } from '../../shared/common-add-model/common-add-model.component';
import { CommonHttpService } from '../../shared/services/http-services/common-http.service';
import { CommonService } from './../../shared/services/common.service';
import { ConformationPopComponent } from '../../shared/conformation-pop/conformation-pop.component';
import { CommonEditModelComponent } from '../../shared/common-edit-model/common-edit-model.component';
import { ViewModalComponent } from '../../shared/view-modal/view-modal.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import * as _LODASH from "lodash";
import { TokenStorageServiceService } from '../../auth/login/token-storage-service.service';

export interface caregivers {
  'Caregiver_name': string,
  'Wards_assigned': string,
  'Screen_time_usage': string,
  'Residents_profile_viewed': number,
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
  header:any;
  displayedColumns: string[] = ['Caregiver_name','Wards_assigned', '_Screen_time_usage', 'Resident_profiles_viewed', 'Most_visited_page', 'Last_active'];
  tableData: caregivers[] = [
    
  ]
  constructor(private tokenStorage: TokenStorageServiceService,private matDialog: MatDialog, private http: HttpClient, private commonHttp: CommonHttpService, public common:CommonService) { }
  getHeaders(){
    this.header = new HttpHeaders().set(
      "Authorization",
      this.tokenStorage.getToken()
    );
  }
  ngOnInit(): void {
    this.getAllCareGiver()
  }
  isLoading = false;
  
  getAllCareGiver() {
    this.getHeaders();
    this.isLoading = true;
    let caregivers: any = localStorage.getItem('caregivers');
    if(caregivers){
      caregivers = JSON.parse(caregivers);
      if(caregivers.itemCount > 0){
        caregivers?.body?.forEach(val => {
          delete val['others']
        })
      }
      const local = JSON.stringify(caregivers.body);
      const user = JSON.parse(localStorage.getItem('loggedInUser'));
      this.http.get(`${environment.apiUrlNew}/caregivers/get/`,{headers:this.header}).subscribe((dbWards:any) => {
        if(local != JSON.stringify(dbWards)){
          this.http.get(`${environment.apiUrlNew}/cdata/getYesterday/`,{headers:this.header}).subscribe((kpi: any) => {
            if(dbWards.itemCount > 0){
              dbWards.body.forEach((value: any) => {
                if(kpi.itemCount > 0){
                  const customerKpi = kpi.body.filter(val => val.details.caregiver_id === value.details.caregiver_id);
                  let Screen_time_usage = '';
                  let Notification_response_time = 0;
                  let Resident_profiles_viewed = 0;
                  customerKpi.forEach(value => {
                    if(value.KPI){
                      Screen_time_usage = this.transform(value.KPI.ScreenTimeUsage);// + parseFloat(value.KPI.ScreenTimeUsage);
                      Notification_response_time = Notification_response_time + parseFloat(value.KPI.NotificationResponseTime);
                      Resident_profiles_viewed = Resident_profiles_viewed + parseFloat(value.KPI.ResidentProfilesViewed);
                    }
                  })
                  value.others = {};
                  if(customerKpi.length > 0){
                    value.others.Screen_time_usage = Screen_time_usage //< 0.25 ? (Screen_time_usage < 0.1 ? (Screen_time_usage > 0.01 ? 0.1 : 0): (Math.round(Screen_time_usage * 10) / 10).toFixed(1)) : this.roundingTechnique(Screen_time_usage);
                    value.others.Notification_response_time = Notification_response_time < 0.25 ? (Notification_response_time < 0.1 ? (Notification_response_time > 0.01 ? 0.1 : 0): (Math.round(Notification_response_time * 10) / 10).toFixed(1)) : this.roundingTechnique(Notification_response_time);
                    value.others.Resident_profiles_viewed = Resident_profiles_viewed < 0.25 ? (Resident_profiles_viewed < 0.1 ? (Resident_profiles_viewed > 0.01 ? 0.1 : 0): (Math.round(Resident_profiles_viewed * 10) / 10).toFixed(1)) : this.roundingTechnique(Resident_profiles_viewed);
                  }else{
                    value.others.Screen_time_usage = (Screen_time_usage);
                    value.others.Notification_response_time = ((Notification_response_time)/60);
                    value.others.Resident_profiles_viewed = (Resident_profiles_viewed);
                  }
                }
              })
            }
            localStorage.setItem('caregivers', JSON.stringify(dbWards));
            this.loadMoreData()
          })
        }
      })
      this.loadMoreData();
    }else{
      this.http.get(`${environment.apiUrlNew}/caregivers/get/`,{headers:this.header}).subscribe((wards: any) => {
        this.http.get(`${environment.apiUrlNew}/cdata/getYesterday/`,{headers:this.header}).subscribe((kpi: any) => {
          if(wards.itemCount > 0){
            wards.body.forEach((value: any) => {
              if(kpi.itemCount > 0){
                const customerKpi = kpi.body.filter(val => val.details.caregiver_id === value.details.caregiver_id);
                let Screen_time_usage = '';
                let Notification_response_time = 0;
                let Resident_profiles_viewed = 0;
                customerKpi.forEach(value => {
                  if(value.KPI){
                    Screen_time_usage = this.transform(value.KPI.ScreenTimeUsage)//Screen_time_usage + parseFloat(value.KPI.ScreenTimeUsage);
                    Notification_response_time = Notification_response_time + (parseFloat(value.KPI.NRT_CriticallyLowActivity) + parseFloat(value.KPI.NRT_FallActivity) + parseFloat(value.KPI.NRT_NightWalkActivity) / 3);
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
          }
          localStorage.setItem('caregivers', JSON.stringify(wards));
          this.loadMoreData()
        })
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
    if(data){
      data = JSON.parse(data);
     // const timeZone = moment.parseZone().utcOffset();
     const timeZone = moment.parseZone("2013 01 01 +03:30", 'YYYY MM DD ZZ', 'fr', true).utcOffset();
      if(data.itemCount > 0){
        data.body.forEach(caregivers => {
          tableData.push({
            caregiver_id: caregivers.details.caregiver_id,
            Caregiver_name: `${caregivers.details.caregiver_firstName} ${caregivers.details.caregiver_lastName}`,
            firstName: caregivers.details.caregiver_firstName,
            lastName: caregivers.details.caregiver_lastName,
            // Wards_assigned: caregivers.details.assigned_wards.length > 0 ? caregivers.details.assigned_wards.filter(value => value.ward_name).map(value => {
            //   return value.ward_name
            // }).toString(): '',
            Wards_assigned: caregivers.details.assigned_wards.map(value => {return value.ward_name}).toString(),
            wardArray: caregivers.details.assigned_wards.map(value => {return value.ward_id}),
            wards: caregivers.details.assigned_wards,
            // Actions: 'visibility',
            Email_address: caregivers.details.caregiver_email,
            Phone_number: caregivers.details.caregiver_phone,
            _Screen_time_usage: caregivers.others ? caregivers.others.Screen_time_usage || "" : '',
            Resident_profiles_viewed: caregivers.others ? caregivers.others.Resident_profiles_viewed || "" : '',
            Most_visited_page: caregivers.mostVisitPage || "Residents",
            Last_active: parseInt(caregivers.meta.currently_active) === 1 ? 'Currently logged in': (caregivers.meta.last_active === null ? 'Not yet logged in': moment(caregivers.meta.last_active).add(timeZone, 'minutes').fromNow() || ""),
          });
        });
      }
      this.tableData = tableData.filter(value => {
        const user = JSON.parse(localStorage.getItem('loggedInUser'));
        const exists = value.wardArray.includes(user.wards[0].ward_id);
        if(exists){
          return true;
        }
        else{
          return false;
        }
      });
    }
  }

  addDialog() {
    this.matDialog.open(CommonAddModelComponent, {
      disableClose: true,
      panelClass: 'dialog-popup',
      width: '920px',
      data: {
        dialogType: 'Add new caregiver'
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
          payload: event.selected,
          editDisable: true,
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
