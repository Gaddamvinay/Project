import { Component, Output, EventEmitter, Input, ViewChild, Inject, OnInit, HostListener } from "@angular/core";
import { PerfectScrollbarConfigInterface } from "ngx-perfect-scrollbar";
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';
import { CookieService } from "ngx-cookie-service";
import { forkJoin, Observable, BehaviorSubject } from "rxjs";
import { AttendPromptComponent } from "../attend-prompt/attend-prompt.component";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { TimeFormatService } from "../../../shared/services/time-format.service";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ResidentSettingsComponent } from "../../../caregiver/resident-view-new/resident-view/notification/resident-settings/resident-settings.component";
import { ResidentService } from "../../../caregiver/residents/resident.service";
import { CommonService } from "../../../shared/services/common.service";
import { CommonHttpService } from "../../../shared/services/http-services/common-http.service";
import { ToastrService } from "ngx-toastr";
import * as moment from "moment";
import { CommonEditModelComponent } from "../../../shared/common-edit-model/common-edit-model.component";
import { SsaSettingsComponent } from "../../../salesserviceadmin/ssa-settings/ssa-settings.component";
import { ChqSettingsComponent } from "../../../customerhq/chq-settings/chq-settings.component";
import { ChangePasswordComponent } from "../change-password/change-password.component";
import { CommonAddModelComponent } from "../../../shared/common-add-model/common-add-model.component";
import { TokenStorageServiceService } from "../../../auth/login/token-storage-service.service";

export interface mycomment {
	class: string;
	/* data: Chartist.IChartistData; */
	options?: any;
	responsiveOptions?: any;
	name: string;
	content: string;
	profile: string;
	status: string;
	date: string;
	maticon: string;
}

@Component({
	selector: "app-header",
	templateUrl: "./header.component.html",
	styleUrls: [],
})
export class AppHeaderComponent implements OnInit {
	today: number = Date.now();
	userImage: string;
	userProfileData: any;
	format: string;
	idleState = 'Not started.';
	timedOut = false;
	tabWasClosed=true;
	userActivity;
	header:any;
	userInactive: Subject<any> = new Subject();
	lastPing?: Date = null;
	//@ViewChild('childModal', { static: false }) childModal: ModalDirective;


	@Output() event = new EventEmitter();
	
	constructor(private idle: Idle, private tokenStorage: TokenStorageServiceService, private keepalive: Keepalive, private commonHttp: CommonHttpService, private common: CommonService, private timeFormat: TimeFormatService,
		private dialog: MatDialog, private router: Router, private toastr: ToastrService, private http: HttpClient, private cookieService: CookieService) {
			let user: any = localStorage.getItem('loggedInUser');
		  // sets an idle timeout of 5 seconds, for testing purposes.
		  idle.setIdle(900);
		  // sets a timeout period of 5 seconds. after 10 seconds of inactivity, the user will be considered timed out.
		  idle.setTimeout(5);
		  // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
		  idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);
	  
		  idle.onIdleEnd.subscribe(() => { 
			this.idleState = 'No longer idle.'
			//console.log(this.idleState);
			//this.reset();
		  });
		  if(user)
		  {
			idle.watch();
			this.timedOut = true;
		  }
		  idle.onTimeout.subscribe(() => {
			this.idleState = 'Timed out!';
			this.timedOut = true;
			//console.log(this.idleState);
		    this.toastr.success("Session expire login again")
		   idle.stop();
		   this.signout();
			
			
		  });
		  
		  idle.onIdleStart.subscribe(() => {
			  this.idleState = 'You\'ve gone idle!'
			  //console.log(this.idleState);
		  });
		  
		  idle.onTimeoutWarning.subscribe((countdown) => {
			this.idleState = 'You will time out in ' + countdown + ' seconds!'
			//console.log(this.idleState);
		  });
	  
		  // sets the ping interval to 15 seconds
		  keepalive.interval(15);
	  
		  keepalive.onPing.subscribe(() => this.lastPing = new Date());
	  
		if (!user) {
			this.router.navigate(['/', 'auth', 'login']).then(() => {
				this.toastr.error('<div class="action-text"><span class="font-400">Sorry unknown error. Please login again </span></div><div class="action-buttons"></div>', "", {
					timeOut: 2000000,
					progressBar: true,
					enableHtml: true,
					closeButton: false,
				})
			})
		}

	
		if (user) {
			user = JSON.parse(user);
			this.userProfileData = user;
		}
		// this.getNotifications(true);
		// setInterval(() => {
		// 	this.getNotifications(true);
		// }, 5000);
	}
	public config: PerfectScrollbarConfigInterface = {};
	reset() {
		this.idle.watch();
		//xthis.idleState = 'Started.';
		this.timedOut = false;
	  }
	  ngOnDestroy(){
		  this.signout();
	  }
	  ngOnInit(){
	
		let user: any = localStorage.getItem('loggedInUser');
		if (user) {
			user = JSON.parse(user);
			let id=user.id;
			this.http.get(`${environment.apiUrlNew}/users/getUser/?id=`+id,{headers:this.header}).subscribe((data: any) => {
			
			let message=data.message;
			if(message==='No token provided'||message==='accesstoken token expired'){
				localStorage.clear();
				this.router.navigate(['/', 'auth', 'login'])
				// this.toastr.error(`<div class="action-text"><span class="font-400">${"Session Expire"}</span></div><div class="action-buttons"></div>`, "", {
				// 	timeOut: 2000,
				// 	progressBar: true,
				// 	enableHtml: true,
				// 	closeButton: false,
				//   });
				
			}
			});
		}
		else{
			this.signout()
		}
	  }
	 signout() {
		this.cookieService.deleteAll();
		this.cookieService.delete('rememberMe');
		this.cookieService.delete('userName');
		this.cookieService.delete('password');
		let user: any = localStorage.getItem('loggedInUser');
		if (user) {
			user = JSON.parse(user);
			let caregiverStatus = {
				caregiver_id: user.caregiver_id,
				currently_active: 0
			}
			if (user.user_type === 'Caregiver') {
				this.commonHttp.updateCaregiverStatus(caregiverStatus).subscribe(() => {
					localStorage.clear();
				})
				
				//Logout time capture
				const user1 = JSON.parse(localStorage.getItem('loggedInUser'))
				const date = new Date();
				const dbPostData = {
					caregiverId: user1.caregiver_id,
					customerId: user1.customers.customer_id,
					facilityId: user1.facilities[0].facility_id,
					wardId: user1.wards[0].ward_id,
					logoutTime: moment(date).format("YYYY-MM-DD HH:mm:ss"),
				}
				this.http.put(`${environment.apiUrlNew}/users/storeLogoutDetails/`, dbPostData,{headers:this.header}).subscribe(data => {
				})
				  this.tokenStorage.signOut();
				  localStorage.clear();
					this.router.navigate(['/', 'auth', 'login'])
				//end 
			} else {
				localStorage.clear();
				this.tokenStorage.signOut();
				this.router.navigate(['/', 'auth', 'login'])
			}
		}
		// this.auth.signOut().subscribe(data => {
		// 	this.router.navigate(['/', 'auth','login']).then(() => {
		// 	});
		// })
		// this.updateAnalytics();
	}

	updateAnalytics(tab?: string) {
		let body = {
			activityType: 'logout',
			page: 'ca-logout',
			time: moment.now(),
			//   userId: this.auth.userInfo['custom:user_id'],
			// residentId: this.userId,
			// tab: tab
		}
	}
	getNoImageHolder(fName: string, lName: string) {
		if (fName !== null && lName !== null && fName && lName) {
			return `${fName[0]}${lName[0]}`
		}
	}
	eventEmit() {
		this.event.emit();
	}
	getFormat() {
		const format = this.timeFormat.getFormat();
		return format;
	}
	isDataAvailable = false;
	fallArray = [];
	latestData = new Date(null);
	showBadge = false;

	promisesNotifications: Observable<any>[] = [];
	wardsApi: Observable<any> = null;
	mobileNotifications = [];
	removeNotifications = [];
	attendedNotifications = [];
	fallUser = [];
	previousLength = 0;
	/**
	 * Function to get all the notification and filter the only the unseen notifications
	 */
	walkCheck(type) {
		const types = ['walk', '6minwalk', '3minwalk'];
		return types.includes(type);
	}
	residentCheck(type) {
		const types = ['residentupdated', 'residentcreated'];
		return types.includes(type);
	}
	questionCheck(type) {
		const types = ['physiotest', 'questionnaireadded', 'questionnaireupdated'];
		return types.includes(type);
	}
	batteryCheck(type) {
		const types = ['batteryfull', 'batterylow', 'batteryempty'];
		return types.includes(type);
	}
	checkButtons(notification: any) {
		const types = ['NightWalkAlert', 'watchRemoved', 'swfalldetection'];
		return types.includes(notification.eventType);
	}
	notifications: any[] = [];
	mergeNotifications: any[] = [];
	criticalNotifications: any[] = [];
	otherNotifications: any[] = [];
	clearNotification(id) {
		const deleted = JSON.parse(localStorage.getItem('deletedNotifications'));
		this.notifications = this.notifications.filter(notification => notification.id !== id);
		if (deleted) {
			const existed = deleted.find(notification => notification.notificationId === id);
			if (!existed) {
				deleted.push(id)
				localStorage.setItem('deletedNotifications', JSON.stringify(deleted));
			}
		} else {
			const newDeleted = [id]
			localStorage.setItem('deletedNotifications', JSON.stringify(newDeleted))
		}
		if (this.otherNotifications.length > 0) {
			this.showBadge = true;
		} else {
			this.showBadge = false;
		}
	}
	openDialog(type: string, id: string, dialogType: string) {
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
			if (data) {
				if (dialogType === 'attend') {
					const notify = this.mergeNotifications.find(notification => notification.id === id);
					notify.markAsAttend = true;
					if (notify.type === 'mobile') {
						const params = {
							id: notify.person,
							title: 'attended',
							// description: `${this.auth.userInfo['cognito:username']} has attended ${notify.person}'s fall alert`,
							notificationId: notify.id,
							notificationStatus: 'yes',
							timestamp: new Date().getTime()
						}
						this.http.post('https://nameless-hamlet-83858.herokuapp.com/api/messages/addMessage', params).subscribe(data => {
							console.log(data);
						})
					} else {
						const obj = {
							user_id: notify.userId,
							notification_type: 'attended',
							source_id: `${notify.id} : ${notify.userId}`,
							source_type: 'attended',
							notification_message: {
								"userId": notify.userId,
								// createdBy: this.auth.userInfo['cognito:username']
							}
						}
					}
				} else {
					const notify = this.mergeNotifications.find(notification => notification.id === id);
					if (notify.type === 'mobile') {
						const params = {
							id: notify.person,
							title: 'Acknowledgement',
							notificationId: notify.id,
							notificationStatus: 'yes',
							timestamp: new Date().getTime()
						}
						this.http.post('https://nameless-hamlet-83858.herokuapp.com/api/messages/addMessage', params).subscribe(data => {
							this.mergeNotifications = this.mergeNotifications.filter(value => value.id !== id);
						})
					} else {
						const notify = this.mergeNotifications.find(notification => notification.id === id);
						const obj = {
							user_id: notify.userId,
							notification_type: 'acknowledgement',
							source_id: `${notify.id} : ${notify.userId}`,
							source_type: 'acknowledgement',
							notification_message: {
								"userId": notify.userId,
								data: { ...data },
							}
						}
					}
				}
			}
		})
	}
	/**
	 * Function to open Profile dialog
	 */
	openProfile() {
		const profile = this.dialog.open(MyprofileComponent, {
			disableClose: true,
			width: '920px',
			panelClass: 'profile-dialog',
			data: {
				payload: this.userProfileData
			}
		})
		profile.afterClosed().subscribe(data => {
			if (data) {
				this.commonHttp.getUserDataNew(this.userProfileData.username).subscribe((data: any) => {
					if (data) {
						this.userProfileData = data.details;
					}
				})
			}
		})
	}

	//session Expire popup//
	//   openSessionExpire(){
	// 		const dialogRef = this.dialog.open(SessionExpireComponent);

	// 		dialogRef.afterClosed().subscribe(result => {
	// 		// console.log(`Dialog result: ${result}`);
	// 		});
	// 	  }


	openPassword() {
		const password = this.dialog.open(CommonAddModelComponent, {
			disableClose: true,
			panelClass: 'dialog-popup',
			width: '920px',
			data: {
				dialogType: 'Change password'
			}
		})
		password.afterClosed().subscribe(data => {
			if (data) {
			}
		})
	}
	/**
	 * Function to open Setting dialog
	 */
	openSettings() {
		if (this.userProfileData["user_type"] === 'SSA') {
			const settings = this.dialog.open(SsaSettingsComponent, {
				disableClose: true,
				width: '920px',
				panelClass: 'profile-dialog',
				data: {
					// payload: this.userProfileData,
					// type: 'global'
				}
			})
			settings.afterClosed().subscribe(data => {
				if (data) {
				}
			})
		} else if (this.userProfileData["user_type"] === 'CA') {
			const settings = this.dialog.open(ChqSettingsComponent, {
				disableClose: true,
				width: '920px',
				panelClass: 'profile-dialog',
				data: {
					// payload: this.userProfileData,
					// type: 'global'
				}
			})
			settings.afterClosed().subscribe(data => {
				if (data) {

				}
			})
		} else if (this.userProfileData['user_type'] === 'Caregiver') {
			const settings = this.dialog.open(ResidentSettingsComponent, {
				disableClose: true,
				width: '920px',
				panelClass: 'profile-dialog',
				data: {
					payload: this.userProfileData,
					type: 'global'
				}
			})
			settings.afterClosed().subscribe(data => {
				if (data) {
					// this.commonHttp.getUserData(this.auth.userInfo['custom:user_id']).subscribe((data: any) =>{
					// 	if(data){
					// 		this.userProfileData = data[0];
					// 		this.userImage = data[0].logoBlob;
					// 	}
					// })
				}
			})
		}
	}
}

@Component({
	selector: "app-profile",
	templateUrl: "./my-profile.component.html",
	styleUrls: [],
})
export class MyprofileComponent implements OnInit {
	previousTimeformat: string;
	previousDateFormat: string;
	previousFilterFomat: string;
	fileUpload: FormGroup;
	header:any;
	userForm: FormGroup;
	today = new Date();
	some: any;
	titleShow = false;
	userProfileData: any;
	imageDataSubject = new BehaviorSubject(null);
	constructor(
		public dialogRef: MatDialogRef<MyprofileComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private timeFormat: TimeFormatService,
		private _fb: FormBuilder,
		private http: HttpClient,
		private tokenStorage: TokenStorageServiceService,
		private commonHttp: CommonHttpService,
		private toastr: ToastrService
	) {
		this.getHeaders()
		this.userProfileData = { ...this.data.payload };
		this.userForm = this._fb.group({
			firstName: [null, [Validators.required, Validators.pattern('^[a-zA-Z0-9äåö_]*$')]],
			lastName: [null, [Validators.required, Validators.pattern('^[a-zA-Z0-9äåö_]*$')]],
			email: [null, Validators.required],
			ext: [{ value: '+91', disabled: true }, Validators.required],
			customer: [{ value: '', disabled: true }],
			facility: [{ value: '', disabled: true }],
			ward: [{ value: '', disabled: true }],
			phoneNumber: [null, Validators.required]
		})
		this.fileUpload = this._fb.group({
			fileInput: ['']
		})
		let { first_name: firstName, last_name: lastName, email, phone_number: phoneNumber, user_role: userRole } = this.data.payload;
		if (this.data.payload.customers) {
			this.userForm.patchValue({
				customer: this.data.payload.customers.customer_id
			})
		}
		if (this.data.payload.facilities) {
			if (this.data.payload.user_type === 'FA') {
				this.userForm.patchValue({
					facility: this.data.payload.facilities.facility_id
				})
			} else {
				this.userForm.patchValue({
					facility: this.data.payload.facilities[0].facility_id
				})
			}
		}
		if (this.data.payload.wards) {
			const wards = this.data.payload.wards.map(val => {
				return val.ward_id
			})
			this.userForm.patchValue({
				ward: wards
			})
		}
		const mobile = phoneNumber.split(" ");
		const ext = mobile[0];
		phoneNumber = mobile[1];;
		this.userForm.patchValue({
			firstName,
			lastName,
			email,
			ext,
			userRole,
			phoneNumber
		})
		this.previousDateFormat = this.getFormat();
		this.previousFilterFomat = this.getFilterFormat();
		this.previousTimeformat = this.getTimeFormat();
		this.http.get(`${environment.apiUrlNew}/wards/get/`,{headers:this.header}).subscribe((wards: any) => {
			if (wards.itemCount > 0) {
				this.wardList = wards.body.map(value => {
					return {
						id: value.details.ward_id,
						name: value.details.ward_name,
						facility_id: value.details.facility_id,
						customer_id: value.details.customer_id,
						userRole: value.details.user_type,
					}
				})
			}
		})
		this.http.get(`${environment.apiUrlNew}/customers/get/`,{headers:this.header}).subscribe((customers: any) => {
			if (customers.itemCount > 0) {
				this.customerList = customers.body.map(value => {
					return {
						id: value.details.customer_id,
						name: value.details.customer_name,
						userRole: value.details.user_type,
					}
				})
			}
		})
		this.http.get(`${environment.apiUrlNew}/facilities/get/`,{headers:this.header}).subscribe((facilities: any) => {
			if (facilities.itemCount > 0) {
				this.facilityList = facilities.body.map(value => {
					return {
						id: value.details.facility_id,
						customer_id: value.details.customer_id,
						name: value.details.facility_name
					}
				})
			}
		})
	}
	
	getHeaders(){
		this.header = new HttpHeaders().set(
		  "Authorization",
		  this.tokenStorage.getToken()
		);
	  }
	get userWardIds() {
		if (this.userForm.get('ward').value.length > 1) {
			return this.userForm.get('ward').value.filter(value => value !== '');
		}
		return this.userForm.get('ward').value;
	}
	wardList: any[] = [];
	facilityList: any[] = [];
	customerList: any[] = [];
	getWard(ward_number: string) {
		return this.wardList.find(it => it.id === ward_number)
	}
	ngOnInit() {
		this.imageDataSubject.subscribe(data => {
			if (data != null) {
				this.changeTheImage({ logoBlob: data });
			}
		})
	}
	close() {
		this.dialogRef.close(false);
		// this.changeFilterFormat(this.previousFilterFomat);
		// this.changeFormat(this.previousDateFormat);
		// this.changeTimeFormat(this.previousTimeformat);
	}
	changeTheImage(putData: any) {

		// this.commonHttp.updateUser(this.cognitoService.userInfo['custom:user_id'], putData).subscribe(() => {
		// 	this.getCareGiver();
		// })
	}
	getCareGiver() {

	}
	getFormat() {
		const format = this.timeFormat.getFormat();
		return format;
	}
	getTimeFormat() {
		const format = this.timeFormat.getTimeFormat();
		return format;
	}
	getFilterFormat() {
		const format = this.timeFormat.getFilterFormat();
		return format;
	}
	changeFormat(format: string) {
		this.timeFormat.changeFormat(format);
		this.userForm.markAsDirty();
	}
	changeFilterFormat(format: string) {
		this.timeFormat.changeFilterFormat(format);
		this.userForm.markAsDirty();
	}
	changeTimeFormat(format: string) {
		this.timeFormat.changeTimeFormat(format);
		this.userForm.markAsDirty();
	}
	fileChangeEvent(event: any) {
		const file = event.target.files[0];
		let reader = new FileReader();
		let putData = null;
		let me = this;
		reader.readAsDataURL(file);
		reader.onload = function () {
			me.imageDataSubject.next(reader.result);
		};
		reader.onerror = function (error) {
			console.log('Error: ', error);
		};
	}
	updateUserData() {
		const putData = {
			id: this.userProfileData.id,
			firstName: this.userForm.get("firstName").value,
			lastName: this.userForm.get("lastName").value,
			email: this.userForm.get("email").value,
			phone_number: `${this.userForm.get('ext').value} ${this.userForm.get("phoneNumber").value}`,
		}
		// this.commonHttp.updateUser('', putData).subscribe(data => {
		// 	this.previousDateFormat = this.getFormat();
		// 	this.previousFilterFomat = this.getFilterFormat();
		// 	this.previousTimeformat = this.getTimeFormat();
		// 	this.dialogRef.close(true);
		// 	this.saveConfig()
		// })
	}

	saveConfig() {
		this.toastr.success('<div class="action-text"><span class="font-400">Profile changes is successfully saved</span></div><div class="action-buttons"></div>', "", {
			timeOut: 2000,
			progressBar: true,
			enableHtml: true,
			closeButton: false,
		});
	}
}

// @Component({
// 	selector: "session-expire",
// 	templateUrl: "./session-expire.component.html",
// 	styleUrls: [],
// })
// export class SessionExpireComponent implements OnInit{
// 	today: number = Date.now();
// 	userImage: string;
// 	userProfileData: any;
// 	format: string;
// 	@Output() event = new EventEmitter();
// 	constructor(public dialogRef: MatDialogRef<SessionExpireComponent>,
// 		@Inject(MAT_DIALOG_DATA) public data: any,private commonHttp: CommonHttpService, private common: CommonService,private timeFormat: TimeFormatService,
// 		private dialog: MatDialog,private router: Router,private toastr : ToastrService, private http: HttpClient, private cookieService: CookieService) {

// 		}
// 		interval:any;
// 		ngOnInit(){
// 			this.startInterval();
// 			}

// 		close(){
// 			clearInterval(this.interval);
// 			this.dialogRef.close(false);
// 		}
// 		startInterval(){ this.interval=setInterval(() => {
// 			this.signout();	
// 		  }, 5000)}

// 	signout() {
// 		this.cookieService.deleteAll();
// 		this.cookieService.delete('rememberMe');
// 		this.cookieService.delete('userName');
// 		this.cookieService.delete('password');
// 		let user: any = localStorage.getItem('loggedInUser');
// 		if(user){
// 			user = JSON.parse(user);
// 			let caregiverStatus={
// 				caregiver_id: user.caregiver_id,
// 					currently_active: 0
// 			}
// 			//if(user.user_type === 'Caregiver'){
// 				this.commonHttp.updateCaregiverStatus(caregiverStatus).subscribe(() => {
// 					//  localStorage.clear();
// 					//  this.router.navigate(['/','auth', 'login'])
// 				  })

// 				   //Logout time capture
// 				   const user1 = JSON.parse(localStorage.getItem('loggedInUser'))
// 				   const date = new Date();
// 				   const dbPostData = {
// 					 caregiverId: user1.caregiver_id,
// 					 customerId: user1.customers.customer_id,
// 					 facilityId:user1.facilities[0].facility_id,
// 					 wardId:user1.wards[0].ward_id,
// 					 logoutTime:moment(date).utc().format("YYYY-MM-DD HH:mm:ss"),
// 				   }
// 				   this.http.put(`${environment.apiSpringUrl}/users/storeLogoutDetails/`, dbPostData).subscribe(data => {
// 				 })
// 				 //end 


// 				localStorage.clear();
// 				this.dialogRef.close(false);
// 				this.router.navigate(['/', 'auth', 'login'])


// 		}

// 		// this.auth.signOut().subscribe(data => {
// 		// 	this.router.navigate(['/', 'auth','login']).then(() => {
// 		// 	});
// 		// })
// 		// this.updateAnalytics();

// 	}


//   }