import { Component, NgModule, OnInit,Inject, Optional, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import * as moment from "moment";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { AttendPromptComponent } from '../../layouts/full/attend-prompt/attend-prompt.component';
import { ResidentService } from '../residents/resident.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import * as _LODASH from "lodash";
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { DatePipe } from '@angular/common';
import { count, filter } from 'rxjs/operators';
import { Observable, forkJoin } from 'rxjs';
import { questionnireService } from '../questionnaire-service/ques.service';
import * as Diff from 'diff';
import { TimeFormatService } from '../../shared/services/time-format.service';
import { CommonService } from '../../shared/services/common.service';
import { CommonHttpService } from '../../shared/services/http-services/common-http.service';
import { FilterResidentByNameComponent } from './filterComponent/filter-resident-by-name/filter-resident-by-name.component';
import { FilterResidentByTypeComponent } from './filterComponent/filter-resident-by-type/filter-resident-by-type.component';
import { stringify } from 'querystring';
@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {

 @ViewChild('multiSelect') multiSelect;
  public formGroup: FormGroup;
  public loadContent: boolean = false;
  public name = 'Cricketers';
  public data = [];
  public settings = {};
  public selectedItems = [];
  myForm:FormGroup;
        disabled = false;
        ShowFilter = false;
        limitSelection = false;
        personName : string;
  dropdownSettings: IDropdownSettings = {};
  dropdownSettingsNType: IDropdownSettings = {};
  residentNames: string[] = [];
  residents: string[] = [];
  personfilters:string[]=[];
  residentNamesList:string[] = [];
  beforeResidentNames: string[] = [];
  notificationsType:{label: string, value: string}[] =[]
  notificationType: {label: string, value: string}[] =[]
  /*notificationTypes: string[] = ['Resident created','Resident updated','Physio test','Questionnaire added','Questionnaire updated','swfalldetection','Battery empty','walk','6minwalk','3minwalk','sleep','sitting','Battery full'];*/
  notificationTypes: {label: string, value: string}[] = [
    {
      label: 'Resident created',
      value: 'residentcreated',
    },
    {
      label: 'Resident updated',
      value: 'residentupdated'
    },
    {
      label: 'Physio test',
      value: 'physiotest'
    },
    {
      label: 'Questionnaire added',
      value: 'questionnaire'
    },
    {
      label: 'Battery',
      value: 'Battery'
    },
    {
      label: 'Night walk',
      value: 'nightwalk'
    },
    {
      label: 'Sleep',
      value: 'Sleep'
    },
    {
      label: 'Sitting',
      value: 'Sitting'
    },
    {
      label: 'Fall',
      value: 'fall'
    }];
   
  constructor(private http: HttpClient,private fb: FormBuilder,public dialog: MatDialog,private datePipe: DatePipe, private commonHttp: CommonHttpService, private timeFormat: TimeFormatService,private common: CommonService, private residentService: ResidentService, private questionnireService: questionnireService) { }
  myComments= [];
  startdate='';
  enddate='';
  count: number=0;
  rows: number=0;
  panelOpenState: boolean = false;
  isButtonVisible: boolean=false;
  typeFilters: string[] = [];
  personFilters: string[] = [];
  personslist:string[]=[];
 // personName : string='';
 personLists=[];
  resident: string[] = [];
  pageStart:number = 0;
  pageEnd:number = 30;
  
  notifications = [];
  filterTypes = {
		filterResident: "All",
		filterStatus: "All",
		filterBalance: "All",
		filterStrength: "All",
		filterSleep: "All",
		filterBattery: "All",
		filterWards: [''],
		filterRooms: ['']
	}
  beforeFilterList = [];
  filteredList: any[];
  listExpanded: number = 0;
  today = moment();
  eventTags: any;
  notificationData = [];
  ntLst: string[] = [];
  isDataAvailable = true;
  ngOnInit(): void {
    // const userId = this.cognitoService.userInfo['custom:user_id'];
    this.common.eventCatch().subscribe(data => {
      // this.getNotifications();
    })
   this.notificationsType=this.notificationTypes;
    var currentDate=new Date();
    let latest_date =this.datePipe.transform(currentDate, 'yyyy-MM-dd');
    this.startdate=latest_date;
    let startdate=new Date(latest_date);
    let lastday=moment(startdate).subtract('days', 7).format('yyyy-MM-DD');
    let edate=this.datePipe.transform(lastday,"yyyy-MM-dd");
  this.enddate=edate;
    this.getNotifications();
    //this.isDataAvailable = true;
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'label',
      textField: 'value',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableCheckAll: false,
      clearSearchFilter: true,
      itemsShowLimit: 2,
      allowSearchFilter: true
    };
    this.dropdownSettingsNType = {
      singleSelection: false,
      idField: 'value',
      textField: 'label',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableCheckAll: false,
      clearSearchFilter: true,
      itemsShowLimit: 2,
      allowSearchFilter: true
    };
  
  }
  
  public setForm() {
    this.formGroup = new FormGroup({
      name: new FormControl(this.data, Validators.required),
    });
    this.loadContent = true;
  }
  toogleShowFilter() {
    this.ShowFilter = !this.ShowFilter;
    this.dropdownSettings = Object.assign({}, this.dropdownSettings, { allowSearchFilter: this.ShowFilter });
}
  paginateNotifications: Observable<any>[] = [];
  promisesNotifications : Observable<any>[] = [];
  wardsApi: Observable<any> = null;

  calculateScore(scoreValue: Number) {
		let value = '';
		if( _LODASH.inRange(scoreValue,0,5) || scoreValue > 100)
			value = 'low';
		else if( _LODASH.inRange(scoreValue,5,15))
			value = 'medium';
		else
			value = 'high';
		return value;
  }
  
  getResidentFullData(response){
    let finalResponse = []
    response.forEach( (summary : any,index) => {
      let scoreDetails = {};
      let residentInfo: {} = this.residentService.items[index];
      scoreDetails['user_id'] = summary.data.items.user_id;

      if(summary.data.items.sleep) {
        scoreDetails['Sleep'] = this.calculateScore(summary.data.items['sleep']['score']);
      } else {
        scoreDetails['Sleep'] = 'Good';
      }

      if(summary.data.items['transition']) {
        scoreDetails['Balance'] = this.calculateScore(summary.data.items['transition']['score']);
      } else {
        scoreDetails['Balance'] = 'Good';
      }

      if(summary.data.items['3minwalk']) {
        scoreDetails['Strength'] = this.calculateScore(summary.data.items['3minwalk']['score']);
      } else {
        scoreDetails['Strength'] = 'Good';
      }
      scoreDetails['Risk'] = summary.data.items.risk;
      scoreDetails['ResidentStatus'] = summary.data.items.eventType;
      scoreDetails['Battery'] = summary.data.items.battery;
      if(typeof summary.data.items.last_known_updated_at === "string"){
        scoreDetails['LastUpdatedAt'] = parseInt(summary.data.items.last_known_updated_at) * 1000;
      }else {
        scoreDetails['LastUpdatedAt'] = summary.data.items.last_known_updated_at * 1000;
      }
      scoreDetails['LastLocation'] = summary.data.items.last_location;
      scoreDetails['fallCount'] = summary.data.items.fallCount;
      scoreDetails['poly_pharmacy'] = summary.data.items.poly_pharmacy;
      scoreDetails['summary'] = summary;
      finalResponse.push({...scoreDetails, ...residentInfo });
    });
    return finalResponse;
  }

  residentsData = [];
  questionValues = [
		'Diabetes',
		'Stroke',
		'Blood thinner pills',
		'Blood pressure',
		'BP pills',
		'Hip surgery',
		'Artificial joints',
		'Pacemaker',
		'Sleeping pills',
		'Anti depressants'
  ]

  getMedicalData(resident){
		let checkValue: string[] = [];
		if(resident.summary.data.items.PreExistingConditions === null){
			return []
		}
		resident.summary.data.items.PreExistingConditions.questions.forEach(data => {
			if(data['answerValue']){
				checkValue.push(data.question);
			}
		})
		checkValue = checkValue.filter(value => this.questionValues.includes(value));
		checkValue.forEach(data => {
			if(data === 'Sleeping pills' || data === 'Anti depressants'){
				data = 'Sleeping Problems'
			}
		})
		const unique = []
		checkValue.forEach(data => {
			const existed = unique.find(value => value === data);
			if(!existed){
				unique.push(data);
			}
		})
		return unique;
  }

  getQuestionData(question){
		if(!Array.isArray(question)){
      const risk = this.calculateQues(question.risk);
      const ques = question.type.split(/(?=[A-Z])/).filter(value => {
        if(value.length > 1){
          return true;
        }else{
          return false
        }
      })
			return `${ques.join(" ")} points to ${risk} risk (${question.risk})`;
		}
  }
  
  getAge(dob: string){
		if(dob !== null){
			const dB = dob?.split("_").join("-");
      const divDate = dB?.split("-");
      if(divDate && divDate.length > 0){
        const date = new Date(`${divDate[1]}-${divDate[0]}-${divDate[2]}`);
        const age = moment(date).fromNow(true);
        if(age && age.includes('years')){
          return age;
        }
      }
		}
  }
  cursor_next = null;
  cursor_previous = null;
  paginationCursors = [];
  
  showLoadMore(){
    let show = false;
    let paginationCursors: any = localStorage.getItem('paginationCursors');
    if(paginationCursors){
      paginationCursors = JSON.parse(paginationCursors)
      paginationCursors.forEach(item => {
        if(item.cursor.next){
          show = true;
        }
      })
      this.paginationCursors = paginationCursors;
    }
    return show;
  }
  isLoading = false;
  noData = true;
  /*
	  Function is used paginating the notifications of resident
  */
  // paginate(){
  //   this.isLoading = true;
  //   let count = 0;
  //   this.paginateNotifications = [];
  //   this.paginationCursors.forEach(item => {
  //     let params = {};
  //     params['user_id'] = item.userId;
  //     if(item.cursor.next) {
  //       Object.assign(params, {'cursor_next' : item.cursor.next});
  //       this.paginateNotifications.push(this.commonHttp.getResidentLog(params))
  //       count++
  //     }
  //   })
  //   if(count === 0){
  //     this.noData = true;
  //     this.isLoading = false;
  //   }else{
  //     const createdStatement: {userId: string, value: string}[] = [];
  //     forkJoin([...this.paginateNotifications]).subscribe(data => {
  //       let notify = [];
  //       let intermediate = [];
  //       if(data){
  //         this.paginationCursors = [];
  //           data.forEach(response => {
  //             response.data.items.forEach(item => {
  //               notify = [...notify, item]
  //             })
  //             if(response.data.cursor){
  //               this.paginationCursors.push({
  //                 userId: response.data.items[0].user_id,
  //                 cursor: response.data.cursor
  //               })
  //             }
  //             localStorage.setItem('paginationCursors', JSON.stringify(this.paginationCursors));
  //           })
            
  //           notify.forEach(item => {
  //             let obj:any = {};
  //             if(item){
  //               const resident = this.residentsData.find(data => data.userId === item.user_id);
  //               if((item.notification_type.includes('residentupdated') && item.notification_message.residentUpdated) || !item.notification_type.includes('residentupdated')){
  //                 if(!item.notification_type.includes('acknowledgement') && !item.notification_type.includes('attended')){
  //                   obj.userId = item.source_id;
  //                   obj.name = item.user_name.split(/(?=[A-Z])/).join(" ");
  //                   obj.eventType = item.notification_type;
  //                   obj.sourceType = item.source_type;

                    
  //                   if(item.notification_type === 'physiotest'){
  //                     const contents = [];
  //                     contents.push({
  //                       date: item.created_at,
  //                       action : `${item.user_name.split(/(?=[A-Z])/).join(" ")} performed the ${item.source_type.split("_").join(" ")} test`
  //                     });
  //                     if(item.notification_message.Interpretation){
  //                       contents.push({
  //                         date: item.notification_message.createdAt,
  //                         action : `The result indicates ${item.notification_message.Interpretation}`
  //                       });
  //                     }
  //                     if(item.notification_message.created_by){
  //                       contents.push({
  //                         date: item.notification_message.createdAt,
  //                         action : `${item.notification_message.created_by} oversaw the physio test for ${item.user_name.split(/(?=[A-Z])/).join(" ")} `
  //                       });
  //                     }
  //                     obj.contents = contents;
  //                   }else if(item.notification_type.includes('residentcreated')){
  //                     const contents = [];
  //                     contents.push({
  //                       date: item.created_at,
  //                       action : `${item.user_name.split(/(?=[A-Z])/).join(" ")}'s profile has been created`
  //                     });
  //                     if(item.notification_message.roomName){
  //                       contents.push({
  //                         date: item.notification_message.createdAt,
  //                         action : `Following details has been added`
  //                       });
  //                       contents.push({
  //                         action : `${item.user_name.split(/(?=[A-Z])/).join(" ")} (${item.notification_message.gender ? item.notification_message.gender[0].toUpperCase() : ''}) [${this.getAge(item.notification_message.birthdate)}] was assigned to ${item.notification_message.roomName} (in ${item.notification_message.wardName}) and paired to ${item.notification_message.deviceId}`
  //                       });
  //                     }else{
  //                       contents.push({
  //                         date: item.notification_message.createdAt,
  //                         action : `Following details has been added`
  //                       });
  //                       contents.push({
  //                         action : `${item.user_name.split(/(?=[A-Z])/).join(" ")} (${item.notification_message.gender ? item.notification_message.gender[0].toUpperCase() : ''})  [${this.getAge(item.notification_message.birthdate)}] was assigned to ${resident.roomName} (in ${resident.wardName}) and paired to ${resident.deviceId}`
  //                       });
  //                     }
  //                     contents.push({action: 'Pre Existing Conditions:'});
  //                     const medicalData = this.getMedicalData(resident);
  //                     if(medicalData.length > 0){
  //                       medicalData.forEach(data => {
  //                         contents.push({
  //                           action: `- ${data}`
  //                         })
  //                       })
  //                     }else{
  //                       contents.push({action : '- No Medical History'})
  //                     }
  //                     obj.contents = contents;
      
  //                   }else if(item.notification_type.includes('residentupdated')){


  //                     const contents = [];
  //                     contents.push({
  //                       date: item.created_at,
  //                       action : `${item.user_name.split(/(?=[A-Z])/).join(" ")}'s profile has been updated`
  //                     });
  //                     contents.push({
  //                       date: item.notification_message.updatedAt,
  //                       action : `Following details has been updated`
  //                     });
  //                     contents.push({
  //                       action : `${item.user_name.split(/(?=[A-Z])/).join(" ")} (${item.notification_message.gender ? item.notification_message.gender[0].toUpperCase() : ''}) [ Age ${this.getAge(item.notification_message.birthdate)}] was assigned to ${resident.roomName} (in ${resident.wardName}) and paired to ${resident.deviceId}`
  //                     });
  //                     createdStatement.push({
  //                       userId: item.user_id,
  //                       value: `${item.user_name.split(/(?=[A-Z])/).join(" ")} (${item.notification_message.gender ? item.notification_message.gender[0].toUpperCase() : ''}) [Age ${this.getAge(item.notification_message.birthdate)}] was assigned to ${item.notification_message.roomName} (in ${item.notification_message.wardName}) and paired to ${item.notification_message.deviceId}`
  //                     })
  //                     contents.push({action: 'Pre Existing Conditions:'});
  //                     const medicalData = this.getMedicalData(resident);
  //                     if(medicalData.length > 0){
  //                       medicalData.forEach(data => {
  //                         contents.push({
  //                           action: `- ${data}`
  //                         })
  //                       })
  //                     }else{
  //                       contents.push({action : '- No Medical History'})
  //                     }
  //                     obj.contents = contents;
  //                   }else if(item.notification_type.includes('questionnaire')){
  //                     const contents = [];
  //                     obj.title = `${item.user_name.split(/(?=[A-Z])/).join(" ")}'s has completed the ${item.source_type.split(/(?=[A-Z])/).join(" ")} questionnaire`
  //                     contents.push({
  //                       date: item.created_at,
  //                       action : `${item.user_name.split(/(?=[A-Z])/).join(" ")} completed the ${item.source_type.split(/(?=[A-Z])/).join(" ")} questionnaire`
  //                     });
  //                     contents.push({
  //                       date: item.notification_message.updatedAt,
  //                       action : `The result indicates ${this.calculateQues(item.notification_message.risk)} risk (${item.notification_message.risk})`
  //                     });
  //                     contents.push({
  //                       date: item.notification_message.updatedAt,
  //                       action : `${item.notification_message.takenBy} initiated the questionniare for ${item.user_name.split(/(?=[A-Z])/).join(" ")}`
  //                     });
  //                     obj.contents = contents;
  //                   }else if(item.notification_type.includes('swfalldetection')){
  //                     obj.content = `${item.user_name.split(/(?=[A-Z])/).join(" ")} has fallen down`
  //                   }else if(item.notification_type.includes('batteryempty')){
  //                     obj.content = `${item.user_name.split(/(?=[A-Z])/).join(" ")}'s wearable has critically low battery`
  //                   }else if(item.notification_type.includes('batterylow')){
  //                     obj.content = `${item.user_name.split(/(?=[A-Z])/).join(" ")}'s wearable has low battery (<15%). Please charge the wearable soon.`
  //                   }else if(item.notification_type.includes('walk')){
  //                     obj.content = `${item.user_name.split(/(?=[A-Z])/).join(" ")}'s wearable has sent a low walk notification`
  //                   }else{
  //                     obj.content = `${item.user_name.split(/(?=[A-Z])/).join(" ")}'s ${item.source_type.split("_").join(" ")} notification`
  //                   }
  //                   obj.class = item.notification_class;
  //                   obj.category = item.notification_category;
  //                   obj.date = item.created_at;
  //                   intermediate.push(obj);
  //                 }
  //               }
  //             }
  //           })
  //           notify.forEach(item => {
  //             if(item.source_type.includes('DowntonFallRiskIndexA')){
  //               intermediate.forEach(notify => {
  //                 if(notify.userId === item.user_id){
  //                   const question = this.getQuestionData(item.notification_message);
  //                   if(question){
  //                     notify.contents.push({action: question})
  //                   }
  //                 }
  //               });
  //             }else if(item.source_type.includes('StayIndependentA')){
  //               intermediate.forEach(notify => {
  //                 if(notify.userId === item.user_id){
  //                   const question = this.getQuestionData(item.notification_message);
  //                   if(question){
  //                     notify.contents.push({action: question})
  //                   }
  //                 }
  //               });
  //             }
  //           })
  //           intermediate.forEach(notify => {
  //             if(notify.eventType == 'residentcreated'){
  //               const createdData = createdStatement.find(value => value.userId === notify.userId)
  //               if(createdData){
  //                 notify.contents[2].action = createdData.value;
  //               }
  //             }
  //           })
  //           let extraNotifications = intermediate.map(comment => {
  //             const contents = [];
  //             contents.push({
  //               date: comment.date,
  //               action : comment.content
  //             });
  //             return {
  //               id: comment.userId,
  //               person: comment.name,
  //               title: comment.title ? comment.title : comment.contents ? comment.contents[0].action : comment.content,
  //               date: comment.date,
  //               eventType: comment.eventType,
  //               sourceType: comment.sourceType,
  //               class: comment.class,
  //               category: comment.category,
  //               contents: comment.contents ? comment.contents : contents,
  //             };
  //           });
  //           this.isLoading = false;
  //           this.beforeFilterList.push(...extraNotifications);
  //           notify.forEach(item => {
  //             if(item.notification_type.includes('walkattended')){
  //               const contents = [];
  //               contents.push({
  //                 date: item.created_at,
  //                 action : `${item.user_name.split(/(?=[A-Z])/).join(" ")}'s night walk alert has attended by ${item.notification_message.createdBy}`
  //               });
  //               this.notifications.forEach(notify => {
  //                 if(notify.id === item.source_id.split(':')[0].trim()){
  //                   if(notify.contents.length > 1){
  //                     const existed = notify.contents.find(content => content.date === contents[0].date);
  //                       if(!existed){
  //                         notify.contents.push(...contents)
  //                       }
  //                   }else{
  //                     notify.contents.push(...contents)
  //                   }
  //                 }
  //               });
  //             }
  //           })
  //           notify.forEach(item => {
  //             if(item.notification_type.includes('attended') && !item.notification_type.includes('walkattended')){
  //               const contents = [];
  //               contents.push({
  //                 date: item.created_at,
  //                 action : `${item.user_name.split(/(?=[A-Z])/).join(" ")}'s fall alert has attended by ${item.notification_message.createdBy}`
  //               });
  //               this.beforeFilterList.forEach(notify => {
  //                 if(notify.id === item.source_id.split(':')[0].trim()){
  //                   if(notify.contents.length > 1){
  //                     const existed = notify.contents.find(content => content.action.includes('attended'));
  //                       if(!existed){
  //                         notify.contents.push(...contents)
  //                       }
  //                   }else{
  //                     notify.contents.push(...contents)
  //                   }
  //                 }
  //               });
  //             }
  //           })
  //           notify.forEach(item => {
  //             if(item.notification_type.includes('walkacknowledgement')){
  //               const contents = [];
  //               const createdBy = item.notification_message.createdBy ? ('by ' + item.notification_message.createdBy) : '';
  //               if(item.notification_message.data.wasFallen){
  //                 if(item.notification_message.data.wasFallen === 'yes'){
  //                   contents.push({
  //                     date: item.created_at,
  //                     action : `${item.user_name.split(/(?=[A-Z])/).join(" ")}'s night walk alert has logged ${createdBy}`
  //                   });
  //                   contents.push({
  //                     action: 'Observations:'
  //                   })
  //                   contents.push({
  //                     action: '- It is a real Alert'
  //                   })
  //                   contents.push({
  //                     action: `- How was the resident feeling fine?: ${item.notification_message.data.rateWalkFeeling} out of 5`
  //                   })
  //                   contents.push({
  //                     action: `- ${item.notification_message.data.observations}`
  //                   })
  //                 }else{
  //                   contents.push({
  //                     date: item.created_at,
  //                     action : `${item.user_name.split(/(?=[A-Z])/).join(" ")}'s night walk alert has logged ${createdBy}`
  //                   });
  //                   contents.push({
  //                     date: item.created_at,
  //                     action : 'It is false alert no need to worry'
  //                   });
  //                 }
  //                 // const existed = intermediate.find(value => value)
  //                 this.beforeFilterList.forEach(notify => {
  //                   if(item.source_id.split('-').length > 2){
  //                     const id = [];
  //                     id.push(item.source_id.split('-')[0]);
  //                     id.push(item.source_id.split('-')[1]);
  //                     if(notify.id === id.join('-')){
  //                       if(notify.contents.length > 1){
  //                         const existed = notify.contents.find(content => content.date === contents[0].date);
  //                           if(!existed){
  //                             notify.contents.push(...contents)
  //                           }
  //                       }else{
  //                         notify.contents.push(...contents)
  //                       }
  //                     }
  //                   }else if(item.source_id.split('-').length < 2 && item.source_id.split('-').length > 1){
  //                     if(notify.id === item.source_id.split('-')[0].trim()){
  //                       if(notify.contents.length > 1){
  //                         const existed = notify.contents.find(content => content.date === contents[0].date);
  //                           if(!existed){
  //                             notify.contents.push(...contents)
  //                           }
  //                       }else{
  //                         notify.contents.push(...contents)
  //                       }
  //                     }
  //                   }
  //                 });
  //               }
  //             }
  //           })
  //           notify.forEach(item => {
  //             if(item.notification_type.includes('acknowledgement') && !item.notification_type.includes('walkacknowledgement')){
  //               const contents = [];
  //               const createdBy = item.notification_message.createdBy ? ('by ' + item.notification_message.createdBy) : '';
  //               if(item.notification_message.data.wasFallen){
  //                 if(item.notification_message.data.wasFallen === 'yes'){
  //                   contents.push({
  //                     date: item.created_at,
  //                     action : `${item.user_name.split(/(?=[A-Z])/).join(" ")}'s fall alert has logged ${createdBy}`
  //                   });
  //                   contents.push({
  //                     action: 'Observations:'
  //                   })
  //                   contents.push({
  //                     action: '- It is a real Alert'
  //                   })
  //                   contents.push({
  //                     action: `- How bad they hurt themselves?: ${item.notification_message.data.rateFall} out of 5`
  //                   })
  //                   contents.push({
  //                     action: `- ${item.notification_message.data.observations}`
  //                   })
  //                 }else{
  //                   contents.push({
  //                     date: item.created_at,
  //                     action : `${item.user_name.split(/(?=[A-Z])/).join(" ")}'s fall alert has logged ${createdBy}`
  //                   });
  //                   contents.push({
  //                     date: item.created_at,
  //                     action : 'It is false alert no need to worry'
  //                   });
  //                 }
  //                 // const existed = intermediate.find(value => value)
  //                 this.beforeFilterList.forEach(notify => {
  //                   if(item.source_id.split('-').length > 2){
  //                     const id = [];
  //                     id.push(item.source_id.split('-')[0]);
  //                     id.push(item.source_id.split('-')[1]);
  //                     if(notify.id === id.join('-')){
  //                       if(notify.contents.length > 1){
  //                         const existed = notify.contents.find(content => content.date === contents[0].date);
  //                           if(!existed){
  //                             notify.contents.push(...contents)
  //                           }
  //                       }else{
  //                         notify.contents.push(...contents)
  //                       }
  //                     }
  //                   }else if(item.source_id.split('-').length < 2 && item.source_id.split('-').length > 1){
  //                     if(notify.id === item.source_id.split('-')[0].trim()){
  //                       if(notify.contents.length > 1){
  //                         const existed = notify.contents.find(content => content.date === contents[0].date);
  //                           if(!existed){
  //                             notify.contents.push(...contents)
  //                           }
  //                       }else{
  //                         notify.contents.push(...contents)
  //                       }
  //                     }
  //                   }
  //                 });
  //               }
  //             }
  //           })
  //           this.beforeFilterList = this.beforeFilterList.sort((a,b) => {
  //             return a.date < b.date ? 1 : -1;
  //           })
  //           this.beforeFilterList = this.beforeFilterList.filter(item => !item.sourceType.includes('DowntonFallRiskIndexA') || !item.sourceType.includes('StayIndependentA'))
  //           this.changeSelection();
  //           if(this.filterDates.startDate){
  //             this.changeSelection(this.filterDates.startDate, this.filterDates.endDate)
  //           }else{
  //             this.changeSelection();
  //           }
  //         }
  //       })
  //   }
  // }
  showLogs = [];
  showLogInfo(index){
    this.showLogs[index] = !this.showLogs[index];
  }
  getFilterFormat(){
		return localStorage.getItem('filterFormat') ? localStorage.getItem('filterFormat') : 'dd/MM/yyyy'
	}
  mobileNotifications = [];
  localNotifications = [];

  /*
	  Function is used for getting the notifications of all residents
  */
  //timeZone = moment.parseZone("2013-01-01T00:00:00-06:00").utcOffset();
  timeZone = moment.parseZone().utcOffset();
 //timeZone= moment.parseZone("2013 01 01 +03:30", 'YYYY MM DD ZZ', 'fr', true).utcOffset();
// timeZone = moment.parseZone("2013 01 01 +03:30", 'YYYY MM DD ZZ', 'fr', true).utcOffset();
  getNotifications(){
    this.isDataAvailable = false;
    const createdStatement: {userId: string, value: string}[] = [];
    this.notifications = [];
    this.residentNames = [];

    //let notifications: any = localStorage.getItem('notifications');
    // if(notifications){
    //   this.commonHttp.getNotifications().subscribe((data: any) => {
    //     this.commonHttp.getAllAlerts().subscribe((alert: any) => {
    //       if(alert.itemCount > 0){
    //         alert.body
    //         .forEach(val => {
    //           data.body.push({
    //             notification: {
    //               notification_id: val.alert.alert_id,
    //               notification_class: val.alert.alert_class,
    //               notification_body: val.alert.alert_body,
    //               notification_type: val.alert.alert_type,
    //             },
    //             meta: {
    //               created_at : val.meta.created_at,
    //             },
    //             details: {...val.details}
    //           })
    //           data.itemCount ++;
    //           if(val.alert.attend_status !== 'N'){
    //             data.body.push({
    //               notification: {
    //                 notification_id: val.alert.alert_id,
    //                 notification_class: 'Warning',
    //                 notification_body: val.alert.attend_body,
    //                 notification_type: val.alert.alert_type,
    //               },
    //               meta: {
    //                 created_at : val.alert.attend_at,
    //               },
    //               details: {...val.details}
    //             })	
    //             data.itemCount ++;
    //           }
    //           if(val.alert.log_status !== 'N'){
    //             data.body.push({
    //               notification: {
    //                 notification_id: val.alert.alert_id,
    //                 notification_class: 'Success',
    //                 notification_body: val.alert.log_body,
    //                 notification_type: val.alert.alert_type,
    //               },
    //               meta: {
    //                 created_at : val.alert.log_at,
    //               },
    //               details: {...val.details}
    //             })	
    //             data.itemCount ++;
    //           }
    //         })
    //       }
    //       if(notifications !== JSON.stringify(data)){
    //       //  localStorage.setItem('notifications', JSON.stringify(data))
    //         this.loadLocalData();
    //       }
    //     })
    //   })
    //   this.loadLocalData();
    // }else{
      this.isDataAvailable = false;
      this.isLoading = false;
      this.commonHttp.getNotifications().subscribe((data: any) => {
        this.commonHttp.getAllAlerts().subscribe((alert: any) => {
          if(alert.itemCount > 0){
            alert.body.forEach(val => {
              data.body.push({
                notification: {
                  notification_id: val.alert.alert_id,
                  notification_class: val.alert.alert_class,
                  notification_body: val.alert.attend_status === 'N' ? val.alert.alert_body : (val.alert.log_status === 'N' ? val.alert.attend_body : val.alert.log_body),
                  notification_type: val.alert.alert_type,
                },
                meta: {
                  created_at : val.meta.created_at,
                },
                details: {...val.details}
              })
              data.itemCount ++;
              if(val.alert.attend_status !== 'N'){
                data.body.push({
                  notification: {
                    notification_id: val.alert.alert_id,
                    notification_class: val.alert.alert_class,
                    notification_body: val.alert.attend_status === 'N' ? val.alert.alert_body : (val.alert.log_status === 'N' ? val.alert.attend_body : val.alert.log_body),
                    notification_type: val.alert.alert_type,
                  },
                  meta: {
                    created_at : val.meta.created_at,
                  },
                  details: {...val.details}
                })	
                data.itemCount ++;
              }
              if(val.alert.log_status !== 'N'){
                data.body.push({
                  notification: {
                    notification_id: val.alert.alert_id,
                    notification_class: val.alert.alert_class,
                    notification_body: val.alert.log_body,
                    notification_type: val.alert.alert_type,
                  },
                  meta: {
                    created_at : val.meta.created_at,
                  },
                  details: {...val.details}
                })	
                data.itemCount ++;
              }
            })
          }
          this.isDataAvailable = true;
          this.isLoading = false;
          //localStorage.setItem('notifications', JSON.stringify(data))
          //this.loadLocalData();
          this.loadNotificationData(data);
        })
      })
   // }
  }
  loadNotificationData(notifications:any){
    let data: any =JSON.stringify(notifications);
    if(data){
      data = JSON.parse(data);
      if(data.itemCount > 0){
        const dbValues = data.body.filter(val => Object.keys(val.notification.notification_body|| {}).length > 0);
     
        const user = JSON.parse(localStorage.getItem('loggedInUser'));
        const wards = user.wards.map(val => {
          return val.ward_id
        })
        this.notifications = dbValues.filter(val => wards.includes(val.details.ward_id)).map(val => { this.count++;
         var content='';
         let sDate=moment(val.meta.created_at).format('YYYY-MM-DD')
         let currentDate='2022-01-04';
         let curren=moment(currentDate).format('YYYY-MM-DD')
          if(((val.notification.notification_type==='ResidentCreated')||(val.notification.notification_type==='ResidentUpdated'))&&(curren<sDate))
         { 
           var cont=val.notification.notification_body.contents[2].action;
           if(val.notification.notification_type==='ResidentUpdated'){
            var splitCont=cont.split(':')
            var action=splitCont[0]+" : "+this.getAge1(splitCont[1])
           } if(val.notification.notification_type==='ResidentUpdated'){
            var splitCont=cont.split(':')
            var action=splitCont[0]+" : "+this.getAge1(splitCont[1])
            var contentAction={
             action
           }
             var contents=val.notification.notification_body.contents;
          var  removeContents=contents.splice(2, 1)
          contents.push(contentAction)
          content=JSON.stringify(contents);
           }

           else{
           var splitCont=cont.split('[')
          var rem=splitCont[1].split(']')
          var action=splitCont[0]+"["+this.getAge1(rem[0])+"]";
          var contentAction={
            action
          }
            var contents=val.notification.notification_body.contents;
         var  removeContents=contents.splice(2, 1)
         contents.push(contentAction)
         content=JSON.stringify(contents);
        }
         }
         else{
           content=val.notification.notification_body.contents;
         }
          return {
            id: val.notification.notification_id,
            class: val.notification.notification_class,
            title: val.notification.notification_body.contents[0].action,
            contents: val.notification.notification_body.contents,
            eventType: val.notification.notification_type,
            date: moment(val.meta.created_at).add(this.timeZone, 'minutes').format(),
            resident_id: val.details.resident_id,
            person: `${val.details.resident_first_name} ${val.details.resident_last_name}`,
          }
        })
        this.notifications = this.notifications.sort((a: any,b: any) => {
          return new Date(a.date).getTime() < new Date(b.date).getTime() ? 1: -1
        });
        this.notifications.forEach(val => {
          if(!this.residentNames.includes(val.person)){
            this.residentNames.push(val.person)  
            //this.residents.push(val.person)
          }
        })
        if(this.notifications.length > 0){
          
          this.noData = false;
        }else{
          this.noData = true;
        } this.isLoading = true;
        this.notificationType=this.notificationTypes;
        this.residentNamesList=[...this.residentNames]
        this.residents=[...this.residentNames];
        this.beforeResidentNames = [...this.residentNames]
        this.beforeFilterList = [...this.notifications]
        this.isLoading = true;
       
      }else{
        this.isLoading = true;
        this.noData = true
      }
      if(this.pageEnd<this.count){
        this.isButtonVisible=true;
      }
      
    }
   }
   getAge1(dob:string){
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
//   getAge1(dob: string){
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
//      var dateofYear:number=+dateofbirth[0];
//      var dateofMonth:number=+dateofbirth[1];
//      var dateofDay:number=+dateofbirth[2];
//      if(dateofMonth===12){
//           age=this.findAge(currentdate[2],currentdate[1],currentdate[0],dateofbirth[2],dateofbirth[1],dateofbirth[0])
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
  loadLocalData(){
   
    let data: any = localStorage.getItem('notifications');
    if(data){
      data = JSON.parse(data);
      if(data.itemCount > 0){
        const dbValues = data.body.filter(val => Object.keys(val.notification.notification_body|| {}).length > 0);
     
        const user = JSON.parse(localStorage.getItem('loggedInUser'));
        const wards = user.wards.map(val => {
          return val.ward_id
        })
        this.notifications = dbValues.filter(val => wards.includes(val.details.ward_id)).map(val => { this.count++;
        
          return {
            id: val.notification.notification_id,
            class: val.notification.notification_class,
            title: val.notification.notification_body.contents[0].action,
            contents: val.notification.notification_body.contents,
            eventType: val.notification.notification_type,
            date: moment(val.meta.created_at).add(this.timeZone, 'minutes').format(),
            resident_id: val.details.resident_id,
            person: `${val.details.resident_first_name} ${val.details.resident_last_name}`,
          }
        })
        this.notifications = this.notifications.sort((a: any,b: any) => {
          return new Date(a.date).getTime() < new Date(b.date).getTime() ? 1: -1
        });
        this.notifications.forEach(val => {
          if(!this.residentNames.includes(val.person)){
            this.residentNames.push(val.person)  
            //this.residents.push(val.person)
          }
        })
        if(this.notifications.length > 0){
          
          this.noData = false;
        }else{
          this.noData = true;
        } this.isLoading = true;
        this.notificationType=this.notificationTypes;
        this.residentNamesList=[...this.residentNames]
        this.residents=[...this.residentNames];
        this.beforeResidentNames = [...this.residentNames]
        this.beforeFilterList = [...this.notifications]
        this.isLoading = true;
       
      }else{
        this.isLoading = true;
        this.noData = true
      }
      if(this.pageEnd<this.count){
        this.isButtonVisible=true;
      }
      
    }
  }
  calculateQues(scoreValue: Number) {
    let value = '';
		if( _LODASH.inRange(scoreValue,0,3) )
    value = 'low';
		else if( _LODASH.inRange(scoreValue,2,5))
    value = 'medium';
		else
    value = 'high';
		return value;
	}
  changeSelectPerson(list: any){
  
   // this.personLists.push(list);
   
   // this.residentNames=this.personLists;
    
    // if(typeof list === 'string'){
    //   this.personName = list.toLowerCase();
    //   if(list !== ''){
    //     this.residentNames = this.beforeResidentNames.filter(name => {
    //       console.log()
    //       return name.toLowerCase().includes(list.toLowerCase())
    //     })
    //   }else{
    //     this.residentNames = this.beforeResidentNames;
    //   }
    // }else if(list.source && Array.isArray(list.source._value)){
    
      this.personFilters =   list;    
        //return list;
    
    //}
    if(this.filterDates.startDate){
      this.changeSelection(this.filterDates.startDate, this.filterDates.endDate)
    }else{
      this.changeSelection();
    }
  }
  // changeSelectPerson(list: any){
  //   // if(typeof list === 'string'){
  //   //   this.personName = list.toLowerCase();
  //   //   if(list !== ''){
  //   //     this.residentNames = this.beforeResidentNames.filter(name => {
  //   //       console.log()
  //   //       return name.toLowerCase().includes(list.toLowerCase())
  //   //     })
  //   //   }else{
  //   //     this.residentNames = this.beforeResidentNames;
  //   //   }
  //   // }else if(list.source && Array.isArray(list.source._value)){
  //     this.personFilters =  list;      
  //       //return list;
    
  //   //}
  //   if(this.filterDates.startDate){
  //     this.changeSelection(this.filterDates.startDate, this.filterDates.endDate)
  //   }else{
  //     this.changeSelection();
  //   }
  // }
  changeFormat(format: string){
		this.timeFormat.changeFormat(format);
	}
  changeSelectType(list:any){
    //  this.typeFilters = list.source._value.map((type: string) => {
    //    console.log( type.split(" ").join("").toLowerCase());
    //    return type.split(" ").join("").toLowerCase();
    //  })
    this.typeFilters=list;
    if(this.filterDates.startDate){
      this.changeSelection(this.filterDates.startDate, this.filterDates.endDate)
    }else{
      this.changeSelection();
    }
  }
  filterDates: any = {}
  changeDateRange(value: any){
    const startDate = new Date(value.startDate).getTime(); 
    const endDate = new Date(value.endDate).getTime();
    this.filterDates = {
      startDate,
      endDate
    }
    this.changeSelection(startDate, endDate);
  }
  filterDataAvailable = false;
  showClear(){
    if(this.personName || this.personFilters.length > 0 || this.typeFilters.length > 0 || this.filterDates.startDate){
      return true;
    }else {
      return false;
    }
  }
  clearFilters(){
    this.personName = undefined;
    this.personFilters = [];
    this.personLists=[];
    this.typeFilters = [];
    this.filterDates = {};
    this.selectedItems = [];
    this.person = null;
    this.typeList = null;
    this.personList = null;
    const obj = {}
    this.residentNames.forEach(name => {
      obj[`${name}`] = this.beforeFilterList.filter(value => value.person.toLowerCase() === name.toLowerCase())
    })
    this.changeSelection();
  }
//   removeElementFromStringArray(element: string) {
//     stringArray.forEach((value,index)=>{
//         if(value==element) stringArray.splice(index,1);
//     });
// }
  onDeSelect(list: any) {
    //this.removeElementFromStringArray(list);
    const id = this.personLists.indexOf(list.toLowerCase());
  const removeList= this.personLists.splice(id,1);
   if(this.personLists.length==0){      
    this.personFilters = [];
    this.personLists=[];
    this.personList = null;
    const obj = {}
    this.residentNames.forEach(name => {
      obj[`${name}`] = this.beforeFilterList.filter(value => value.person.toLowerCase() === name.toLowerCase())
    })
    this.changeSelection();
  }else{
    this.changeSelectPerson(this.personLists);
  }
  }
   onSelect(list: any) {
    this.personLists.push(list.toLowerCase());
    this.changeSelectPerson(this.personLists);
   }
   onNTypeSelect(list: any) {
   const jsonObject=JSON.parse(JSON.stringify(list));
    this.ntLst.push(jsonObject.value);
    this.changeSelectType(this.ntLst);
   }
   onNTypeDeSelect(list: any){
  // const listremove = list.source._value.map((type: string) => {
  //     return type.split(" ").join("").toLowerCase();
  //   })
  const jsonObject=JSON.parse(JSON.stringify(list));
    const id = this.ntLst.indexOf(jsonObject.value);
    const removeList= this.ntLst.splice(id);
    if(this.ntLst.length==0){
      this.typeFilters = [];
      this.changeSelectPerson(this.personLists);
    }else{
      this.changeSelectType(this.ntLst);
      
    }
   }
  dateRange: {
		startDate: any,
		endDate: any,
  }= null;
  person:string = null;
  personList = null;
  typeList = null;
  changeSelection(startDate?: number, endDate?:number){this.pageEnd=30;
    this.isDataAvailable = false;
    localStorage.setItem('notifications', JSON.stringify(this.beforeFilterList));
    if(this.personFilters.length > 0 && this.typeFilters.length > 0 && this.personName){
      const personName = this.beforeFilterList.filter(value => value.person.toLowerCase().includes(this.personName));
      const personList = this.beforeFilterList.filter(value => this.personFilters.includes(value.person.toLowerCase()));
      this.filteredList = [];
      this.filteredList.push(...personName);
      personList.forEach(person => {
        const existed = this.filteredList.find(exist => exist.id === person.id);
        if(!existed){
          this.filteredList.push(person);
        }
      })
      this.filteredList = this.filteredList.sort((a,b)=>{
        return a.date < b.date ? 1 : -1
      })
      this.filteredList = this.filteredList.filter(value => this.typeFilters.includes(value.eventType.toLowerCase()));
      if(this.typeFilters.includes('battery')){
        const filter = this.beforeFilterList.filter(value => value.eventType.toLowerCase().includes('battery'))
        this.filteredList.push(...filter)
      }
    }else if(!this.personName && this.typeFilters.length > 0 && this.personFilters.length > 0){
      this.filteredList = this.beforeFilterList.filter(value => this.personFilters.includes(value.person.toLowerCase()) &&this.typeFilters.includes(value.eventType.toLowerCase()));
      if(this.typeFilters.includes('battery')){
        const filter = this.beforeFilterList.filter(value => value.eventType.toLowerCase().includes('battery'))
        this.filteredList.push(...filter)
      }
    }else if(this.personFilters.length > 0 && this.typeFilters.length < 1 && !this.personName){
      this.filteredList = this.beforeFilterList.filter(value => this.personFilters.includes(value.person.toLowerCase()));
    }
    else if(this.personFilters.length < 1 && this.typeFilters.length > 0 && !this.personName){
      this.filteredList = this.beforeFilterList.filter(value => this.typeFilters.includes(value.eventType.toLowerCase()));
      if(this.typeFilters.includes('battery')){
        const filter = this.beforeFilterList.filter(value => value.eventType.toLowerCase().includes('battery'))
        this.filteredList.push(...filter)
      }
    }else if(this.personName && this.typeFilters.length > 0 && this.personFilters.length < 1){
      this.filteredList = this.beforeFilterList.filter(value => this.typeFilters.includes(value.eventType.toLowerCase()) && value.person.includes(this.personName));
     
    }else if(this.personName && this.personFilters.length > 0 && this.typeFilters.length < 1){
      const personName = this.beforeFilterList.filter(value => value.person.toLowerCase().includes(this.personName));
      const personList = this.beforeFilterList.filter(value => this.personFilters.includes(value.person.toLowerCase()));
      this.filteredList = [];
      this.filteredList.push(...personName);
      personList.forEach(person => {
        const existed = this.filteredList.find(exist => exist.id === person.id);
        if(!existed){
          this.filteredList.push(person);
        }
      })
      if(this.typeFilters.includes('battery')){
        const filter = this.beforeFilterList.filter(value => value.eventType.toLowerCase().includes('battery'))
        this.filteredList.push(...filter)
      }
    }else if(this.personName && this.typeFilters.length < 1 && this.personFilters.length < 1){
      this.filteredList = this.beforeFilterList.filter(value => value.person.toLowerCase().includes(this.personName));
    }else {
      this.filteredList = this.beforeFilterList;
    }
    if(startDate && endDate){
      this.filteredList = this.filteredList.filter(value => new Date(value.date).getTime() > startDate && new Date(value.date).getTime() < endDate);
    }
    this.notifications = this.filteredList;
    this.listExpanded = 0;
    if(this.notifications.length < 1 && this.showLoadMore()){
      // this.paginate();
    }else{
			this.filterDataAvailable = true;
      this.isLoading =false;
      this.isDataAvailable = true;
      this.noData = this.notifications.length < 1;
    }
    if(this.pageEnd>this.filteredList.length){
      this.isButtonVisible=false;
    }else{
      this.isButtonVisible=true;
    }
  }
  changeExpandedIndex(index){
		if(this.listExpanded === index){
			this.listExpanded = -1;
		}else {
			this.listExpanded = index;
		}
	  }
  getDateOrString(date){
    const dateValue = new Date(date);
    if(moment(dateValue).format('DD-MM-YYYY') === moment().format('DD-MM-YYYY')){
      return false;
    }else if(moment(dateValue).format('DD-MM-YYYY') === moment().subtract(1, 'days').format('DD-MM-YYYY')){
      return false;
    }
    return true;
  }
  getFormat(){
		const format = this.timeFormat.getFormat();
		return format;
	}
  getTimeFormat1(date){
    return moment(date).add(this.timeZone, 'minutes').format()

  }
  getValueOfDate(date){
    const dateValue = new Date(date);
    if(moment(dateValue).format('DD-MM-YYYY') === moment().format('DD-MM-YYYY')){
      return '' + moment(dateValue).subtract(1, 'hour').format(this.getTimeFormat());
    }else if(moment(dateValue).format('DD-MM-YYYY') === moment().subtract(1, 'days').format('DD-MM-YYYY')){
      return 'Yesterday';
    }
    return date;
  }
  getTimeFormat(){
    const format = this.timeFormat.getTimeFormat();
    return format;
	}
  public loadMore(pageEnd: any): void {
		this.pageEnd=pageEnd+10;
    if(this.pageEnd>this.count){
      this.isButtonVisible=false;
    }else if(this.filteredList!=null){
    if(this.pageEnd>this.filteredList.length){
      this.isButtonVisible=false;
    }
    }else{

      this.isButtonVisible=true;
    }
    
	}
  appliedFilters = [];
	addFiltersByName(){
		this.appliedFilters = [];
		const filterDialog = this.dialog.open(FilterResidentByNameComponent, {
			disableClose: false,
			data: {
				payload: this.residentNamesList,
				type: 'caregiver'
			},
		});
    filterDialog.afterClosed().subscribe((result) => {
			if(result){
        this.residentNames = result;
				this.changeSelectPerson(result);
			}
		});

  }
	addFiltersByType(){
		this.appliedFilters = [];
		const filterDialog = this.dialog.open(FilterResidentByTypeComponent, {
			disableClose: false,
			data: {
				payload: this.notificationType,
				type: 'caregiver'
			},
		});
    filterDialog.afterClosed().subscribe((result) => {
			if(result){
        this.notificationTypes= result;
				this.changeSelectType(result);
			}
		});

  }
  togglePanel() {
    this.panelOpenState = !this.panelOpenState
  }
}