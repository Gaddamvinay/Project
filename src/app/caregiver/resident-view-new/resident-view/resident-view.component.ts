import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, ParamMap } from '@angular/router';
import * as moment from 'moment';
import { CommonHttpService } from '../../../shared/services/http-services/common-http.service';
import { TimeFormatService } from '../../../shared/services/time-format.service';
import { ProfileComponent } from './profile/profile.component';
import { HttpClient } from '@angular/common/http';
import {NativeDateAdapter, DateAdapter,	MAT_DATE_FORMATS} from '@angular/material/core';
import { formatDate } from '@angular/common';

import { environment } from '../../../../environments/environment';
import { DischargeResidentComponent } from './discharge-resident/discharge-resident.component';
export const PICK_FORMATS = {
	parse: {dateInput: {month: 'short', year: 'numeric', day: 'numeric'}},
	display: {
		dateInput: 'input',
		monthYearLabel: {year: 'numeric', month: 'short'},
		dateA11yLabel: {year: 'numeric', month: 'long', day: 'numeric'},
		monthYearA11yLabel: {year: 'numeric', month: 'long'}
	}
  };


class PickDateAdapter extends NativeDateAdapter {
	format(date: Date, displayFormat: Object): string {
		if (displayFormat === 'input') {
			return formatDate(date,'dd-MM-yyyy',this.locale);
		} else {
			return date.toDateString();
		}
	}
  }
@Component({
  selector: 'app-resident-view',
  templateUrl: './resident-view.component.html',
  styleUrls: ['./resident-view.component.scss'],
  providers: [
    {provide: DateAdapter, useClass: PickDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: PICK_FORMATS}
]
})
export class ResidentViewComponent implements OnInit {

  constructor(private dialog:MatDialog,private commonHttp: CommonHttpService, private http: HttpClient,private route: ActivatedRoute) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.userId = params.get('userId');
    })
  }
  today = new Date();

  ngOnInit(): void {
    this.getResidentData();
  }
  ngOnDestroy(){
    //     const user1 = JSON.parse(localStorage.getItem('loggedInUser'))
    //     const date = new Date();
    //     const dbPostData = {
    //       caregiverId: user1.caregiver_id,
    //       customerId: user1.customers.customer_id,
    //       facilityId:user1.facilities[0].facility_id,
    //       wardId:user1.wards[0].ward_id,
    //       residentId:this.userId,
    //       screenVisitEnd:moment(date).utc().format("YYYY-MM-DD HH:mm:ss"),
    //     }
    // this.http.post(`${environment.apiSpringUrl}/residents/updateResidentProfileViewDetails/`, dbPostData).subscribe(data => {
      
    // })
    ///

  }
  userId: string = '';
  residentName: string = '';
  residentData: any;

  updateAnalytics(tab?: string) {
    let body = {
      activityType: 'viewResident',
      page: 'ca-resident',
      time : moment.now(),
      // userId: this.auth.userInfo['custom:user_id'],
      residentId: this.userId,
      tab: tab,
      wardId: this.residentData ? this.residentData.wardId: null
    }
  }
  //resident profile viewed 
  
  //timeZone = moment.parseZone().utcOffset();
  timeZone = moment.parseZone("2013 01 01 +03:30", 'YYYY MM DD ZZ', 'fr', true).utcOffset();
  getResidentData(){
    this.commonHttp.getResidentSummaryDetails(this.userId).subscribe((data: any) => {
      //resident profile view by caregiver store in database
      const user1 = JSON.parse(localStorage.getItem('loggedInUser'))
      const date = new Date();
      const dbPostData = {   
        caregiverId: user1.caregiver_id,
        customerId: user1.customers.customer_id,
        facilityId:user1.facilities[0].facility_id,
        wardId:user1.wards[0].ward_id,
        residentId:this.userId,
       screenVisitSt:moment(date).utc().format("YYYY-MM-DD HH:mm:ss"),
      }
   this.commonHttp.storeResidentProfileDetails(dbPostData).subscribe(data => {
    
   })
  //////////
     
      this.residentName = `${data.GeneralInformation.first_name} ${data.GeneralInformation.last_name}`
      let phone: any = data.ContactInformation.phone_number;
      phone = phone.split(" ");
      this.residentData = {
        firstName: data.GeneralInformation.first_name,
        lastName: data.GeneralInformation.last_name,
        nickName: data.GeneralInformation.nick_name,
        gender: data.GeneralInformation.gender,
        Battery: data.WearableInformation.battery_status ? parseInt(data.WearableInformation.battery_status) : 0,
       // birthdate: moment( data.GeneralInformation.dob).format('DD-MM-YYYY'),
        height: data.GeneralInformation.height_value,
        height_units: data.GeneralInformation.height_units,
        weight: data.GeneralInformation.weight_value,
        weight_units: data.GeneralInformation.weight_units,
        contact_of: data.ContactInformation.contact_of,
        email: data.ContactInformation.contact_email,
        ext: phone[0],
        mobile: phone[1],
        wardName: data.WardInformation.ward_name,
        wardId: data.WardInformation.ward_id,
        roomId: data.WardInformation.room_id,
        roomName: data.WardInformation.room_name,
        admissionDate: data.WardInformation.admission_date,
        admission_Date: moment(data.WardInformation.admission_date).format('DD-MM-YYYY'),
       // moment(this.profileDetails['birthdate']).format('YYYY-MM-DD'),
        user_id: data.meta.resident_id,
        totalFalls: data.scores.total_falls ? parseInt(data.scores.total_falls) : 0,
        Balance: data.scores.balance || 'unknown',
        Strength: data.scores.strength || 'unknown',
        Sleep: data.scores.sleep || 'unknown',
        deviceId: data.WearableInformation.wearable_id,
        medical_history: data.MedicalHistory.medical_history,
        updated_at: data.meta.updated_at,
        fall_update:data.meta.fall_update,
        dob: moment( data.GeneralInformation.dob).format('DD-MM-YYYY'),
        birthdate:data.GeneralInformation.dob,
        questionnaire: data.questionnaire,
        lastKnownStatus: data.status.fall_status === 'true' ? 'Fall' : (data.status.nightwalk_status === 'true' ? 'Night walk':data.status.last_status || 'Unknown'),
      }
    })
  }
  showView = false;
  getAge(dob:string){
    if(dob){
    
    let dateofbirth=dob.split('-')
    //var dob=new Date(date);
      var dobYear:number =+dateofbirth[0];  
        var dobMonth:number =+dateofbirth[1];  
        var dobDate:number =+dateofbirth[2];  
        let current=new Date();
        let curren=moment(current).format('YYYY-MM-DD')
        let currentdate=curren.split('-');
        //get the current date from the system  
        var now = new Date();  
        //extract the year, month, and date from current date  
        var currentYear:number =+currentdate[0];  
        var currentMonth:number =+currentdate[1];  
        var currentDate:number =+currentdate[2];  
          
        //declare a variable to collect the age in year, month, and days  
        var age = {};  
        var ageString = "";  
        
        //get years  
       var  yearAge = currentYear - dobYear;  
          
        //get months  
        if (currentMonth >= dobMonth)  
          //get months when current month is greater  
          var monthAge = currentMonth - dobMonth;  
        else {  
          yearAge--;  
          var monthAge = 12 + currentMonth - dobMonth;  
        }  
      
        //get days  
        if (currentDate >= dobDate)  
          //get days when the current date is greater  
          var dateAge = currentDate - dobDate;  
        else {  
          monthAge--;  
          var dateAge = 31 + currentDate - dobDate;  
      
          if (monthAge < 0) {  
            monthAge = 11;  
            yearAge--;  
          }  
        }  
        var years=yearAge;  
        var months= monthAge;  
        var days= dateAge;  
        ageString = years + " Years " + months + " Months " + days + " Days";  
        return ageString;
      }
    }
  // getAge(dob: string){
  //   if(dob){
  //     const age = moment(dob).fromNow(true);
  //     if(age && age.includes('years')){
  //       return age;
  //     }else{
  //       return '65 years'
  //     }
  //   }
  // }
//   getAge(dob: string){
//     let age='';
//     if(dob!=null)
//     {
//     let dateofbirth=dob.split('-')
//     let currentDate=new Date();
//     let curren=moment(currentDate).format('YYYY-MM-DD')
//     let currentdate=curren.split('-');
//      var curyear:number=+currentdate[0];
//      var curmonth:number=+currentdate[1];
//      var cursDay:number=+currentdate[2];
//      var dateofYear:number=+dateofbirth[2];
//      var dateofMonth:number=+dateofbirth[1];
//      var dateofDay:number=+dateofbirth[0];
//      if(dateofMonth===12){
//           age=this.findAge(currentdate[2],currentdate[1],currentdate[0],dateofbirth[0],dateofbirth[1],dateofbirth[2])
       
//      }else{
//      var current = moment([curyear, curmonth, cursDay]);
//     var dateOfBirth = moment([dateofYear, dateofMonth, dateofDay]);
//     var years = current.diff(dateOfBirth, 'year');
//     dateOfBirth.add(years, 'years');

//     var months = current.diff(dateOfBirth, 'months');
//     dateOfBirth.add(months, 'months');

//     var days = current.diff(dateOfBirth, 'days');

//     age=years + ' Years ' + months + ' Months ' + days + ' Days';
//      }
//    }
// return age;
// }
findAge(current_date, current_month, current_year, birth_date, birth_month, birth_year)
{
      // days of every month
      let month = [31, 28, 31, 30, 31, 30, 31,
                  31, 30, 31, 30, 31 ]

      // if birth date is greater then current birth
      // month then do not count this month and add 30
      // to the date so as to subtract the date and
      // get the remaining days
      if (birth_date > current_date) {
      // var value: number = +month[birth_month - 1]
       var value: number = +month[birth_month-1];
       var curdate: number = +current_date;
       current_date = curdate + value;
       current_month = current_month - 1;
      }

      // if birth month exceeds current month, then do
      // not count this year and add 12 to the month so
      // that we can subtract and find out the difference
      if (birth_month > current_month) {
        var curMonth: number = +current_month;
        var curYear:number=+current_year;
        current_year = curYear - 1;
        current_month = curMonth + 12;
      }

      // calculate date, month, year
      var calculated_date = current_date - birth_date;
      var calculated_month = current_month - birth_month;
      var calculated_year = current_year - birth_year;
      return calculated_year+" Years"+" "+calculated_month+" Months"+" "+calculated_date+" Days"

}
  viewResident(){
    const resident = {...this.residentData};
    delete resident['medical_history'];
    delete resident['questionnaire'];
    delete resident['Battery'];
    delete resident['Balance'];
    delete resident['Sleep'];
    delete resident['Strength'];
    const dialog = this.dialog.open(ProfileComponent, {
      disableClose: false,
      maxWidth: '80vw',
      minWidth: '600px',
      panelClass: 'dialog-popup',
      data: {
        payload: resident
      }
    })
    dialog.afterClosed().subscribe(data => {
      if(data && data.refresh){
        this.getResidentData()
      }
    })
  }
  discharegeResident(){
    const resident = {...this.residentData};
    const dialog = this.dialog.open(DischargeResidentComponent, {
      disableClose: false,
      maxWidth: '80vw',
      minWidth: '600px',
      panelClass: 'dialog-popup',
      data: {
        payload: resident
      }
    })
    dialog.afterClosed().subscribe(data => {
      if(data && data.refresh){
        this.getResidentData()
      }
    })
  }
  selectedTab = 0;
  goto = false;
  gotoTab(value: string) {
    this.goto = true;
    if(value === 'medication'){
      this.selectedTab = 4;
    }else if(value === 'questionnaire'){
      this.selectedTab = 2;
    }else if(value === 'trend'){
      this.selectedTab = 1;
    }else if(value === 'notifications'){
      this.selectedTab = 6;
    }
  }
  filter(){
    if(this.goto){
      return this.selectedTab === 6? 'fall': ''
    }else{
      return '';
    }
  }
  tabChangeCount = 0;
  onTabChanged($event) {
    this.selectedTab = $event.index;
    if(this.goto){
      this.tabChangeCount++;
      if(this.tabChangeCount > 1){
        this.goto = false;
        this.tabChangeCount = 0;
      }
    }
    // this.updateAnalytics($event.tab.textLabel);
    // let clickedIndex = $event.index;
    // let length = (<FormArray>this.formData.controls['staffMembers']).length;
    // if (clickedIndex === length) {
    //   if ((<FormArray>this.formData.controls['staffMembers']).at(length - 1).dirty) {
    //     this.addItem();
    //     this.selectedTabIndex = clickedIndex - 1;
    //   } else {
    //     if (this.formData.staffMembers.length === clickedIndex) {
    //       this.addItem();
    //     }
    //     this.selectedTabIndex = clickedIndex - 1;
    //   }
    // }
  }
}
