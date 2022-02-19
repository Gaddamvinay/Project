import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Ward, Residentsprof, Caregiver, Room, Resident } from '../../../shared/interfaces';
import { CommonHttpService } from '../../../shared/services/http-services/common-http.service';
import { CommonService } from '../../../shared/services/common.service';
import { LoadingState } from '../../../caregiver/resident-view-new/resident-view/overview/overview.component';
import { TimeFormatService } from '../../../shared/services/time-format.service';
import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
	ChartComponent,
	ApexAxisChartSeries,
	ApexChart,
	ApexDataLabels,
	ApexMarkers,
	ApexTitleSubtitle,
	ApexYAxis,
	ApexXAxis,
	ApexTooltip,
	ApexStroke,
	ApexAnnotations,
	ApexGrid,
	ApexLegend,
	ApexPlotOptions,
} from 'ng-apexcharts';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { TokenStorageServiceService } from '../../../auth/login/token-storage-service.service';

export type ChartOptions = {
	series: ApexAxisChartSeries;
	chart: ApexChart;
	dataLabels: ApexDataLabels;
	markers: ApexMarkers;
	title: ApexTitleSubtitle;
	fill: any;
	yaxis: ApexYAxis;
	xaxis: ApexXAxis;
	tooltip: ApexTooltip;
	stroke: ApexStroke;
	annotations: ApexAnnotations;
	colors: any;
	grid: ApexGrid;
	toolbar: any;
	legend: ApexLegend;
	plotOptions: ApexPlotOptions;
};
@Component({
  selector: 'app-residents-summary-dash',
  templateUrl: './residents-summary.component.html',
  styleUrls: ['./residents-summary.component.scss']
})
export class ResidentsSummaryDashComponent implements OnInit {

  public chartOptions: Partial<ChartOptions>;
	public chartOptions2: Partial<ChartOptions>;
	public chartOptions3: Partial<ChartOptions>;
	public chartOptions4: Partial<ChartOptions>;
	public totalResidents = 0;
	@Input() type: string = 'Dashboard';
	@Input() titleShow: boolean = false;
	@Output() changeTitleShow = new EventEmitter();
	@Input() forType: string = "";

	loadingStateType = LoadingState;
	graphLoading: LoadingState = LoadingState.LOADING;
	header:any;
	customProgressDates: any;
	progressDates: any = {
		startDate: moment().subtract(7, 'days'),
		endDate: moment()
	};
	momentToday = moment();
	showFilter = false;
	dateInput = this.progressDates;
	wards: Ward[] = [
		{ value: 'Ward A', viewValue: 'Ward A' },
		{ value: 'Ward B', viewValue: 'Ward B' },
		{ value: 'Ward C', viewValue: 'Ward C' },
	];
	selectedWard = this.wards[0].value;

	intervals: Ward[] = [
		{ value: 'Last 7 days', viewValue: 'Last 7 days' },
		{ value: 'Custom range', viewValue: 'Custom range' },
		// { value: 'Last 1 month', viewValue: 'Last 1 month' },
	];
	selectedInterval = this.intervals[0].value;

	residentsprof: Residentsprof[] = [
		{ value: 'Residents prof…', viewValue: 'Residents prof…' },
		{ value: 'Ward B', viewValue: 'Ward B' },
		{ value: 'Ward C', viewValue: 'Ward C' },
	];
	selectedResidentsprof = this.residentsprof[0].value;

	totalFall: Residentsprof[] = [
		{ value: 'fall report', viewValue: 'Fall report' },
		{ value: 'night walk report', viewValue: 'Night walk report' },
		{ value: 'active report', viewValue: 'Active report' },
		{ value: 'assessment report', viewValue: 'Assessment report' },
	];
	selectedFall = this.totalFall[0].value;

	residents: Caregiver[] = [
		{ value: 'Smith H', viewValue: 'Smith H' },
		{ value: 'Ward B', viewValue: 'Ward B' },
		{ value: 'Ward C', viewValue: 'Ward C' },
	];
	selectedResident = this.residents[0].value;

	rooms: Caregiver[] = [
		{ value: 'Room 1', viewValue: 'Room 1' },
		{ value: 'Ward B', viewValue: 'Ward B' },
		{ value: 'Ward C', viewValue: 'Ward C' },
	];
	selectedRoom = this.rooms[0].value;

	wardSelect2: Residentsprof[] = [
		{ value: 'All', viewValue: 'All' },
		{ value: 'Ward B', viewValue: 'Ward B' },
		{ value: 'Ward C', viewValue: 'Ward C' },
	];
	selectedWard2 = this.wardSelect2[0].value;

	caregivers: Caregiver[] = [
		{ value: 'All caregivers', viewValue: 'All caregivers' },
		{ value: 'Ward B', viewValue: 'Ward B' },
		{ value: 'Ward C', viewValue: 'Ward C' },
	];
	selectedCaregiver = this.caregivers[0].value;
	eventEmit() {
		this.titleShow = !this.titleShow;
		this.changeTitleShow.emit(this.titleShow);
	}
	role = '';
	constructor(private tokenStorage: TokenStorageServiceService, private http: HttpClient,private routeActivate: ActivatedRoute ,public common: CommonService, 
		private timeFormat: TimeFormatService, private router: Router) {
		let user: any = localStorage.getItem('loggedInUser');
		if(user){
			user = JSON.parse(user);
			this.role = user.user_type;
		}
		  this.chartOptions2 = {
        series: [
          {
            name: 'Questionnaire',
            data: [10, 30, 50, 60, 70, 30, 70],
          },
          {
            name: 'Physio tests',
            data: [40, 15, 20, 18, 32, 40, 70]
          },
        ],
        chart: {
          type: 'line',
          height: 320,
          animations: {
            enabled: false,
          },
          zoom: {
            enabled: false,
            type: 'x',
          },
          toolbar: {
            show: false
          }
        },
        // title: {
        //   text: "Screen time usage (Hours)",
        //   align: 'center',
        //   margin: 0,
        //   offsetX: 0,
        //   offsetY: 0,
        //   style: {
        //     fontSize:  '18px',
        //     fontWeight:  600,
        //     fontFamily:  'Whitney A,Whitney B,Helvetica,Arial,sans-serif',
        //     color:  '#434342'
        //   },
        // },
        dataLabels: {
          enabled: false,
        },
        legend: {
          show: true,
          position: "bottom",
          fontSize: '14px',
          fontFamily: 'Whitney A,Whitney B,Helvetica,Arial,sans-serif',
          fontWeight: 500,
          offsetY: 8,
		  itemMargin: {
			horizontal: 5,
			vertical: 10
		},
          markers: {
            width: 15,
            height: 15,
            radius: 0,
            offsetX: 0,
            offsetY: 0
          },
        },
        xaxis: {
          type: 'datetime',
          title: {
            text: 'Date',
            offsetX: 0,
            offsetY: 12,
            style: {
              color: '#434342',
              fontSize: '14px',
              fontFamily: 'Whitney A,Whitney B,Helvetica,Arial,sans-serif',
              fontWeight: 500,
              cssClass: 'apexcharts-xaxis-title',
            },
          },
          categories: [
            '7 Dec 2020',
            '8 Dec 2020',
            '9 Dec 2020',
            '10 Dec 2020',
            '11 Dec 2020',
            '12 Dec 2020',
            '13 Dec 2020',
          ],
          labels: {
            style: {
              colors: '#aaa093',
              fontSize: '12px',
              fontFamily: 'Whitney A,Whitney B,Helvetica,Arial,sans-serif',
              fontWeight: 500,
              cssClass: 'apexcharts-xaxis-label',
            },
          },
        },
        markers: {
          size: 5
        },
        yaxis: {
          title: {
            text: 'Number of assessments',
            offsetX: -6,
            offsetY: 0,
            style: {
              color: '#434342',
              fontSize: '14px',
              fontFamily: 'Whitney A,Whitney B,Helvetica,Arial,sans-serif',
              fontWeight: 500,
              cssClass: 'apexcharts-xaxis-title',
            },
		  },
		  min: 0,
		  tickAmount: 4,
          labels: {
			formatter: (val: any, index: any) =>{
				return '' + val.toFixed(0)
			},
            style: {
              colors: '#aaa093',
              fontSize: '12px',
              fontFamily: 'Whitney A,Whitney B,Helvetica,Arial,sans-serif',
              fontWeight: 500,
              cssClass: 'apexcharts-xaxis-label',
            },
          },
        },
        tooltip: {
          x: {
            format: 'dd/MM/yyyy',
          },
          y: {
            formatter: function (val: any) {
              return val;
            },
		  },
		  fixed: {
			enabled: false,
			position: 'topRight',
			offsetX: 0,
			offsetY: 0,
		  },
        },
        colors: ['#025174', '#bfb4ae', '#87657d', '#8cab88'],
        // stroke: {
        // 	show: true,
        // 	curve: 'straight',
        // 	lineCap: 'butt',
        // 	colors: undefined,
        // 	width: 5,
        // 	dashArray: [0, 0, 0, 10],
        // },
        fill: {
          colors: ['#025174'],
          opacity: 1,
          type: 'solid',
          gradient: {
            shade: 'light',
            type: 'vertical',
            shadeIntensity: 1,
            gradientToColors: undefined,
            inverseColors: false,
            opacityFrom: 1,
            opacityTo: 1,
            stops: [1],
          },
        },
      };
	}

	ngOnInit(): void {
		this.getLast7days();
	}
	getHeaders(){
		this.header = new HttpHeaders().set(
		  "Authorization",
		  this.tokenStorage.getToken()
		);
	  }
	getLast7days(){
		this.selectedInterval = 'Last 7 days';
		if(this.type === 'ward' && this.role === 'SSA'){
		  this.routeActivate.paramMap.subscribe(data => {
			this.wardId = data.get('wardId');
			this.getKPIWardData('week');
		  });
		}else if(this.type === 'facility' && this.role === 'SSA'){
		  this.routeActivate.paramMap.subscribe(data => {
			this.facilityId = data.get('facilityId');
			this.getKPIFacilityData('week');
		  });
		}else if(this.type === 'customer' && this.role === 'SSA'){
		  this.routeActivate.paramMap.subscribe(data => {
			this.customerId = data.get('customer_id');
			this.getKPICustomerData('week');
		  });
		}else if(this.type === 'dashboard' && this.role === 'SSA'){
		  this.getKPIDashboardData('week');
		}else if(this.type === 'ward' && this.role === 'CA'){
		  this.routeActivate.paramMap.subscribe(data => {
			this.wardId = data.get('wardId');
			this.getKPIWardData('week');
		  });
		}else if(this.type === 'facility' && this.role === 'CA'){
		  this.routeActivate.paramMap.subscribe(data => {
			this.facilityId = data.get('facilityId');
			this.getKPIFacilityData('week');
		  });
		}else if(this.type === 'customer' && this.role === 'CA'){
		  const user = JSON.parse(localStorage.getItem('loggedInUser'));
      this.customerId = user.customers.customer_id;
		  this.getKPICustomerData('week');
		}else if(this.type === 'ward' && this.role === 'FA'){
			this.routeActivate.paramMap.subscribe(data => {
			  this.wardId = data.get('wardId');
			  this.getKPIWardData('week');
			});
		  }else if(this.type === 'facility' && this.role === 'FA'){
			  const user = JSON.parse(localStorage.getItem('loggedInUser'));
        this.facilityId = user.facilities.facility_id;
			  this.getKPIFacilityData('week');
		  }else if(this.type === 'ward' && this.role === 'WA'){
			let user: any = localStorage.getItem('loggedInUser');
			if(user){
				user = JSON.parse(user);
				this.wardId = user.wards[0].ward_id;
				this.getKPIWardData('week');
			}
		  }
	  }
	  
	rounded(numb: number){
		const round = Math.round(numb);
		return Math.ceil(round / 5) * 5;
	}
	isLoading = false;
	wardId = '';
	isDataAvailable = false;
	getKPIWardData(interval: string){
		this.isLoading = true;
		this.getHeaders();
		if(interval === 'week'){
			this.http.get(`${environment.apiUrlNew}/kpi/getSevenDaysWSummary/?ward_id=${this.wardId}`,{headers:this.header}).subscribe((data: any) => {
				if(data.itemCount > 0){
					let KPIData = data.body.filter(value => value.details.ward_id === this.wardId)
										.sort((a,b) => {
										return new Date(a.details.Rdate).getTime() > new Date(b.details.Rdate).getTime() ? 1 : -1;
						});
					;
					const categories = KPIData.map((value: any) => {
					return value.details.Rdate;
					})
					const Questionnaire = KPIData.map((value: any, i: number )=> {
					return value.Graph.Questionnaires_performed
					})
					let max = 0;
					if(KPIData.length > 0){
						this.isDataAvailable = true;
					}
					KPIData.forEach(val => {
						if(parseInt(val.Graph.Questionnaires_performed) > max){
							max = parseInt(val.Graph.Questionnaires_performed);
						}
						if(parseInt(val.Graph.PhysioTests_performed) > max){
							max = parseInt(val.Graph.PhysioTests_performed)
						}
						})
					const physioTest = KPIData.map((value: any, i: number ) => {
					return value.Graph.PhysioTests_performed;
					})
					this.chartOptions2.series[0].data = physioTest;
					this.chartOptions2.series[1].data = Questionnaire;
					this.chartOptions2.xaxis.categories = categories;
					this.customProgressDates = {
						startDate: categories[categories.length - 1],
						endDate: categories[0]
					}
					this.chartOptions2.yaxis.max = this.rounded(max);
					if(this.rounded(max)==0 ){
						this.isDataAvailable = false;
					  }else  {
					 this.isDataAvailable = true;
				   
					  }
				}
				this.isLoading = false;
			})
		  }else if(interval === 'month'){
			this.http.get(`${environment.apiUrlNew}/kpi/getOneMonthWSummary/?ward_id=${this.wardId}`,{headers:this.header}).subscribe((data: any) => {
			if(data.itemCount > 0){
				let KPIData = data.body.filter(value => value.details.ward_id === this.wardId)
									.sort((a,b) => {
									return new Date(a.details.Rdate).getTime() > new Date(b.details.Rdate).getTime() ? 1 : -1;
					});
				;
				const categories = KPIData.map((value: any) => {
				return value.details.Rdate;
				})
				const Questionnaire = KPIData.map((value: any, i: number )=> {
				return value.Graph.Questionnaires_performed
				})
				let max = 0;
				if(KPIData.length > 0){
					this.isDataAvailable = true;
				}
				KPIData.forEach(val => {
					if(parseInt(val.Graph.Questionnaires_performed) > max){
						max = parseInt(val.Graph.Questionnaires_performed);
					}
					if(parseInt(val.Graph.PhysioTests_performed) > max){
						max = parseInt(val.Graph.PhysioTests_performed)
					}
					})
				const physioTest = KPIData.map((value: any, i: number ) => {
				return value.Graph.PhysioTests_performed;
				})
				this.chartOptions2.series[0].data = physioTest;
				this.chartOptions2.series[1].data = Questionnaire;
				this.chartOptions2.xaxis.categories = categories;
				this.customProgressDates = {
					startDate: categories[categories.length - 1],
					endDate: categories[0]
				}
				this.chartOptions2.yaxis.max = this.rounded(max);
				if(this.rounded(max)==0 ){
					this.isDataAvailable = false;
				  }else  {
				 this.isDataAvailable = true;
			   
				  }
			}
			this.isLoading = false;
			})
		  }else if(interval === 'threeMonth'){
			this.http.get(`${environment.apiUrlNew}/kpi/getThreeMonthsWSummary/?ward_id=${this.wardId}`,{headers:this.header}).subscribe((data: any) => {
			if(data.itemCount > 0){
				let KPIData = data.body.filter(value => value.details.ward_id === this.wardId)
									.sort((a,b) => {
									return new Date(a.details.Rdate).getTime() > new Date(b.details.Rdate).getTime() ? 1 : -1;
					});
				;
				let categories = KPIData.map((value: any) => {
				return value.details.Rdate;
				})
				let Questionnaire = KPIData.map((value: any, i: number )=> {
				return value.Graph.Questionnaires_performed
				})
				let max = 0;
				if(KPIData.length > 0){
					this.isDataAvailable = true;
				}
				KPIData.forEach(val => {
					if(parseInt(val.Graph.Questionnaires_performed) > max){
						max = parseInt(val.Graph.Questionnaires_performed);
					}
					if(parseInt(val.Graph.PhysioTests_performed) > max){
						max = parseInt(val.Graph.PhysioTests_performed)
					}
					})
				let physioTest = KPIData.map((value: any, i: number ) => {
				return value.Graph.PhysioTests_performed;
				})
				//physioTest = physioTest.filter((val: any, i: number) => ((i - 1)%3 === 0 && i > 1) || i === 0 || i === KPIData.length - 1);
				//Questionnaire = Questionnaire.filter((val: any, i: number) => ((i - 1)%3 === 0 && i > 1) || i === 0 || i === KPIData.length - 1);
				//categories = categories.filter((val: any, i: number) => ((i - 1)%3 === 0 && i > 1) || i === 0 || i === KPIData.length - 1)
				this.chartOptions2.series[0].data = physioTest;
				this.chartOptions2.series[1].data = Questionnaire;
				this.chartOptions2.xaxis.categories = categories;
				this.customProgressDates = {
					startDate: categories[categories.length - 1],
					endDate: categories[0]
				}
				this.chartOptions2.yaxis.max = this.rounded(max);
				if(this.rounded(max)==0 ){
					this.isDataAvailable = false;
				  }else  {
				 this.isDataAvailable = true;
			   
				  }
			}
			this.isLoading = false;
			})
		  }else if(interval === 'sixMonth'){
			this.http.get(`${environment.apiUrlNew}/kpi/getSixMonthsWSummary/?ward_id=${this.wardId}`,{headers:this.header}).subscribe((data: any) => {
			if(data.itemCount > 0){
				let KPIData = data.body.filter(value => value.details.ward_id === this.wardId)
									.sort((a,b) => {
									return new Date(a.details.Rdate).getTime() > new Date(b.details.Rdate).getTime() ? 1 : -1;
					});
				;
				let categories = KPIData.map((value: any) => {
				return value.details.Rdate;
				})
				let Questionnaire = KPIData.map((value: any, i: number )=> {
				return value.Graph.Questionnaires_performed
				})
				let max = 0;
				if(KPIData.length > 0){
					this.isDataAvailable = true;
				}
				KPIData.forEach(val => {
					if(parseInt(val.Graph.Questionnaires_performed) > max){
						max = parseInt(val.Graph.Questionnaires_performed);
					}
					if(parseInt(val.Graph.PhysioTests_performed) > max){
						max = parseInt(val.Graph.PhysioTests_performed)
					}
					})
				let physioTest = KPIData.map((value: any, i: number ) => {
				return value.Graph.PhysioTests_performed;
				})
				//physioTest = physioTest.filter((val: any, i: number) => ((i - 1)%6 === 0 && i > 1) || i === 0 || i === KPIData.length - 1);
				//Questionnaire = Questionnaire.filter((val: any, i: number) => ((i - 1)%6 === 0 && i > 1) || i === 0 || i === KPIData.length - 1);
				//categories = categories.filter((val: any, i: number) => ((i - 1)%6 === 0 && i > 1) || i === 0 || i === KPIData.length - 1)
				this.chartOptions2.series[0].data = physioTest;
				this.chartOptions2.series[1].data = Questionnaire;
				this.chartOptions2.xaxis.categories = categories;
				this.customProgressDates = {
					startDate: categories[categories.length - 1],
					endDate: categories[0]
				}
				this.chartOptions2.yaxis.max = this.rounded(max);
				if(this.rounded(max)==0 ){
					this.isDataAvailable = false;
				  }else  {
				 this.isDataAvailable = true;
			   
				  }
			}
			this.isLoading = false;
			})
		  }
	}
	facilityId = '';
	getKPIFacilityData(interval: string){
		this.isLoading = true;
		this.getHeaders();
		if(interval === 'week'){
			this.http.get(`${environment.apiUrlNew}/kpi/getSevenDaysFSummary/?facility_id=${this.facilityId}`,{headers:this.header}).subscribe((data: any) => {
				if(data.itemCount > 0){
					let KPIData = data.body.filter(value => value.details.facility_id === this.facilityId)
										.sort((a,b) => {
										return new Date(a.details.Rdate).getTime() > new Date(b.details.Rdate).getTime() ? 1 : -1;
						});
					;
					const categories = KPIData.map((value: any) => {
					return value.details.Rdate;
					})
					const Questionnaire = KPIData.map((value: any, i: number )=> {
					return value.Graph.Questionnaires_performed
					})
					let max = 0;
					if(KPIData.length > 0){
						this.isDataAvailable = true;
					}
					KPIData.forEach(val => {
						if(parseInt(val.Graph.Questionnaires_performed) > max){
							max = parseInt(val.Graph.Questionnaires_performed);
						}
						if(parseInt(val.Graph.PhysioTests_performed) > max){
							max = parseInt(val.Graph.PhysioTests_performed)
						}
						})
					const physioTest = KPIData.map((value: any, i: number ) => {
					return value.Graph.PhysioTests_performed;
					})
					this.chartOptions2.series[0].data = physioTest;
					this.chartOptions2.series[1].data = Questionnaire;
					this.chartOptions2.xaxis.categories = categories;
					this.customProgressDates = {  
						startDate: categories[categories.length - 1],
						endDate: categories[0]
					}
					this.chartOptions2.yaxis.max = this.rounded(max);
					if(this.rounded(max)==0 ){
						this.isDataAvailable = false;
					  }else  {
					 this.isDataAvailable = true;
				   
					  }
				}
				this.isLoading = false;
			})
		}else if(interval === 'month'){
			this.http.get(`${environment.apiUrlNew}/kpi/getOneMonthFSummary/?facility_id=${this.facilityId}`,{headers:this.header}).subscribe((data: any) => {
				if(data.itemCount > 0){
					let KPIData = data.body.filter(value => value.details.facility_id === this.facilityId)
										.sort((a,b) => {
										return new Date(a.details.Rdate).getTime() > new Date(b.details.Rdate).getTime() ? 1 : -1;
						});
					;
					const categories = KPIData.map((value: any) => {
					return value.details.Rdate;
					})
					const Questionnaire = KPIData.map((value: any, i: number )=> {
					return value.Graph.Questionnaires_performed
					})
					let max = 0;
					if(KPIData.length > 0){
						this.isDataAvailable = true;
					}
					KPIData.forEach(val => {
						if(parseInt(val.Graph.Questionnaires_performed) > max){
							max = parseInt(val.Graph.Questionnaires_performed);
						}
						if(parseInt(val.Graph.PhysioTests_performed) > max){
							max = parseInt(val.Graph.PhysioTests_performed)
						}
						})
					const physioTest = KPIData.map((value: any, i: number ) => {
					return value.Graph.PhysioTests_performed;
					})
					this.chartOptions2.series[0].data = physioTest;
					this.chartOptions2.series[1].data = Questionnaire;
					this.chartOptions2.xaxis.categories = categories;
					this.customProgressDates = {
						startDate: categories[categories.length - 1],
						endDate: categories[0]
					}
					this.chartOptions2.yaxis.max = this.rounded(max);
					if(this.rounded(max)==0 ){
						this.isDataAvailable = false;
					  }else  {
					 this.isDataAvailable = true;
				   
					  }
				}
				this.isLoading = false;
			})
    	}else if(interval === 'threeMonth'){
			this.http.get(`${environment.apiUrlNew}/kpi/getThreeMonthsFSummary/?facility_id=${this.facilityId}`,{headers:this.header}).subscribe((data: any) => {
				if(data.itemCount > 0){
					let KPIData = data.body.filter(value => value.details.facility_id === this.facilityId)
										.sort((a,b) => {
										return new Date(a.details.Rdate).getTime() > new Date(b.details.Rdate).getTime() ? 1 : -1;
						});
					;
					let categories = KPIData.map((value: any) => {
					return value.details.Rdate;
					})
					let Questionnaire = KPIData.map((value: any, i: number )=> {
					return value.Graph.Questionnaires_performed
					})
					let max = 0;
					if(KPIData.length > 0){
						this.isDataAvailable = true;
					}
					KPIData.forEach(val => {
						if(parseInt(val.Graph.Questionnaires_performed) > max){
							max = parseInt(val.Graph.Questionnaires_performed);
						}
						if(parseInt(val.Graph.PhysioTests_performed) > max){
							max = parseInt(val.Graph.PhysioTests_performed)
						}
						})
					let physioTest = KPIData.map((value: any, i: number ) => {
					return value.Graph.PhysioTests_performed;
					})
					physioTest = physioTest.filter((val: any, i: number) => ((i - 1)%3 === 0 && i > 1) || i === 0 || i === KPIData.length - 1);
					Questionnaire = Questionnaire.filter((val: any, i: number) => ((i - 1)%3 === 0 && i > 1) || i === 0 || i === KPIData.length - 1);
					categories = categories.filter((val: any, i: number) => ((i - 1)%3 === 0 && i > 1) || i === 0 || i === KPIData.length - 1)
					this.chartOptions2.series[0].data = physioTest;
					this.chartOptions2.series[1].data = Questionnaire;
					this.chartOptions2.xaxis.categories = categories;
					this.customProgressDates = {
						startDate: categories[categories.length - 1],
						endDate: categories[0]
					}
					this.chartOptions2.yaxis.max = this.rounded(max);
					if(this.rounded(max)==0 ){
						this.isDataAvailable = false;
					  }else  {
					 this.isDataAvailable = true;
				   
					  }
				}
				this.isLoading = false;
			})
    	}else if(interval === 'sixMonth'){
			this.http.get(`${environment.apiUrlNew}/kpi/getSixMonthsFSummary/?facility_id=${this.facilityId}`,{headers:this.header}).subscribe((data: any) => {
				if(data.itemCount > 0){
					let KPIData = data.body.filter(value => value.details.facility_id === this.facilityId)
										.sort((a,b) => {
										return new Date(a.details.Rdate).getTime() > new Date(b.details.Rdate).getTime() ? 1 : -1;
						});
					;
					let categories = KPIData.map((value: any) => {
					return value.details.Rdate;
					})
					let Questionnaire = KPIData.map((value: any, i: number )=> {
					return value.Graph.Questionnaires_performed
					})
					let max = 0;
					if(KPIData.length > 0){
						this.isDataAvailable = true;
					}
					KPIData.forEach(val => {
						if(parseInt(val.Graph.Questionnaires_performed) > max){
							max = parseInt(val.Graph.Questionnaires_performed);
						}
						if(parseInt(val.Graph.PhysioTests_performed) > max){
							max = parseInt(val.Graph.PhysioTests_performed)
						}
						})
					let physioTest = KPIData.map((value: any, i: number ) => {
					return value.Graph.PhysioTests_performed;
					})
					//physioTest = physioTest.filter((val: any, i: number) => ((i - 1)%6 === 0 && i > 1) || i === 0 || i === KPIData.length - 1);
					//Questionnaire = Questionnaire.filter((val: any, i: number) => ((i - 1)%6 === 0 && i > 1) || i === 0 || i === KPIData.length - 1);
					//categories = categories.filter((val: any, i: number) => ((i - 1)%6 === 0 && i > 1) || i === 0 || i === KPIData.length - 1)
					this.chartOptions2.series[0].data = physioTest;
					this.chartOptions2.series[1].data = Questionnaire;
					this.chartOptions2.xaxis.categories = categories;
					this.customProgressDates = {
						startDate: categories[categories.length - 1],
						endDate: categories[0]
					}
					this.chartOptions2.yaxis.max = this.rounded(max);
					if(this.rounded(max)==0 ){
						this.isDataAvailable = false;
					  }else  {
					 this.isDataAvailable = true;
				   
					  }
				}
				this.isLoading = false;
			})
    	}
	}
	
	customerId = '';
	getKPICustomerData(interval: string){
		this.isLoading = true;
		this.getHeaders();
		if(interval === 'week'){
			this.http.get(`${environment.apiUrlNew}/kpi/getSevenDaysCSummary/?customer_id=${this.customerId}`,{headers:this.header}).subscribe((data: any) => {
				if(data.itemCount > 0){
					let KPIData = data.body.filter(value => value.details.customer_id === this.customerId)
										.sort((a,b) => {
										return new Date(a.details.Rdate).getTime() > new Date(b.details.Rdate).getTime() ? 1 : -1;
						});
					;
					let categories = KPIData.map((value: any) => {
					return value.details.Rdate;
					})
					let Questionnaire = KPIData.map((value: any, i: number )=> {
					return value.Graph.Questionnaires_performed
					})
					let max = 0;
					if(KPIData.length > 0){
						this.isDataAvailable = true;
					}
					KPIData.forEach(val => {
					if(parseInt(val.Graph.Questionnaires_performed) > max){
						max = parseInt(val.Graph.Questionnaires_performed);
					}
					if(parseInt(val.Graph.PhysioTests_performed) > max){
						max = parseInt(val.Graph.PhysioTests_performed)
					}
					})
					let physioTest = KPIData.map((value: any, i: number ) => {
					return value.Graph.PhysioTests_performed;
					})
					this.chartOptions2.series[0].data = Questionnaire;
					this.chartOptions2.series[1].data = physioTest;
					this.chartOptions2.xaxis.categories = categories;
					this.customProgressDates = {
						startDate: categories[categories.length - 1],
						endDate: categories[0]
					  }
					this.chartOptions2.yaxis.max = this.rounded(max);
					if(this.rounded(max)==0 ){
						this.isDataAvailable = false;
					  }else  {
					 this.isDataAvailable = true;
				   
					  }
				}
				this.isLoading = false;
			})
		}else if(interval === 'month'){
			this.http.get(`${environment.apiUrlNew}/kpi/getOneMonthCSummary/?customer_id=${this.customerId}`,{headers:this.header}).subscribe((data: any) => {
				if(data.itemCount > 0){
					let KPIData = data.body.filter(value => value.details.customer_id === this.customerId)
										.sort((a,b) => {
										return new Date(a.details.Rdate).getTime() > new Date(b.details.Rdate).getTime() ? 1 : -1;
						});
					;
					const categories = KPIData.map((value: any) => {
					return value.details.Rdate;
					})
					const Questionnaire = KPIData.map((value: any, i: number )=> {
					return value.Graph.Questionnaires_performed
					})
					let max = 0;
					if(KPIData.length > 0){
						this.isDataAvailable = true;
					}
					KPIData.forEach(val => {
					if(parseInt(val.Graph.Questionnaires_performed) > max){
						max = parseInt(val.Graph.Questionnaires_performed);
					}
					if(parseInt(val.Graph.PhysioTests_performed) > max){
						max = parseInt(val.Graph.PhysioTests_performed)
					}
					})
					const physioTest = KPIData.map((value: any, i: number ) => {
					return value.Graph.PhysioTests_performed;
					})
					this.chartOptions2.series[0].data = Questionnaire;
					this.chartOptions2.series[1].data = physioTest;
					this.chartOptions2.xaxis.categories = categories;
					this.customProgressDates = {
						startDate: categories[categories.length - 1],
						endDate: categories[0]
					  }
					this.chartOptions2.yaxis.max = this.rounded(max);
					if(this.rounded(max)==0 ){
						this.isDataAvailable = false;
					  }else  {
					 this.isDataAvailable = true;
				   
					  }
				}
				this.isLoading = false;
			})
    	}else if(interval === 'threeMonth'){
			this.http.get(`${environment.apiUrlNew}/kpi/getThreeMonthsCSummary/?customer_id=${this.customerId}`,{headers:this.header}).subscribe((data: any) => {
				if(data.itemCount > 0){
					let KPIData = data.body.filter(value => value.details.customer_id === this.customerId)
										.sort((a,b) => {
										return new Date(a.details.Rdate).getTime() > new Date(b.details.Rdate).getTime() ? 1 : -1;
						});
					;
					let categories = KPIData.map((value: any) => {
					return value.details.Rdate;
					})
					let Questionnaire = KPIData.map((value: any, i: number )=> {
					return value.Graph.Questionnaires_performed
					})
					let max = 0;
					if(KPIData.length > 0){
						this.isDataAvailable = true;
					}
					KPIData.forEach(val => {
					if(parseInt(val.Graph.Questionnaires_performed) > max){
						max = parseInt(val.Graph.Questionnaires_performed);
					}
					if(parseInt(val.Graph.PhysioTests_performed) > max){
						max = parseInt(val.Graph.PhysioTests_performed)
					}
					})
					let physioTest = KPIData.map((value: any, i: number ) => {
					return value.Graph.PhysioTests_performed;
					})
					//physioTest = physioTest.filter((val: any, i: number) => ((i - 1)%3 === 0 && i > 1) || i === 0 || i === KPIData.length - 1);
					//Questionnaire = Questionnaire.filter((val: any, i: number) => ((i - 1)%3 === 0 && i > 1) || i === 0 || i === KPIData.length - 1);
					//categories = categories.filter((val: any, i: number) => ((i - 1)%3 === 0 && i > 1) || i === 0 || i === KPIData.length - 1)
					this.chartOptions2.series[0].data = Questionnaire;
					this.chartOptions2.series[1].data = physioTest;
					this.chartOptions2.xaxis.categories = categories;
					this.customProgressDates = {
						startDate: categories[categories.length - 1],
						endDate: categories[0]
					  }
					this.chartOptions2.yaxis.max = this.rounded(max);
					if(this.rounded(max)==0 ){
						this.isDataAvailable = false;
					  }else  {
					 this.isDataAvailable = true;
				   
					  }
				}
				this.isLoading = false;
			})
    	}else if(interval === 'sixMonth'){
			this.http.get(`${environment.apiUrlNew}/kpi/getSixMonthsCSummary/?customer_id=${this.customerId}`,{headers:this.header}).subscribe((data: any) => {
				if(data.itemCount > 0){
					let KPIData = data.body.filter(value => value.details.customer_id === this.customerId)
										.sort((a,b) => {
										return new Date(a.details.Rdate).getTime() > new Date(b.details.Rdate).getTime() ? 1 : -1;
						});
					;
					let categories = KPIData.map((value: any) => {
					return value.details.Rdate;
					})
					let Questionnaire = KPIData.map((value: any, i: number )=> {
					return value.Graph.Questionnaires_performed
					})
					let max = 0;
					if(KPIData.length > 0){
						this.isDataAvailable = true;
					}
					KPIData.forEach(val => {
					if(parseInt(val.Graph.Questionnaires_performed) > max){
						max = parseInt(val.Graph.Questionnaires_performed);
					}
					if(parseInt(val.Graph.PhysioTests_performed) > max){
						max = parseInt(val.Graph.PhysioTests_performed)
					}
					})
					let physioTest = KPIData.map((value: any, i: number ) => {
					return value.Graph.PhysioTests_performed;
					})
					
				//physioTest = physioTest.filter((val: any, i: number) => ((i - 1)%6 === 0 && i > 1) || i === 0 || i === KPIData.length - 1);
				//Questionnaire = Questionnaire.filter((val: any, i: number) => ((i - 1)%6 === 0 && i > 1) || i === 0 || i === KPIData.length - 1);
				//categories = categories.filter((val: any, i: number) => ((i - 1)%6 === 0 && i > 1) || i === 0 || i === KPIData.length - 1)
					this.chartOptions2.series[0].data = Questionnaire;
					this.chartOptions2.series[1].data = physioTest;
					this.chartOptions2.xaxis.categories = categories;
					this.customProgressDates = {
						startDate: categories[categories.length - 1],
						endDate: categories[0]
					  }
					this.chartOptions2.yaxis.max = this.rounded(max);
					if(this.rounded(max)==0 ){
						this.isDataAvailable = false;
					  }else  {
					 this.isDataAvailable = true;
				   
					  }
				}
				this.isLoading = false;
			})
    	}
	}
	
	getKPIDashboardData(interval: string){
		this.isLoading = true;
		this.getHeaders();
		if(interval === 'week'){
			this.http.get(`${environment.apiUrlNew}/kpi/getSevenDaysSummary/`,{headers:this.header}).subscribe((data: any) => {
				if(data.itemCount > 0){
					let KPIData = data.body
										.sort((a,b) => {
										return new Date(a.details.Rdate).getTime() > new Date(b.details.Rdate).getTime() ? 1 : -1;
						});
					const avgCount = KPIData.length/7;
					const intermediate = [];
					
					KPIData.forEach(value => {
					const exists = intermediate.find(val => val.details.Rdate === value.details.Rdate);
					if(!exists){
						value.Graph.PhysioTests_performed = parseFloat(value.Graph.PhysioTests_performed);
						value.Graph.Questionnaires_performed = parseFloat(value.Graph.Questionnaires_performed)
						intermediate.push(value);
					}
					})
					KPIData = intermediate;
					const categories = KPIData.map((value: any) => {
					return value.details.Rdate;
					})
					let max = 0;
					if(KPIData.length > 0){
						this.isDataAvailable = true;
					}
					KPIData.forEach(val => {
						if(parseInt(val.Graph.Questionnaires_performed) > max){
							max = parseInt(val.Graph.Questionnaires_performed);
						}
						if(parseInt(val.Graph.PhysioTests_performed) > max){
							max = parseInt(val.Graph.PhysioTests_performed)
						}
					})
					const Questionnaire = KPIData.map((value: any, i: number )=> {
						return (value.Graph.PhysioTests_performed)
					})
					const physioTests = KPIData.map((value: any, i: number ) => {
						return (value.Graph.Questionnaires_performed);
					})
					this.chartOptions2.series[0].data = physioTests;
					this.chartOptions2.series[1].data = Questionnaire;
					this.chartOptions2.xaxis.categories = categories;
					this.customProgressDates = {
						startDate: categories[categories.length - 1],
						endDate: categories[0]
					  }
					this.chartOptions2.yaxis.max = this.rounded(max);
					if(this.rounded(max)==0 ){
						this.isDataAvailable = false;
					  }else  {
					 this.isDataAvailable = true;
				   
					  }
				}
				this.isLoading = false;
			})
		}else if(interval === 'month'){
				this.http.get(`${environment.apiUrlNew}/kpi/getOneMonthSummary/`,{headers:this.header}).subscribe((data: any) => {
					if(data.itemCount > 0){
						let KPIData = data.body
											.sort((a,b) => {
											return new Date(a.details.Rdate).getTime() > new Date(b.details.Rdate).getTime() ? 1 : -1;
							});
						const intermediate = [];
						
						KPIData.forEach(value => {
						const exists = intermediate.find(val => val.details.Rdate === value.details.Rdate);
						if(!exists){
							value.Graph.PhysioTests_performed = parseFloat(value.Graph.PhysioTests_performed);
							value.Graph.Questionnaires_performed = parseFloat(value.Graph.Questionnaires_performed)
							intermediate.push(value);
						}else{
							exists.Graph.PhysioTests_performed = exists.Graph.PhysioTests_performed + parseFloat(value.Graph.PhysioTests_performed);
							exists.Graph.Questionnaires_performed = exists.Graph.Questionnaires_performed + parseFloat(value.Graph.Questionnaires_performed)
						}
						})
						KPIData = intermediate;
						const categories = KPIData.map((value: any) => {
						return value.details.Rdate;
						})
						let max = 0;
						if(KPIData.length > 0){
							this.isDataAvailable = true;
						}
						KPIData.forEach(val => {
							if(parseInt(val.Graph.Questionnaires_performed) > max){
								max = parseInt(val.Graph.Questionnaires_performed);
							}
							if(parseInt(val.Graph.PhysioTests_performed) > max){
								max = parseInt(val.Graph.PhysioTests_performed)
							}
						})
						const Questionnaire = KPIData.map((value: any, i: number )=> {
							return (value.Graph.PhysioTests_performed)
						})
						const physioTests = KPIData.map((value: any, i: number ) => {
							return (value.Graph.Questionnaires_performed);
						})
						this.chartOptions2.series[0].data = physioTests;
						this.chartOptions2.series[1].data = Questionnaire;
						this.chartOptions2.xaxis.categories = categories;
						this.customProgressDates = {
							startDate: categories[categories.length - 1],
							endDate: categories[0]
						  }
						this.chartOptions2.yaxis.max = this.rounded(max);

						if(this.rounded(max)==0 ){
							this.isDataAvailable = false;
						  }else  {
						 this.isDataAvailable = true;
					   
						  }
					}
					this.isLoading = false;
				})
    	}else if(interval === 'threeMonth'){
				this.http.get(`${environment.apiUrlNew}/kpi/getThreeMonthsSummary/`,{headers:this.header}).subscribe((data: any) => {
					if(data.itemCount > 0){
						let KPIData = data.body
											.sort((a,b) => {
											return new Date(a.details.Rdate).getTime() > new Date(b.details.Rdate).getTime() ? 1 : -1;
							});
						const avgCount = KPIData.length/7;
						const intermediate = [];
						
						KPIData.forEach(value => {
						const exists = intermediate.find(val => val.details.Rdate === value.details.Rdate);
						if(!exists){
							value.Graph.PhysioTests_performed = parseFloat(value.Graph.PhysioTests_performed);
							value.Graph.Questionnaires_performed = parseFloat(value.Graph.Questionnaires_performed)
							intermediate.push(value);
						}else{
							exists.Graph.PhysioTests_performed = exists.Graph.PhysioTests_performed + parseFloat(value.Graph.PhysioTests_performed);
							exists.Graph.Questionnaires_performed = exists.Graph.Questionnaires_performed + parseFloat(value.Graph.Questionnaires_performed)
						}
						})
						KPIData = intermediate;
						let categories = KPIData.map((value: any) => {
						return value.details.Rdate;
						})
						let max = 0;
						if(KPIData.length > 0){
							this.isDataAvailable = true;
						}
						KPIData.forEach(val => {
							if(parseInt(val.Graph.Questionnaires_performed) > max){
								max = parseInt(val.Graph.Questionnaires_performed);
							}
							if(parseInt(val.Graph.PhysioTests_performed) > max){
								max = parseInt(val.Graph.PhysioTests_performed)
							}
						})
						let Questionnaire = KPIData.map((value: any, i: number )=> {
							return (value.Graph.PhysioTests_performed)
						})
						let physioTests = KPIData.map((value: any, i: number ) => {
							return (value.Graph.Questionnaires_performed);
						})
						// physioTests = physioTests.filter((val: any, i: number) => ((i - 1)%3 === 0 && i > 1) || i === 0 || i === KPIData.length - 1);
						// Questionnaire = Questionnaire.filter((val: any, i: number) => ((i - 1)%3 === 0 && i > 1) || i === 0 || i === KPIData.length - 1);
						// categories = categories.filter((val: any, i: number) => ((i - 1)%3 === 0 && i > 1) || i === 0 || i === KPIData.length - 1)
						this.chartOptions2.series[0].data = physioTests;
						this.chartOptions2.series[1].data = Questionnaire;
						this.chartOptions2.xaxis.categories = categories;
						this.customProgressDates = {
							startDate: categories[categories.length - 1],
							endDate: categories[0]
						  }
						this.chartOptions2.yaxis.max = this.rounded(max);
						if(this.rounded(max)==0 ){
							this.isDataAvailable = false;
						  }else  {
						 this.isDataAvailable = true;
					   
						  }
					}
					this.isLoading = false;
				})
    	}else if(interval === 'sixMonth'){
				this.http.get(`${environment.apiUrlNew}/kpi/getSixMonthsSummary/`,{headers:this.header}).subscribe((data: any) => {
					if(data.itemCount > 0){
						let KPIData = data.body
											.sort((a,b) => {
											return new Date(a.details.Rdate).getTime() > new Date(b.details.Rdate).getTime() ? 1 : -1;
							});
						const intermediate = [];
						
						KPIData.forEach(value => {
						const exists = intermediate.find(val => val.details.Rdate === value.details.Rdate);
						if(!exists){
							value.Graph.PhysioTests_performed = parseFloat(value.Graph.PhysioTests_performed);
							value.Graph.Questionnaires_performed = parseFloat(value.Graph.Questionnaires_performed)
							intermediate.push(value);
						}else{
							exists.Graph.PhysioTests_performed = exists.Graph.PhysioTests_performed + parseFloat(value.Graph.PhysioTests_performed);
							exists.Graph.Questionnaires_performed = exists.Graph.Questionnaires_performed + parseFloat(value.Graph.Questionnaires_performed)
						}
						})
						KPIData = intermediate;
						let categories = KPIData.map((value: any) => {
						return value.details.Rdate;
						})
						let max = 0;
						if(KPIData.length > 0){
							this.isDataAvailable = true;
						}
						KPIData.forEach(val => {
							if(parseInt(val.Graph.Questionnaires_performed) > max){
								max = parseInt(val.Graph.Questionnaires_performed);
							}
							if(parseInt(val.Graph.PhysioTests_performed) > max){
								max = parseInt(val.Graph.PhysioTests_performed)
							}
						})
						let Questionnaire = KPIData.map((value: any, i: number )=> {
							return (value.Graph.PhysioTests_performed)
						})
						let physioTests = KPIData.map((value: any, i: number ) => {
							return (value.Graph.Questionnaires_performed);
						})
						
						// physioTests = physioTests.filter((val: any, i: number) => ((i - 1)%6 === 0 && i > 1) || i === 0 || i === KPIData.length - 1);
						// Questionnaire = Questionnaire.filter((val: any, i: number) => ((i - 1)%6 === 0 && i > 1) || i === 0 || i === KPIData.length - 1);
						// categories = categories.filter((val: any, i: number) => ((i - 1)%6 === 0 && i > 1) || i === 0 || i === KPIData.length - 1)
						this.chartOptions2.series[0].data = physioTests;
						this.chartOptions2.series[1].data = Questionnaire;
						this.chartOptions2.xaxis.categories = categories;
						this.customProgressDates = {
							startDate: categories[categories.length - 1],
							endDate: categories[0]
						  }
						this.chartOptions2.yaxis.max = this.rounded(max);
						if(this.rounded(max)==0 ){
							this.isDataAvailable = false;
						  }else  {
						 this.isDataAvailable = true;
					   
						  }
					}
					this.isLoading = false;
				})
    	}
	}
	
	getFilterFormat() {
		return this.timeFormat.getFilterFormat()
	}
	
	updateResident(item) {
		console.log('updateResident ', item)
	}
	changeProgress(e?: any) {
		this.customProgressDates = {
			startDate: new Date(e.startDate),
			endDate: new Date(e.endDate)
		  }
		  const diff = moment(e.endDate).diff(moment(e.startDate), 'days');
		  const dates = [];
		  for(let i = 0; i < diff + 1; i++){
			dates.push(moment(e.startDate).add(i,'days').format('YYYY-MM-DD'))
		  }
		  this.isLoading = true;
		  this.getHeaders();
		  this.http.get(`${environment.apiUrlNew}/kpi/get/`,{headers:this.header}).subscribe((data: any) => {
			let KPIData = [];
			if(this.type === 'ward' && this.role === 'SSA'){
			  data.body.filter(value => value.details.ward_id === this.wardId).forEach(value =>{
				const exists = dates.includes(value.meta.Rdate);
				if(exists){
				  KPIData.push(value)
				}
			  })
			  const intermediate = [];
			  KPIData.forEach(val => {
				const exists = intermediate.find(value => value.meta.Rdate === val.meta.Rdate);
				if(!exists){
				  val.KPI.Questionnaires_performed = parseFloat(val.KPI.Questionnaires_performed);
				  val.KPI.PhysioTests_performed = parseFloat(val.KPI.PhysioTests_performed)
				  Object.assign(val, {count : 1})
				  intermediate.push(val);
				}else{
				  exists.KPI.Questionnaires_performed = exists.KPI.Questionnaires_performed + parseFloat(val.KPI.Questionnaires_performed);
				  exists.KPI.PhysioTests_performed = exists.KPI.PhysioTests_performed + parseFloat(val.KPI.PhysioTests_performed);
				  exists.count = exists.count + 1;
				}
			  })
			  KPIData = intermediate;
			}else if(this.type === 'facility' && this.role === 'SSA'){
			  data.body.filter(value => value.details.facility_id === this.facilityId).forEach(value =>{
				const exists = dates.includes(value.meta.Rdate);
				if(exists){
				  KPIData.push(value)
				}
			  })
			  const intermediate = [];
			  KPIData.forEach(val => {
				const exists = intermediate.find(value => value.meta.Rdate === val.meta.Rdate);
				if(!exists){
				  val.KPI.Questionnaires_performed = parseFloat(val.KPI.Questionnaires_performed);
				  val.KPI.PhysioTests_performed = parseFloat(val.KPI.PhysioTests_performed)
				  Object.assign(val, {count : 1})
				  intermediate.push(val);
				}else{
				  exists.KPI.Questionnaires_performed = exists.KPI.Questionnaires_performed + parseFloat(val.KPI.Questionnaires_performed);
				  exists.KPI.PhysioTests_performed = exists.KPI.PhysioTests_performed + parseFloat(val.KPI.PhysioTests_performed);
				  exists.count = exists.count + 1;
				}
			  })
			  KPIData = intermediate;
			}else if(this.type === 'customer' && this.role === 'SSA'){
			  data.body.filter(value => value.details.customer_id === this.customerId).forEach(value =>{
				const exists = dates.includes(value.meta.Rdate);
				if(exists){
				  KPIData.push(value)
				}
			  })
			  const intermediate = [];
			  KPIData.forEach(val => {
				const exists = intermediate.find(value => value.meta.Rdate === val.meta.Rdate);
				if(!exists){
				  val.KPI.Questionnaires_performed = parseFloat(val.KPI.Questionnaires_performed);
				  val.KPI.PhysioTests_performed = parseFloat(val.KPI.PhysioTests_performed)
				  Object.assign(val, {count : 1})
				  intermediate.push(val);
				}else{
				  exists.KPI.Questionnaires_performed = exists.KPI.Questionnaires_performed + parseFloat(val.KPI.Questionnaires_performed);
				  exists.KPI.PhysioTests_performed = exists.KPI.PhysioTests_performed + parseFloat(val.KPI.PhysioTests_performed);
				  exists.count = exists.count + 1;
				}
			  })
			  KPIData = intermediate;
			}else if(this.type === 'dashboard' && this.role === 'SSA'){
			  data.body.forEach(value =>{
				const exists = dates.includes(value.meta.Rdate);
				if(exists){
				  KPIData.push(value)
				}
			  })
			  const intermediate = [];
			  KPIData.forEach(val => {
				const exists = intermediate.find(value => value.meta.Rdate === val.meta.Rdate);
				if(!exists){
				  val.KPI.Questionnaires_performed = parseFloat(val.KPI.Questionnaires_performed);
				  val.KPI.PhysioTests_performed = parseFloat(val.KPI.PhysioTests_performed)
				  Object.assign(val, {count : 1})
				  intermediate.push(val);
				}else{
				  exists.KPI.Questionnaires_performed = exists.KPI.Questionnaires_performed + parseFloat(val.KPI.Questionnaires_performed);
				  exists.KPI.PhysioTests_performed = exists.KPI.PhysioTests_performed + parseFloat(val.KPI.PhysioTests_performed);
				  exists.count = exists.count + 1;
				}
			  })
			  KPIData = intermediate;
			}else if(this.type === 'ward' && this.role === 'CA'){
			  data.body.filter(value => value.details.ward_id === this.wardId).forEach(value =>{
				const exists = dates.includes(value.meta.Rdate);
				if(exists){
				  KPIData.push(value)
				}
			  })
			  const intermediate = [];
			  KPIData.forEach(val => {
				const exists = intermediate.find(value => value.meta.Rdate === val.meta.Rdate);
				if(!exists){
				  val.KPI.Questionnaires_performed = parseFloat(val.KPI.Questionnaires_performed);
				  val.KPI.PhysioTests_performed = parseFloat(val.KPI.PhysioTests_performed)
				  Object.assign(val, {count : 1})
				  intermediate.push(val);
				}else{
				  exists.KPI.Questionnaires_performed = exists.KPI.Questionnaires_performed + parseFloat(val.KPI.Questionnaires_performed);
				  exists.KPI.PhysioTests_performed = exists.KPI.PhysioTests_performed + parseFloat(val.KPI.PhysioTests_performed);
				  exists.count = exists.count + 1;
				}
			  })
			  KPIData = intermediate;
			}else if(this.type === 'facility' && this.role === 'CA'){
			  data.body.filter(value => value.details.facility_id === this.facilityId).forEach(value =>{
				const exists = dates.includes(value.meta.Rdate);
				if(exists){
				  KPIData.push(value)
				}
			  })
			  const intermediate = [];
			  KPIData.forEach(val => {
				const exists = intermediate.find(value => value.meta.Rdate === val.meta.Rdate);
				if(!exists){
				  val.KPI.Questionnaires_performed = parseFloat(val.KPI.Questionnaires_performed);
				  val.KPI.PhysioTests_performed = parseFloat(val.KPI.PhysioTests_performed)
				  Object.assign(val, {count : 1})
				  intermediate.push(val);
				}else{
				  exists.KPI.Questionnaires_performed = exists.KPI.Questionnaires_performed + parseFloat(val.KPI.Questionnaires_performed);
				  exists.KPI.PhysioTests_performed = exists.KPI.PhysioTests_performed + parseFloat(val.KPI.PhysioTests_performed);
				  exists.count = exists.count + 1;
				}
			  })
			  KPIData = intermediate;
			}else if(this.type === 'customer' && this.role === 'CA'){
			  const user = JSON.parse(localStorage.getItem('loggedInUser'));
      this.customerId = user.customers.customer_id;
			  data.body.filter(value => value.details.customer_id === this.customerId).forEach(value =>{
				const exists = dates.includes(value.meta.Rdate);
				if(exists){
				  KPIData.push(value)
				}
			  })
			  const intermediate = [];
			  KPIData.forEach(val => {
				const exists = intermediate.find(value => value.meta.Rdate === val.meta.Rdate);
				if(!exists){
				  val.KPI.Questionnaires_performed = parseFloat(val.KPI.Questionnaires_performed);
				  val.KPI.PhysioTests_performed = parseFloat(val.KPI.PhysioTests_performed)
				  Object.assign(val, {count : 1})
				  intermediate.push(val);
				}else{
				  exists.KPI.Questionnaires_performed = exists.KPI.Questionnaires_performed + parseFloat(val.KPI.Questionnaires_performed);
				  exists.KPI.PhysioTests_performed = exists.KPI.PhysioTests_performed + parseFloat(val.KPI.PhysioTests_performed);
				  exists.count = exists.count + 1;
				}
			  })
			  KPIData = intermediate;
			}else if(this.type === 'ward' && this.role === 'FA'){
				data.body.filter(value => value.details.ward_id === this.wardId).forEach(value =>{
				  const exists = dates.includes(value.meta.Rdate);
				  if(exists){
					KPIData.push(value)
				  }
				})
				const intermediate = [];
				KPIData.forEach(val => {
				  const exists = intermediate.find(value => value.meta.Rdate === val.meta.Rdate);
				  if(!exists){
					val.KPI.Questionnaires_performed = parseFloat(val.KPI.Questionnaires_performed);
				  val.KPI.PhysioTests_performed = parseFloat(val.KPI.PhysioTests_performed)
				  Object.assign(val, {count : 1})
				  intermediate.push(val);
				  }else{
					exists.KPI.Questionnaires_performed = exists.KPI.Questionnaires_performed + parseFloat(val.KPI.Questionnaires_performed);
					exists.KPI.PhysioTests_performed = exists.KPI.PhysioTests_performed + parseFloat(val.KPI.PhysioTests_performed);
					exists.count = exists.count + 1;
				  }
				})
				KPIData = intermediate;
			  }else if(this.type === 'facility' && this.role === 'FA'){
				data.body.filter(value => value.details.facility_id === this.facilityId).forEach(value =>{
				  const exists = dates.includes(value.meta.Rdate);
				  if(exists){
					KPIData.push(value)
				  }
				})
				const intermediate = [];
				KPIData.forEach(val => {
				  const exists = intermediate.find(value => value.meta.Rdate === val.meta.Rdate);
				  if(!exists){
					val.KPI.Questionnaires_performed = parseFloat(val.KPI.Questionnaires_performed);
				  val.KPI.PhysioTests_performed = parseFloat(val.KPI.PhysioTests_performed)
				  Object.assign(val, {count : 1})
				  intermediate.push(val);
				  }else{
					exists.KPI.Questionnaires_performed = exists.KPI.Questionnaires_performed + parseFloat(val.KPI.Questionnaires_performed);
					exists.KPI.PhysioTests_performed = exists.KPI.PhysioTests_performed + parseFloat(val.KPI.PhysioTests_performed);
					exists.count = exists.count + 1;
				  }
				})
				KPIData = intermediate;
			  }else if(this.type === 'ward' && this.role === 'WA'){
				data.body.filter(value => value.details.ward_id === this.wardId).forEach(value =>{
				  const exists = dates.includes(value.meta.Rdate);
				  if(exists){
					KPIData.push(value)
				  }
				})
				const intermediate = [];
				KPIData.forEach(val => {
				  const exists = intermediate.find(value => value.meta.Rdate === val.meta.Rdate);
				  if(!exists){
					val.KPI.Questionnaires_performed = parseFloat(val.KPI.Questionnaires_performed);
				  val.KPI.PhysioTests_performed = parseFloat(val.KPI.PhysioTests_performed)
				  Object.assign(val, {count : 1})
				  intermediate.push(val);
				  }else{
					exists.KPI.Questionnaires_performed = exists.KPI.Questionnaires_performed + parseFloat(val.KPI.Questionnaires_performed);
					exists.KPI.PhysioTests_performed = exists.KPI.PhysioTests_performed + parseFloat(val.KPI.PhysioTests_performed);
					exists.count = exists.count + 1;
				  }
				})
				KPIData = intermediate;
			  }
			KPIData.sort((a,b) => {
				return parseInt(a.meta.timestamp) > parseInt(b.meta.timestamp) ? 1 : -1;
			});
			const categories = KPIData.map((value: any) => {
				return value.meta.Rdate;
			})
			let max = 0;
			KPIData.forEach(val => {
				if(parseInt(val.KPI.Questionnaires_performed) > max){
					max = parseInt(val.KPI.Questionnaires_performed);
				}
				if(parseInt(val.KPI.PhysioTests_performed) > max){
					max = parseInt(val.KPI.PhysioTests_performed)
				}
			})
			const Questionnaire = KPIData.map((value: any, i: number )=> {
				return (value.KPI.PhysioTests_performed)
			})
			const physioTests = KPIData.map((value: any, i: number ) => {
				return (value.KPI.Questionnaires_performed);
			})
			this.chartOptions2.series[0].data = physioTests;
			this.chartOptions2.series[1].data = Questionnaire;
			this.chartOptions2.xaxis.categories = categories;
			this.chartOptions2.yaxis.max = this.rounded(max);
			if(physioTests.length > 0 || Questionnaire.length > 0){
				this.isDataAvailable = true;
			}
			this.isLoading = false;
		})
	}
	
	getLast3Month(){
		this.selectedInterval = 'Last 3 months';
		if(this.type === 'ward' && this.role === 'SSA'){
		  this.routeActivate.paramMap.subscribe(data => {
			this.wardId = data.get('wardId');
			this.getKPIWardData('threeMonth');
		  });
		}else if(this.type === 'facility' && this.role === 'SSA'){
		  this.routeActivate.paramMap.subscribe(data => {
			this.facilityId = data.get('facilityId');
			this.getKPIFacilityData('threeMonth');
		  });
		}else if(this.type === 'customer' && this.role === 'SSA'){
		  this.routeActivate.paramMap.subscribe(data => {
			this.customerId = data.get('customer_id');
			this.getKPICustomerData('threeMonth');
		  });
		}else if(this.type === 'dashboard' && this.role === 'SSA'){
		  this.getKPIDashboardData('threeMonth');
		}else if(this.type === 'ward' && this.role === 'CA'){
		  this.routeActivate.paramMap.subscribe(data => {
			this.wardId = data.get('wardId');
			this.getKPIWardData('threeMonth');
		  });
		}else if(this.type === 'facility' && this.role === 'CA'){
		  this.routeActivate.paramMap.subscribe(data => {
			this.facilityId = data.get('facilityId');
			this.getKPIFacilityData('threeMonth');
		  });
		}else if(this.type === 'customer' && this.role === 'CA'){
		  const user = JSON.parse(localStorage.getItem('loggedInUser'));
      this.customerId = user.customers.customer_id;
		  this.getKPICustomerData('threeMonth');
		}else if(this.type === 'ward' && this.role === 'FA'){
		  this.routeActivate.paramMap.subscribe(data => {
			this.wardId = data.get('wardId');
			this.getKPIWardData('threeMonth');
		  });
		}else if(this.type === 'facility' && this.role === 'FA'){
			const user = JSON.parse(localStorage.getItem('loggedInUser'));
        this.facilityId = user.facilities.facility_id;
			this.getKPIFacilityData('threeMonth');
		}else if(this.type === 'ward' && this.role === 'WA'){
			let user: any = localStorage.getItem('loggedInUser');
			if(user){
			  user = JSON.parse(user);
			  this.wardId = user.wards[0].ward_id;
			  this.getKPIWardData('threeMonth');
			}
		}
	  }
	
	  getLast6Month(){
		this.selectedInterval = 'Last 6 months';
		if(this.type === 'ward' && this.role === 'SSA'){
		  this.routeActivate.paramMap.subscribe(data => {
			this.wardId = data.get('wardId');
			this.getKPIWardData('sixMonth');
		  });
		}else if(this.type === 'facility' && this.role === 'SSA'){
		  this.routeActivate.paramMap.subscribe(data => {
			this.facilityId = data.get('facilityId');
			this.getKPIFacilityData('sixMonth');
		  });
		}else if(this.type === 'customer' && this.role === 'SSA'){
		  this.routeActivate.paramMap.subscribe(data => {
			this.customerId = data.get('customer_id');
			this.getKPICustomerData('sixMonth');
		  });
		}else if(this.type === 'dashboard' && this.role === 'SSA'){
		  this.getKPIDashboardData('sixMonth');
		}else if(this.type === 'ward' && this.role === 'CA'){
		  this.routeActivate.paramMap.subscribe(data => {
			this.wardId = data.get('wardId');
			this.getKPIWardData('sixMonth');
		  });
		}else if(this.type === 'facility' && this.role === 'CA'){
		  this.routeActivate.paramMap.subscribe(data => {
			this.facilityId = data.get('facilityId');
			this.getKPIFacilityData('sixMonth');
		  });
		}else if(this.type === 'customer' && this.role === 'CA'){
		  const user = JSON.parse(localStorage.getItem('loggedInUser'));
      this.customerId = user.customers.customer_id;
		  this.getKPICustomerData('sixMonth');
		}else if(this.type === 'ward' && this.role === 'FA'){
		  this.routeActivate.paramMap.subscribe(data => {
			this.wardId = data.get('wardId');
			this.getKPIWardData('sixMonth');
		  });
		}else if(this.type === 'facility' && this.role === 'FA'){
			const user = JSON.parse(localStorage.getItem('loggedInUser'));
        this.facilityId = user.facilities.facility_id;
			this.getKPIFacilityData('sixMonth');
		}else if(this.type === 'ward' && this.role === 'WA'){
			let user: any = localStorage.getItem('loggedInUser');
			if(user){
			  user = JSON.parse(user);
			  this.wardId = user.wards[0].ward_id;
			  this.getKPIWardData('sixMonth');
			}
		}
	  }
	getLast1Month(){
		this.selectedInterval = 'Last 1 month';
		if(this.type === 'ward' && this.role === 'SSA'){
		  this.routeActivate.paramMap.subscribe(data => {
			this.wardId = data.get('wardId');
			this.getKPIWardData('month');
		  });
		}else if(this.type === 'facility' && this.role === 'SSA'){
		  this.routeActivate.paramMap.subscribe(data => {
			this.facilityId = data.get('facilityId');
			this.getKPIFacilityData('month');
		  });
		}else if(this.type === 'customer' && this.role === 'SSA'){
		  this.routeActivate.paramMap.subscribe(data => {
			this.customerId = data.get('customer_id');
			this.getKPICustomerData('month');
		  });
		}else if(this.type === 'dashboard' && this.role === 'SSA'){
		  this.getKPIDashboardData('month');
		}else if(this.type === 'ward' && this.role === 'CA'){
		  this.routeActivate.paramMap.subscribe(data => {
			this.wardId = data.get('wardId');
			this.getKPIWardData('month');
		  });
		}else if(this.type === 'facility' && this.role === 'CA'){
		  this.routeActivate.paramMap.subscribe(data => {
			this.facilityId = data.get('facilityId');
			this.getKPIFacilityData('month');
		  });
		}else if(this.type === 'customer' && this.role === 'CA'){
		  const user = JSON.parse(localStorage.getItem('loggedInUser'));
      this.customerId = user.customers.customer_id;
		  this.getKPICustomerData('month');
		}else if(this.type === 'ward' && this.role === 'FA'){
		  this.routeActivate.paramMap.subscribe(data => {
			this.wardId = data.get('wardId');
			this.getKPIWardData('month');
		  });
		}else if(this.type === 'facility' && this.role === 'FA'){
			const user = JSON.parse(localStorage.getItem('loggedInUser'));
        this.facilityId = user.facilities.facility_id;
			this.getKPIFacilityData('month');
		}else if(this.type === 'ward' && this.role === 'WA'){
			let user: any = localStorage.getItem('loggedInUser');
			if(user){
			  user = JSON.parse(user);
			  this.wardId = user.wards[0].ward_id;
			  this.getKPIWardData('month');
			  
			}
		}
	  }
	@Output() changeTab = new EventEmitter();
	navigateTo(){
		if(this.type === 'dashboard'){
			this.router.navigate(['/facility','residents'])
		}else{
			this.changeTab.emit();
		}
	}
}
