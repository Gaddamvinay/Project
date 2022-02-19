import { Component, OnInit, OnDestroy, Inject, Optional, ViewChild, AfterViewInit, ChangeDetectorRef, Input, Output, EventEmitter } from "@angular/core";
import { MatTableDataSource, MatTable } from "@angular/material/table";
import { Observable, forkJoin, BehaviorSubject, of, concat } from "rxjs";
import { MatPaginator } from "@angular/material/paginator";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ResidentService } from "./resident.service";
import { resident } from "./resident";
import { ModalService } from "../../_modal";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import * as _LODASH from "lodash";
import { DatePipe } from '@angular/common';
import { environment as ENV, environment } from './../../../environments/environment';
import { residentList } from "./resident-data";
import * as moment from "moment";
import { ToastrService } from "ngx-toastr";
import { CommonService } from './../../shared/services/common.service';
import { AttendPromptComponent } from '../../layouts/full/attend-prompt/attend-prompt.component';
export interface ResidentData {
	closeResult: string;
	residents: resident[];
	searchText: any;
	txtId: number;
	txtriskType: string;
	txtTime: string;
	txtUpdate: string;
	txtWatchName: string;
	txtRiskScore: number;
	txtName: string;
	txtAge: number;
	txtWard: string;
	txtRoom: string;
	txtAdmissionDate: string;
	txtResidentStatus: string;
	txtRisk: number;
	txtBalance: string;
	txtStrength: string;
	txtSleep: string;
	txtBattery: number;
	txtfirstname: string;
	txtlastname: string;
}

@Component({
	selector: "app-residents",
	templateUrl: "./residents.component.html",
	styleUrls: ["./residents.component.scss"],
})
export class ResidentComponent implements OnInit, OnDestroy {
	fallResidentList: any[] = [];
	fallResidentLists: any[] = [];
	residentList: any[] = [];
	residentFallList: any[] = [];
	list :any=[];
	king:any=[]
	// wardNameInfo: {} = {};
	beforeFilterList: resident[] = [];
	selectedCategory: string = "All";
	filterForm: FormGroup;

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
	isDataAvailable = false;
	filteredList: any = [];
	cleared = true; stringJson: any;
	isLoading = true;
	/* Display View Types Start */
	displayviewType: number = 1;
	viewType(no) {
		this.displayviewType = no;
	}
	/* Display View Types End */

	/* Data Table View Settings Start */
	dtOptions: DataTables.Settings = {
		responsive: true,
		order: [[0, "asc"]],
		searching: false,
		language: {
			searchPlaceholder: "Search residents",
			search: "<span class='material-icons dt-search'>search</span>",
		},
	};
	/* Data Table View Settings End */

	/* Paginator Start */
	@ViewChild(MatPaginator) paginator: MatPaginator;
	obs: Observable<any>;
	dataSource: MatTableDataSource<ResidentData> = new MatTableDataSource<ResidentData>();
	/* Paginator End */

	showClear() {
		return this.filterForm.value.ward_id.filter(value => value !== '').length > 0;
	}
	constructor(private tokenStorage: TokenStorageServiceService,public common: CommonService,private toastr: ToastrService, private datePipe: DatePipe, private router: Router, private commonHttp: CommonHttpService, private fb: FormBuilder, private timeFormat: TimeFormatService, public dialog: MatDialog, private residentService: ResidentService, private modalService: ModalService, private changeDetectorRef: ChangeDetectorRef, private http: HttpClient,) {
		this.common.eventCatch().subscribe((data) => {
			this.residentFallList = [];
			if(data){
			this.stringJson = JSON.parse(JSON.stringify(data));
			for (var val of this.stringJson) {
				if (val.notificationStatus === 'Not attended') {
					this.residentFallList.push(val.residentId);

				}
			}
		    }
			this.residentFallList = _LODASH.uniqWith(this.residentFallList, _LODASH.isEqual);
			localStorage.setItem('residentFallAlerts', JSON.stringify(this.residentFallList))
			this.residentList = [];
			this.fallResidentLists = [];
			if (this.residentFallList.length == 0) {
				this.isLoading = false;
				this.getResidentDataNew();
			} else {
				this.getResidentData(this.residentFallList);
			}
		})

		// this.getResidentData();
		this.filterForm = this.fb.group({
			wardSearch: [''],
			ward_id: [['']]
		})
		this.getAllWards();
	}
	getAllWards() {
		let user: any = localStorage.getItem('loggedInUser');
		if (user) {
			user = JSON.parse(user);
		}
		this.wardList = user.wards ? user.wards : [];
	}
	getWard(id: string) {
		return this.wardList.find(value => value.ward_id === id).ward_name;
	}
	getFilterWard() {
		return this.wardList.filter(value => value.wardName.toLowerCase().includes(this.filterForm.get('wardSearch').value.toLowerCase()));
	}
	getStatus(data: resident) {
		if (data.status === 'In-Active') {
			return ` (${data.status})`
		} else {
			return '';
		}
	}
	getFallHistoryFrom(date) {
		return `In the last ${moment(date).fromNow(true)}`;
	}
	getLastKnownStatus(data: resident) {
		if (data.ResidentStatus) {
			return `${data.ResidentStatus} (${data.LastLocation})`
		}
	}
	getBatteryStatus(battery: number) {
		const batteryLevel = Math.round(battery / 10) * 10;
		return batteryLevel;
	}
	getBatteryStatusColor(battery: number) {
		const batteryLevel = Math.round(battery / 10) * 10;
		let value: string;
		if (batteryLevel > 50)
			value = 'low';
		else if (_LODASH.inRange(batteryLevel, 15, 50))
			value = 'medium';
		else if (batteryLevel < 15)
			value = 'high';
		return value;
	}
	getNickName(data: resident) {
		if (data.nickName) {
			return data.nickName;
		} else {
			return data.deviceId;
		}
	}
	getResidentName(firstName: string, lastName: string) {
		this.residentService.setResidentName(`${firstName} ${lastName}`);
	}
	getUpdatedStatus(resident: any) {
		return resident.updated_at ? resident.updated_at : resident.created_at;
	}
	clearFilter() {
		this.uniqueData = [];
		this.appliedFilters = [];
		this.filterTypes.filterBalance = "All";
		this.filterTypes.filterStrength = "All";
		this.filterTypes.filterStatus = "All";
		this.filterTypes.filterSleep = "All";
		this.filterTypes.filterResident = "All";
		this.filterTypes.filterBattery = "All";
		this.filterTypes.filterWards = [''],
		this.filterTypes.filterRooms = ['']
		this.cleared = true;
		this.filteredList = this.filterAccordingToExisted();
		this.residentList = this.filteredList;
		this.tableData = this.filterAccordingListView();

	}
	clear(filter: any) {
		if (filter.title == 'Wards' || filter.title == 'Rooms') {
			this.filterTypes[filter.key] = [''];
		} else {
			this.filterTypes[filter.key] = "All";
		}
		this.filteredList = this.filterAccordingToExisted();
		this.residentList = this.filteredList;
		this.tableData = this.filterAccordingListView();
		this.uniqueData = this.uniqueData.filter(value => value.key !== filter.key);
		if (this.uniqueData.length > 0) {
			this.cleared = false;
		} else {
			this.cleared = true;
		}
		
	}
	changeFormat(format: string) {
		this.timeFormat.changeFormat(format);
	}
	getValue(title: string, value: any) {
		switch (title) {
			case 'Registration status':
				switch (value) {
					case 'Active':
						return 'Complete';
					case 'In-Active':
						return 'Incomplete';
				}
			case 'Activity status':
				switch (value) {
					case 'Downton Fall Risk Index':
						return 'Downton Fall Risk Index';
					case 'Stay Independent':
						return 'Stay Independent'

				}
			case 'Balance':
				switch (value) {
					case 'Normal':
						return 'Normal';
					case 'High':
						return 'High'
				}
			case 'Strength':
				switch (value) {
					case 'Safe':
						return 'Safe';
					case 'Unsafe':
						return 'Unsafe'
					case 'Unable':
						return 'Unable'
					case 'Normal':
						return 'Normal'
				}
			case 'Sleep':
				switch (value) {
					case 'Oriented':
						return 'Oriented';
					case 'Confused':
						return 'Confused'
				}
			case 'Medications':
				switch (value) {
					case '0 out of 5':
						return '0 out of 5';
					case '1 out of 5':
						return '1 out of 5'
					case '2 out of 5':
						return '2 out of 5 low'
					case '3 out of 5':
						return '3 out of 5'
					case '4 out of 5':
						return '4 out of 5'
					case '5 out of 5':
						return '5 out of 5'
				}
			case 'Wards': {
				return value.map(value => {
					return this.getWard(value);
				});
			}
			case 'Rooms': {
				return value.map(value => {
					return this.getRoom(value);
				});
			}
		}
	}
	getRoom(id: string) {
		return this.roomList.find(value => value.details.room_id === id)?.details.room_name;
	}
	roomList = [];
	getRoomValues() {
		this.commonHttp.getRoomDetails().subscribe((roomDetails: any) => {
			this.roomList = roomDetails.body ? roomDetails.body.filter(value => this.filterTypes.filterWards.includes(value.details.ward_id)).sort((a, b) => {
				return a.details.room_name > b.details.room_name ? 1 : -1;
			}) : []
		});
	}
	appliedFilters = [];
	
	
	uniqueData = [];

	addFilters() {
		
		this.appliedFilters=[];
		
		const filterDialog = this.dialog.open(FilterComponent, {
			disableClose: false,
			data: {
				payload: this.filterTypes,
				type: 'caregiver'
			},
		});
        
		filterDialog.afterClosed().subscribe((result) => {
			if (result) {

				this.filterTypes = result;
				this.getRoomValues();
				Object.keys(this.filterTypes).forEach((value, i) => {
					if (this.filterTypes[value] !== 'All' && typeof this.filterTypes[value] === 'string') {
						switch (value) {
							case 'filterStatus':
								this.appliedFilters.push({
									title: 'Questionnaire name',
									value: this.filterTypes[value],
									key: value
								})
								break;
							case 'filterBalance':
								this.appliedFilters.push({
									title: 'Risk of Falls',
									value: this.filterTypes[value],
									key: value
								})
								break;
							case 'filterStrength':
								this.appliedFilters.push({
									title: 'Walking ability',
									value: this.filterTypes[value],
									key: value
								})
								break;
							case 'filterSleep':
								this.appliedFilters.push({
									title: 'Cognitive ability',
									value: this.filterTypes[value],
									key: value
								})
								break;
							case 'filterBattery':
								this.appliedFilters.push({
									title: 'Medications',
									value: this.filterTypes[value],
									key: value
								})
								break;
						}
					} else if ((this.filterTypes[value] !== 'All' && typeof this.filterTypes[value] === 'object')) {
						if ((this.filterTypes[value].length === 1 && this.filterTypes[value][0] !== '') || this.filterTypes[value].length > 1) {
							if (value === 'filterWards') {
								this.appliedFilters.push({
									title: 'Wards',
									value: this.filterTypes[value],
									key: value
								})
							} else {
								this.appliedFilters.push({
									title: 'Rooms',
									value: this.filterTypes[value],
									key: value
								})
							}
						}
					}
				})

				
				// let king = Array.from(new Set(this.appliedFilters));
				this.cleared = false;
				this.filteredList = this.filterAccordingToExisted();
				this.residentList = this.filteredList;
				this.tableData = this.filterAccordingListView();
				// this.tableData = this.beforeFilterList.filter(val => {
				// const exists = this.filteredList.find(value => val.user_id === value.User_id);
				// if(exists){
				// return true;
				// }else{
				// return false;
				// }
				// })
			//    this.appliedFilter = this.appliedFilters
				// console.log(this.appliedFilters)
			
			}
            // console.log (this.appliedFilters)
			this.king = this.appliedFilters
			// console.log(this.king)
			this.uniqueData = [];
			this.uniqueData = [...this.king.reduce((map, obj) => map.set(obj.key, obj), new Map()).values()];
             
			// console.log(this.uniqueData)
		});

		
	}

	// console.log(this.appliedFilters)
    //   appliedFilters=[];
	 
    // app(){
	// 	this.appliedFilters = this.appliedFilters.reduce((a,b)=>{
	// 		if(!a.find(data => data.name === b.name)){
	// 			a.push(b);
	// 		}
	// 		return a;
			
	// },[]);

	// }

	roomCountArray: { room_id: string; count: number }[] = [];
	latest6MWTDate: number = 0;
	latest30Date: number = 0;
	latestTUGDate: number = 0;
	widths: string[] = ['17%', '13.5%', '10.5%', '10.5%', '12%', '10.5%', '14%', '12%']
	displayedColumns: string[] = ['Residents_name', 'Questionnaire_name', 'Risk_of_fals', 'walking_ability', 'Cognitive_ability', 'Medication', 'Next_questionnaire_date', 'Interventions_acted_upon'];
	tableData: any[] = []
	/*
	funtion to get all resident details
	*/
	beforeFilter = [];
	loadMoreData() {
		let response: any = localStorage.getItem('residents');
		if (response) {
			response = JSON.parse(response);
			let finalResponse = [];
			let loaData = [];
			let residentInfoValues: any = localStorage.getItem('residentsInfo');
			residentInfoValues = JSON.parse(residentInfoValues);
			response.data.forEach((summary: any, index) => {
				if (index < response.itemCount) {
					let scoreDetails = {};
					let residentInfo: {} = residentInfoValues[index];
					scoreDetails['user_id'] = summary.data.items.user_id;
					scoreDetails['Risk'] = summary.data.items.risk;
					scoreDetails['ResidentStatus'] = summary.data.items.eventType;
					scoreDetails['Battery'] = summary.data.items.battery;
					if (typeof summary.data.items.last_known_updated_at === "string") {
						scoreDetails['LastUpdatedAt'] = parseInt(summary.data.items.last_known_updated_at) * 1000;
					} else {
						scoreDetails['LastUpdatedAt'] = summary.data.items.last_known_updated_at * 1000;
					}
					scoreDetails['LastLocation'] = summary.data.items.last_location;
					scoreDetails['fallCount'] = summary.data.items.fallCount;
					scoreDetails['poly_pharmacy'] = summary.data.items.poly_pharmacy;
					scoreDetails['summary'] = summary;
					finalResponse.push({ ...scoreDetails, ...residentInfo });
				} else if (index < 2 * response.itemCount) {
					let status = 'unknown';
					summary = summary.map((value: any) => {
						return {
							actper: value.actper,
							actvar: value.actvar,
							btry: value.btry,
							dwalk: value.dwalk,
							etmp: moment(new Date(moment.utc(value.etmp * 1000).format('MM-DD-YYYY, HH:mm'))).format('X'),
							impt: value.impt,
							inscr: value.inscr,
							slen: 0,
							stmp: moment(new Date(moment.utc(value.stmp * 1000).format('MM-DD-YYYY, HH:mm'))).format('X'),
							swalk: value.swalk
						}
					})
					if (summary[summary.length - 1]) {
						switch (summary[summary.length - 1].actper) {
							case 0:
								status = 'unknown';
								break;
							case 1:
								status = 'sleep';
								break;
							case 2:
								status = 'sitting';
								break;
							case 3:
								status = 'walk';
								break;
							case 13:
								status = 'active';
								break;
							case 16:
								status = 'doffed';
								break;
							case 255:
								status = 'charging'
								break;

						}
					}
					loaData.push({
						userId: residentInfoValues[index - residentInfoValues.length]['userId'],
						status,
						LastUpdatedAt: summary[summary.length - 1] ? summary[summary.length - 1].etmp * 1000 : null
					})
				}
			});
			finalResponse.forEach(data => {
				const loaStatus = loaData.find(value => value.userId === data.userId);
				if (data.ResidentStatus === null) {
					data.ResidentStatus = loaStatus.status;
					if (loaStatus.LastUpdatedAt !== null) {
						data.updatedAt = loaStatus.LastUpdatedAt
					}
				}
			})
			let orderedList = [];
			orderedList = finalResponse.sort((a: any, b: any) => {
				return a.BSSCount < b.BSSCount ? 1 : -1;
			})
			let intermediate = [];
			let mergedList = [];
			intermediate = orderedList.filter(value => value.nightWalkActive);
			orderedList = [...intermediate, ...orderedList.filter(value => !value.nightWalkActive)];
			intermediate = orderedList.filter(value => value.fallActive);
			mergedList = [...intermediate, ...orderedList.filter(value => !value.fallActive)];
			this.residentList = mergedList;
			this.tableData = mergedList.map(value => {
				var createdDate = moment(value.created_at);
							var nextDate = moment(createdDate).add(1, 'M');
							var currentDate = moment();
				return {
					            Residents_name: `${value.GeneralInformation.first_name} ${value.GeneralInformation.last_name}`,
								Risk_of_fals: this.calculateQueScore(value.questionnaire_score) + ' (' + value.questionnaire_score + ')',//value.questionnaire_fall_count > 0 ? 'High' : 'Normal',
								Last_known_status: value.status.fall_status === 'true' ? 'Fall' : (value.status.nightwalk_status === 'true' ? 'Night walk' : value.status.last_status || 'Unknown'),
								//Questionnaire_fall: parseInt(this.getFallenData(value.questionnaire.questions)) > 0 ? 'Yes' : 'No',
								fallRisk: this.calculateQueScore(value.questionnaire_score),
								Wearable_fall: value.scores.total_falls ? parseInt(value.scores.total_falls) : 0,
								Balance: value.scores.balance || 'unknown',
								Strength: value.scores.strength || 'unknown',
								Sleep: value.scores.sleep || 'unknown',
								BSSCount: parseInt(value.scores.bss_count),
								Wearables_name: value.WearableInformation.wearable_id,
								created_at: moment(value.meta.fall_update).add(this.timeZone, 'minutes').fromNow(),
								updated_at: moment(value.meta.updated_at).add(this.timeZone, 'minutes').fromNow(),
								ward_id: value.WardInformation.ward_id,
								Ward_name: value.WardInformation.ward_name || '',
								Room_number: value.WardInformation.room_name || '',
								room_id: value.WardInformation.room_id || '',
								Interventions_acted_upon: value.intervention + ' out of ' + value.intervention_totalcount,
								Next_questionnaire_date: nextDate.diff(currentDate, 'days') > 0 ? 'in ' + nextDate.diff(currentDate, 'days') + ' days' : nextDate.diff(currentDate, 'days') + ' overdue',
								//Risk_of_fals:this.getRetakeValue(parseInt(value.questionnaire.questionnaire_score)),
								Cognitive_ability: this.getCognitiveAbility({ Questionnaire_type: value.questionnaire.questionnaire_type, questions: value.questionnaire.questions }),
								Medication: this.getMedication({ Questionnaire_type: value.questionnaire.questionnaire_type, questions: value.questionnaire.questions }),
								walking_ability: this.getWalkAbility({ Questionnaire_type: value.questionnaire.questionnaire_type, questions: value.questionnaire.questions }),
								Questionnaire_name: value.questionnaire.questionnaire_type,
								Battery_status: parseInt(value.WearableInformation.battery_status),
								User_id: value.meta.resident_id
				}
			})
			this.beforeFilter = this.tableData;
			this.beforeFilterList = mergedList;
			this.isDataAvailable = true;
			this.roomCountArray = [];
			this.residentList.forEach(resident => {
				const existed = this.roomCountArray.find(room => room.room_id === resident.roomId);
				if (!existed) {
					this.roomCountArray.push({
						room_id: resident.roomId,
						count: 1
					})
				} else {
					existed.count++;
				}
			})
		}
	}
	navigate(value: any) {
		this.router.navigate(['ca', 'residents', 'residentview', value.selected.User_id])
	}
	
	/* calculate score */
	getCognitiveAbility(questionnaire: any) {
		if (questionnaire && questionnaire?.questions) {
			const walkingAbility = questionnaire?.questions.find(question => question.questionID === 10304);
			if (walkingAbility) {
				const answer = questionnaire?.questions.find(question => question.questionID === 10304).answers.find(answer => answer.answerID === walkingAbility.answerValue);
				return answer.answer.split(' ')[0];
			} else {
				return 'Safe'
			}
		} else {
			return '--'
		}
	}
	calculateScore(scoreValue: Number) {
		let value = '';
		if (_LODASH.inRange(scoreValue, 0, 3) || scoreValue > 100)
			value = 'low';
		else if (_LODASH.inRange(scoreValue, 2, 5))
			value = 'medium';
		else
			value = 'high';
		return value;
	}
	calculateQueScore(scoreValue: Number) {
		let value = '';
		if (_LODASH.inRange(scoreValue, 0, 3) || scoreValue > 100)
			value = 'Normal';
		// else if( _LODASH.inRange(scoreValue,2,5))
		// value = 'Normal';
		else
			value = 'High';
		return value;
	}

	/* calculate the question risk */
	calculateQues(scoreValue: Number) {
		let value = '';
		if (_LODASH.inRange(scoreValue, 0, 3))
			value = 'low';
		else if (_LODASH.inRange(scoreValue, 2, 5))
			value = 'medium';
		else
			value = 'high';
		return value;
	}
	getWalkAbility(questionnaire: any) {
		if (questionnaire && questionnaire?.questions) {
			const questionaryType = questionnaire?.Questionnaire_type;
			if (questionaryType === 'Stay Independent') {
				const walkingAbility = questionnaire?.questions.find(question => question.questionID === 10116);
				if (walkingAbility) {
					const answer = questionnaire?.questions.find(question => question.questionID === 10116).answers.find(answer => answer.answerID === walkingAbility.answerValue);
					return answer.answer.split(' ')[0];
				} else {
					return 'Safe'
				}
			} else {
				const walkingAbility = questionnaire?.questions.find(question => question.questionID === 10305);
				if (walkingAbility) {
					if(walkingAbility.answerValue){
					const answer = questionnaire?.questions.find(question => question.questionID === 10305).answers.find(answer => answer.answerID === walkingAbility.answerValue);
					
					return answer.answer.split(' ')[0];
					}
					else{
						return 'Safe'
					}
				} else {
					return 'Safe'
				}
			}
		} else {
			return '--'
		}
	}
	/* Add Resident */
	openDialog(action, obj, index?: number) {
		if (!isUndefined(index)) {
			const jwModel = `custfom-modal-${index}`;
			this.closeModal(jwModel);
		}
		const dialogRef = this.dialog.open(DialogContent, {
			disableClose: true,
			data: {
				payload: obj,
				action,
				roomCount: this.roomCountArray
			},
		});

		dialogRef.afterClosed().subscribe((result) => {
			if (result) {
				setTimeout(() => {
					this.getResidentDataNew();
					  }, 1000)
				
				// this.addContact(result.data);
			}
		});
	}

	addContact(row_obj) {
		this.residentList.push({
			Id: row_obj.txtId,
			riskType: row_obj.txtriskType,
			Time: row_obj.txtTime,
			Update: row_obj.txtUpdate,
			WatchName: row_obj.txtWatchName,
			RiskScore: row_obj.txtRiskScore,
			myAlias: row_obj.txtName,
			Age: row_obj.txtAge,
			Ward: row_obj.txtWard,
			Room: row_obj.txtRoom,
			AdmissionDate: row_obj.txtAdmissionDate,
			ResidentStatus: row_obj.txtResidentStatus,
			Risk: row_obj.txtRisk,
			Balance: row_obj.txtBalance,
			Strength: row_obj.txtStrength,
			Sleep: row_obj.txtSleep,
			Battery: row_obj.txtBattery,
			firstName: row_obj.txtfirstname,
			lastName: row_obj.txtlastname,
		});
	}
	/* Add Resident End */

	filtered = false;
	ngOnInit() {
		const residentfallalerts = JSON.parse(localStorage.getItem('residentFallAlerts'))
		this.residentFallList = [];
		this.residentList = [];
		this.fallResidentLists = [];
		if (residentfallalerts) {
			this.getResidentData(residentfallalerts);
		}
		else {
			this.getResidentDataNew()
		}
		/* Paginator Strat */
		this.changeDetectorRef.detectChanges();
		this.dataSource.paginator = this.paginator;
		this.obs = this.dataSource.connect();
		/* Paginator End */
	}




	clearFilters() {
		this.filtered = false;
		this.tableData = this.beforeFilter;
		this.filterForm.patchValue({
			wardSearch: '',
			ward_id: ['']
		})
	}

	get wardIds() {
		if (this.filterForm.get('ward_id').value.length > 1) {
			return this.filterForm.get('ward_id').value.filter(value => value !== '');
		}
		return this.filterForm.get('ward_id').value;
	}
	wardList: any[] = [];
	ngOnDestroy() {
		/* Paginator Strat */
		if (this.dataSource) {
			this.dataSource.disconnect();
		}
		/* Paginator End */
	}
	//timeZone = moment.parseZone().utcOffset();
	timeZone = moment.parseZone("2013 01 01 +03:30", 'YYYY MM DD ZZ', 'fr', true).utcOffset();
	hasAlerts = false;
	attendAlert(alert: any, resident: any) {
		const user = JSON.parse(localStorage.getItem('loggedInUser'));

		const date = new Date();
		const body = {
			resident_id: resident.user_id,
			resident_name: resident.firstName + " " + resident.lastName,
			contents: [
				{
					date: date,
					action: `${resident.firstName} ${resident.lastName}'s ${alert.alert_type} has been attended by ${user.first_name} ${user.last_name}`
				}
			]
		}
		var date1 = new Date();
		this.commonHttp.updateAlertAttendDetails({
			"alert_id": alert.alert_id,
			"attend_status": "Y",
			"attend_by": `${user.first_name} ${user.last_name}`,
			"attend_at": this.datePipe.transform(date1, 'YYYY-MM-DD HH:mm:ss', 'CET'),// moment(date).format("YYYY-MM-DD HH:mm:ss"),
			"attend_body": body
		}).subscribe(data => {
			this.getResidentDataNew()
		})
	}
	logAlert(alert: any, resident: any) {
		const dialogRef = this.dialog.open(AttendPromptComponent, {
			maxWidth: '450px',
			maxHeight: '600px',
			data: {
				type: alert.alert_type,
				dialogType: 'log'
			}
		})
		dialogRef.afterClosed().subscribe(data => {
			if (data) {
				const user = JSON.parse(localStorage.getItem('loggedInUser'));
				let description = Object.assign({ ...data }, { createdBy: `${user.first_name} ${user.last_name}` });
				const date = new Date();
				const body: any = {
					resident_id: resident.user_id,
					resident_name: resident.firstName + " " + resident.lastName,
					contents: [
						{
							date: date,
							action: `${resident.firstName} ${resident.lastName}'s ${alert.alert_type} has been logged by ${user.first_name} ${user.last_name}`
						},
						{
							date: date,
							action: `It is a ${description.real === 'no' ? 'false' : 'Real'} alert`
						}
					]
				}
				if (description.real !== 'no') {
					body.contents.push({ action: 'Observations' })
					body.contents.push({ action: `On scale of 1-5, The criticality is given as ${description.rate}` })
					body.contents.push({ action: `Other observations, ${description.observations}` })
				}
				this.commonHttp.updateAlertLogDetails({
					"alert_id": alert.alert_id,
					"log_status": "Y",
					"log_by": `${user.first_name} ${user.last_name}`,
					"log_at": moment(date).utc().format("YYYY-MM-DD HH:mm:ss"),
					"log_body": body
				}).subscribe(data => {
					this.getResidentDataNew()
				})
			}
		})
	}
	walkCheck(type) {
		const types = ['Nightwalk', '6minwalk', '3minwalk', 'nightwalkalert'];
		return types.includes(type);
	}

	getResidentDataNew() {
		this.isDataAvailable = false;
		this.isLoading = true;
		const caregiver = JSON.parse(localStorage.getItem('loggedInUser'))
		// this.commonHttp.getAllResidentDetails().subscribe((data: any) => {
			this.commonHttp.getNursingResiData(caregiver.caregiver_id).subscribe((data: any) => {
			//this.commonHttp.getAllAlertsDetails().subscribe((alerts: any) => {
			this.commonHttp.getAlertsDetails(caregiver.caregiver_id).subscribe((alerts: any) => {
				const alertsData = alerts.body ? alerts.body.filter(val => val.alert.log_status === 'N') : [];
				let user: any = localStorage.getItem('loggedInUser');
				if (user) {
					user = JSON.parse(user);
					const wards = user.wards.map(value => {
						return value.ward_id;
					});
					if (data.itemCount > 0) {
						const values = data.body.filter(value => wards.includes(value.WardInformation.ward_id));
						const uniques = values.map(item => item.meta.resident_id).filter((value, index, self) => self.indexOf(value) === index)

						const hasAlertValues = [];
						this.residentList = values.map(value => {
							const alert = alertsData.find(val => val.details.resident_id === value.meta.resident_id);
							if (!alert) {
								return {
									Balance: value.scores.balance || 'unknown',
									Strength: value.scores.strength || 'unknown',
									Sleep: value.scores.sleep || 'unknown',
									residentId: value.meta.resident_id,
									Battery: parseInt(value.WearableInformation.battery_status),
									BSSCount: parseInt(value.scores.bss_count),
									firstName: value.GeneralInformation.first_name,
									lastName: value.GeneralInformation.last_name,
									ResidentStatus: value.status.fall_status === 'true' ? 'Fall' : (value.status.nightwalk_status === 'true' ? 'Night walk' : value.status.last_status || 'Unknown'),
									created_at: moment(value.meta.created_at).add(this.timeZone, 'minutes').fromNow(),
									updated_at: moment(value.meta.updated_at).add(this.timeZone, 'minutes').fromNow(),
									Last_known_status: value.status.fall_status === 'true' ? 'Fall' : (value.status.nightwalk_status === 'true' ? 'Night walk' : value.status.last_status || 'Unknown'),
									status: value.GeneralInformation.status || 'active',
									room_id: value.WardInformation.room_id || '',
									room_name: value.WardInformation.room_name,
									ward_name: value.WardInformation.ward_name,
									ward_id: value.WardInformation.ward_id,
									user_id: value.meta.resident_id,
									hasAlert: false,
									height: '65px'
								}
							} else {
								hasAlertValues.push(true);
								let obj = {
									Balance: value.scores.balance || 'unknown',
									Strength: value.scores.strength || 'unknown',
									Sleep: value.scores.sleep || 'unknown',
									Battery: parseInt(value.WearableInformation.battery_status),
									BSSCount: parseInt(value.scores.bss_count),
									firstName: value.GeneralInformation.first_name,
									lastName: value.GeneralInformation.last_name,
									ResidentStatus: value.status.fall_status === 'true' ? 'Fall' : (value.status.nightwalk_status === 'true' ? 'Night walk' : value.status.last_status || 'Unknown'),
									created_at: moment(value.meta.created_at).add(this.timeZone, 'minutes').fromNow(),
									updated_at: moment(value.meta.updated_at).add(this.timeZone, 'minutes').fromNow(),
									Last_known_status: value.status.fall_status === 'true' ? 'Fall' : (value.status.nightwalk_status === 'true' ? 'Night walk' : value.status.last_status || 'Unknown'),
									status: value.GeneralInformation.status || 'active',
									room_id: value.WardInformation.room_id || '',
									room_name: value.WardInformation.room_name,
									ward_name: value.WardInformation.ward_name,
									ward_id: value.WardInformation.ward_id,
									user_id: value.meta.resident_id,
									hasAlert: true,
									logAccess: alert.alert.attend_by === `${user.first_name} ${user.last_name}`,
									height: '65px',
									alert: alert.alert,
									alertDetails: alert.details,
									alertCreated: moment(alert.meta.created_at).add(this.timeZone, 'minutes').fromNow(),
								};
								return obj
							}
						})
						this.hasAlerts = hasAlertValues.some(val => val);
						this.tableData = values.map(value => {
							var createdDate = moment(value.created_at);
							var nextDate = moment(createdDate).add(1, 'M');
							var currentDate = moment();
							return {
								Residents_name: `${value.GeneralInformation.first_name} ${value.GeneralInformation.last_name}`,
								Risk_of_fals: this.calculateQueScore(value.questionnaire_score) + ' (' + value.questionnaire_score + ')',//value.questionnaire_fall_count > 0 ? 'High' : 'Normal',
								Last_known_status: value.status.fall_status === 'true' ? 'Fall' : (value.status.nightwalk_status === 'true' ? 'Night walk' : value.status.last_status || 'Unknown'),
								//Questionnaire_fall: parseInt(this.getFallenData(value.questionnaire.questions)) > 0 ? 'Yes' : 'No',
								fallRisk: this.calculateQueScore(value.questionnaire_score),
								Wearable_fall: value.scores.total_falls ? parseInt(value.scores.total_falls) : 0,
								Balance: value.scores.balance || 'unknown',
								Strength: value.scores.strength || 'unknown',
								Sleep: value.scores.sleep || 'unknown',
								BSSCount: parseInt(value.scores.bss_count),
								Wearables_name: value.WearableInformation.wearable_id,
								created_at: moment(value.meta.fall_update).add(this.timeZone, 'minutes').fromNow(),
								updated_at: moment(value.meta.updated_at).add(this.timeZone, 'minutes').fromNow(),
								ward_id: value.WardInformation.ward_id,
								Ward_name: value.WardInformation.ward_name || '',
								Room_number: value.WardInformation.room_name || '',
								room_id: value.WardInformation.room_id || '',
								Interventions_acted_upon: value.intervention + ' out of ' + value.intervention_totalcount,
								Next_questionnaire_date: nextDate.diff(currentDate, 'days') > 0 ? 'in ' + nextDate.diff(currentDate, 'days') + ' days' : nextDate.diff(currentDate, 'days') + ' overdue',
								//Risk_of_fals:this.getRetakeValue(parseInt(value.questionnaire.questionnaire_score)),
								Cognitive_ability: this.getCognitiveAbility({ Questionnaire_type: value.questionnaire.questionnaire_type, questions: value.questionnaire.questions }),
								Medication: this.getMedication({ Questionnaire_type: value.questionnaire.questionnaire_type, questions: value.questionnaire.questions }),
								walking_ability: this.getWalkAbility({ Questionnaire_type: value.questionnaire.questionnaire_type, questions: value.questionnaire.questions }),
								Questionnaire_name: value.questionnaire.questionnaire_type,
								Battery_status: parseInt(value.WearableInformation.battery_status),
								User_id: value.meta.resident_id
							}
						})
						// this.tableData = this.tableData.sort((a: any, b: any) => {
						// return a.BSSCount < b.BSSCount ? 1: -1;
						// })
						// this.residentList = this.residentList.sort((a: any, b: any) => {
						// return a.BSSCount < b.BSSCount ? 1: -1;
						// })
						let other = [];
						let fall = []
						let Night = [];
						this.tableData.forEach(val => {
							if (val.Last_known_status === 'Fall') {
								fall.push(val);
							} else if (val.Last_known_status === 'Night walk') {
								Night.push(val)
							} else {
								other.push(val)
							}
						})
						this.tableData = [...fall, ...Night, ...other];
						other = [];
						fall = [];
						Night = [];
						this.residentList.forEach(val => {
							if (val.Last_known_status === 'Fall') {
								fall.push(val);
							} else if (val.Last_known_status === 'Night walk') {
								Night.push(val)
							} else {
								other.push(val)
							}
						})
						this.residentList = [...fall, ...Night, ...other];
						this.beforeFilter = [...this.residentList];
						this.beforeFilterList = [...this.tableData];
						this.roomCountArray = [];
						this.tableData.forEach(resident => {
							const existed = this.roomCountArray.find(room => room.room_id === resident.room_id);
							if (!existed) {
								this.roomCountArray.push({
									room_id: resident.room_id,
									count: 1
								})
							} else {
								existed.count++;
							}
						})
					}
				}
				this.residentList = _LODASH.uniqWith(this.residentList, _LODASH.isEqual);

				this.tableData = _LODASH.uniqBy(this.tableData, function (e) {
					return e.User_id;
				});
				this.isLoading = false;
				this.isDataAvailable = true;
			})
		})

	}

	getResidentData(residentId: any) {
		this.isDataAvailable = false;
		const caregiver = JSON.parse(localStorage.getItem('loggedInUser'))
		// this.commonHttp.getAllResidentDetails().subscribe((data: any) => {
		this.commonHttp.getNursingResiData(caregiver.caregiver_id).subscribe((data: any) => {
			//this.commonHttp.getAllAlertsDetails().subscribe((alerts: any) => {
			this.commonHttp.getAlertsDetails(caregiver.caregiver_id).subscribe((alerts: any) => {
				const alertsData = alerts.body ? alerts.body.filter(val => val.alert.log_status === 'N') : [];
				let user: any = localStorage.getItem('loggedInUser');
				if (user) {
					user = JSON.parse(user);
					const wards = user.wards.map(value => {
						return value.ward_id;
					});
					if (data.itemCount > 0) {
						const values = data.body.filter(value => wards.includes(value.WardInformation.ward_id));
						const uniques = values.map(item => item.meta.resident_id).filter((value, index, self) => self.indexOf(value) === index)

						const hasAlertValues = [];
						this.residentList = values.map(value => {
							const alert = alertsData.find(val => val.details.resident_id === value.meta.resident_id);
							if (!alert) {
								return {
									Balance: value.scores.balance || 'unknown',
									Strength: value.scores.strength || 'unknown',
									Sleep: value.scores.sleep || 'unknown',
									residentId: value.meta.resident_id,
									Battery: parseInt(value.WearableInformation.battery_status),
									BSSCount: parseInt(value.scores.bss_count),
									firstName: value.GeneralInformation.first_name,
									lastName: value.GeneralInformation.last_name,
									ResidentStatus: value.status.fall_status === 'true' ? 'Fall' : (value.status.nightwalk_status === 'true' ? 'Night walk' : value.status.last_status || 'Unknown'),
									created_at: moment(value.meta.created_at).add(this.timeZone, 'minutes').fromNow(),
									updated_at: moment(value.meta.updated_at).add(this.timeZone, 'minutes').fromNow(),
									Last_known_status: value.status.fall_status === 'true' ? 'Fall' : (value.status.nightwalk_status === 'true' ? 'Night walk' : value.status.last_status || 'Unknown'),
									status: value.GeneralInformation.status || 'active',
									room_id: value.WardInformation.room_id || '',
									room_name: value.WardInformation.room_name,
									ward_name: value.WardInformation.ward_name,
									ward_id: value.WardInformation.ward_id,
									user_id: value.meta.resident_id,
									hasAlert: false,
									height: '65px'
								}
							} else {
								hasAlertValues.push(true);
								let obj = {
									Balance: value.scores.balance || 'unknown',
									Strength: value.scores.strength || 'unknown',
									Sleep: value.scores.sleep || 'unknown',
									Battery: parseInt(value.WearableInformation.battery_status),
									BSSCount: parseInt(value.scores.bss_count),
									firstName: value.GeneralInformation.first_name,
									lastName: value.GeneralInformation.last_name,
									ResidentStatus: value.status.fall_status === 'true' ? 'Fall' : (value.status.nightwalk_status === 'true' ? 'Night walk' : value.status.last_status || 'Unknown'),
									created_at: moment(value.meta.created_at).add(this.timeZone, 'minutes').fromNow(),
									updated_at: moment(value.meta.updated_at).add(this.timeZone, 'minutes').fromNow(),
									Last_known_status: value.status.fall_status === 'true' ? 'Fall' : (value.status.nightwalk_status === 'true' ? 'Night walk' : value.status.last_status || 'Unknown'),
									status: value.GeneralInformation.status || 'active',
									room_id: value.WardInformation.room_id || '',
									room_name: value.WardInformation.room_name,
									ward_name: value.WardInformation.ward_name,
									ward_id: value.WardInformation.ward_id,
									user_id: value.meta.resident_id,
									hasAlert: true,
									logAccess: alert.alert.attend_by === `${user.first_name} ${user.last_name}`,
									height: '65px',
									alert: alert.alert,
									alertDetails: alert.details,
									alertCreated: moment(alert.meta.created_at).add(this.timeZone, 'minutes').fromNow(),
								};
								return obj
							}
						})
						this.hasAlerts = hasAlertValues.some(val => val);
						this.tableData = values.map(value => {
							var createdDate = moment(value.created_at);
							var nextDate = moment(createdDate).add(1, 'M');
							var currentDate = moment();
							return {
								Residents_name: `${value.GeneralInformation.first_name} ${value.GeneralInformation.last_name}`,
								Risk_of_fals: this.calculateQueScore(value.questionnaire_score) + ' (' + value.questionnaire_score + ')',//value.questionnaire_fall_count > 0 ? 'High' : 'Normal',
								Last_known_status: value.status.fall_status === 'true' ? 'Fall' : (value.status.nightwalk_status === 'true' ? 'Night walk' : value.status.last_status || 'Unknown'),
								//Questionnaire_fall: parseInt(this.getFallenData(value.questionnaire.questions)) > 0 ? 'Yes' : 'No',
								fallRisk: this.calculateQueScore(value.questionnaire_score),
								Wearable_fall: value.scores.total_falls ? parseInt(value.scores.total_falls) : 0,
								Balance: value.scores.balance || 'unknown',
								Strength: value.scores.strength || 'unknown',
								Sleep: value.scores.sleep || 'unknown',
								BSSCount: parseInt(value.scores.bss_count),
								Wearables_name: value.WearableInformation.wearable_id,
								created_at: moment(value.meta.fall_update).add(this.timeZone, 'minutes').fromNow(),
								updated_at: moment(value.meta.updated_at).add(this.timeZone, 'minutes').fromNow(),
								ward_id: value.WardInformation.ward_id,
								Ward_name: value.WardInformation.ward_name || '',
								Room_number: value.WardInformation.room_name || '',
								room_id: value.WardInformation.room_id || '',
								Interventions_acted_upon: value.intervention + ' out of ' + value.intervention_totalcount,
								Next_questionnaire_date: nextDate.diff(currentDate, 'days') > 0 ? 'in ' + nextDate.diff(currentDate, 'days') + ' days' : nextDate.diff(currentDate, 'days') + ' overdue',
								//Risk_of_fals:this.getRetakeValue(parseInt(value.questionnaire.questionnaire_score)),
								Cognitive_ability: this.getCognitiveAbility({ Questionnaire_type: value.questionnaire.questionnaire_type, questions: value.questionnaire.questions }),
								Medication: this.getMedication({ Questionnaire_type: value.questionnaire.questionnaire_type, questions: value.questionnaire.questions }),
								walking_ability: this.getWalkAbility({ Questionnaire_type: value.questionnaire.questionnaire_type, questions: value.questionnaire.questions }),
								Questionnaire_name: value.questionnaire.questionnaire_type,
								Battery_status: parseInt(value.WearableInformation.battery_status),
								User_id: value.meta.resident_id
							}
						})
						this.tableData = this.tableData.sort((a: any, b: any) => {
							return a.BSSCount < b.BSSCount ? 1 : -1;
						})
						this.residentList = this.residentList.sort((a: any, b: any) => {
							return a.BSSCount < b.BSSCount ? 1 : -1;
						})
						let other = [];
						let fall = []
						let Night = [];
						this.tableData.forEach(val => {
							if (val.Last_known_status === 'Fall') {
								fall.push(val);
							} else if (val.Last_known_status === 'Night walk') {
								Night.push(val)
							} else {
								other.push(val)
							}
						})
						this.tableData = [...fall, ...Night, ...other];
						other = [];
						fall = [];
						Night = [];
						this.residentList.forEach(val => {
							if (val.Last_known_status === 'Fall') {
								fall.push(val);
							} else if (val.Last_known_status === 'Night walk') {
								Night.push(val)
							} else {
								other.push(val)
							}
						})
						this.residentList = [...fall, ...Night, ...other];
						this.beforeFilter = [...this.residentList];
						this.beforeFilterList = [...this.tableData];
						this.roomCountArray = [];
						this.tableData.forEach(resident => {
							const existed = this.roomCountArray.find(room => room.room_id === resident.room_id);
							if (!existed) {
								this.roomCountArray.push({
									room_id: resident.room_id,
									count: 1
								})
							} else {
								existed.count++;
							}
						})
					}
				}

				this.residentList = _LODASH.uniqWith(this.residentList, _LODASH.isEqual);
				this.tableData = _LODASH.uniqWith(this.tableData, _LODASH.isEqual);
				let jsonObject = JSON.parse(JSON.stringify(residentId));
				for (var val of jsonObject) {
					let index = this.residentList.findIndex(x => x.user_id === val);

					if (index > 0) {
						const deleted = this.residentList.splice(index, 1);
						this.fallResidentLists.push(deleted[0]);
					}
				}

				this.fallResidentLists = _LODASH.uniqWith(this.fallResidentLists, _LODASH.isEqual);
				const residentfallalerts = JSON.parse(localStorage.getItem('residentFallAlerts'))

				if (residentfallalerts) {

					this.fallResidentLists.reverse()
					//this.fallResidentLists;
				}
				else {
					this.fallResidentLists.reverse();
				}
				this.residentList = _LODASH.uniqWith(this.residentList, _LODASH.isEqual);


				this.isDataAvailable = true;

			})
		})
	}
	getMedication(questionnaire: any) {
		if(questionnaire && questionnaire?.questions){
		let medication=0;
				const medicationGiven = questionnaire?.questions.find(question => question.questionID === 10302);
						
				if(medicationGiven){
					if(medicationGiven.answerValue)
					{
						medication=medicationGiven.answerValue.length;
					}
					if(medicationGiven.answerValue[0]===null){
						medication=0;
					}
					if(medicationGiven.answerValue=='1030207'){

						medication=0;
					 }
					 if(medicationGiven.answerValue[0]!=null){
			
						if(medicationGiven.answerValue.includes('1030206')){
							medication=medicationGiven.answerValue.length-1;
						}
					}
					return medication+' out of 5'
				}else{
					return medication+' out of 5'
				}
		}else{
			return '--'
		}
	}
	// getMedication(questionnaire: any) {
	// 	if (questionnaire && questionnaire?.questions) {
	// 		let medication = 0;
	// 		const walkingAbility = questionnaire?.questions.find(question => question.questionID === 10302);
	// 		if (walkingAbility) {
	// 			if (walkingAbility.answerValue) {
	// 				medication = walkingAbility.answerValue.length;
	// 			}

	// 			return medication + ' out of 5'
	// 		} else {
	// 			return medication + ' out of 5'
	// 		}
	// 	} else {
	// 		return '--'
	// 	}
	// }
	getFallenData(questions: any[]) {
		return questions.find(val => val.question === 'How many times you have fallen?').answerValue
	}
	/* Profile Modal from Quick View Start*/
	openModal(id: string) {
		this.modalService.open(id);
	}
	closeModal(id: string) {
		this.modalService.close(id);
	}
	/* Profile Modal from Quick View End*/

	/* Apply Filters for Card View Start */
	applyFilter(event: Event) {
		const filterValue = (event.target as HTMLInputElement).value;
		if (filterValue)
			this.residentList = this.filter(filterValue);
		else
			this.residentList = this.beforeFilterList;
	}
	filter(v: string) {
		return this.beforeFilterList.filter((x) => x.myAlias.toLowerCase().indexOf(v.toLowerCase()) !== -1);
	}
	// getAge(dob: string) {
	// 	if (dob !== null) {
	// 		const dB = dob.split("_").join("-");
	// 		const divDate = dB.split("-");
	// 		const date = new Date(`${divDate[1]}-${divDate[0]}-${divDate[2]}`);
	// 		const age = moment(date).fromNow(true);
	// 		if (age && age.includes('years')) {
	// 			return age;
	// 		}
	// 	}
	// }
	getAge(dob: string){
		dob=moment(dob).format('DD-MM-YYYY')
		let age='';
		if(dob!=null)
		{
		let dateofbirth=dob.split('-')
		let currentDate=new Date();
		let curren=moment(currentDate).format('YYYY-MM-DD')
		let currentdate=curren.split('-');
		var curyear:number=+currentdate[0];
		var curmonth:number=+currentdate[1];
		var cursDay:number=+currentdate[2];
		var dateofYear:number=+dateofbirth[2];
		var dateofMonth:number=+dateofbirth[1];
		var dateofDay:number=+dateofbirth[0];
		if(dateofMonth===12){
          age=this.findAge(currentdate[2],currentdate[1],currentdate[0],dateofbirth[0],dateofbirth[1],dateofbirth[2])
  
     }else{
     var current = moment([curyear, curmonth, cursDay]);
    var dateOfBirth = moment([dateofYear, dateofMonth, dateofDay]);
    var years = current.diff(dateOfBirth, 'year');
    dateOfBirth.add(years, 'years');

    var months = current.diff(dateOfBirth, 'months');
    dateOfBirth.add(months, 'months');

    var days = current.diff(dateOfBirth, 'days');

    age=years + ' Years ' + months + ' Months ' + days + ' Days';
     }
	}
	return age;
	}
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
	getQuestionData(resident) {
		if (!Array.isArray(resident.summary.data.items.questionnaire_info)) {
			const risk = this.calculateQues(resident.summary.data.items.questionnaire_info.risk);
			return `Indicates ${risk} as per ${resident.summary.data.items.questionnaire_info.type} taken on ${moment(resident.summary.data.items.questionnaire_info.created_at).format('DD-MM-YYYY')} taken by ${resident.summary.data.items.questionnaire_info.takenBy}`;
		}
	}
	getRetakeValue(risk: any) {
		const riskLabel = this.calculateQues(risk);
		return riskLabel === 'Normal' ? 'No' : 'Yes';
	}
	getRisk(resident) {
		if (resident.summary.data.items.questionnaire_info.risk) {
			const risk = this.calculateQues(resident.summary.data.items.questionnaire_info.risk);
			return risk;
		} else {
			return 'none';
		}
	}
	getFormat() {
		const format = this.timeFormat.getFormat();
		return format;
	}
	today = new Date();
	getFallHistory(resident) {
		let fallForUser = [];
		let totalCount = 0;
		const prevFall = !Array.isArray(resident.summary.data.items.questionnaire_info) ? resident.summary.data.items.questionnaire_info.questions.find(question => question.questionID === '10102') : undefined;
		if (localStorage.getItem('fallForUser') !== 'null') {
			fallForUser = JSON.parse(localStorage.getItem('fallForUser'));
			if (fallForUser !== null) {
				const existed = fallForUser.find(user => user.userId === resident.user_id);
				if (existed && resident.fallCount !== undefined && prevFall !== undefined && prevFall.qnswerValue !== undefined) {
					totalCount = totalCount + existed.count + resident.fallCount + parseInt(prevFall.answerValue);
				} else if (resident.fallCount !== undefined && existed === undefined && prevFall !== undefined && prevFall.answerValue !== undefined) {
					totalCount = totalCount + resident.fallCount + parseInt(prevFall.answerValue);
				}
			}
		}
		return totalCount;
	}
	getMedicalData(resident: any) {
		let checkValue: string[] = [];
		if (resident.summary.data.items.PreExistingConditions === null) {
			return ""
		}
		resident.summary.data.items.PreExistingConditions.questions.forEach(data => {
			if (data['answerValue']) {
				checkValue.push(data.question);
			}
		})
		checkValue = checkValue.filter(value => this.questionValues.includes(value));
		checkValue.forEach(data => {
			if (data === 'Sleeping pills' || data === 'Anti depressants') {
				data = 'Sleeping Problems'
			}
		})
		const unique = []
		checkValue.forEach(data => {
			const existed = unique.find(value => value === data);
			if (!existed) {
				unique.push(data);
			}
		})
		return unique.toString();
	}

	/* Filtering function for the residents*/
	filterAccordingToExisted() {
		let filteredList: any;
		const filterValueList = Object.values(this.filterTypes).map(filter => {
			if (filter !== null && typeof filter === 'string') {
				return filter;
			}
		})
		filterValueList.forEach((filter, i) => {
			if (filter !== undefined) {
				switch (i) {
					case 1:
						if (filteredList) {
							if (filter !== 'All') {
								filteredList = filteredList.filter((resident: any) => {
									if (resident.ResidentStatus)
										return resident.ResidentStatus.toLowerCase() == filter.toLowerCase();
								});
							} else filteredList = filteredList;
						} else {
							if (filter !== 'All') {
								filteredList = this.beforeFilter.filter((resident: any) => {
									if (resident.ResidentStatus)
										return resident.ResidentStatus.toLowerCase() == filter.toLowerCase();
								});
							} else filteredList = this.beforeFilter;
						}
						break;
					case 2:
						if (filteredList) {
							if (filter !== 'All') {
								filteredList = filteredList.filter((resident: any) => resident.Balance.toLowerCase() == filter.toLowerCase());
							} else filteredList = filteredList;
						} else {
							if (filter !== 'All') {
								filteredList = this.beforeFilter.filter((resident: any) => resident.Balance.toLowerCase() == filter.toLowerCase());
							} else filteredList = this.beforeFilter;
						}
						break;
					case 3:
						if (filteredList) {
							if (filter !== 'All') {
								filteredList = filteredList.filter((resident: any) => resident.Strength.toLowerCase() == filter.toLowerCase());
							} else filteredList = filteredList;
						} else {
							if (filter !== 'All') {
								filteredList = this.beforeFilter.filter((resident: any) => resident.Strength.toLowerCase() == filter.toLowerCase());
							} else filteredList = this.beforeFilter;
						}
						break;
					case 4:
						if (filteredList) {
							if (filter !== 'All') {
								filteredList = filteredList.filter((resident: any) => resident.Sleep.toLowerCase() == filter.toLowerCase());
							} else filteredList = filteredList;
						} else {
							if (filter !== 'All') {
								filteredList = this.beforeFilter.filter((resident: any) => resident.Sleep.toLowerCase() == filter.toLowerCase());
							} else filteredList = this.beforeFilter;
						}
						break;
					case 5:
						if (filteredList) {
							if (filter !== 'All') {
								filteredList = filteredList.filter((resident: any) => this.getBatteryStatusColor(resident.Battery) === filter.toLowerCase());
							}
						} else {
							if (filter !== 'All') {
								filteredList = this.beforeFilter.filter((resident: any) => this.getBatteryStatusColor(resident.Battery) === filter.toLowerCase());
							}
						}
						break;
				}
			}
		})
		if (this.filterTypes.filterWards.length > 1 || (this.filterTypes.filterWards.length === 1 && this.filterTypes.filterWards[0] !== '')) {
			filteredList = filteredList.filter(value => this.filterTypes.filterWards.includes(value.ward_id))
		}
		if (this.filterTypes.filterRooms.length > 1 || (this.filterTypes.filterRooms.length === 1 && this.filterTypes.filterRooms[0] !== '')) {
			filteredList = filteredList.filter(value => this.filterTypes.filterRooms.includes(value.room_id))
		}
		return filteredList;
	}
	/* Apply Filters for Card View End */
	/*filter for listview data*/
	filterAccordingListView() {
		let filteredList: any;
		const filterValueList = Object.values(this.filterTypes).map(filter => {
			if (filter !== null && typeof filter === 'string') {
				return filter;
			}
		})
		filterValueList.forEach((filter, i) => {
			if (filter !== undefined) {
				switch (i) {
					case 1:
						if (filteredList) {
							if (filter !== 'All') {
								filteredList = filteredList.filter((resident: any) => {
									if (resident.ResidentStatus)
										return resident.ResidentStatus.toLowerCase() == filter.toLowerCase();
								});
							} else filteredList = filteredList;
						} else {
							if (filter !== 'All') {
								filteredList = this.beforeFilterList.filter((resident: any) => resident.Questionnaire_name == filter);

							} else filteredList = this.beforeFilterList;
						}
						break;
					case 2:
						if (filteredList) {

							if (filter !== 'All') {
								filteredList = filteredList.filter((resident: any) => resident.fallRisk.toLowerCase() == filter.toLowerCase());
								//filteredList = filteredList.filter((resident:any) => resident.Balance.toLowerCase() == filter.toLowerCase());
							} else filteredList = filteredList;
						} else {
							if (filter !== 'All') {
								//filteredList = this.beforeFilterList.filter((resident:any) => resident.Balance.toLowerCase() == filter.toLowerCase());
								filteredList = this.beforeFilterList.filter((resident: any) => resident.fallRisk.toLowerCase() == filter.toLowerCase());
							} else filteredList = this.beforeFilterList;
						}
						break;
					case 3:
						if (filteredList) {
							if (filter !== 'All') {
								filteredList = filteredList.filter((resident: any) => resident.walking_ability.toLowerCase() == filter.toLowerCase());

								//filteredList = filteredList.filter((resident:any) => resident.Strength.toLowerCase() == filter.toLowerCase());
							} else filteredList = filteredList;
						} else {
							if (filter !== 'All') {
								//filteredList = this.beforeFilterList.filter((resident:any) => resident.Strength.toLowerCase() == filter.toLowerCase());
								filteredList = this.beforeFilterList.filter((resident: any) => resident.walking_ability.toLowerCase() == filter.toLowerCase());
							} else filteredList = this.beforeFilterList;
						}
						break;
					case 4:
						if (filteredList) {
							if (filter !== 'All') {
								filteredList = filteredList.filter((resident: any) => resident.Cognitive_ability.toLowerCase() == filter.toLowerCase());
								//filteredList = filteredList.filter((resident:any) => resident.Sleep.toLowerCase() == filter.toLowerCase());
							} else filteredList = filteredList;
						} else {
							if (filter !== 'All') {
								//filteredList = this.beforeFilterList.filter((resident:any) => resident.Sleep.toLowerCase() == filter.toLowerCase());
								filteredList = this.beforeFilterList.filter((resident: any) => resident.Cognitive_ability.toLowerCase() == filter.toLowerCase());
							} else filteredList = this.beforeFilterList;
						}
						break;
					case 5:
						if (filteredList) {
							if (filter !== 'All') {
								filteredList = filteredList.filter((resident: any) => resident.Medication.toLowerCase() == filter.toLowerCase());
							
								//filteredList = filteredList.filter((resident: any) => this.getBatteryStatusColor(resident.Battery) === filter.toLowerCase());
							}
						} else {
							if (filter !== 'All') {
								filteredList = this.beforeFilterList.filter((resident: any) => resident.Medication.toLowerCase() == filter.toLowerCase());
							
								//filteredList = this.beforeFilterList.filter((resident: any) => this.getBatteryStatusColor(resident.Battery) === filter.toLowerCase());
							}
						}
						break;
				}
			}
		})
		if (this.filterTypes.filterWards.length > 1 || (this.filterTypes.filterWards.length === 1 && this.filterTypes.filterWards[0] !== '')) {
			filteredList = filteredList.filter(value => this.filterTypes.filterWards.includes(value.ward_id))
		}
		if (this.filterTypes.filterRooms.length > 1 || (this.filterTypes.filterRooms.length === 1 && this.filterTypes.filterRooms[0] !== '')) {
			filteredList = filteredList.filter(value => this.filterTypes.filterRooms.includes(value.room_id))
		}
		return filteredList;
	}

	/*end of listview data*/

}

/* Add Resident */
import { FormBuilder, FormGroup, FormControl, Validators } from "@angular/forms";
import { startWith, map, mergeMap } from "rxjs/operators";
import { CalendarEventTitleFormatter } from "angular-calendar";
import { isUndefined } from "util";
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { NativeDateAdapter, DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { formatDate } from '@angular/common';
import { PrefixNot } from "@angular/compiler";
import { TimeFormatService } from "../../shared/services/time-format.service";
import { CommonHttpService } from "../../shared/services/http-services/common-http.service";
import { Router } from "@angular/router";
import { AppHeaderComponent } from "../../layouts/full/header/header.component";
import { TokenStorageServiceService } from "../../auth/login/token-storage-service.service";
/* import { delimiter } from "path"; */
// import { mergeMap } from 'rxjs/operators';
// import { HttpClient } from '@angular/common/http';
export const PICK_FORMATS = {
	parse: { dateInput: { month: 'short', year: 'numeric', day: 'numeric' } },
	display: {
		dateInput: 'input',
		monthYearLabel: { year: 'numeric', month: 'short' },
		dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
		monthYearA11yLabel: { year: 'numeric', month: 'long' }
	}
};
export interface StateGroup {
	letter: string;
	names: string[];
}
export const _filter = (opt: string[], value: string): string[] => {
	const filterValue = value.toLowerCase();

	return opt.filter((item) => item.toLowerCase().indexOf(filterValue) === 0);
};
class PickDateAdapter extends NativeDateAdapter {
	format(date: Date, displayFormat: Object): string {
		if (displayFormat === 'input') {
			return formatDate(date, 'dd-MM-yyyy', this.locale);
		} else {
			return date.toDateString();
		}
	}
}
@Component({
	selector: "add-resident",
	templateUrl: "add-resident.html",
	styleUrls: ['./residents.component.scss'],
	providers: [
		{ provide: DateAdapter, useClass: PickDateAdapter },
		{ provide: MAT_DATE_FORMATS, useValue: PICK_FORMATS }
	]
})
export class DialogContent {
	userForm: FormGroup = this._formBuilder.group({
		stateGroup: "",
	});
	public stayIndependent: any = [];
	public downtonFallRiskIndex: any = [];
	public PreExistingConditions: any = [];
	questionAnswers:any=[];
	today = new Date();
	minDate = new Date();
	editModeWard: string;
	stateGroups: StateGroup[] = [
	];
	stateGroupOptions: Observable<StateGroup[]>;
	header:any;
	action: string;
	local_data: any;
	wardSearch: string = '';
	roomSearch: string = '';
	checked = true;
	questionnaireControl = new FormControl("Select a question type", Validators.required);
	allQuestionnaire: any = [
		{ value: 'down_fall_risk_index', name: 'Downton Fall Risk Index' },
		{ value: 'stay_independent', name: 'Stay Independent' }
	]
	medicalCheckBoxes = [
		'Diabetes',
		'Diabetes pills',
		'Insulin',
		'Stroke',
		'Blood thinner pills',
		'Blood pressure',
		'BP pills',
		'Hip surgery',
		'Artificial joints',
		'Pacemaker',
		'Sleeping problems',
		'Sleeping pills',
		'Anti depressants',
		'Polypharmacy'
	]
	constructor(private tokenStorage: TokenStorageServiceService,public common: CommonService, private datePipe: DatePipe, private commonHttp: CommonHttpService, private toastr: ToastrService, private http: HttpClient, public dialogRef: MatDialogRef<DialogContent>, @Optional() @Inject(MAT_DIALOG_DATA) public data: any, private _formBuilder: FormBuilder) {
		this.local_data = { ...this.data.payload };
		this.local_data.gender = 'nottosay';
		this.local_data.contact_of = 'myself';
		this.local_data.weight_units = 'kg';
		this.local_data.ext = '+46';
		this.local_data.height_units = 'cm';
		this.local_data.roomId = '';
		this.local_data.wardId = '';
		this.local_data.deviceId = '';
		this.local_data.height_inch = '';
		this.local_data.height_feet = '';
		this.action = this.data.action;
		this.getInitialData();
		const PreExistingConditions = this.commonHttp.getPreExsitingQuestions();
		PreExistingConditions.subscribe((questionnaire: any) => {
			this.PreExistingConditions = [...questionnaire.body[0].data.items.questions.questions];
		})
	}
	getRoomCount(roomId: string) {
		const roomCount = this.data.roomCount.find(room => room.room_id === roomId);
		if (roomCount) {
			return roomCount.count;
		} else {
			return 0
		}
	}
	prevMedicalHistory = null;
	colorAccessOddNumbers = [];
	colorAccessEvenNumbers = [];
	checkBoxLength = 0;
	getAccessColor(i, answer?: any[], name?: string) {
		const a = i / 2;
		const b = (i - 1) / 2;
		if (this.colorAccessOddNumbers.includes(a)) {
			return true;
		} else if (this.colorAccessOddNumbers.includes(b)) {
			return true;
		}
	}
	getAccessColorOdd(i) {
		const a = i / 2;
		const b = (i - 1) / 2;
		if (i == 0) {
			return true;
		} else if (this.colorAccessEvenNumbers.includes(a)) {
			return true;
		} else if (this.colorAccessEvenNumbers.includes(b)) {
			return true;
		}
	}
	getWardName(id) {
		if (this.wardInfo.length > 0) {
			const ward = this.wardInfo.find(ward => ward.ward_number === id);
			if (ward) {
				return ward.name;
			} else {
				return 'Not Assigned'
			}
		}
	}
	getRoomName(id) {
		if (this.roomDetails.length > 0) {
			const room = this.roomDetails.find(room => room.room_number === id);
			if (room) {
				return room.name;
			} else {
				return 'Not Assigned';
			}
		}
		return 'Not Assigned';
	}
	disable = false;
	downFallQuestions: any;
	stayQuestions: any;
	calculateQues(scoreValue: Number) {
		let value = '';
		if (_LODASH.inRange(scoreValue, 0, 3))
			value = 'Normal';
		// else if( _LODASH.inRange(scoreValue,2,5))
		//   value = 'Medium Risk';
		else
			value = 'High';
		return value;
	}
	getDownFallValues(values: any, type: string) {
		let user: any = localStorage.getItem('loggedInUser');
		if (user) {
			user = JSON.parse(user);
		}
		this.disable = values.disable;
		this.questionAnswers=[...values.questions]
		if (type === 'down fall') {
			this.downFallQuestions = {
				created_by: user.caregiver_id,
				resident_id: '',
				questionnaire_id: `${Math.round((Math.pow(36, 15 + 1) - Math.random() * Math.pow(36, 15))).toString(36).slice(1)}`,
				questionnaire_type: "Downton Fall Risk Index",
				questionnaire_score: values.risk,
				questions: [...values.questions]
			}
		} else {
			this.stayQuestions = {
				created_by: user.caregiver_id,
				resident_id: '',
				questionnaire_id: `${Math.round((Math.pow(36, 15 + 1) - Math.random() * Math.pow(36, 15))).toString(36).slice(1)}`,
				questionnaire_type: "Stay Independent",
				questionnaire_score: values.risk,
				questions: [...values.questions]
			};
		}

		
	}

	ngOnInit() {
		this.minDate.setFullYear(1900);

	}
	public wardInfo = [];
	public allDevices = []
	deviceSearch: string = '';
	getInitialData() {
		let user: any = localStorage.getItem('loggedInUser');
		if (user) {
			user = JSON.parse(user);
			this.wardInfo = user.wards;
		}
	}
	getWards() {
		return this.wardInfo.filter(value => value.ward_name.toLowerCase().includes(this.wardSearch.toLowerCase()));
	}
	getDevices() {
		return this.allDevices.filter(value => value.details.wearable_sno.toLowerCase().includes(this.deviceSearch.toLowerCase()));
	}
	getRooms() {
		return this.roomDetails.filter(value => value.details.room_name.toLowerCase().includes(this.roomSearch.toLowerCase()));
	}
	public roomDetails = [];
	getRoomDetails(event: string) {
		this.commonHttp.getRoomDetails().subscribe((roomDetails: any) => {
			this.roomDetails = roomDetails.body ? roomDetails.body.filter(value => value.details.ward_id === event).sort((a, b) => {
				return a.room_number > b.room_number ? 1 : -1;
			}) : []
		});
		this.commonHttp.getWearableDetails().subscribe((devices: any) => {
			this.allDevices = devices.body ? devices.body.filter(value => value.details.wearable_status === 'Ready to use' && value.details.ward_id === event) : [];
		})
	}
	private _filterGroup(value: string): StateGroup[] {
		if (value) {
			return this.stateGroups.map((group) => ({ letter: group.letter, names: _filter(group.names, value) })).filter((group) => group.names.length > 0);
		}

		return this.stateGroups;
	}
	getErrors(form: any) {
		if (form && form.errors) {
			return form.errors;
		} else {
			return false;
		}
	}
	isTouched(formControl: any) {
		if (formControl && formControl.touched) {
			return formControl.touched
		} else {
			return false;
		}
	}
	noPreExisting = false;
	noPreExistingCondition(event) {
		this.noPreExisting = event.checked;
		if (this.noPreExisting) {
			this.diabetesCheck = false;
			this.strokeCheck = false;
			this.bpCheck = false;
			this.sleepProblemCheck = false;
			this.diabetesPills = false;
			this.insulin = false;
			this.btPills = false;
			this.bPills = false;
			this.hSurgery = false;
			this.aJoints = false;
			this.pacemaker = false;
			this.sPills = false;
			this.aDepressants = false;
			this.pPharmacy = false;
			this.deSelectAll()
		}
	}
	wardRoomCheck() {
		return this.local_data.roomId === 'Select room' || this.local_data.wardId === 'Select ward'
	}
	/* Function to valid the add resident form */
	validate() {
		if (this.action === 'Add') {
			let invalidPreExisting = true;
			if(this.questionAnswers.length>0){
				let sensoryImpl=this.questionAnswers[3].answerValue
				let cogniImpl=this.questionAnswers[4].answerValue
				let walkAbi=this.questionAnswers[5].answerValue
				if(!isUndefined(cogniImpl)&&!isUndefined(walkAbi)&&!isUndefined(sensoryImpl)){
						invalidPreExisting = false;
						return;
				}

			}
			// if (this.noPreExisting) {
			// 	invalidPreExisting = false;
			// } else {
			// 	this.PreExistingConditions.forEach(data => {
			// 		if (!isUndefined(data.answerValue)) {
			// 			invalidPreExisting = false;
			// 			return;
			// 		}
			// 	})
			// 	invalidPreExisting = false;
			// }
		
			return invalidPreExisting || this.questionnaireControl.value === 'Select a question type';
		}
	}
	// getAge(dob: string) {
	// 	if (dob !== null) {
	// 		const age = moment(dob).fromNow(true);
	// 		if (age && age.includes('years')) {
	// 			return parseInt(age.split('years')[0]) < 60 ? '60' : age.split('years')[0];
	// 		}
	// 	}
	// }
	getAge(dob: string){
		dob=moment(dob).format('DD-MM-YYYY')
		let age='';
		if(dob!=null)
		{
		let dateofbirth=dob.split('-')
		let currentDate=new Date();
		let curren=moment(currentDate).format('YYYY-MM-DD')
		let currentdate=curren.split('-');
		var curyear:number=+currentdate[0];
		var curmonth:number=+currentdate[1];
		var cursDay:number=+currentdate[2];
		var dateofYear:number=+dateofbirth[2];
		var dateofMonth:number=+dateofbirth[1];
		var dateofDay:number=+dateofbirth[0];
		if(dateofMonth===12){
			 age=this.findAge(currentdate[2],currentdate[1],currentdate[0],dateofbirth[0],dateofbirth[1],dateofbirth[2])
	 
		}else{
		var current = moment([curyear, curmonth, cursDay]);
	   var dateOfBirth = moment([dateofYear, dateofMonth, dateofDay]);
	   var years = current.diff(dateOfBirth, 'year');
	   dateOfBirth.add(years, 'years');
   
	   var months = current.diff(dateOfBirth, 'months');
	   dateOfBirth.add(months, 'months');
   
	   var days = current.diff(dateOfBirth, 'days');
   
	   age=years + ' Years ' + months + ' Months ' + days + ' Days';
		}
	}
	return age;
	}
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
	public userId;
	isLoading = false;
	getRoomByID(id: any) {
		return this.roomDetails?.find(value => value.details.room_id === id)?.details.room_name
	}
	getWardByID(id: any) {
		return this.wardInfo?.find(value => value.ward_id === id)?.ward_name
	}
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
	feet = [
		1,
		2,
		3,
		4,
		5,
		6,
		7,
		8,
		9,
		10
	]
	inch = [
		0,
		1,
		2,
		3,
		4,
		5,
		6,
		7,
		8,
		9,
		10,
		11
	]
	/* function to post the resident data */
	doAction() {
		this.isLoading = true;
		const id = `${Math.round((Math.pow(36, 15 + 1) - Math.random() * Math.pow(36, 15))).toString(36).slice(1)}`;
		//const id= `${Math.round((Math.pow(36, 8 + 1) - Math.random() * Math.pow(36, 8))).toString(36).slice(1)}`;
		//const id='UMA102';
		const user = JSON.parse(localStorage.getItem('loggedInUser'))
		let PostUser = {}
		PostUser['customer_id'] = user.customers.customer_id,
			PostUser['facility_id'] = user.facilities[0].facility_id,
			PostUser['first_name'] = this.local_data['firstName'];
		PostUser['last_name'] = this.local_data['lastName'];
		PostUser['nick_name'] = this.local_data['nickName'];
		PostUser['resident_id'] = id;
		PostUser['gender'] = this.local_data.gender;
		PostUser['dob'] = moment(this.local_data['birthdate']).format('YYYY-MM-DD');
		PostUser['height_value'] = this.local_data.height_units === 'cm' ? this.local_data.height : (this.local_data.height_feet * 30.48 + this.local_data.height_inch * 2.58);
		PostUser['height_feet'] = this.local_data.height_feet;
		PostUser['height_inch'] = this.local_data.height_inch;
		PostUser['height_units'] = this.local_data.height_units;
		PostUser['weight_value'] = this.local_data.weight;
		PostUser['weight_units'] = this.local_data.weight_units;
		PostUser['ward_assigned'] = this.local_data.wardId;
		PostUser['contact_email'] = this.local_data.email;
		PostUser['phone_number'] = `${this.local_data.ext} ${this.local_data.mobile}`;
		PostUser['contact_of'] = this.local_data.contact_of;
		PostUser['room_assigned'] = this.local_data.roomId;
		PostUser['admission_date'] = moment(this.local_data.admissionDate).format('YYYY-MM-DD');
		PostUser['wearable_assigned'] = 'ABBAC'// this.local_data.deviceId;
		PostUser['medical_history'] = null;
		//  {
		// "questions": [...this.PreExistingConditions],
		// }
		const date = new Date();
		this.commonHttp.storeResidentDetails(PostUser).subscribe((data) => {
			const notificationBody = {
				resident_id: id,
				resident_name: `${this.local_data.firstName} ${this.local_data.lastName}`,
				contents: [
					{
						date: date,
						action: `${this.local_data.firstName} ${this.local_data.lastName}'s profile has been created`
					},
					{
						date: date,
						action: 'Following details has been added',
					},
					// {
					// action: `${this.local_data.firstName} ${this.local_data.lastName} (${this.local_data.gender === 'nottosay' ? '--' : this.local_data.gender})[${this.getAge(this.local_data.birthdate)}] was assigned to ${this.getRoomByID(this.local_data.roomId)} ( in ${this.getWardByID(this.local_data.wardId)}) and paired to ${this.local_data.deviceId}`
					// },
					{
						//action: `${this.local_data.firstName} ${this.local_data.lastName} (${this.local_data.gender === 'nottosay' ? '--' : this.local_data.gender})[${this.getAge(this.local_data.birthdate)}]`
						action: `${this.local_data.firstName} ${this.local_data.lastName} (${this.local_data.gender === 'nottosay' ? '--' : this.local_data.gender})[${moment(this.local_data['birthdate']).format('YYYY-MM-DD')}]`
					},
					{
						action: 'Pre Existing conditions'
					},
				]
			}
			// const unique = []
			// this.PreExistingConditions.forEach(data => {
			// let checkValue = [];
			// if(data['answerValue']){
			// checkValue.push(data.question);
			// }
			// checkValue = checkValue.filter(value => this.questionValues.includes(value));
			// checkValue.forEach(data => {
			// if(data === 'Sleeping pills' || data === 'Anti depressants'){
			// data = 'Sleeping Problems'
			// }
			// })
			// checkValue.forEach(data => {
			// const existed = unique.find(value => value === data);
			// if(!existed){
			// unique.push(data);
			// }
			// })
			// })
			// if(unique.length > 0){
			// unique.forEach(val => {
			// notificationBody.contents.push({
			// action: `- ${val}`
			// })
			// })
			// }else{
			// notificationBody.contents.push({
			// action: `- No medical history`
			// })
			// }

			const user = JSON.parse(localStorage.getItem('loggedInUser'));
			this.commonHttp.storeNotificationsData({
				resident_id: id,
				"notification_id": `${Math.round((Math.pow(36, 15 + 1) - Math.random() * Math.pow(36, 15))).toString(36).slice(1)}`,
				"customer_id": user.customers.customer_id,
				"facility_id": user.facilities[0].facility_id,
				"ward_id": this.local_data.wardId,
				"notification_category": "Dashboard",
				"notification_type": 'ResidentCreated',
				"notification_class": "Success",
				"notification_body": notificationBody
			}).subscribe(() => { })
			this.submitQue(id);
			this.commonHttp.updateWearablesDetails({
				"wearable_id": PostUser['wearable_assigned'],
				"wearable_status": "In use"
			}).subscribe(data => {

			})
			// const postData={
			// "1" : id,
			// "2":`${this.local_data.firstName} ${this.local_data.lastName}`,
			// "deviceID":this.local_data.deviceId,
			//   }
			//   this.http.post(`${environment.apiNodeDUrl}/device/post`,postData).subscribe(() => {
			//   })
			this.toastr.success('<div class="action-text"><span class="font-400">Resident is Successfully Added</span></div><div class="action-buttons"></div>', "", {
				timeOut: 2000,
				progressBar: true,
				enableHtml: true,
				// closeButton: false,
				closeButton: true,

			});

		}, (error) => {
			this.isLoading = false;
		})
		this.dialogRef.close(true);
	}

	closeDialog() {
		this.dialogRef.close({ event: "Cancel" });
	}


	public PreExistingConditionsScore = 0;
	diabetesCheck = false;
	noPreExistCheck = false;
	strokeCheck = false;
	bpCheck = false;
	sleepProblemCheck = false;
	diabetesPills = false;
	insulin = false;
	btPills = false;
	bPills = false;
	hSurgery = false;
	aJoints = false;
	pacemaker = false;
	sPills = false;
	aDepressants = false;
	pPharmacy = false;
	medicalInfo(event, index) {
		if (index) {
			let ansId = null;
			let question: any = {};
			let questionIndex = null;
			let check = event ? 'Yes' : 'No'
			this.PreExistingConditions.filter((que, ind) => {
				if (que.questionID === index) {
					question = { ...que };
					questionIndex = ind
				}
			});
			let answersForQue = question.answers.filter((data) => data.answer == check);
			ansId = answersForQue[0].answerID
			if (check === 'Yes') {
				question['answerValue'] = ansId;
				this.PreExistingConditionsScore += answersForQue[0].risk;
			}
			else {
				delete question['answerValue'];
				this.deleteExistChildren(question.question);
				this.PreExistingConditionsScore -= answersForQue[0].risk;
			}

			this.PreExistingConditions[questionIndex] = question;
		}
	}
	sleepChange(event, question) {
		const check = event.checked ? 'Yes' : 'No';
		if (check === 'No') {
			this.deleteExistChildren(question);
		}
	}
	deSelectAll() {
		this.PreExistingConditions.forEach(data => {
			delete data['answerValue'];
		})
	}
	deleteExistChildren(question: string) {
		let questionToChange: any;
		switch (question) {
			case 'Diabetes':
				questionToChange = this.PreExistingConditions.find(question => question.question === 'Diabetes pills');
				delete questionToChange['answerValue'];
				questionToChange = this.PreExistingConditions.find(question => question.question === "Diabetes - Insulin");
				delete questionToChange['answerValue'];
				break;
			case "Blood pressure":
				questionToChange = this.PreExistingConditions.find(question => question.question === "BP pills");
				delete questionToChange['answerValue'];
				break;
			case "Sleeping problems":
				questionToChange = this.PreExistingConditions.find(question => question.question === "Sleeping pills");
				delete questionToChange['answerValue'];
				questionToChange = this.PreExistingConditions.find(question => question.question === "Anti depressants");
				delete questionToChange['answerValue'];
				break;
		}
	}
	public closeDialogBox: boolean;
	getHeaders(){
		this.header = new HttpHeaders().set(
		  "Authorization",
		  this.tokenStorage.getToken()
		);
	  }
	submitQue(id: string) {
		this.getHeaders();
		if (this.questionnaireControl.value === 'down_fall_risk_index') {
			let DowntonFallRiskIndexBody = this.downFallQuestions;
			DowntonFallRiskIndexBody.resident_id = id;
			//this.commonHttp.storeQuestionaireDetails(DowntonFallRiskIndexBody).subscribe((data) => {
			this.http.post(`${environment.apiUrlNew}/nursing/questionnaries/post`, DowntonFallRiskIndexBody,{headers:this.header}).subscribe((data) => {
				const user = JSON.parse(localStorage.getItem('loggedInUser'));
				const notificationBody = {
					resident_id: id,
					resident_name: `${this.local_data.firstName} ${this.local_data.lastName}`,
					contents: [
						{
							date: new Date(),
							action: `${this.local_data.firstName} ${this.local_data.lastName} completed the Downton fall risk index questionnaire`,
						},
						{
							date: new Date(),
							action: `The result indicates ${this.calculateQues(this.downFallQuestions.questionnaire_score)} risk (${this.downFallQuestions.questionnaire_score})`
						},
						{
							date: new Date(),
							action: `${user.first_name} ${user.last_name} initiated the questionnaire for ${this.local_data.firstName} ${this.local_data.lastName}`
						}
					]
				}

				this.http.post(`${environment.apiUrlNew}/notifications/post/`, {
					resident_id: id,
					"notification_id": `${Math.round((Math.pow(36, 15 + 1) - Math.random() * Math.pow(36, 15))).toString(36).slice(1)}`,
					"customer_id": user.customers.customer_id,
					"facility_id": user.facilities[0].facility_id,
					"ward_id": this.local_data.wardId,
					"notification_category": "Dashboard",
					"notification_type": 'Questionnaire',
					"notification_class": "Success",
					"notification_body": notificationBody
				},{headers:this.header}).subscribe(() => { })
				this.toastr.success('<div class="action-text"><span class="font-400">Questionnaires are Successfully Added</span></div><div class="action-buttons"></div>', "", {
					timeOut: 2000,
					progressBar: true,
					enableHtml: true,
					closeButton: false,
				});
				this.common.eventEmit(true);
				this.dialogRef.close(true);
			});
		} else {
			let stayIndependent = this.stayQuestions;
			const user = JSON.parse(localStorage.getItem('loggedInUser'));
			stayIndependent.resident_id = id;
			//this.http.post(`${environment.apiSpringUrl}/questionnaire/post/`,stayIndependent).subscribe((data) => {
			this.http.post(`${environment.apiUrlNew}/nursing/questionnaries/post`, stayIndependent,{headers:this.header}).subscribe((data) => {
				const notificationBody = {
					resident_id: id,
					resident_name: `${this.local_data.firstName} ${this.local_data.lastName}`,
					contents: [
						{
							date: new Date(),
							action: `${this.local_data.firstName} ${this.local_data.lastName} completed the Stay independent questionnaire`,
						},
						{
							date: new Date(),
							action: `The result indicates ${this.calculateQues(this.stayQuestions.questionnaire_score)} risk (${this.stayQuestions.questionnaire_score})`
						},
						{
							date: new Date(),
							action: `${user.first_name} ${user.last_name} initiated the questionnaire for ${this.local_data.firstName} ${this.local_data.lastName}`
						}
					]
				}
				this.http.post(`${environment.apiUrlNew}/notifications/post/`, {
					resident_id: id,
					"notification_id": `${Math.round((Math.pow(36, 15 + 1) - Math.random() * Math.pow(36, 15))).toString(36).slice(1)}`,
					"customer_id": user.customers.customer_id,
					"facility_id": user.facilities[0].facility_id,
					"ward_id": this.local_data.wardId,
					"notification_category": "Dashboard",
					"notification_type": 'Questionnaire',
					"notification_class": "Success",
					"notification_body": notificationBody
				},{headers:this.header}).subscribe(() => { })
				this.toastr.success('<div class="action-text"><span class="font-400">Questionnaires are Successfully Added</span></div><div class="action-buttons"></div>', "", {
					timeOut: 2000,
					progressBar: true,
					enableHtml: true,
					closeButton: false,
				});
				this.common.eventEmit(true);
				this.dialogRef.close(true)
			})
		}
	}
}


@Component({
	selector: "add-filters",
	templateUrl: "filter-pop.component.html",
	styleUrls: ['./residents.component.scss']
})

export class FilterComponent implements OnInit {
	filterTypes: any = {
		filterResident: "All",
		filterStatus: "All",
		filterBalance: "All",
		filterStrength: "All",
		filterSleep: "All",
		filterBattery: "All",
		filterWards: [''],
		filterRooms: ['']
	}

	constructor(public dialogRef: MatDialogRef<FilterComponent>, private datePipe: DatePipe, private http: HttpClient, @Optional() @Inject(MAT_DIALOG_DATA) public data: any, private commonHttp: CommonHttpService) {
		if (this.data.payload) {
			this.filterTypes = { ...this.data.payload };
			if (this.filterTypes.filterWards && this.filterTypes.filterWards.length > 0) {
				this.getRoomValues();
			}
		}
		this.getWards();
	}
	wardSearch: string = '';
	getFilterWards() {
		return this.wardList.filter(value => value.ward_name.toLowerCase().includes(this.wardSearch.toLowerCase()));
	}
	getWardByID(id: any) {
		return this.wardList?.find(value => value.ward_id === id)?.ward_name
	}
	wardList = [];
	getWards() {
		if (this.data.type === 'caregiver') {
			let user: any = localStorage.getItem('loggedInUser');
			if (user) {
				user = JSON.parse(user);
			}
			this.wardList = user.wards ? user.wards : [];
		} else {
			const user = JSON.parse(localStorage.getItem('loggedInUser'));
			this.http.get(`${environment.apiUrlNew}/wards/get/`).subscribe((wards: any) => {
				if (wards.itemCount > 0) {
					this.wardList = wards.body.filter(val => val.details.facility_id === user.facilities.facility_id).map(value => {
						return {
							ward_name: value.details.ward_name,
							ward_id: value.details.ward_id,
						}
					}).sort((a: any, b: any) => {
						return a.ward_name > b.ward_name ? 1 : -1;
					})
				}
			})
		}
	}
	getRoomByID(id: any) {
		return this.roomList?.find(value => value.details.room_id === id)?.details.room_name
	}

	roomSearch: string = '';
	getFilterRooms() {
		return this.roomList.filter(value => {
			return value.details.room_name.toLowerCase().includes(this.roomSearch.toLowerCase())
		});
	}
	getFormWards() {
		if (this.filterTypes.filterWards.length > 1) {
			return this.filterTypes.filterWards.filter(value => value !== '');
		}
		return this.filterTypes.filterWards
	}
	getFormRooms() {
		if (this.filterTypes.filterRooms.length > 1) {
			return this.filterTypes.filterRooms.filter(value => value !== '');
		}
		return this.filterTypes.filterRooms
	}
	roomList = [];
	getRoomValues() {
		this.http.get(`${environment.apiUrlNew}/rooms/get/`).subscribe((roomDetails: any) => {
			this.roomList = roomDetails.body ? roomDetails.body.filter(value => this.filterTypes.filterWards.includes(value.details.ward_id)).sort((a, b) => {
				return a.details.room_name > b.details.room_name ? 1 : -1;
			}) : []
		});
	}
	showRegisterStatus = false;
	ngOnInit() { }
	ddlChange(ob: any, type: any) {
		const filterValue = ob;
		switch (type) {
			case 'resident':
				this.filterTypes.filterResident = filterValue;
				break;
			case 'downton':
				this.filterTypes.filterStatus = filterValue;
				break;
			case 'fallsRisk':
				this.filterTypes.filterBalance = filterValue;
				break;
			case 'cognitiveAbility':
				this.filterTypes.filterSleep = filterValue;
				break;
			case 'walkingAbility':
				this.filterTypes.filterStrength = filterValue;
				break;
			case 'medication':
				this.filterTypes.filterBattery = filterValue;
				break;
		}
	}
	apply() {
		this.filterTypes.filterWards = this.filterTypes.filterWards.length > 1 ? this.filterTypes.filterWards.filter(value => value !== '') : this.filterTypes.filterWards;
		this.filterTypes.filterRooms = this.filterTypes.filterRooms.length > 1 ? this.filterTypes.filterRooms.filter(value => value !== '') : this.filterTypes.filterRooms;
		this.dialogRef.close(this.filterTypes);
	}
}