import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonAddModelComponent } from '../../shared/common-add-model/common-add-model.component';
import { FilterComponent } from '../../caregiver/residents/residents.component';
import { CommonHttpService } from '../../shared/services/http-services/common-http.service';
import { CommonService } from './../../shared/services/common.service'
import * as moment from "moment";
import * as _LODASH from "lodash";
import { MatDialog } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { TokenStorageServiceService } from '../../auth/login/token-storage-service.service';

export interface residents {
  'Residents_name': string;
  'Last_known_status': string;
  'Questionnaire_fall': string;
  'Wearable_fall': number;
  'Balance': string;
  'Strength': string;
  'Sleep': string;
  wearableFallIncreased: boolean,
  fallDiff: number,
  'Wearables_name': string;
  'Ward_name': string;
  'Room_name': string;
  'Battery_status': number;
}
@Component({
  selector: 'app-residents',
  templateUrl: './residents.component.html',
  styleUrls: ['./residents.component.scss']
})

export class ResidentsComponent implements OnInit {
  isLoading = true;
  widths: string[] = ['12%', '16%', '10%', '12%', '5%', '5%', '5%', '9%', '9%', '9%', '10%', '6%']
  displayedColumns: string[] = ['Resident_name','Last_known_status','Questionnaire_fall','Wearable_fall','Balance','Strength', 'Sleep', 'Ward_name','Room_name', 'Name_on_wearable', 'Battery_status'];
  tableData: residents[] = [];
  header:any;
    // {
    //   Ward_name: 'Ward A',
    //   Last_known_status: 'Sleeping',
    //   Questionnaire_fall: 10,
    //   Wearable_fall: 3,
    //   Balance: 'low',
    //   Strength: 'low',
    //   wearableFallIncreased: true,
    //   fallDiff: 4,
    //   Sleep: 'low',
    //   Wearables_name: 'JDXC',
    //   Room_number: '11-1123',
    //   Residents_name: 'Camilia D',
    //   Battery_status: 80
    // },
 
  constructor(private tokenStorage: TokenStorageServiceService,private routeActivate: ActivatedRoute, private http: HttpClient, private matDialog: MatDialog, private commonHttp: CommonHttpService,  public common:CommonService) { }

  ngOnInit(): void {
	  this.getResidentToOrg();
	  this.getWards()
    }
	getHeaders(){
		this.header = new HttpHeaders().set(
		  "Authorization",
		  this.tokenStorage.getToken()
		);
	  }
    getResidentToOrg() {
		this.getHeaders();
      let residents:any = localStorage.getItem('residents');
      if(residents){
        this.http.get(`${environment.apiUrlNew}/residents/get/`,{headers:this.header}).subscribe((data:any) =>{
          if(residents != JSON.stringify(data)){
				localStorage.setItem('residents', JSON.stringify(data));
				this.loadMoreData();
          }
        })
        this.loadMoreData()
      }else{
		this.isLoading = true;
        this.http.get(`${environment.apiUrlNew}/residents/get/`,{headers:this.header}).subscribe((data:any) =>{
			localStorage.setItem('residents', JSON.stringify(data));
			this.loadMoreData();
        })
      }
    }
	beforeFilter= [];
	//timeZone = moment.parseZone().utcOffset();
	//timeZone = moment.parseZone("2013 01 01 +03:30", 'YYYY MM DD ZZ', 'fr', true).utcOffset();
	//timeZone = moment.parseZone("2013-01-01T00:00:00-06:00").utcOffset();
    timeZone = moment.parseZone().utcOffset();
	loadMoreData(){
		let data:any = localStorage.getItem('residents');
		this.clearFilter();
		if(data){
			data = JSON.parse(data);
			let tableData = [];
			const user = JSON.parse(localStorage.getItem('loggedInUser'));
			if(data.itemCount > 0 && user){ 
				data.body.filter(val => val.meta.facility_id === user.facilities.facility_id).forEach(residents => {
					tableData.push({
						Ward_name: residents.WardInformation.ward_name,
						Last_known_status: residents.status.last_status || 'unknown',
						Questionnaire_fall: residents.questionnaire.questions!==null?parseInt(this.getFallenData(residents.questionnaire.questions)) > 0 ? 'Yes' : 'No':'',
						Wearable_fall: residents.scores.total_falls || 0,
						Balance: residents.scores.balance || 'unknown',
						Strength: residents.scores.strength || 'unknown',
						//wearableFallIncreased: residents.wearableFallInc || true,
						//fallDiff: residents.wearableFallDiff || 0,
						Sleep: residents.scores.sleep || 'unknown',
						created_at: moment(residents.meta.fall_update).add(this.timeZone, 'minutes').fromNow(),
						updated_at: moment(residents.meta.updated_at).add(this.timeZone, 'minutes').fromNow(),
						Name_on_wearable: residents.GeneralInformation.nick_name,
						Room_name: residents.WardInformation.room_name || 'Room 1',
						Resident_name: `${residents.GeneralInformation.first_name} ${residents.GeneralInformation.last_name}`,
						Battery_status: parseInt(residents.WearableInformation.battery_status),
						ward_id: residents.WardInformation.ward_id,
						room_id: residents.WardInformation.room_id,
					});
				});
			}
			this.tableData = tableData;
			this.beforeFilter =tableData;
			this.isLoading = false;
		}
    }
  
	doOperation(event: any){
    console.log(event)
  }
  getFallenData(questions: any[]){
	return questions.find(val => val.question === 'How many times you have fallen?').answerValue
  }
  filterTypes = {
	  filterStatus: "All",
	  filterBalance: "All",
		filterStrength: "All",
		filterSleep: "All",
		filterBattery: "All",
		filterWards: [''],
		filterRooms: ['']
	}
  cleared= true;
  getValue(title: string, value: any){
		switch(title){
			case 'Registration status':
				switch(value){
					case 'Active':
						return 'Complete';
					case 'In-Active':
						return 'Incomplete';
				}
			case 'Activity status':
				switch(value){
					case 'walk':
						return 'Walking';
					case 'sitting':
						return 'Sitting'
					case 'standing':
						return 'Standing'
					case 'sleep':
						return 'Sleeping'
				}
			case 'Balance':
				switch(value){
					case 'low':
						return 'Normal';
					case 'medium':
						return 'Fair'
					case 'high':
						return 'Poor'
				}
			case 'Strength':
				switch(value){
					case 'low':
						return 'Normal';
					case 'medium':
						return 'Fair'
					case 'high':
						return 'Poor'
				}
			case 'Sleep':
				switch(value){
					case 'low':
						return 'Normal';
					case 'medium':
						return 'Fair'
					case 'high':
						return 'Poor'
				}
			case 'Battery':
				switch(value){
					case 'low':
						return 'Sufficient';
					case 'medium':
						return 'Low'
					case 'high':
						return 'Critical low'
					case 'charging':
						return 'Charging'
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
	getWard(id: string){
		return this.wardList.find(value => value.id === id)?.name;
	}
	wardList = [];
	getWards(){
		this.getHeaders();
		const user = JSON.parse(localStorage.getItem('loggedInUser'));
		this.http.get(`${environment.apiUrlNew}/wards/get/`,{headers:this.header}).subscribe((wards: any) => {
		if(wards.itemCount > 0){
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
	getRoom(id: string){
		return this.roomList.find(value => value.detail.room_id === id)?.details.room_name;
	}
	roomList = [];
	getRoomValues(){
		this.getHeaders();
		this.http.get(`${environment.apiUrlNew}/rooms/get/`,{headers:this.header}).subscribe((roomDetails: any) => {
			this.roomList = roomDetails.body.filter(value => this.filterTypes.filterWards.includes(value.details.ward_id)).sort((a,b) => {
				return a.details.room_name > b.details.room_name ? 1 : -1;
			})
		});
	  }
  	appliedFilters = [];
	addFilters(){
		this.appliedFilters = [];
		const filterDialog = this.matDialog.open(FilterComponent, {
			disableClose: false,
			data: {
				payload: this.filterTypes,
			},
		});

		filterDialog.afterClosed().subscribe((result) => {
			if(result){
				this.filterTypes = result;
				this.getRoomValues();
				Object.keys(this.filterTypes).forEach((value, i) => {
					if(this.filterTypes[value] !== 'All' && typeof this.filterTypes[value] === 'string'){
						switch(i){
							case 0:
								this.appliedFilters.push({
									title: 'Last known status',
									value: this.filterTypes[value],
									key: value
								})
								break;
							case 1:
								this.appliedFilters.push({
									title: 'Balance',
									value: this.filterTypes[value],
									key: value
								})
								break;
							case 2:
								this.appliedFilters.push({
									title: 'Strength',
									value: this.filterTypes[value],
									key: value
								})
								break;
							case 3:
								this.appliedFilters.push({
									title: 'Sleep',
									value: this.filterTypes[value],
									key: value
								})
								break;
							case 4:
								this.appliedFilters.push({
									title: 'Battery',
									value: this.filterTypes[value],
									key: value
								})
								break;
						}
					}else if((this.filterTypes[value] !== 'All' && typeof this.filterTypes[value] === 'object')){
						if((this.filterTypes[value].length === 1 && this.filterTypes[value][0] !== '') || this.filterTypes[value].length > 1){
							if(i === 5){
								this.appliedFilters.push({
									title: 'Wards',
									value: this.filterTypes[value],
									key: value
								})
							}else{
								this.appliedFilters.push({
									title: 'Rooms',
									value: this.filterTypes[value],
									key: value
								})
							}
						}
					}
				})
				this.cleared = false;
				this.tableData = this.filterAccordingToExisted();
			}
		});
  }
  clearFilter(){
		this.appliedFilters = [];
		this.filterTypes.filterBalance = "All";
		this.filterTypes.filterStrength = "All";
		this.filterTypes.filterStatus = "All";
		this.filterTypes.filterSleep = "All";
		this.filterTypes.filterBattery = "All";
		this.filterTypes.filterWards = [''],
		this.filterTypes.filterRooms = ['']
		this.cleared = true;
		this.tableData = this.filterAccordingToExisted();
	}
	clear(filter: any){
		this.filterTypes[filter.key] = "All";
		this.tableData = this.filterAccordingToExisted();
		this.appliedFilters = this.appliedFilters.filter(value => value.key !== filter.key);
		if(this.appliedFilters.length > 0){
			this.cleared = false;
		}else {
			this.cleared = true;
		}
  }
  filterAccordingToExisted(){
		let filteredList: any;
		const filterValueList = Object.values(this.filterTypes).map(filter => {
			if(filter !== null && typeof filter === 'string'){
				return filter;
			}
		})
		filterValueList.forEach((filter, i)=>{
			if(filter !== undefined){
				switch(i){
					case 0:
						if(filteredList){
							if(filter !== 'All'){
								filteredList = filteredList.filter((resident:any) => { 
									if(resident.ResidentStatus)
										return resident.ResidentStatus.toLowerCase() == filter.toLowerCase();
							   });
							}else filteredList = filteredList;
						}else {
							if(filter !== 'All'){
								filteredList = this.beforeFilter.filter((resident:any) => { 
									if(resident.ResidentStatus)
										return resident.ResidentStatus.toLowerCase() == filter.toLowerCase();
							   });
							}else filteredList = this.beforeFilter;
						}
						break;
					case 1:
						if(filteredList){
							if(filter !== 'All'){
								filteredList = filteredList.filter((resident:any) => resident.Balance.toLowerCase() == filter.toLowerCase());
							}else filteredList = filteredList;
						}else {
							if(filter !== 'All'){
								filteredList = this.beforeFilter.filter((resident:any) => resident.Balance.toLowerCase() == filter.toLowerCase());
							}else filteredList = this.beforeFilter;
						}
						break;
					case 2:
						if(filteredList){
							if(filter !== 'All'){
								filteredList = filteredList.filter((resident:any) => resident.Strength.toLowerCase() == filter.toLowerCase());
							}else filteredList = filteredList;
						}else {
							if(filter !== 'All'){
								filteredList = this.beforeFilter.filter((resident:any) => resident.Strength.toLowerCase() == filter.toLowerCase());
							}else filteredList = this.beforeFilter;
						}
						break;
					case 3:
						if(filteredList){
							if(filter !== 'All'){
								filteredList = filteredList.filter((resident:any) => resident.Sleep.toLowerCase() == filter.toLowerCase());
							}else filteredList = filteredList;
						}else {
							if(filter !== 'All'){
								filteredList = this.beforeFilter.filter((resident:any) => resident.Sleep.toLowerCase() == filter.toLowerCase());
							}else filteredList = this.beforeFilter;
						}
						break;
					case 4:
						if(filteredList){
							if(filter !== 'All'){
								filteredList = filteredList.filter((resident: any) => this.getBatteryStatusColor(resident.Battery_status) === filter.toLowerCase());
							}
						}else {
							if(filter !== 'All'){
								filteredList = this.beforeFilter.filter((resident: any) => this.getBatteryStatusColor(resident.Battery_status) === filter.toLowerCase());
							}
						}
						break;
				}
			}
		})
		if(this.filterTypes.filterWards.length > 1 || (this.filterTypes.filterWards.length === 1 && this.filterTypes.filterWards[0] !== '')){
			filteredList = filteredList.filter(value => this.filterTypes.filterWards.includes(value.ward_id))
		}
		if(this.filterTypes.filterRooms.length > 1 || (this.filterTypes.filterRooms.length === 1 && this.filterTypes.filterRooms[0] !== '')){
			filteredList = filteredList.filter(value => this.filterTypes.filterRooms.includes(value.room_id))
		}
		return filteredList;
  }
  getBatteryStatusColor(battery: number){
		const batteryLevel = Math.round(battery/10) * 10;
		let value: string;
		if( batteryLevel > 50)
			value = 'low';
		else if( _LODASH.inRange(batteryLevel,15,50))
			value = 'medium';
		else if(batteryLevel < 15)
			value = 'high';
		return value;
	}
}
