
import { MediaMatcher } from '@angular/cdk/layout';
import { Router, NavigationStart } from '@angular/router';
import {
  ChangeDetectorRef,
  Component,
  NgZone,
  OnDestroy,
  ViewChild,
  HostListener,
  Directive
} from '@angular/core';
import { MenuItems } from '../../shared/menu-items/menu-items';
import { DatePipe } from '@angular/common';
import { AppHeaderComponent } from './header/header.component';
import { AppSidebarComponent } from './sidebar/sidebar.component';

import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { ToastrService } from 'ngx-toastr';
import { ResidentService } from '../../caregiver/residents/resident.service';
import * as moment from 'moment';
import * as _lodash from "lodash";
import { MatDialog } from '@angular/material/dialog';
import { AttendPromptComponent } from './attend-prompt/attend-prompt.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, forkJoin, timer, of, Subject } from 'rxjs';
import { switchMap, takeUntil, catchError } from 'rxjs/operators';
import { CommonService } from '../../shared/services/common.service';
import { CommonHttpService } from '../../shared/services/http-services/common-http.service';
import { WebsocketService } from "./../../common/commonData.service";
/** @title Responsive sidenav */
@Component({
  selector: 'app-full-layout',
  templateUrl: 'full.component.html',
  styleUrls: ["./full.component.scss"]
})
export class FullComponent implements OnDestroy {
  mobileQuery: MediaQueryList;
  dir = 'ltr';
  green: boolean;
  blue: boolean;
  dark: boolean;
  minisidebar: boolean;
  boxed: boolean;
  danger: boolean;
  showHide: boolean;
  sidebarOpened;
	
	public showSearch = false;

  public config: PerfectScrollbarConfigInterface = {};
  private _mobileQueryListener: () => void;
  myComments = [];
  mergeNotifications: any[] = [];
  notifications: any[] = [];
  oldNotifications: any[] = [];
  criticalNotifications: any[] = [];
  otherNotifications: any[] = [];
  public messages: any;
  header:any;
  username = '';
  constructor(private tokenStorage: TokenStorageServiceService,
	private router:Router,private datePipe: DatePipe,
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    public menuItems: MenuItems,
    private toaster: ToastrService,
	
	 private residentService: ResidentService,
	 private dialog: MatDialog,
	 private http: HttpClient,
	 private common: CommonService,
	 private commonHttp: CommonHttpService,
	 private wsService: WebsocketService
  ) {
    this.mobileQuery = media.matchMedia('(min-width: 768px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
	this.mobileQuery.addListener(this._mobileQueryListener);
	
  }
  today: number = Date.now();
  ngOnDestroy(): void {
	this.mobileQuery.removeListener(this._mobileQueryListener);
  }
  getHeaders(){
    this.header = new HttpHeaders().set(
      "Authorization",
      this.tokenStorage.getToken()
    );
  }
  promisesNotifications : Observable<any>[] = [];
  wardsApi: Observable<any>;
  ngOnInit(): void {
	let user: any = localStorage.getItem('loggedInUser');
	user = JSON.parse(user);
	// if(user && user.user_type === 'Caregiver'){
	// 	setInterval(() => {
	// 		if(user && user.user_type === 'Caregiver'){
	// 			this.getAlerts();	
	// 		}
	// 	}, 5000);
	// 	this.getAlerts();
	// 	console.log("continuous alerts api hit")
	// }
	// this.commonHttp.verifyAccessToken(this.tokenStorage.getUser(),this.tokenStorage.getToken()).subscribe(
	// 	data => this.username= data.toString(),
	// 	error => this.router.navigate(['/', 'auth', 'login'])
	//   )
	}
  


  @ViewChild('mainContainer') mainContainer: any =null;
  mainContainerTag : HTMLElement = null;

  isDataAvailable = false;
  fallArray = [];
  latestData = new Date();
  showBadge = true;
  mobileNotifications = [];
  fallUser = [];
  removeNotifications = [];
  attendedNotifications = [];
  previousLength = 0;
  getAlerts(){
	  this.getHeaders();
	let user: any = localStorage.getItem('loggedInUser');
	user = JSON.parse(user);
	if(user && user.user_type === 'Caregiver'){
		this.http.get(`${environment.apiUrlNew}/alerts/getWeekAlerts/`,{headers:this.header}).subscribe((data: any) => {
			if(data.itemCount > 0){
				this.notifications = [];
				if(user){
					const wards = user.wards.map(val => {
					  return val.ward_id
					})
					data.body.filter(val => val.alert.log_status === 'N' && wards.includes(val.details.ward_id)).forEach(val => {
						this.notifications.push({
							id: val.alert.alert_id,
							residentId:val.details.resident_id,
							title: val.alert.attend_status === 'N' ? val.alert.alert_body.contents[0].action : (val.alert.log_status === 'N' ? val.alert.attend_body.contents[0].action : val.alert.log_body.contents[0].action),
							notificationStatus: val.alert.attend_status !== 'N' ? 'attended' : 'Not attended',
							markAsAttend: val.alert.attend_status !== 'N',
							eventType: val.alert.alert_type,
							class: val.alert.alert_class,
							logAccess: val.alert.attend_by === `${user.first_name} ${user.last_name}`,
							details: val.details
						})
						if(val.alert.attend_status !== 'N'){
							this.notifications.push({
								residentId:val.details.resident_id,
								title: val.alert.attend_status === 'N' ? val.alert.alert_body.contents[0].action : (val.alert.log_status === 'N' ? val.alert.attend_body.contents[0].action : val.alert.log_body.contents[0].action),
								notificationStatus: val.alert.attend_status !== 'N' ? 'attended' : 'Not attended',
								markAsAttend: val.alert.attend_status !== 'N',
								eventType: 'fall attended',
								class: 'Warning',
								details: val.details
							})	
						}
					})
				}
				if(this.notifications.length !== this.previousLength){
					const objre=JSON.stringify(this.notifications);
					this.common.eventEmit(this.notifications)
				}
				this.previousLength = this.notifications.length;
			}
		})
	}
  }
  /**
   * Function to get all the notification and filter the only the unseen critical notifications
   */
  getNotifications(webCall: boolean, data: any){
	this.isDataAvailable = false;
	this.fallUser = [];
	if(localStorage.getItem('notifyPrevDate')){
		this.latestData = new Date(localStorage.getItem('notifyPrevDate'));
	}else{
		this.latestData.setHours(11);
		this.latestData.setMinutes(0);
		this.latestData.setSeconds(0);
	}
	// this.wardsApi = this.commonHttp.getOrgWard(this.cognitoService.userInfo['custom:org_unit_id']);
	// this.commonHttp.getMobileNotify().subscribe((mobile: any) => {
		const mobileNotifications = [];
		let mobileIntermediate = [];
		const acknowledgedIds = [];
		// mobileNotifications.forEach(data => {
		// 	const obj :any = {};
		// 	if(data.title.includes('fallen') || data.title === 'Fall detected'){
		// 		if(data.notificationStatus !== 'acknowledged'){
		// 			const markAsAttend = data.notificationStatus === 'attended';
		// 			obj.userId = data.notificationId;
		// 			obj.name = data.id;
		// 			obj.eventType = 'swfalldetection';
		// 			obj.content = `${data.id} has fallen down`;
		// 			obj.class = 'critical';
		// 			obj.notificationStatus = data.notificationStatus;
		// 			obj.markAsAttend = markAsAttend;
		// 			obj.date = data.timestamp;
		// 			if(data.description.split(":")[1]){
		// 				obj.user_id = data.description.split(":")[1].trim()
		// 			}
		// 			mobileIntermediate.push(obj);
		// 		}
		// 	}else if(data.title === 'acknowledged'){
		// 		if(data.description.includes('{')){
		// 			acknowledgedIds.push(data.notificationId);
		// 			const dataNotify = JSON.parse(data.description);
		// 			obj.userId = data._id;
		// 			obj.name = data.id;
		// 			obj.eventType = 'acknowledgement';
		// 			obj.content = `${data.id}'s fall has logged by ${dataNotify.createdBy}`;
		// 			obj.date = data.timestamp;
		// 			obj.class = 'success';
		// 			obj.markAsAttend = false;
		// 			obj.notificationStatus = data.notificationStatus;
		// 			mobileIntermediate.push(obj);
		// 		}
		// 	}else if(data.title === 'attended'){
		// 		obj.userId = data.notificationId;
		// 		obj.name = data.id;
		// 		obj.eventType = 'attended';
		// 		obj.content = data.description;
		// 		obj.date = data.timestamp;
		// 		obj.markAsAttend = false;
		// 		obj.notificationStatus = data.notificationStatus;
		// 		obj.class = 'warning';
		// 		mobileIntermediate.push(obj)
		// 	}
		// })
		// mobileIntermediate = mobileIntermediate.filter(value => !acknowledgedIds.includes(value.userId))
		// this.mobileNotifications = mobileIntermediate.map(comment => {
		// 	const contents = [];
		// 	contents.push({
		// 		date: comment.date,
		// 		action : comment.content
		// 	});
		// 	const obj = {
		// 		id: comment.userId,
		// 		person: comment.name,
		// 		title: comment.content,
		// 		date: comment.date,
		// 		type: 'mobile',
		// 		notificationStatus: comment.notificationStatus,
		// 		eventType: comment.eventType,
		// 		class: comment.class,
		// 		category: comment.category,
		// 		contents
		// 	}
		// 	if(comment.user_id){
		// 		Object.assign(obj, {userId: comment.user_id})
		// 	}
		// 	return obj;
		// });
		if(webCall){
			// this.wardsApi.subscribe((wards: any) =>{
				// wards.items.forEach(data => {
				// 	let params = {};
				// 	params['care_giver_id'] = this.cognitoService.userInfo['custom:user_id'],
				// 	params['ward_id'] = data.ward_number;
				// 	this.promisesNotifications.push(this.commonHttp.getAllResidentLog(params))
				// })
				// forkJoin([...this.promisesNotifications]).subscribe(data => {
					let notify = [];
					let intermediate = [];
					if(data){
						// data.forEach(response => {
						// 	response.data.items.forEach(item => {
								notify = [...notify, ...data]
						// 	})
						// })
						intermediate = notify.map(item => {
							let obj:any = {};
							if(item){
								obj.id = item.source_id;
								obj.user_id = item.user_id;
								obj.name = item.user_name !== undefined ? item.user_name.split(/(?=[A-Z])/).join(" ") : 'Unknown';
								obj.eventType = item.notification_type;
								if(item.notification_type.includes('walkattended')){
									obj.content = `${item.user_name.split(/(?=[A-Z])/).join(" ")}'s night walk alert has attended`;
									const existed = this.attendedNotifications.find(data => data === item.source_id.split(':')[0].trim());
									if(!existed){
										this.attendedNotifications.push(item.source_id.split(':')[0].trim());
									}
								}else if(item.notification_type.includes('walkacknowledgement')){
									obj.content = `${item.user_name.split(/(?=[A-Z])/).join(" ")}'s night walk alert has acknowledged`;
									if(item.source_id.split('-').length > 2){
										const id = [];
										id.push(item.source_id.split('-')[0]);
										id.push(item.source_id.split('-')[1]);
										this.removeNotifications.push(id.join("-"))
									}else if(item.source_id.split('-').length > 1){
										this.removeNotifications.push(item.source_id.split('-')[0].trim());
									}else if(item.source_id.split('A').length > 1){	
										this.removeNotifications.push(item.source_id.split('A')[0].trim())
									}else{
										this.removeNotifications.push(item.source_id.split(':')[0].trim())
									}
								}else if(item.notification_type === 'physiotest'){
									obj.content = `A ${item.source_type} test is performed for ${item.user_name.split(/(?=[A-Z])/).join(" ")}`
								}else if(item.notification_type.includes('resident')){
									obj.content = `A ${item.source_type.split("_").join(" ")} operation is made for ${item.user_name !== undefined ? item.user_name.split(/(?=[A-Z])/).join(" ") : 'Unknown'}`
								}else if(item.notification_type.includes('questionnaire')){
									obj.content = `A ${item.source_type.split("_").join(" ")} type question is made for ${item.user_name !== undefined ? item.user_name.split(/(?=[A-Z])/).join(" ") : 'Unknown'}`
								}else if(item.notification_type.includes('swfalldetection')){
									obj.content = `${item.user_name.split(/(?=[A-Z])/).join(" ")} has fallen down`;
								}else if(item.notification_type.includes('batteryempty')){
									obj.content = `${item.user_name.split(/(?=[A-Z])/).join(" ")}'s wearable has critically low battery`
								}else if(item.notification_type.includes('batterylow')){
									obj.content = `${item.user_name.split(/(?=[A-Z])/).join(" ")}'s wearable has low battery (<15%). Please charge the wearable soon.`
								}else if(item.notification_type.includes('walk')){
									if(item.notification_type.includes('nightwalkalert')){
										obj.content = `${item.user_name.split(/(?=[A-Z])/).join(" ")}'s wearable has sent a night walk notification`;
									}else{
										obj.content = `${item.user_name.split(/(?=[A-Z])/).join(" ")}'s wearable has sent a low walk notification`
									}
								}else if(item.notification_type.includes('acknowledgement')){
									obj.content = `${item.user_name.split(/(?=[A-Z])/).join(" ")}'s fall alert has acknowledged`;
									const existed = this.removeNotifications.find(data => data === item.source_id.split('-')[0].trim());
									if(!existed){
										if(!existed){
											if(item.source_id.split('-').length > 1){
												this.removeNotifications.push(item.source_id.split('-')[0].trim());
											}else{
												this.removeNotifications.push(item.source_id.split(':')[0].trim())
											}
										}
									}
								}else if(item.notification_type.includes('attended')){
									obj.content = `${item.user_name.split(/(?=[A-Z])/).join(" ")}'s fall alert has attended`;
									const existed = this.attendedNotifications.find(data => data === item.source_id.split(':')[0].trim());
									if(!existed){
										this.attendedNotifications.push(item.source_id.split(':')[0].trim());
									}
								}else {
									obj.content = `${item.user_name.split(/(?=[A-Z])/).join(" ")}'s ${item.source_type.split("_").join(" ")} notification`
								}
								if(item.notification_type.includes('acknowledgement')){
									obj.class = 'success';
								}else if(item.notification_type.includes('attended') || item.notification_type.includes('walkattended')){
									obj.class = "warning";
								}else if(item.notification_type.includes('nightwalkalert')){
									obj.class="critical"
								}else{
									obj.class = item.notification_class;
								}
								obj.category = item.notification_category;
								obj.date = item.created_at;
								if (obj.class == 'success') {
									this.hindNotifications(obj.id)
								}
								return obj;
							}
						})
						this.notifications = intermediate.map(comment => {
							const contents = [];
							contents.push({
								date: comment.date,
								action : comment.content
							});
							return {
								id: comment.id,
								userId: comment.user_id,
								person: comment.name,
								title: comment.content,
								date: comment.date,
								eventType: comment.eventType,
								class: comment.class,
								type: 'dashboard',
								category: comment.category,
								markAsAttend: this.attendedNotifications.includes(comment.id),
								contents
							};
						});
						const notifyIntermediate = []					
						this.notifications.forEach(data => {
							const existed = notifyIntermediate.find(notify => notify.id === data.id && notify.date === data.date);
							if(!existed){
								notifyIntermediate.push(data)
							}
						})
						this.notifications = notifyIntermediate.sort((a,b) => {
							return a.date < b.date ? 1 : -1;
						})
						const deleted = JSON.parse(localStorage.getItem('deletedNotifications'));
						if(deleted){
							this.notifications = this.notifications.filter(notification => !deleted.includes(notification.id))
						}
						this.notifications = this.notifications.filter(notify => !this.removeNotifications.includes(notify.id.split(":")[0].trim()));
						this.notifications = this.notifications.filter(notify => !this.removeNotifications.includes(notify.id));
					}
				// })
			// })
		}
		this.mergeNotifications = [...this.notifications, ...this.mobileNotifications];
		this.mergeNotifications = this.mergeNotifications.sort((a: any, b: any) => {
			return a.date < b.date ? 1 : -1;
		})
		if(localStorage.getItem('notifyPrevDate')){
			this.mergeNotifications = this.mergeNotifications.filter(notification => {
				return (new Date(notification.date).getTime() > new Date(this.latestData).getTime()) || notification.class === 'critical' || notification.class === 'warning' || notification.eventType === 'attended' || notification.eventType === 'walkattended'
			});
		}
		this.mergeNotifications.forEach(data => {
			data.markAsAttend = this.attendedNotifications.includes(data.id)
		})
		this.mergeNotifications = this.mergeNotifications.filter(notify => !this.removeNotifications.includes(notify.id.split(":")[0].trim()))
		this.mergeNotifications = this.mergeNotifications.filter(notify => !this.removeNotifications.includes(notify.id))
		this.mergeNotifications.forEach(item => {
			if(this.latestData.getTime() < new Date(item.date).getTime()){
				this.latestData = new Date(item.date);			}
		})
		localStorage.setItem('notifyPrevDate', `${this.latestData}`);
		this.isDataAvailable = true;
		this.criticalNotifications = this.mergeNotifications.filter(notification => notification.eventType === 'swfalldetection' || notification.eventType === 'nightwalkalert' || notification.eventType === 'acknowledgement' || notification.eventType === 'walkacknowledgement' || notification.eventType === 'attended' || notification.eventType === 'walkattended');
		if(this.previousLength < this.criticalNotifications.length){
			this.common.eventEmit(true)
		}
		this.previousLength = this.criticalNotifications.length;
		this.residentService.setFallResidents(true);
		// console.log("asdsadsadsadsadsadsa  ", this.notifications);
	// })
  }
  hindNotifications(id) {
	setTimeout(() => {
		this.clearNotification(id);
	}, 5000);
  }
  walkCheck(type){
	const types = ['Nightwalk','6minwalk','3minwalk', 'nightwalkalert'];
	return types.includes(type);
  }
  residentCheck(type){
	const types = ['residentupdated','residentcreated'];
	return types.includes(type);
  }
  questionCheck(type){
	const types = ['physiotest','questionnaireadded','questionnaireupdated'];
	return types.includes(type);
  }
  batteryCheck(type){
	const types = ['batteryfull','batterylow','batteryempty'];
	return types.includes(type);
  }
  checkButtons(type){
	const types = ['Nightwalk','watchRemoved','Fall'];
	return types.includes(type);
  }
  clearNotification(id){
	const deleted = JSON.parse(localStorage.getItem('deletedNotifications'));
	this.notifications = this.notifications.filter(notification => notification.id !== id);
	this.criticalNotifications = this.criticalNotifications.filter(notification => notification.id !== id);
	if(deleted){
		const existed = deleted.find(notification => notification.notificationId === id);
		if(!existed){
			deleted.push(id)
			localStorage.setItem('deletedNotifications', JSON.stringify(deleted));
		}
	}else {
		const newDeleted = [id]
		localStorage.setItem('deletedNotifications', JSON.stringify(newDeleted))
	}
	if(this.otherNotifications.length > 0){
		this.showBadge = true;
	}else {
		this.showBadge = false;
	}
  }
  /**
   * Function to open attempt prompt dialog
   */
  timeZone = moment.parseZone().utcOffset();
  openDialog(type, id, dialogType){
	  this.getHeaders();
	if(dialogType === 'attend'){
		const notify = this.notifications.find(notification => notification.id === id);
		notify.markAsAttend = true;
		if(notify.type === 'mobile'){
			const params = {
				id: notify.person,
				title: 'attended',
				eventType: notify.eventType,
				// description: `${this.cognitoService.userInfo['cognito:username']} has attended ${notify.person}'s fall alert`,
				notificationId: notify.id,
				notificationStatus: 'attended',
				timestamp: new Date().getTime()
			}
		}else{
			const user = JSON.parse(localStorage.getItem('loggedInUser'));
			const date = new Date();
			const alert = this.notifications.find(val => val.id === id)
			const body = {
				resident_id: alert.details.resident_id,
				resident_name: alert.details.resident_first_name + " " + alert.details.resident_last_name,
				contents: [
					{
						date: date,
						action: `${alert.details.resident_first_name} ${alert.details.resident_last_name}'s ${alert.eventType} has been attended by ${user.first_name} ${user.last_name}`
					}
				]
			}
			this.http.put(`${environment.apiUrlNew}/alerts/attend/`, {
				"alert_id" : id,
				"attend_status": "Y",
				"attend_by": `${user.first_name} ${user.last_name}`,
				"attend_at": this.datePipe.transform(new Date(), 'YYYY-MM-dd HH:mm:ss', 'UTC+2'),//moment(date).utc().format("YYYY-MM-DD HH:mm:ss"),
				"attend_body": body
			},{headers:this.header}).subscribe(data => {
			})
		}
	}else{
		const dialogRef = this.dialog.open(AttendPromptComponent, {
			maxWidth: '450px',
			maxHeight: '600px',
			data: {
				type,
				id,
				dialogType
			}
		})
		dialogRef.afterClosed().subscribe(data => {
		  if(data){
				const user = JSON.parse(localStorage.getItem('loggedInUser'));
				let description = Object.assign({...data}, {createdBy: `${user.first_name} ${user.last_name}`});
				const date = new Date();
				const alert = this.notifications.find(val => val.id === id)
				const body: any = {
					resident_id: alert.details.resident_id,
					resident_name: alert.details.resident_first_name + " " + alert.details.resident_last_name,
					contents: [
						{
							date: date,
							action: `${alert.details.resident_first_name} ${alert.details.resident_last_name}'s ${alert.eventType} has been logged by ${user.first_name} ${user.last_name}`
						},
						{
							date: date,
							action: `It is a ${description.real === 'no' ? 'false' : 'Real'} alert`
						}
					]
				}
				if(description.real !== 'no'){
					body.contents.push({action: 'Observations'})
					body.contents.push({action: `On scale of 1-5, The criticality is given as ${description.rate}`})
					body.contents.push({action: `Other observations, ${description.observations}`})
				}
				this.http.put(`${environment.apiUrlNew}/alerts/log/`, {
					"alert_id" : id,
					"log_status": "Y",
					"log_by": `${user.first_name} ${user.last_name}`,
					"log_at":this.datePipe.transform(new Date(), 'YYYY-MM-dd HH:mm:ss', 'UTC+2'),// moment(date).utc().format("YYYY-MM-DD HH:mm:ss"),
					"log_body": body
				},{headers:this.header}).subscribe(data => {
					this.notifications.push({
						id: alert.id,
						title: `${alert.details.resident_first_name} ${alert.details.resident_last_name}'s ${alert.eventType} has been logged`,
						eventType: 'fall logged',
						class: 'Success'
					})
					setTimeout(() => {
						this.notifications = this.notifications.filter(val => alert.id == val.id)
					}, 1000);
				})
			}
		})
	}
  }
  showSuccess() {
		this.toaster.success('<div class="action-text"><span class="font-400">Resident is Successfully Added</span><br><span>Ward A Room 319 has alloted</span></div><div class="action-buttons"></div>', "", {
			timeOut: 2000,
			progressBar: true,
			enableHtml: true,
			closeButton: false,
		});
	}
	/////log wearable for charege
	wearableOncharge(type, id, dialogType){
		this.getHeaders();
	const notify = this.notifications.find(notification => notification.id === id);
	notify.markAsAttend = true;
	if(notify.type === 'mobile'){
		const params = {
			id: notify.person,
			title: 'attended',
			eventType: notify.eventType,
			// description: `${this.cognitoService.userInfo['cognito:username']} has attended ${notify.person}'s fall alert`,
			notificationId: notify.id,
			notificationStatus: 'Wearable on Charge',
			timestamp: new Date().getTime()
		}
	}else{
		const user = JSON.parse(localStorage.getItem('loggedInUser'));
		const date = new Date();
		const alert = this.notifications.find(val => val.id === id)
		const body = {
			resident_id: alert.details.resident_id,
			resident_name: alert.details.resident_first_name + " " + alert.details.resident_last_name,
			contents: [
				{
					date: date,
					action: `${alert.details.resident_first_name} ${alert.details.resident_last_name}'s ${alert.eventType} has been attended by ${user.first_name} ${user.last_name}`
				}
			]
		}
		this.http.put(`${environment.apiUrlNew}/alerts/log/`, {
			"alert_id" : id,
			"log_status": "Y",
			"log_by": `${user.first_name} ${user.last_name}`,
			"log_at": moment(date).utc().format("YYYY-MM-DD HH:mm:ss"),
			"log_body": body
		},{headers:this.header}).subscribe(data => {
			this.notifications.push({
				id: alert.id,
				title: `${alert.details.resident_first_name} ${alert.details.resident_last_name}'s ${alert.eventType} has been logged`,
				eventType: 'fall logged',
				class: 'Success'
			})
			setTimeout(() => {
				this.notifications = this.notifications.filter(val => alert.id == val.id)
			}, 1000);
		})
		}
	}

	//////////
  saveConfig() {
		this.toaster.success('<div class="action-text"><span class="font-400">Profile settings are successfully saved</span></div><div class="action-buttons"></div>', "", {
			timeOut: 2000,
			progressBar: true,
			enableHtml: true,
			closeButton: false,
		});
	}
	showInfo() {
		this.toaster.info(`<div class="action-text"><span class="font-400">John Wick has worn the watch again.</span></div><div class="action-buttons"></div>`, "", {
			timeOut: 5000,
			progressBar: true,
			enableHtml: true,
			closeButton: true,
		});
  }
  showFullBattery(){
    this.toaster.info(`<div class="action-text"><span class="font-400">John wick's wearable is fully charged. Please return it to John.</span></div><div class="action-buttons"></div>`, "", {
			timeOut: 5000,
			progressBar: true,
			enableHtml: true,
			closeButton: true,
		});
  }
	residentAddIncomplete() {
		this.toaster.warning('<div class="action-text"><span class="font-400">Resident is saved with incomplete details</span><br><span>Please fill the incomplete information</span></div><div class="action-buttons"></div>', "", {
			timeOut: 300000000,
			progressBar: false,
			enableHtml: true,
			closeButton: true,
			disableTimeOut: false,
		});
  }
  showWatchRemoved() {
		this.toaster.warning(`<div class="action-text"><span class="font-400">John wick is not wearing the wearable</span><div class="action-buttons"></div>`, "", {
			timeOut: 300000,
			progressBar: false,
			enableHtml: true,
			closeButton: true,
			disableTimeOut: true,
		});
  }
	showWarning() {
		this.toaster.warning(`<div class="action-text"><span class="font-400">John wick's wearable has low battery (<15%). Please charge the wearable soon.</span><div class="action-buttons"></div>`, "", {
			timeOut: 300000,
			progressBar: false,
			enableHtml: true,
			closeButton: true,
			disableTimeOut: true,
		});
  }
  showNoData(){
    this.toaster.error(`<div class="action-text"><span class="font-400">John wick's wearable has not sent any data in 3 hours.</span></div><div class="action-buttons"><a class="white-act-btn" href="./residents">Action</a></div>`, "", {
			timeOut: 300000,
			progressBar: false,
			enableHtml: true,
			closeButton: false,
			toastClass: "toast-critical other",
		});
  }
  showNightWalkAlert(){
    this.toaster.error('<div class="action-text"><span class="font-400">John wick is up walking since 23:00</span></div><div class="action-buttons"><a class="white-act-btn" href="./residents">Action</a></div>', "", {
			timeOut: 300000,
			progressBar: false,
			enableHtml: true,
			closeButton: false,
			toastClass: "toast-critical other",
		});
  }
  showCriticalBattery(){
    this.toaster.error(`<div class="action-text"><span class="font-400">John wick's wearable has critically low battery</span></div><div class="action-buttons"><a class="white-act-btn" href="./residents">Action</a></div>`, "", {
			timeOut: 300000,
			progressBar: false,
			enableHtml: true,
			closeButton: false,
			toastClass: "toast-critical other",
		});
  }
	showCritical() {
		this.toaster.error('<div class="action-text"><span class="font-400">John wick is Falling Down</span></div><div class="action-buttons"><a class="white-act-btn">Action</a></div>', "", {
			timeOut: 300000,
			progressBar: false,
			enableHtml: true,
			closeButton: false,
			toastClass: "toast-critical fall",
		});
  }
  closeToast(){
    console.log('coming');
  }
  // Mini sidebar
}


import { Pipe, PipeTransform } from '@angular/core';
import { TokenStorageServiceService } from '../../auth/login/token-storage-service.service';

@Pipe({
  name: 'criticalFilter'
})
export class CriticalFilter implements PipeTransform {

  transform(data: any): any {
    return data.filter(notification => !(notification.eventType === 'swfalldetection' || notification.eventType === 'nightwalkalert' || notification.eventType === 'acknowledgement' || notification.eventType === 'walkacknowledgement' || notification.eventType === 'attended' || notification.eventType === 'walkattended'));
  }

}
