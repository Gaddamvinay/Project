import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import * as moment from 'moment';
import { ApexAxisChartSeries, ApexChart, ApexXAxis, ApexStroke, ApexDataLabels, ApexMarkers, ApexYAxis, ApexTooltip, ApexGrid, ApexLegend, ApexTitleSubtitle, ApexFill } from 'ng-apexcharts';
import { environment } from '../../../../../environments/environment';
import { CommonHttpService } from '../../../../shared/services/http-services/common-http.service';
import { TimeFormatService } from '../../../../shared/services/time-format.service';

export type bssChartOptions = {
	series: ApexAxisChartSeries;
	chart: ApexChart;
	xaxis: ApexXAxis;
	stroke: ApexStroke;
	dataLabels: ApexDataLabels;
	markers: ApexMarkers;
	colors: string[];
	yaxis: ApexYAxis;
	tooltip: ApexTooltip;
	grid: ApexGrid;
	legend: ApexLegend;
	title: ApexTitleSubtitle;
};

export type activeGraphOptions = {
	series: ApexAxisChartSeries;
	chart: ApexChart;
	xaxis: ApexXAxis;
	stroke: ApexStroke;
	dataLabels: ApexDataLabels;
	markers: ApexMarkers;
	colors: string[];
	fill: ApexFill;
	yaxis: ApexYAxis;
	tooltip: ApexTooltip;
	grid: ApexGrid;
	legend: ApexLegend;
	title: ApexTitleSubtitle;
};
@Component({
	selector: 'app-trend-report',
	templateUrl: './trend-report.component.html',
	styleUrls: ['./trend-report.component.scss']
})
export class TrendReportComponent implements OnInit {

	titleShow = false;
	showFilter = false;
	showActiveGraph = false;
	showRiskGraph = false;
	// @ViewChild("activeGraph") chart3: ChartComponent;
	public activeGraphOptions: Partial<activeGraphOptions>;

	// @ViewChild("bsschart") chart2: ChartComponent;
	public bssChartOptions: Partial<bssChartOptions>;
	timeToAdded: number = 0;
	constructor(private commonHttp: CommonHttpService, private route: ActivatedRoute, private http: HttpClient, private timeFormat: TimeFormatService) {
		this.timeToAdded = moment.parseZone().utcOffset();
		this.bssChartOptions = {
			series: [
				{
					name: "Balance",
					data: [30, 50, 70, 90, 100,50,60,70]
				},
				{
					name: "Strength",
					data: [40, 60, 80, 70, 30,60,50,40]
				},
				{
					name: "Sleep",
					data: [30, 60, 80, 40, 90,60,30,20]
				},
			],
			chart: {
				height: 320,
				type: "line",
				dropShadow: {
					enabled: false,
					color: "#434342",
					top: 18,
					left: 7,
					blur: 10,
					opacity: 0.2
				},
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
			colors: ['#a6bcc9', '#87657d', '#aaa093', '#ffb22b'],
			dataLabels: {
				enabled: false
			},
			stroke: {
				curve: "smooth"
			},
			grid: {
				borderColor: "#e7e7e7",
				row: {
					colors: ["#fff", "transparent"],
					opacity: 0.5
				}
			},
			markers: {
				size: 1
			},
			xaxis: {
				type: "datetime",
				title: {
					text: 'Date',
					offsetX: 0,
					offsetY: 8,
					style: {
						color: '#434342',
						fontSize: '14px',
						fontFamily: 'Whitney A,Whitney B,Helvetica,Arial,sans-serif',
						fontWeight: 500,
						cssClass: 'apexcharts-xaxis-title',
					},
				},
				labels: {
					style: {
						colors: '#aaa093',
						fontSize: '12px',
						fontFamily: 'Whitney A,Whitney B,Helvetica,Arial,sans-serif',
						fontWeight: 500,
						cssClass: 'apexcharts-xaxis-label',
					},
				},
				categories: [

				]
			},
			yaxis: {
				title: {
					text: '% of maximum',
					offsetX: -4,
					offsetY: 0,
					style: {
						color: '#434342',
						fontSize: '14px',
						fontFamily: 'Whitney A,Whitney B,Helvetica,Arial,sans-serif',
						fontWeight: 500,
						cssClass: 'apexcharts-xaxis-title',
					},
				},
				labels: {
					show: false,
					style: {
						colors: '#aaa093',
						fontSize: '12px',
						fontFamily: 'Whitney A,Whitney B,Helvetica,Arial,sans-serif',
						fontWeight: 500,
						cssClass: 'apexcharts-xaxis-label',
					},
				},
				min: 0,
				max: 100
			},
			tooltip: {
				enabled: true,
				onDatasetHover: {
					highlightDataSeries: true,
				},
				y: {
					formatter: function (val) {
						if (val !== 0)
							return val + "%"
						else
							return ''
					},
				},
				marker: {
					show: true,
				},
			},
			legend: {
				show: true,
				position: "bottom",
				fontSize: '14px',
				fontFamily: 'Whitney A,Whitney B,Helvetica,Arial,sans-serif',
				fontWeight: 500,
				offsetY: 6,
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
		};
		this.activeGraphOptions = {
			series: [
				{
					name: "Active time",
					data: [500 / 60, 700 / 60,400 / 60, 800 / 60, 550 / 60, 400 / 60, 500 / 60, 100 / 60]
				},
				{
					name: "Inactive time",
					data: [42 / 60, 100 / 60, 80 / 60, 90 / 60, 50 / 60, 80 / 60, 40 / 60, 50 / 60]
				},
				{
					name: "Not in Use time",
					data: [40 / 60, 200 / 60, 120 / 60, 100 / 60, 70 / 60, 90 / 60, 50 / 60,50 / 60]
				},
			],
			chart: {
				height: 320,
				type: "line",
				dropShadow: {
					enabled: false,
					color: "#434342",
					top: 18,
					left: 7,
					blur: 10,
					opacity: 0.2
				},
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
			colors: ['#015174', '#aaa093', '#87657d'],
			dataLabels: {
				enabled: false
			},
			stroke: {
				curve: "smooth"
			},
			grid: {
				borderColor: "#e7e7e7",
				row: {
					colors: ["#fff", "transparent"],
					opacity: 0.5
				}
			},
			markers: {
				size: 1,
			},
			xaxis: {
				type: "datetime",
				title: {
					text: 'Date',
					offsetX: 0,
					offsetY: 8,
					style: {
						color: '#434342',
						fontSize: '14px',
						fontFamily: 'Whitney A,Whitney B,Helvetica,Arial,sans-serif',
						fontWeight: 500,
						cssClass: 'apexcharts-xaxis-title',
					},
				},
				labels: {
					style: {
						colors: '#aaa093',
						fontSize: '12px',
						fontFamily: 'Whitney A,Whitney B,Helvetica,Arial,sans-serif',
						fontWeight: 500,
						cssClass: 'apexcharts-xaxis-label',
					},
				}
			},
			yaxis: {
				title: {
					text: 'Time',
					offsetX: -4,
					offsetY: 0,
					style: {
						color: '#434342',
						fontSize: '14px',
						fontFamily: 'Whitney A,Whitney B,Helvetica,Arial,sans-serif',
						fontWeight: 500,
						cssClass: 'apexcharts-xaxis-title',
					},
				},
				labels: {
					show: false,
					style: {
						colors: '#aaa093',
						fontSize: '12px',
						fontFamily: 'Whitney A,Whitney B,Helvetica,Arial,sans-serif',
						fontWeight: 500,
						cssClass: 'apexcharts-xaxis-label',
					},
				},
				min: 0,
				max: 24
			},
			tooltip: {
				enabled: true,
				onDatasetHover: {
					highlightDataSeries: true,
				},
				y: {
					formatter: function (val, opt) {
						if (val > 0) {
							val = Math.round(val * 60);
							return `${Math.floor(val / 60) > 9 ? Math.floor(val / 60) : '0' + Math.floor(val / 60)}:${Math.ceil(val % 60 / 5) * 5 > 5 ? Math.ceil(val % 60 / 5) * 5 : '0' + Math.ceil(val % 60 / 5) * 5}`
						} else {
							return '00:00'
						}
					},
				},
				marker: {
					show: true,
				},
			},
			legend: {
				show: true,
				position: "bottom",
				fontSize: '14px',
				fontFamily: 'Whitney A,Whitney B,Helvetica,Arial,sans-serif',
				fontWeight: 500,
				offsetY: 6,
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
		};
		let timeIntervals = [];
		const date = new Date();
		date.setHours(0);
		date.setMinutes(0);
		date.setSeconds(0);
		for (let i = 7; i >= 0; i--) {
			timeIntervals.push(
				parseInt(moment(date).add(330, 'minutes').subtract(i, 'days').format('X')) * 1000);
		}
		this.activeGraphOptions.xaxis.categories = timeIntervals;
		this.bssChartOptions.xaxis.categories = timeIntervals;
	}

	userId: string = '';
	dateInput = new Date();
	residentData: any;
	@Input('userData')
	set user(event: any) {
		this.residentData = event;
	}
	get user() {
		return this.residentData;
	}
	ngOnInit(): void {
		this.dateInput.setHours(0);
		this.dateInput.setMinutes(0);
		this.dateInput.setSeconds(0);
		this.route.paramMap.subscribe((params: ParamMap) => {
			this.userId = params.get('userId');
			const dates = [];
			for(let i=1; i<8; i++){
				dates.push(moment().subtract(i, 'days').format('YYYY-MM-DD'))
			}
			this.getActivityData(dates);
			this.getRiskData(dates);
			// this.getLoaModifiedData(this.userId, this.dateInput, 'weekly', 'activity');
			// this.getLoaModifiedData(this.userId, this.dateInput, 'weekly', 'risk');
		})
	}
	timeZone = moment.parseZone().utcOffset();
	getActivityData(dates: string[]){
		this.showActiveGraph = false;
		this.noActiveData = false;
		this.initialDates = {
			startDate: moment(dates[dates.length - 1]),
			endDate: moment(dates[0])
		}
		this.commonHttp.getActivityReports().subscribe((data: any) => {
			if(data.itemCount > 0){
				let residentValues = data.body.filter(val => val.details.resident_id === this.userId);
				const unique = [];
				residentValues.forEach(val => {
					const exists = unique.find(value => value.meta.Rdate === val.meta.Rdate);
					if(!exists && dates.includes(val.meta.Rdate)){
						unique.push(val);
					}
				})
				residentValues = unique;
				const others= [];
				if(residentValues.length > 0){
					dates.forEach(val => {
						const exists = residentValues.find(value => value.meta.Rdate === val);
						if(!exists){
							others.push({
								meta: {Rdate: val},
								summary: {
									total_active: 0,
									total_inactive: 0,
									total_notuse: 0
								}
							})
						}
					})
				}
				residentValues = [...residentValues,...others];
				residentValues.sort((a:any,b: any) => {
					return new Date(a.meta.Rdate).getTime() > new Date(b.meta.Rdate).getTime() ? 1: -1
				})
				if(residentValues.length > 0){
					const active = residentValues.map(val => {
						return [parseInt(moment(val.meta.Rdate).add(this.timeZone, 'minutes').format('X')) * 1000, parseInt(val.summary.total_active) / 60]
					})
					const inactive = residentValues.map(val => {
						return [parseInt(moment(val.meta.Rdate).add(this.timeZone, 'minutes').format('X')) * 1000, parseInt(val.summary.total_inactive) / 60]
					})
					const notUse = residentValues.map(val => {
						return [parseInt(moment(val.meta.Rdate).add(this.timeZone, 'minutes').format('X')) * 1000, parseInt(val.summary.total_notuse) / 60]
					})
					this.activeGraphOptions.series[0].data = active;
					this.activeGraphOptions.series[1].data = inactive;
					this.activeGraphOptions.series[2].data = notUse;
					this.showActiveGraph = true;
					this.noActiveData = false;
				}else{
					this.showActiveGraph = false;
					this.noActiveData = true;
				}
			}else{
				this.showActiveGraph = false;
				this.noActiveData = true;
			}
		})
	}
	getRiskData(dates: string[]){
		this.showRiskGraph = false;
		this.noRiskData = false;
		this.initialRiskDates = {
			startDate: moment(dates[dates.length - 1]),
			endDate: moment(dates[0])
		}
		this.commonHttp.getRiskReports().subscribe((data: any) => {
			if(data.itemCount > 0){
				let residentValues = data.body.filter(val => val.details.resident_id === this.userId);
				const unique = [];
				residentValues.forEach(val => {
					const exists = unique.find(value => value.meta.Rdate === val.meta.Rdate);
					if(!exists && dates.includes(val.meta.Rdate)){
						unique.push(val);
					}
				})
				residentValues = unique;
				const others= [];
				if(residentValues.length > 0){
					dates.forEach(val => {
						const exists = residentValues.find(value => value.meta.Rdate === val);
						if(!exists){
							others.push({
								meta: {Rdate: val},
								summary: {
									balance_percentage: '0',
									sleep_percentage: '0',
									strength_percentage: '0'
								}
							})
						}
					})
				}
				residentValues = [...residentValues,...others];
				residentValues.sort((a:any,b: any) => {
					return new Date(a.meta.Rdate).getTime() > new Date(b.meta.Rdate).getTime() ? 1: -1
				})
				if(residentValues.length > 0){
					const categories = residentValues.map(val => { return parseInt(moment(val.meta.Rdate).add(this.timeZone, 'minutes').format('X')) * 1000});
					let maxSleep = 0;
					let maxBalance = 0;
					let maxStrength = 0;
					residentValues.forEach(val => {
						if(maxSleep < parseInt(val.summary.sleep_percentage)){
							maxSleep = parseInt(val.summary.sleep_percentage)
						}
						if(maxBalance < parseInt(val.summary.balance_percentage)){
							maxBalance = parseInt(val.summary.balance_percentage)
						}
						if(maxStrength < parseInt(val.summary.strength_percentage)){
							maxStrength = parseInt(val.summary.strength_percentage)
						}
					})
					const balance = residentValues.map(val => {
						return Math.round((parseInt(val.summary.balance_percentage)/maxBalance) * 100)
					})
					const sleep = residentValues.map(val => {
						return Math.round((parseInt(val.summary.sleep_percentage)/maxSleep) * 100)
					})
					const strength = residentValues.map(val => {
						return Math.round((parseInt(val.summary.strength_percentage)/maxStrength) * 100)
					})
					this.bssChartOptions.series[0].data = balance;
					this.bssChartOptions.series[1].data = strength;
					this.bssChartOptions.series[2].data = sleep;
					this.bssChartOptions.xaxis.categories = categories;
					this.showRiskGraph = true;
					this.noRiskData = false;
				}else{
					this.showRiskGraph = false;
					this.noRiskData = true; 
				}
			}else{
				this.showRiskGraph = false;
				this.noRiskData = true; 
			}
		})
	}
	
	activityLoading = false;
	weeklyDates: any;
	intervalType: string = '';
	activityFilter = 'Last 7 days';
	riskFilter = 'Last 7 days';
	initialDates: any = {
	}
	initialRiskDates: any = {
	}
	momentToday = moment();
	change(e: any, type: string) {
		const diff = moment(e.endDate).diff(moment(e.startDate), 'days');
		const dates = [];
		for(let i=0; i<diff + 1; i++){
			dates.push(moment(e.endDate).subtract(i, 'days').format('YYYY-MM-DD'))
		}
		if (type === 'activity') {
			this.getActivityData(dates)
		} else {
			this.getRiskData(dates)
		}
	}
	getFilterFormat() {
		return this.timeFormat.getFilterFormat()
	}
	updateFilter(option: any): void {
		this.activityFilter = option;
		if (option !== 'Custom range') {
			const dates = [];
			for(let i=1; i<8; i++){
				dates.push(moment().subtract(i, 'days').format('YYYY-MM-DD'))
			}
			this.getActivityData(dates);
		}
	}
	updateRisk(option: any): void {
		this.riskFilter = option;
		if (option !== 'Custom range') {
			const dates = [];
			for(let i=1; i<8; i++){
				dates.push(moment().subtract(i, 'days').format('YYYY-MM-DD'))
			}
			this.getRiskData(dates);
		}
	}

	comparision = 0;
	summaryData: any[] = [];
	noActiveData = true;
	activityDates: any;
	noRiskData = true;
	riskDates: any;
	todaysActivityInfo = {
		active: 0,
		inactive: 0
	}
	todaysActivityPercent: { walk: number; sit: number; sleep: number; active: number } = {
		walk: 0,
		sit: 0,
		sleep: 0,
		active: 0
	};
}
