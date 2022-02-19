import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit,ViewChild } from '@angular/core';
import { Form, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import {MatSelect} from '@angular/material/select'
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CommonAddModelComponent } from '../../../shared/common-add-model/common-add-model.component';
import { CommonEditModelComponent } from '../../../shared/common-edit-model/common-edit-model.component';
import { ConformationPopComponent } from '../../../shared/conformation-pop/conformation-pop.component';
//import { CognitoService } from '../../../shared/services/cognito.service';
import { CommonService } from '../../../shared/services/common.service';
import { CommonHttpService } from '../../../shared/services/http-services/common-http.service';
import * as _LODASH from "lodash";
import * as moment from "moment";
import { ViewModalComponent } from '../../../shared/view-modal/view-modal.component';
import { environment } from '../../../../environments/environment';
import { TokenStorageServiceService } from '../../../auth/login/token-storage-service.service';

@Component({
  selector: 'app-inner-customers',
  templateUrl: './inner-customers.component.html',
  styleUrls: ['./inner-customers.component.scss']
})
export class InnerCustomersComponent implements OnInit {
  customerDetails: any = {
    name: '',
    contactName: '',
    contactPhone: ''
	};
	customerOverView: any = {};
  customer_id: any = '';
  wearableFilterForm: FormGroup;
  displayWard: boolean = false;
  header:any;
  @ViewChild('select') private select: MatSelect;
  @ViewChild('weaFaSelect') private weaFaSelect: MatSelect;
  @ViewChild('weaWaSelect') private weaWaSelect: MatSelect;
	constructor(private tokenStorage: TokenStorageServiceService,private routeActivate: ActivatedRoute,private router: Router,private _fb: FormBuilder, private matDialog: MatDialog,private http: HttpClient, private commonHttp: CommonHttpService,  public common: CommonService) {
    this.wardFilterForm = this._fb.group({
      facility_id :[['']],
      facilitySearch: ''
    })
    this.wearableFilterForm = this._fb.group({
      facility_id :[['']],
      ward_id: [['']],
      wardSearch: '',
      facilitySearch: ''
    })
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

	isLoading: {
		facility: boolean,
		wearable: boolean,
		ward: boolean
	} = {
			wearable: false,
      ward: false,
      facility: false,
		};
	
  titleShow = false;
  quickSelection: string = 'week';
  quickBoxValues: {
		screenTime: any;
		lowBattery: any;
		response: any;
		escalations: any;
	  } = {
		  screenTime: {
			previous: {
				week: 2,
				oneMonth: 9,
				threeMonth: 30,
				sixMonth: 60
			},
			present: {
				week: 3,
				oneMonth: 5,
				threeMonth: 60,
				sixMonth: 100
			}
		  },
		  lowBattery: {
			previous: {
				week: 3,
				oneMonth: 10,
				threeMonth: 3,
				sixMonth: 6
			},
			present: {
				week: 2,
				oneMonth: 5,
				threeMonth: 2,
				sixMonth: 1
			}
		  },
		  response: {
			previous: {
				week: 2,
				oneMonth: 9,
				threeMonth: 35,
				sixMonth: 60
			},
			present: {
				week: 3,
				oneMonth: 5,
				threeMonth: 60,
				sixMonth: 100
			}
		  },
		  escalations: {
			previous: {
				week: 2,
				oneMonth: 4,
				threeMonth: 30,
				sixMonth: 60
			},
			present: {
				week: 3,
				oneMonth: 5,
				threeMonth: 60,
				sixMonth: 10
			}
    }
  }
  getFacilityById(id: any){
    if(id !== ''){
      return this.facilityList.find(value => value.facility_id === id).facility_name;
    }
  }

  get facilityIds(){
    if(this.wardFilterForm.get('facility_id').value.length > 1){
      return this.wardFilterForm.get('facility_id').value.filter(value => value !== '');
    }
    return this.wardFilterForm.get('facility_id').value;
  }

  get wearableFacilityIds(){
    if(this.wearableFilterForm.get('facility_id').value.length > 1){
      return this.wearableFilterForm.get('facility_id').value.filter(value => value !== '');
    }
    return this.wearableFilterForm.get('facility_id').value;
  }

  getWardById(id: any){
    if(id !== ''){
      return this.wardsList.find(value => value.ward_id === id).ward_name;
    }
  }

  get wardIds(){
    if(this.wearableFilterForm.get('ward_id').value.length > 1){
      return this.wearableFilterForm.get('ward_id').value.filter(value => value !== '');
    }
    return this.wearableFilterForm.get('ward_id').value;
  }
  wearableWidths: string[] = ['12%', '10%', '12%', '10%', '10%','10%', '10%', '10%', '16%'];
	wearableDisplayedColumns: string[] = ['Facility_name','Ward_name', 'Wearable_serial_number','Wearable_status', 'Battery_status','Wearable_fall','Falls_activity','Night_walk_activity','Critically_low_battery_activity'];
  wearableTableData: any[] = [];

  wardWidths: string[] = ['17%', '11%', '9.5%', '9.5%', '10%', '10%','11%','11%', '11%'];
	wardDisplayedColumns: string[] = ['Facility_name','Ward_name','Wearable_fall','Falls_activity','Night_walk_activity','Critically_low_battery_activity','Screen_time_usage','Resident_profiles_viewed','Notification_response_time'];
  wardTableData: any[] = [];
  
  facilityWidths: string[] = ['20.5%', '10%', '10%', '11.5%', '12%', '12%','12%','12%'];
	facilityDisplayedColumns: string[] = ['Facility_name','Wearable_fall','Falls_activity','Night_walk_activity','Critically_low_battery_activity','Screen_time_usage','Resident_profiles_viewed','Notification_response_time'];
  facilityTableData: any[] = [];
  
  navigate(value: any){
    switch(value.key){
      case 'Ward_name' : 
        if (value.selected.ward_id) {
          localStorage.setItem('previousWPage', 'Customer');
          this.router.navigate(['/ssa/wards', `${value.selected.ward_id}`])
        }
        break;
      case 'Facility_name' : 
        if (value.selected.facility_id) {
          localStorage.setItem('previousFPage', 'Customer');
          this.router.navigate(['/ssa/facilities', `${value.selected.facility_id}`])
        }
        break;
      case 'Customer_name' : 
        if (value.selected.customer_id) {
          this.router.navigate(['/ssa/customers', `${value.selected.customer_id}`])
        }
        break;
    }
  }
  getBatteryPer(percent: any){
		const per = percent.split('%')[0];
		return Math.round(Math.abs(parseFloat(per)));
  }
  getScreenTime(){
		const previous = this.quickBoxValues.screenTime.previous[this.quickSelection];
		const present = this.quickBoxValues.screenTime.present[this.quickSelection];
		const changePercentage = this.changePercentage(present, previous);
		return changePercentage;
  }
	
  getResponseTime(){
		const previous = this.quickBoxValues.response.previous[this.quickSelection];
		const present = this.quickBoxValues.response.present[this.quickSelection];
		const changePercentage = this.changePercentage(present, previous);
		return changePercentage;
  }
  getLowBatteryTime(){
		const previous = this.quickBoxValues.lowBattery.previous[this.quickSelection];
		const present = this.quickBoxValues.lowBattery.present[this.quickSelection];
		const changePercentage = this.changePercentage(present, previous);
		return changePercentage;
  }
  getEscalationTime(){
		const previous = this.quickBoxValues.escalations.previous[this.quickSelection];
		const present = this.quickBoxValues.escalations.present[this.quickSelection];
		const changePercentage = this.changePercentage(present, previous);
		return changePercentage;
  }
  changePercentage(present: number, previous: number){
		let changePercentage: any;
		changePercentage = (present - previous) / present;
		changePercentage = parseFloat((Math.round(changePercentage * 100) / 100).toFixed(2));
		changePercentage = changePercentage > 0 ? `+${changePercentage}%`: `${changePercentage}%`;
		return changePercentage;
  }
	changeTitleShow(value: boolean) {
		this.titleShow = value;
	}
	showToast = false;
	toastMessage: string;
  wardFilterForm: FormGroup;
  filtered: {ward: boolean, wearable: boolean} = {ward: false, wearable: false};
	ngOnInit(): void {
		this.routeActivate.paramMap.subscribe(data => {
      this.customer_id = data.get('customer_id');
    });
    this.header = new HttpHeaders().set(
      "Authorization",
      this.tokenStorage.getToken()
    );
    this.init();
    const previousFPage = localStorage.getItem('previousFPage');
    const previousWPage = localStorage.getItem('previousWPage');
    if(previousFPage === 'Customer'){
      this.goto(1);
    }else if(previousWPage === 'Customer'){
      this.goto(2)
    }
    this.wardFilterForm.valueChanges.subscribe(() => {
      if(this.facilityIds.length === 1){
        if(this.facilityIds[0] !== ''){
          this.wardTableData = this.wardBefore.filter(value => this.facilityIds.includes(value.facility_id))
          this.filtered.ward = true;
        }else{
          this.wardTableData = this.wardBefore;
          if(this.filtered.ward){
            this.clearWardFilters();
          }
        }
      }else if(this.facilityIds.length > 1){
        this.wardTableData = this.wardBefore.filter(value => this.facilityIds.includes(value.facility_id));
        this.filtered.ward = true;
      }
    })
    this.wearableFilterForm.valueChanges.subscribe(() => {
      if(this.wearableFacilityIds.length === 1){
        if(this.wearableFacilityIds[0] !== ''){
          this.wearableTableData = this.wearableBefore.filter(value => this.wearableFacilityIds.includes(value.facility_id))
          this.filtered.wearable = true;
        }else{
          this.wearableTableData = this.wearableBefore;
          if(this.filtered.wearable){
            this.clearWearableFilters();
          }
        }
      }else if(this.wearableFacilityIds.length > 1){
        this.wearableTableData = this.wearableBefore.filter(value => this.wearableFacilityIds.includes(value.facility_id));
        this.filtered.wearable = true;
      }
      if(this.wardIds.length === 1){
        if(this.wardIds[0] !== ''){
          this.wearableTableData = this.wearableTableData.filter(value => this.wardIds.includes(value.ward_id))
          this.filtered.wearable = true;
        }
      }else if(this.wardIds.length > 1){
        this.wearableTableData = this.wearableTableData.filter(value => this.wardIds.includes(value.ward_id));
        this.filtered.wearable = true;
      }
    })
  }
  
  init(){
    this.getCustomer();
    this.getWards();
    this.getWearables();
    this.getFacilities();
    let customers: any = localStorage.getItem('customers');
		customers = JSON.parse(customers);
		customers.itemCount = 9999;
		localStorage.setItem('customers', JSON.stringify(customers));
		
		let facilities: any = localStorage.getItem('facilities');
		facilities = JSON.parse(facilities);
		facilities.itemCount = 9999;
		localStorage.setItem('facilities', JSON.stringify(facilities));
		
		let wards: any = localStorage.getItem('wards');
		wards = JSON.parse(wards);
		wards.itemCount = 9999;
		localStorage.setItem('wards', JSON.stringify(wards));
  }

  getFilterFacilities(){
    this.wardFilterForm.valueChanges.subscribe(() => {
      this.select.close();
    });
    return this.facilityList.filter(value => value.facility_name.toLowerCase().includes(this.wardFilterForm.get('facilitySearch').value.toLowerCase()) || this.facilityIds.includes(value.facility_id));
  }

  getWFilterFacilities(){
    this.wearableFilterForm.valueChanges.subscribe(() => {
      this.weaFaSelect.close();
    });
    return this.facilityList.filter(value => value.facility_name.toLowerCase().includes(this.wearableFilterForm.get('facilitySearch').value.toLowerCase()) || this.wearableFacilityIds.includes(value.facility_id));
  }

  getIFilterWards(wards: any[]){
    this.wearableFilterForm.valueChanges.subscribe(() => {
      this.weaWaSelect.close();
    });
    return wards.filter(value => value.ward_name.toLowerCase().includes(this.wearableFilterForm.get('wardSearch').value.toLowerCase()) || this.wardIds.includes(value.ward_id));
  }

	getContact(contactPhone: {ext: string; phone: string}[]){
		if(contactPhone){
			return contactPhone.map(value => {
				return `${value.ext} ${value.phone}`
			})
		}
	}
	editCustomer() {
		const dialog = this.matDialog.open(CommonEditModelComponent, {
			disableClose: true,
			panelClass: 'dialog-popup',
			width: '920px',
			data: {
				dialogType: 'Edit customer',
				customerId: this.customer_id
			}
		})
		dialog.afterClosed().subscribe(data => {
			if (data) {
        this.init();
        let customers: any = localStorage.getItem('customers');
        customers = JSON.parse(customers);
        customers.itemCount = 99999;
        localStorage.setItem('customers', JSON.stringify(customers));
        let facilities: any = localStorage.getItem('facilities');
        if(facilities){
          facilities = JSON.parse(facilities);
          facilities.itemCount = 9999;
          localStorage.setItem('facilities', JSON.stringify(facilities));
        }
        let wards: any = localStorage.getItem('wards');
        if(wards){
          wards = JSON.parse(wards);
          wards.itemCount = 9999;
          localStorage.setItem('wards', JSON.stringify(wards));
        }
			}
		})
	}
	selectedTab: number = 0;
	goto(tabIndex: number) {
		this.selectedTab = tabIndex;
	}
	onChangeTab(event: any) {
    this.selectedTab = event.index;
    localStorage.setItem('previousFPage', '');
    localStorage.setItem('previousWPage', '');
  }
  facilityList: any[] = [];
  clearWearableFilters(){
    this.filtered.wearable = false;
    this.displayWard = false;
    this.wearableTableData = this.wearableBefore;
    this.wearableFilterForm.patchValue({
      facility_id: [''],
      facilitySearch: '',
      wardSearch: '',
      ward_id: ['']
    })
  }

  showWearableClear(){
    return this.wearableFilterForm.value.facility_id.filter(value => value !== '').length > 0 || this.wearableFilterForm.value.ward_id.filter(value => value !== '').length > 0;
  }

  clearWardFilters(){
    this.filtered.ward = false;
    this.wardTableData = this.wardBefore;
    this.wardFilterForm.patchValue({
      facility_id: [''],
      facilitySearch: ''
    })
  }

  showWardClear(){
    return this.wardFilterForm.value.facility_id.filter(value => value !== '').length > 0;
  }

  getFilterWards(){
    if(this.wearableFilterForm.get('facility_id').value.length < 1){
      return this.wardsList;
    }
    return this.wardsList.filter(value => this.wearableFacilityIds.includes(value.facility_id))
  }
  booleanValue = [true, false];
  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
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
  getFacilities(){
    this.isLoading.facility = true;
    this.http.get(`${environment.apiUrlNew}/facilities/get/`,{headers:this.header}).subscribe((facilities: any) => {
      if(facilities.itemCount > 0){
        forkJoin([this.http.get(`${environment.apiUrlNew}/cdata/getCustomerSummary/`,{headers:this.header}),this.http.get(`${environment.apiUrlNew}/cdata/getFacilitiesSummary/`,{headers:this.header}),this.http.get(`${environment.apiUrlNew}/cdata/getWardsSummary/`,{headers:this.header})]).subscribe((AllStats: any) => {
          facilities.body.forEach((value: any) => {
            const stats = AllStats[0].customers.map(val => {
              return val
            }).find(val => val.customer === value.details.customer_id);
  
            value.summary.reports = {};
            value.summary.reports.facilityCount = stats.facilities_count;
            value.summary.reports.wardCount = stats.wards_count;
            value.summary.reports.CCaregivers = stats.caregivers_count;
            value.summary.reports.CResidents = stats.residents_count;
            value.summary.reports.CWearables = stats.wearables_count;
            
            const facility = AllStats[1].facilities.map(val => {
              return val
            }).find(val => val.facilit_id === value.details.facility_id);
            value.summary.reports.FWardCount = facility.wards_count;
            value.summary.reports.FCaregivers = facility.caregivers_count;
            value.summary.reports.FResidents = facility.residents_count;
            value.summary.reports.FWearables = facility.wearables_count;
          })
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
                    let totalFalls=0;
                    customerKpi.forEach(value => {
                      if(value.KPI){
                        totalFalls=value.KPI.totalFalls;
                        Falls_activity = Falls_activity + parseFloat(value.KPI.FallActivity);
                        Night_walk_activity = Night_walk_activity + parseFloat(value.KPI.NightWalkActivity);
                        Critically_low_battery_activity = Critically_low_battery_activity + parseFloat(value.KPI.CriticallyLowBattery);
                        Screen_time_usage = this.transform(value.KPI.ScreenTimeUsage);//Screen_time_usage + parseFloat(value.KPI.ScreenTimeUsage);
                        Notification_response_time = this.transforms(value.KPI.NotificationResponseTime);// Notification_response_time + parseFloat(value.KPI.NotificationResponseTime);
                        Resident_profiles_viewed = Resident_profiles_viewed + parseFloat(value.KPI.ResidentProfilesViewed);
                       // console.log("this for NTF"+Notification_response_time);
                      }
                    })
                    if(customerKpi.length > 0){
                      value.summary.wearableFall = totalFalls;//Math.round(value.summary.reports.FWardCount * (Falls_activity * 5))
                      value.summary.reports.Falls_activity = Falls_activity < 0.25 ? (Falls_activity < 0.1 ? (Falls_activity > 0.01 ? 0.1 : 0): (Math.round(Falls_activity * 10) / 10).toFixed(1)) : this.roundingTechnique(Falls_activity);
                      value.summary.reports.Night_walk_activity = Night_walk_activity < 0.25 ? (Night_walk_activity < 0.1 ? (Night_walk_activity > 0.01 ? 0.1 : 0): (Math.round(Night_walk_activity * 10) / 10).toFixed(1)) : this.roundingTechnique(Night_walk_activity);
                      value.summary.reports.Critically_low_battery_activity = Critically_low_battery_activity < 0.25 ? (Critically_low_battery_activity < 0.1 ? (Critically_low_battery_activity > 0.01 ? 0.1 : 0): (Math.round(Critically_low_battery_activity * 10) / 10).toFixed(1)) : this.roundingTechnique(Critically_low_battery_activity);
                      value.summary.reports.Screen_time_usage = Screen_time_usage;// < 0.25 ? (Screen_time_usage < 0.1 ? (Screen_time_usage > 0.01 ? 0.1 : 0): (Math.round(Screen_time_usage * 10) / 10).toFixed(1)) : this.roundingTechnique(Screen_time_usage);
                      value.summary.reports.Notification_response_time = Notification_response_time //< 0.25 ? (Notification_response_time < 0.1 ? (Notification_response_time > 0.01 ? 0.1 : 0): (Math.round(Notification_response_time * 10) / 10).toFixed(1)) : this.roundingTechnique(Notification_response_time);
                      value.summary.reports.Resident_profiles_viewed = Resident_profiles_viewed < 0.25 ? (Resident_profiles_viewed < 0.1 ? (Resident_profiles_viewed > 0.01 ? 0.1 : 0): (Math.round(Resident_profiles_viewed * 10) / 10).toFixed(1)) : this.roundingTechnique(Resident_profiles_viewed);
                      //console.log("this for NTF"+ value.summary.reports.Notification_response_time);
                     // console.log("this for NTF"+Notification_response_time);
                    }else{
                      value.summary.reports.Falls_activity = (Falls_activity);
                      value.summary.reports.Night_walk_activity = (Night_walk_activity);
                      value.summary.reports.Critically_low_battery_activity = (Critically_low_battery_activity);
                      value.summary.reports.Screen_time_usage = (Screen_time_usage);
                      value.summary.reports.Notification_response_time = ((Notification_response_time));
                      value.summary.reports.Resident_profiles_viewed = (Resident_profiles_viewed);
                    }
                  }
                })
                const filteredFacilities = facilities.body.filter(value => value.details.customer_id === this.customer_id);
                this.facilityList = filteredFacilities.map(value => {
                  return {
                    facility_id: value.details.facility_id,
                    facility_name: value.details.facility_name
                  }
                }).sort((a:any, b:any) => {
                  return a.facility_name > b.facility_name ? 1: -1;
                })
                this.facilityTableData = filteredFacilities.map(value => {
                  return {
                    Facility_name: value.details.facility_name,
                    facility_id: value.details.facility_id,
                    Wearable_fall: value.summary.wearableFall || '',
                   // fallDiff: this.getRandomInt(1,5),
                   // wearableFallIncreased: this.booleanValue[this.getRandomInt(0,1)],
                    Falls_activity: value.summary.reports.Falls_activity || '',
                    Night_walk_activity: value.summary.reports.Night_walk_activity || '', 
                    Critically_low_battery_activity: value.summary.reports.Critically_low_battery_activity || '', 
                    Screen_time_usage: value.summary.reports.Screen_time_usage || '', 
                    Resident_profiles_viewed: value.summary.reports.Resident_profiles_viewed || '', 
                    Notification_response_time: value.summary.reports.Notification_response_time || '',
                    caregivers: value.summary.reports.CCaregivers || 0,
                    residents: value.summary.reports.CResidents || 0,
                    wearables: value.summary.reports.CWearables || 0,
                    FCaregivers: value.summary.reports.FCaregivers || 0,
                    FResidents: value.summary.reports.FResidents || 0,
                    FWearables: value.summary.reports.FWearables || 0,
                    position: value.summary.position,
                    nFWards: value.summary.reports && value.summary.reports.FWardCount ? value.summary.reports.FWardCount : 0,
                    registeredResidents: value.summary.reports &&  value.summary.reports.WResidents ? value.summary.reports.WResidents : 0,
                    registeredCaregivers: value.summary.reports && value.summary.reports.WCaregivers ? value.summary.reports.WCaregivers : 0,
                    registeredWearables: value.summary.reports && value.summary.reports.WWearables ? value.summary.reports.WWearables : 0,
                  }
                }).sort((a: any,b: any) => {
                  return a.Falls_activity < b.Falls_activity ? 1: -1
                })
                this.facilityTableData=_LODASH.orderBy(this.facilityTableData, ['Falls_activity', 'Night_walk_activity','Critically_low_battery_activity'], ['desc', 'desc','desc']);
                this.isLoading.facility = false;
              }
          })
        })
      }else{
        this.isLoading.facility = false;
      }
    })
  }

  addFacility(){
    const dialog = this.matDialog.open(CommonAddModelComponent, {
      disableClose: true,
      panelClass: 'dialog-popup',
      width: '920px',
      data: {
        dialogType: 'Add new facility',
        customer_id: this.customer_id
      }
    })
    dialog.afterClosed().subscribe(data => {
      if(data){
        this.init();
      }
    })
  }

  addWearable(){
		const dialog = this.matDialog.open(CommonAddModelComponent, {
		  disableClose: true,
		  panelClass: 'dialog-popup',
		  width: '920px',
		  data: {
        dialogType: 'Add new wearable',
        customer_id: this.customer_id
		  }
		})
		dialog.afterClosed().subscribe(data => {
		  if (data) {
			  this.init();
		  }
		})
	}

  addWard(){
    const dialog = this.matDialog.open(CommonAddModelComponent, {
      disableClose: true,
      panelClass: 'dialog-popup',
      width: '920px',
      data: {
        dialogType: 'Add new ward',
        extraFields: true,
        customer_id: this.customer_id
      }
    })
    dialog.afterClosed().subscribe(data => {
      if (data) {
        this.init();
      }
    })
  }

  getCustomer(){
    this.http.get(`${environment.apiUrlNew}/customers/get/`,{headers:this.header}).subscribe((dbCustomers: any) => {
      const customer = dbCustomers.body.find(value => value.details.customer_id === this.customer_id);
      const {customer_name: name, contact_firstname, contact_lastname, customer_address: customerAddress, contact_phone: contactPhone} = customer.details;
      this.customerDetails = {
        name,
        contactName: `${contact_firstname} ${contact_lastname}`,
        contactPhone,
        customerAddress,
        registeredResidents: 0,
        registeredCaregivers: 0,
        registeredWearables: 0,
        nWards: 0,
        nFacilities: 0
      }
      this.http.get(`${environment.apiUrlNew}/cdata/getCustomerSummary/`,{headers:this.header}).subscribe((AllStats: any) => {
          const stats = AllStats.customers.map(val => {
            return val
          }).find(val => val.customer === this.customer_id);

          if(stats){
            this.customerDetails.nFacilities = stats.facilities_count;
            this.customerDetails.nWards = stats.wards_count;
            this.customerDetails.registeredCaregivers = stats.caregivers_count;
            this.customerDetails.registeredResidents = stats.residents_count;
            this.customerDetails.registeredWearables = stats.wearables_count;
          }
        })
    })
  }
  wardsList: any[];
  wardBefore: any[] = [];
  initial: {
    ward: boolean;
    wearable: boolean;
    facility: boolean
  } = {
    ward: true,
    wearable: true,
    facility: true
  }
  getWards(){
    this.isLoading.ward = true;
    this.http.get(`${environment.apiUrlNew}/wards/get/`,{headers:this.header}).subscribe((wards: any) => {
      this.clearWardFilters();
      if(wards.itemCount > 0){
        forkJoin([this.http.get(`${environment.apiUrlNew}/cdata/getCustomerSummary/`,{headers:this.header}),this.http.get(`${environment.apiUrlNew}/cdata/getFacilitiesSummary/`,{headers:this.header}),this.http.get(`${environment.apiUrlNew}/cdata/getWardsSummary/`,{headers:this.header})]).subscribe((AllStats: any) => {
          wards.body.forEach((value: any) => {
            value.summary.reports = {};
            const ward = AllStats[2].wards.map(val => {
            return val
            }).find(val => val.ward_id === value.details.ward_id)
            if(ward){
            value.summary.reports.WResidents = ward.residents_count;
            value.summary.reports.WWearables = ward.wearables_count;
            }
          })
          wards.body.forEach((value: any) => {
            const stats = AllStats[0].customers.map(val => {
              return val
            }).find(val => val.customer === value.details.customer_id);
            value.summary.reports.facilityCount = stats.facilities_count;
            value.summary.reports.wardCount = stats.wards_count;
            value.summary.reports.CCaregivers = stats.caregivers_count;
            value.summary.reports.CResidents = stats.residents_count;
            value.summary.reports.CWearables = stats.wearables_count;
            
            const facility = AllStats[1].facilities.map(val => {
              return val
            }).find(val => val.facilit_id === value.details.facility_id);
            value.summary.reports.FWardCount = facility.wards_count;
            value.summary.reports.FCaregivers = facility.caregivers_count;
            value.summary.reports.FResidents = facility.residents_count;
            value.summary.reports.FWearables = facility.wearables_count;
          })
             
          this.http.get(`${environment.apiUrlNew}/kpi/getYesterdayWSummary/`,{headers:this.header}).subscribe((kpi: any) => {
         // this.http.get(`${environment.apiUrlNew}/kpi/getYesterdayWearableDetails/`).subscribe((kpi: any) => {  
             
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
                if(wards.itemCount > 0){
                  wards.body.forEach((value: any) => {
                    if(kpi.itemCount > 0){
                      const customerKpi = kpi.body.filter(val => val.details.ward_id === value.details.ward_id);
                      value.summary.position = positions.find(val => val.id === value.details.ward_id)? positions.find(val => val.id === value.details.ward_id).position: kpi.itemCount;
                      let Falls_activity = 0;
                      let Night_walk_activity = 0;
                      let Critically_low_battery_activity = 0;
                      let Screen_time_usage = '';
                      let Notification_response_time = '';
                      let Resident_profiles_viewed = 0;
                      let totalFalls=0;
                      customerKpi.forEach(value => {
                        if(value.KPI){
                          totalFalls=value.KPI.totalFalls;
                          Falls_activity = Falls_activity + parseFloat(value.KPI.FallActivity);
                          Night_walk_activity = Night_walk_activity + parseFloat(value.KPI.NightWalkActivity);
                          Critically_low_battery_activity = Critically_low_battery_activity + parseFloat(value.KPI.CriticallyLowBattery);
                          Screen_time_usage = this.transform(value.KPI.ScreenTimeUsage);//Screen_time_usage + parseFloat(value.KPI.ScreenTimeUsage);
                         // Notification_response_time = Notification_response_time + parseFloat(value.KPI.NotificationResponseTime);
                         Notification_response_time = this.transforms(value.KPI.NotificationResponseTime);
                         Resident_profiles_viewed = Resident_profiles_viewed + parseFloat(value.KPI.ResidentProfilesViewed);
                        }
                      })
                      if(customerKpi.length > 0){
                        value.summary.reports.totalFalls=totalFalls;
                        value.summary.reports.Falls_activity = ((Falls_activity/customerKpi.length)) < 0.25 ? (((Falls_activity/customerKpi.length)) < 0.1 ? (((Falls_activity/customerKpi.length)) > 0.01 ? 0.1 : 0): (Math.round(((Falls_activity/customerKpi.length)) * 10) / 10).toFixed(1)) : this.roundingTechnique(((Falls_activity/customerKpi.length)));
                        value.summary.reports.Night_walk_activity = ((Night_walk_activity/customerKpi.length)) < 0.25 ? (((Night_walk_activity/customerKpi.length)) < 0.1 ? (((Night_walk_activity/customerKpi.length)) > 0.01 ? 0.1 : 0): (Math.round(((Night_walk_activity/customerKpi.length)) * 10) / 10).toFixed(1)) : this.roundingTechnique(((Night_walk_activity/customerKpi.length)));
                        value.summary.reports.Critically_low_battery_activity = ((Critically_low_battery_activity/customerKpi.length)) < 0.25 ? (((Critically_low_battery_activity/customerKpi.length)) < 0.1 ? (((Critically_low_battery_activity/customerKpi.length)) > 0.01 ? 0.1 : 0): (Math.round(((Critically_low_battery_activity/customerKpi.length)) * 10) / 10).toFixed(1)) : this.roundingTechnique(((Critically_low_battery_activity/customerKpi.length)));
                        value.summary.reports.Screen_time_usage = Screen_time_usage;//((Screen_time_usage/customerKpi.length)) < 0.25 ? (((Screen_time_usage/customerKpi.length)) < 0.1 ? (((Screen_time_usage/customerKpi.length)) > 0.01 ? 0.1 : 0): (Math.round(((Screen_time_usage/customerKpi.length)) * 10) / 10).toFixed(1)) : this.roundingTechnique(((Screen_time_usage/customerKpi.length)));
                        value.summary.reports.Notification_response_time = Notification_response_time;//(((Notification_response_time/customerKpi.length))) < 0.25 ? ((((Notification_response_time/customerKpi.length))) < 0.1 ? ((((Notification_response_time/customerKpi.length))) > 0.01 ? 0.1 : 0): (Math.round((((Notification_response_time/customerKpi.length))) * 10) / 10).toFixed(1)) : this.roundingTechnique((((Notification_response_time/customerKpi.length))));
                        value.summary.reports.Resident_profiles_viewed = ((Resident_profiles_viewed/customerKpi.length)) < 0.25 ? (((Resident_profiles_viewed/customerKpi.length)) < 0.1 ? (((Resident_profiles_viewed/customerKpi.length)) > 0.01 ? 0.1 : 0): (Math.round(((Resident_profiles_viewed/customerKpi.length)) * 10) / 10).toFixed(1)) : this.roundingTechnique(((Resident_profiles_viewed/customerKpi.length)));
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
                  const filteredWards = wards.body.filter(value => value.details.customer_id === this.customer_id);
                  this.wardsList = filteredWards.map(value => {
                    return {
                      ward_id: value.details.ward_id,
                      ward_name: value.details.ward_name,
                      facility_id: value.details.facility_id
                    }
                  }).sort((a:any, b:any) => {
                    return a.ward_name > b.ward_name ? 1: -1;
                  })
                  this.wardTableData = filteredWards.map(value => {
                    return {
                      Facility_name: value.details.facility_name,
                      facility_id: value.details.facility_id,
                      Ward_name: value.details.ward_name,
                      ward_id: value.details.ward_id,
                      Wearable_fall: value.summary.reports.totalFalls ? (value.summary.reports.totalFalls) : '',
                      Falls_activity: value.summary.reports.Falls_activity || '',
                      Night_walk_activity: value.summary.reports.Night_walk_activity || '', 
                      Critically_low_battery_activity: value.summary.reports.Critically_low_battery_activity || '', 
                      Screen_time_usage: value.summary.reports.Screen_time_usage || '', 
                      Resident_profiles_viewed: value.summary.reports.Resident_profiles_viewed ||'', 
                      Notification_response_time: value.summary.reports.Notification_response_time || '',
                      nFacilities: value.summary.reports.facilityCount || 0,
                      nWards: value.summary.reports.wardCount || 0,
                      nFWards: value.summary.reports.FWardCount || 0,
                     // fallDiff: this.getRandomInt(1,5),
                      //wearableFallIncreased: this.booleanValue[this.getRandomInt(0,1)],
                      caregivers: value.summary.reports.CCaregivers || 0,
                      residents: value.summary.reports.CResidents || 0,
                      wearables: value.summary.reports.CWearables || 0,
                      FCaregivers: value.summary.reports.FCaregivers || 0,
                      FResidents: value.summary.reports.FResidents || 0,
                      FWearables: value.summary.reports.FWearables || 0,
                      position: value.summary.position,
                      registeredResidents: value.summary.reports &&  value.summary.reports.WResidents ? value.summary.reports.WResidents : 0,
                      registeredCaregivers: value.summary.reports && value.summary.reports.WCaregivers ? value.summary.reports.WCaregivers : 0,
                      registeredWearables: value.summary.reports && value.summary.reports.WWearables ? value.summary.reports.WWearables : 0,
                    }
                  }).sort((a: any,b: any) => {
                    return a.Falls_activity < b.Falls_activity ? 1: -1
                  });
                  this.wardTableData=_LODASH.orderBy(this.wardTableData, ['Falls_activity', 'Night_walk_activity','Critically_low_battery_activity'], ['desc', 'desc','desc']);
                  this.wardBefore = this.wardTableData;
                }
              })
              this.isLoading.ward = false;
        })
      }else{
        this.isLoading.ward = false;
      }
      this.initial.ward = false;
    })
  }
  wearableBefore: any[] = [];
  getWearables(){
    this.isLoading.wearable = true;
		this.http.get(`${environment.apiUrlNew}/wearables/get/`,{headers:this.header}).subscribe((wearables: any) => {
      this.clearWearableFilters();
      if(wearables.itemCount > 0){
        forkJoin([this.http.get(`${environment.apiUrlNew}/cdata/getCustomerSummary/`,{headers:this.header}),this.http.get(`${environment.apiUrlNew}/cdata/getFacilitiesSummary/`,{headers:this.header}),this.http.get(`${environment.apiUrlNew}/cdata/getWardsSummary/`,{headers:this.header})]).subscribe((AllStats: any) => {
          wearables.body.forEach((value: any) => {
            value.summary.reports = {};
            const ward = AllStats[2].wards.map(val => {
            return val
            }).find(val => val.ward_id === value.details.ward_id)
            if(ward){
            value.summary.reports.WResidents = ward.residents_count;
            value.summary.reports.WWearables = ward.wearables_count;
            }
          })
          wearables.body.forEach((value: any) => {
            const stats = AllStats[0].customers.map(val => {
              return val
            }).find(val => val.customer === value.details.customer_id);
  
            value.summary.reports.facilityCount = stats.facilities_count;
            value.summary.reports.wardCount = stats.wards_count;
            value.summary.reports.CCaregivers = stats.caregivers_count;
            value.summary.reports.CResidents = stats.residents_count;
            value.summary.reports.CWearables = stats.wearables_count;
          
            const stats2 = AllStats[1].facilities.map(val => {
              return val
            }).find(val => val.facilit_id === value.details.facility_id);
            if(stats2){
            value.summary.reports.FWardCount = stats2.wards_count;
            value.summary.reports.FCaregivers = stats2.caregivers_count;
            value.summary.reports.FResidents = stats2.residents_count;
            value.summary.reports.FWearables = stats2.wearables_count;
            }
          })
              if(wearables.itemCount > 0){
               // this.http.get(`${environment.apiUrlNew}/kpi/getYesterdayWSummary/`).subscribe((kpi: any) => {
                  this.http.get(`${environment.apiUrlNew}/kpi/getYesterdayWearableDetails/`,{headers:this.header}).subscribe((kpi: any) => {  
                let positions: any;
                  if(kpi.itemCount > 0){
                    positions = kpi.body.map((val: any, i: number) => {
                      return {
                      id: val.details.wearable_id,
                      position: i
                      }
                    })
                    }else{
                      positions = [];
                    }
                  wearables.body.forEach((value: any) => {
                    if(kpi.itemCount > 0){
                      const customerKpi = kpi.body.filter(val => val.details.wearable_id === value.details.wearable_id);
                      value.summary.position = positions.find(val => val.id === value.details.wearable_id)? positions.find(val => val.id === value.details.wearable_id).position : kpi.itemCount;
                      let Falls_activity = 0;
                      let Night_walk_activity = 0;
                      let totalFalls=0;
                      let Critically_low_battery_activity = 0;
                      let Screen_time_usage = '';
                      let Notification_response_time = '';
                      let Resident_profiles_viewed = 0;
                      customerKpi.forEach(value => {
                        if(value.KPI){
                          totalFalls=value.KPI.totalFalls;
                          Falls_activity = Falls_activity + parseFloat(value.KPI.FallActivity);
                          Night_walk_activity = Night_walk_activity + parseFloat(value.KPI.NightWalkActivity);
                          Critically_low_battery_activity = Critically_low_battery_activity + parseFloat(value.KPI.CriticallyLowBattery);
                          Screen_time_usage =this.transform(value.KPI.ScreenTimeUsage);// Screen_time_usage + parseFloat(value.KPI.ScreenTimeUsage);
                          Notification_response_time = this.transforms(value.KPI.NotificationResponseTime);//Notification_response_time + parseFloat(value.KPI.NotificationResponseTime);
                          Resident_profiles_viewed = Resident_profiles_viewed + parseFloat(value.KPI.ResidentProfilesViewed);
                        }
                      })
                      if(customerKpi.length > 0){
                        value.summary.reports.totalFalls=totalFalls; 
                        value.summary.reports.Falls_activity = ((Falls_activity/customerKpi.length)) < 0.25 ? (((Falls_activity/customerKpi.length)) < 0.1 ? (((Falls_activity/customerKpi.length)) > 0.01 ? 0.1 : 0): (Math.round(((Falls_activity/customerKpi.length)) * 10) / 10).toFixed(1)) : this.roundingTechnique(((Falls_activity/customerKpi.length)));
                        value.summary.reports.Night_walk_activity = ((Night_walk_activity/customerKpi.length)) < 0.25 ? (((Night_walk_activity/customerKpi.length)) < 0.1 ? (((Night_walk_activity/customerKpi.length)) > 0.01 ? 0.1 : 0): (Math.round(((Night_walk_activity/customerKpi.length)) * 10) / 10).toFixed(1)) : this.roundingTechnique(((Night_walk_activity/customerKpi.length)));
                        value.summary.reports.Critically_low_battery_activity = ((Critically_low_battery_activity/customerKpi.length)) < 0.25 ? (((Critically_low_battery_activity/customerKpi.length)) < 0.1 ? (((Critically_low_battery_activity/customerKpi.length)) > 0.01 ? 0.1 : 0): (Math.round(((Critically_low_battery_activity/customerKpi.length)) * 10) / 10).toFixed(1)) : this.roundingTechnique(((Critically_low_battery_activity/customerKpi.length)));
                        value.summary.reports.Screen_time_usage = Screen_time_usage;//((Screen_time_usage/customerKpi.length)) < 0.25 ? (((Screen_time_usage/customerKpi.length)) < 0.1 ? (((Screen_time_usage/customerKpi.length)) > 0.01 ? 0.1 : 0): (Math.round(((Screen_time_usage/customerKpi.length)) * 10) / 10).toFixed(1)) : this.roundingTechnique(((Screen_time_usage/customerKpi.length)));
                        value.summary.reports.Notification_response_time = Notification_response_time//(((Notification_response_time/customerKpi.length))) < 0.25 ? ((((Notification_response_time/customerKpi.length))) < 0.1 ? ((((Notification_response_time/customerKpi.length))) > 0.01 ? 0.1 : 0): (Math.round((((Notification_response_time/customerKpi.length))) * 10) / 10).toFixed(1)) : this.roundingTechnique((((Notification_response_time/customerKpi.length))));
                        value.summary.reports.Resident_profiles_viewed = ((Resident_profiles_viewed/customerKpi.length)) < 0.25 ? (((Resident_profiles_viewed/customerKpi.length)) < 0.1 ? (((Resident_profiles_viewed/customerKpi.length)) > 0.01 ? 0.1 : 0): (Math.round(((Resident_profiles_viewed/customerKpi.length)) * 10) / 10).toFixed(1)) : this.roundingTechnique(((Resident_profiles_viewed/customerKpi.length)));
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

                  const filteredWearables = wearables.body.filter(value => value.details.customer_id === this.customer_id);
                  this.wearableTableData = filteredWearables.map(value => {
                    return {
                      Facility_name: value.details.facility_name,
                      facility_id: value.details.facility_id,
                      ward_id: value.details.ward_id,
                      Battery_status: parseInt(value.details.battery_status),
                      Wearable_status: value.details.wearable_status,
                      Ward_name: value.details.ward_name,
                      Wearable_serial_number: value.details.wearable_sno,
                      Wearable_fall: value.details.wearable_status !== 'Ready to use' ? ( value.summary.reports.totalFalls) || '' : '',
                     // Wearable_fall: value.details.wearable_status !== 'Ready to use' ? (value.summary.reports.Falls_activity*5) || '' : '',
                      //fallDiff: this.getRandomInt(1,5),
                     // wearableFallIncreased: this.booleanValue[this.getRandomInt(0,1)],
                      Falls_activity: value.details.wearable_status !== 'Ready to use' ? value.summary.reports.Falls_activity || '' : '',
                      Night_walk_activity: value.details.wearable_status !== 'Ready to use' ? value.summary.reports.Night_walk_activity || '' : '', 
                      Critically_low_battery_activity: value.details.wearable_status !== 'Ready to use' ? value.summary.reports.Critically_low_battery_activity || '': '',
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
                      registeredResidents: value.summary.reports &&  value.summary.reports.WResidents ? value.summary.reports.WResidents : 0,
                      registeredCaregivers: value.summary.reports && value.summary.reports.WCaregivers ? value.summary.reports.WCaregivers : 0,
                      registeredWearables: value.summary.reports && value.summary.reports.WWearables ? value.summary.reports.WWearables : 0,
                    }
               }).sort((a: any,b: any) => {
                    return a.Falls_activity < b.Falls_activity ? 1: -1
                  })
                  this.wearableTableData=_LODASH.orderBy(this.wearableTableData, ['Falls_activity', 'Night_walk_activity','Critically_low_battery_activity'], ['desc', 'desc','desc']);
                  this.wearableBefore = this.wearableTableData;
                })
              }
              this.isLoading.wearable = false;
            })
      }else{
        this.isLoading.wearable = false;
      }
		})
  }
}
