import { Component, Input, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import * as moment from 'moment';
import * as _LODASH from 'lodash';
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexMarkers, ApexTitleSubtitle, ApexYAxis, ApexXAxis, ApexTooltip, ApexStroke, ApexAnnotations, ApexGrid, ApexLegend, ApexPlotOptions, ChartComponent } from 'ng-apexcharts';
import { CommonHttpService } from '../../../../shared/services/http-services/common-http.service';
import { TimeFormatService } from '../../../../shared/services/time-format.service';
import { questionnireService } from '../../../questionnaire-service/ques.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

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

export enum LoadingState {
	LOADING,
	LOADED,
	NODATA
}

@Component({
	selector: 'app-overview',
	templateUrl: './overview.component.html',
	styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {

	@ViewChild("chart", { static: false }) chart: ChartComponent;
	public chartOptions: Partial<ChartOptions>;
	titleShow = false;
	showFilter = false;
	loadingStateType = LoadingState;
	activityProLoading: LoadingState = LoadingState.NODATA;
	activityRecord: any;
	activeActivityPercentage = 0;
	avgActivePercentage = 0;
	stepActivityPercentage = 0;
	avgStepPercentage = 0;
	sittingActivityPercentage = 0;
	avgSittingPercentage = 0;
	sleepActivityPercentage = 0;
	avgSleepPercentage = 0;
	todaysActivityRecord: any = {
		walking_steps: 0,
		sleeping_time: 0,
		sitting_time: 0,
		walking_time: 0,
		active_time: 0,
		doffed_time: 0,
		charging_time: 0,
		unknown_time: 0
	};
	timeToAdded: number = 0;
	momentToday = moment();
	constructor(private commonHttp: CommonHttpService,private http: HttpClient, private timeFormat: TimeFormatService, private questionnaireService: questionnireService) {
		this.timeToAdded =moment.parseZone().utcOffset();//moment.parseZone("2013 01 01 +03:30", 'YYYY MM DD ZZ', 'fr', true).utcOffset();// moment.parseZone().utcOffset();
		const minutes = this.timeToAdded % 60;
		const hours = Math.floor(this.timeToAdded / 60);
		this.dateInput.setHours(0);
		this.dateInput.setMinutes(0);
		this.dateInput.setSeconds(0);
		this.maxPeriods = {
			'6hr': this.sixHours.setHours(this.todayDate.getHours() - 6),
			'12hr': this.twelveHours.setHours(this.todayDate.getHours() - 12),
			'24hrs': this.oneDay.setHours(this.todayDate.getHours() - 24),
			'7 days': this.weekly.setDate(this.todayDate.getDate() - 7),
			'1 Month': this.monthly.setMonth(this.todayDate.getMonth() - 1),
			'3m': this.quarterly.setMonth(this.todayDate.getMonth() - 3),
			'6m': this.halfYearly.setMonth(this.todayDate.getMonth() - 6),
			'1y': this.yearly.setFullYear(this.todayDate.getFullYear() - 1)
		}
		this.updateOptionsData = {
			"6hr": {
				xaxis: {
					xaxis: {
						max: this.todayDate.getTime(),
						min: this.maxPeriods['6hr']
					}
				},
				graphFor: '6 hours'
			},
			"12hr": {
				xaxis: {
					xaxis: {
						max: this.todayDate.getTime(),
						min: this.maxPeriods['12hr']
					}
				},
				graphFor: '12 hours'
			},
			"24hrs": {
				xaxis: {
					xaxis: {
						max: this.todayDate.getTime(),
						min: this.maxPeriods['24hrs']
					}
				},
				graphFor: '24 hours'
			},
			"7 days": {
				xaxis: {
					xaxis: {
						max: this.todayDate.getTime(),
						min: this.maxPeriods['7 days']
					}
				},
				graphFor: '7 days'
			},
			"3m": {
				xaxis: {
					xaxis: {
						max: this.todayDate.getTime(),
						min: this.maxPeriods['3m']
					}
				},
				graphFor: '3 months'
			},
			"6m": {
				xaxis: {
					xaxis: {
						max: this.todayDate.getTime(),
						min: this.maxPeriods['6m']
					}
				},
				graphFor: '6 months'
			},
			"1 Month": {
				xaxis: {
					xaxis: {
						max: this.todayDate.getTime(),
						min: this.maxPeriods['1 Month']
					}
				},
				graphFor: '1 month'
			},
			"1y": {
				xaxis: {
					xaxis: {
						max: this.todayDate.getTime(),
						min: this.maxPeriods['1y']
					}
				},
				graphFor: '1 year'
			},
			all: {
				xaxis: {
					xaxis: {
						min: this.maxPeriods['1y'],
						max: this.todayDate.getTime()
					}
				},
				graphFor: 'Till now'
			}
		};
		this.chartOptions = {
				series: [  
					],
				  chart: {
					type: 'bar',
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
				dataLabels: {
					enabled: false
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
				markers: {
					size: 0,
				},
				xaxis: {
					type: "datetime",
					max: this.todayDate.getTime(),
					min: this.maxPeriods['6h'],
					title: {
						text: 'Time',
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
				},
				yaxis: {
					title: {
						text: 'Level of Activity',
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
					max: 2
				},
				tooltip: {
					x: {
						format: "dd/MM/yyyy HH:mm"
					},
					y: {
						formatter: function(val: any) {
							if(val !== 0){
								return ''
							}else{
								return val + ''
							}
						},
					},
				},
				colors: ['#015174','#87657d','#a6bcc9','#aaa093','#a6bcc9','red','green'],
				stroke: {
					show: true,
					curve: 'stepline',
					lineCap: 'butt',
					colors: undefined,
					width: 2,
					dashArray: 0,      
				},	
				fill: {
					colors: ['#aaa093','#87657d','#a6bcc9','#a6bcc9','#015174','red','green'],
					opacity: 1,
					type: 'solid',
					gradient: {
						shade: 'light',
						type: "vertical",
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
	residentData: any;
	updatedAt: string;
	fallUpdatedAt:string;
	questionnaire: any;
	preExistingCondition: any;
	fallCount: any;
	@Input('userData')
	set user(event: any) {
		this.residentData = event;
		if (this.residentData && this.residentData.user_id) {
			const buildObj: any = {};
			buildObj['id'] = this.residentData?.questionnaire['questionnaire_id'];
			buildObj['Questionnaire_type'] = this.residentData?.questionnaire['questionnaire_type'];
			buildObj['Questionnaire_score'] = this.residentData?.questionnaire['questionnaire_score'];
			buildObj['Date_taken_on'] = this.residentData?.questionnaire['created_at'];
			buildObj['Taken_by'] = this.residentData?.questionnaire['created_by'];
			buildObj['Interpretations'] = this.calculateQues(parseInt(this.residentData?.questionnaire['questionnaire_score']));
			buildObj['total'] = this.residentData?.questionnaire;
			this.questionnaire = buildObj;
			const dates = [];
			for(let i=0; i<8; i++){
				dates.push(moment().subtract(i, 'days').format('YYYY-MM-DD'))
			}
			this.getAnalysisData(dates);
			this.getLoaDataNew('6hr',this.updateOptionsData['6hr'].xaxis.xaxis);
		}
		this.fallCount = this.residentData?.totalFalls;// + parseInt(this.getFallenData(this.residentData?.questionnaire?.questions));
		this.preExistingCondition = this.residentData?.medical_history;
		this.updatedAt = this.residentData?.updated_at;
		this.fallUpdatedAt=this.residentData?.fall_update;
	}
	getFallenData(questions: any[]){
		if(questions){
			return questions.find(val => val.question === 'How many times you have fallen?').answerValue
		}else{
			return 0
		}
	}
	get user() {
		return this.residentData;
	}
	inRange(values: any[], dates: string[]){
		let exists = false;
		values.forEach(val => {
			if(dates.includes(val.meta.Rdate)){
				exists = true;
			}
		})
		return exists;
	}
	getAnalysisData(dates: string[]){
		this.progressDates = {
			startDate: moment(dates[dates.length -1]),
			endDate: moment(dates[0])
		}
		this.activityProLoading = LoadingState.LOADING;
		this.commonHttp.getActiveAnalysis().subscribe((data: any) => {
			if(data.itemCount > 0){
				let residentValues = data.body.filter(val => val.details.resident_id === this.residentData.user_id);
				const unique = [];
				residentValues.forEach(val => {
					const exists = unique.find(value => value.meta.Rdate === val.meta.Rdate);
					if(!exists){
						unique.push(val);
					}
				})
				residentValues = unique;
				residentValues = residentValues.map(val => {
					return {
						meta: {Rdate: val.meta.Rdate},
						summary: {
							active_time: parseInt(val.summary.active_time),
							battery_time: parseInt(val.summary.battery_time),
							doffed_time: parseInt(val.summary.doffed_time),
							sitting_time: parseInt(val.summary.sitting_time),
							sleeping_time: parseInt(val.summary.sleeping_time),
							walking_steps: parseInt(val.summary.walking_steps),
							walking_time: parseInt(val.summary.walking_time)
						}
					}
				})
				let avgStep = 0;
				let avgSitTime = 0;
				let avgSleepTime = 0;
				let avgActive = 0;
				let maxActive = 0;
				let maxStep = 0;
				let maxSit = 0;
				let maxSleep = 0;
				residentValues = residentValues.filter(data => {
					if(data.meta.Rdate === moment().format('YYYY-MM-DD')){
						this.todaysActivityRecord = {...data.summary};
						return false;
					}else{
						return true;
					}
				})
				residentValues = residentValues.filter(val => dates.includes(val.meta.Rdate));
				if(residentValues.length > 0 && this.inRange(residentValues, dates)){
					const others = [];
					dates.forEach(val => {
						const exists = residentValues.find(value => value.meta.Rdate === val);
						if(!exists){
							others.push({
								meta: {Rdate: val},
								summary: {
									active_time: 0,
									battery_time: 0,
									doffed_time: 0,
									sitting_time: 0,
									sleeping_time: 0,
									walking_steps: 0,
									walking_time: 0
								}
							})
						}
					})
					residentValues.sort((a:any,b: any) => {
						return new Date(a.meta.Rdate).getTime() > new Date(b.meta.Rdate).getTime() ? 1: -1
					})
					residentValues.forEach(val => {
						if(maxActive < val.summary.active_time){
							maxActive = val.summary.active_time;
						}
						if(maxSit < val.summary.sitting_time){
							maxSit = val.summary.sitting_time;
						}
						if(maxSleep < val.summary.sleeping_time){
							maxSleep = val.summary.sleeping_time;
						}
						if(maxStep < val.summary.walking_steps){
							maxStep = val.summary.walking_steps;
						}
						avgActive = avgActive + val.summary.active_time;
						avgSitTime = avgSitTime + val.summary.sitting_time;
						avgSleepTime = avgSleepTime + val.summary.sleeping_time;
						avgStep = avgStep + val.summary.walking_steps;
					})
					if(residentValues.length < 1){
						this.activityProLoading = LoadingState.NODATA;
					}
					avgActive = avgActive / residentValues.length;
					avgActive = parseFloat((Math.round(avgActive * 100) / 100).toFixed(2));
					avgSitTime = avgSitTime / residentValues.length;
					avgSitTime = parseFloat((Math.round(avgSitTime * 100) / 100).toFixed(2));
					avgSleepTime = avgSleepTime / residentValues.length;
					avgSleepTime = parseFloat((Math.round(avgSleepTime * 100) / 100).toFixed(2));
					avgStep = avgStep / residentValues.length;
					avgStep = Math.round(avgStep);
					this.activityRecord = {
						avgWalk: avgStep,
						maxWalk: maxStep,
						avgSleep: avgSleepTime,
						maxSleep,
						avgSit: avgSitTime,
						maxSit,
						avgActive,
						maxActive
					}
					this.sittingActivityPercentage = maxSit === 0 ? 0 : (Math.round(this.todaysActivityRecord.sitting_time/maxSit * 100) > 100 ? 100 : Math.round(this.todaysActivityRecord.sitting_time/maxSit * 100));
					this.stepActivityPercentage = maxStep === 0 ? 0 : Math.round(this.todaysActivityRecord.walking_steps/maxStep * 100) > 100 ? 100 : Math.round(this.todaysActivityRecord.walking_steps/maxStep * 100);
					this.sleepActivityPercentage = maxSleep === 0 ? 0 : Math.round(this.todaysActivityRecord.sleeping_time/maxSleep * 100) > 100 ? 100 : Math.round(this.todaysActivityRecord.sleeping_time/maxSleep * 100);
					this.activeActivityPercentage = maxActive === 0 ? 0 : Math.round(this.todaysActivityRecord.active_time/maxActive * 100) > 100 ? 100 : Math.round(this.todaysActivityRecord.active_time/maxActive * 100);
					this.avgActivePercentage = avgActive === 0 ? 0 : Math.round((avgActive)/maxActive * 100) > 100 ? 100 : Math.round((avgActive)/maxActive * 100);
					this.avgSleepPercentage = avgSleepTime === 0 ? 0 : Math.round((avgSleepTime)/maxSleep * 100) > 100 ? 100 : Math.round((avgSleepTime)/maxSleep * 100);
					this.avgStepPercentage = avgStep === 0 ? 0 : Math.round((avgStep)/maxStep * 100) > 100 ? 100 : Math.round((avgStep)/maxStep * 100);
					this.avgSittingPercentage = avgSitTime === 0 ? 0 : Math.round((avgSitTime)/maxSit * 100) > 100 ? 100 : Math.round((avgSitTime)/maxSit * 100);
					this.activityProLoading = LoadingState.LOADED;
				}else{
					this.activityProLoading = LoadingState.NODATA;
				}
			}else{
				this.activityProLoading = LoadingState.NODATA;
			}
		})
	}
	getLatest(residentUpdated: any) {
		return residentUpdated
	}
	@Output() viewSelected = new EventEmitter();

	ngOnInit(): void {
	}
	getFilterFormat() {
		return this.timeFormat.getFilterFormat()
	}
	dateInput = new Date()
	dateRange: any = null;
	analysisFilter: string = 'Last 7 days';
	updateAnalysis(option: any): void {
		this.analysisFilter = option;
		if (option !== 'Custom range') {
			const dates = [];
			for(let i=0; i<8; i++){
				dates.push(moment().subtract(i, 'days').format('YYYY-MM-DD'))
			}
			this.getAnalysisData(dates);
		}
	}
	changeProgress(e: any) {
		const diff = moment(e.endDate).diff(moment(e.startDate), 'days');
		const dates = [];
		for(let i=0; i<diff + 1; i++){
			dates.push(moment(e.endDate).subtract(i, 'days').format('YYYY-MM-DD'))
		}
		this.getAnalysisData(dates);
	}
	analysisProgressDates: any;
	progressDates: any = {
	};
	questionnaires: any[];
	getQuestionnaires() {
		let data = [];
		this.commonHttp.getQuestionnaireDetails().subscribe((allQuestionnaires: any) => {
			const questions = allQuestionnaires.body.filter(value => value.details.resident_id === this.residentData.user_id)
			questions.forEach(questionnaire => {
				const buildObj = {};
				buildObj['id'] = questionnaire.details['questionnaire_id'];
				buildObj['Questionnaire_type'] = questionnaire.details['questionnaire_type'];
				buildObj['Questionnaire_score'] = questionnaire.details['questionnaire_score'];
				buildObj['Date_taken_on'] = questionnaire.meta['created_at'];
				buildObj['Taken_by'] = questionnaire.meta['created_by'];
				buildObj['Interpretations'] = this.calculateQues(parseInt(questionnaire.details['questionnaire_score']));
				buildObj['total'] = questionnaire.questions.questions;
				data.push(buildObj);
			})
			this.questionnaire = data.sort((a: any, b: any) => {
				return a.Date_taken_on < b.Date_taken_on ? 1 : -1;
			})[0];
		})
	}
	summaryData: any[] = [];
	comparision = 0;
	activityUpdated: any;

	getQuestionnaire() {
		// if (Array.isArray(this.questionnaire)) {	
		// 	if (this.questionnaires && this.questionnaires.length > 0) {	
		// 		this.questionnaire = this.questionnaires[0].total;	
		// 		return true	
		// 	}	
		// } else {	
		// 	return true;	
		// }
		if (this.questionnaire) {
			return true
		}
	}
	getQuestionType(value: string) {
		return value?.split(/(?=[A-Z])/).join(" ")
	}

	getFromNow(value: any) {
		return moment(value).fromNow()
	}

	calculateQues(scoreValue: Number) {
		let value = '';
		if( _LODASH.inRange(scoreValue,0,3) )
		value = 'Normal';
		else
			value = 'High';
		return value;
	}

	getWalkAbility() {
		if(this.questionnaire && this.questionnaire?.total?.questions){
			if(this.questionnaire?.Questionnaire_type === 'Stay Independent'){
				const walkingAbility = this.questionnaire?.total?.questions.find(question => question.questionID === 10116);
				if(walkingAbility){
					const answer = this.questionnaire?.total?.questions.find(question => question.questionID === 10116).answers.find(answer => answer.answerID === walkingAbility.answerValue);
					return answer.answer.split(' ')[0];
				}else{
					return 'Safe'
				}
			}else{
				const walkingAbility = this.questionnaire?.total?.questions.find(question => question.questionID === 10305);
				if(walkingAbility){
					const answer = this.questionnaire?.total?.questions.find(question => question.questionID === 10305).answers.find(answer => answer.answerID === walkingAbility.answerValue);
					return answer.answer.split(' ')[0];
				}else{
					return 'Safe'
				}
			}
		}else{
			return '--'
		}
	}
	getMedication() {
		const existed = this.preExistingCondition?.questions.find((question: any) => question.questionID === 10207)
		if (existed && existed.answerValue) {
			return 'Yes'
		} else {
			return 'No'
		}
	}

	gotoTab(value: string) {
		this.viewSelected.emit(value);
	}
	getTimeInHrs(minutes: number) {
		return `${Math.floor(minutes / 60) > 9 ? Math.floor(minutes / 60) : '0' + Math.floor(minutes / 60)}:${Math.ceil(minutes % 60 / 5) * 5 > 5 ? Math.ceil(minutes % 60 / 5) * 5 : '0' + Math.ceil(minutes % 60 / 5) * 5}`
	}
	showLoaGraph: LoadingState = LoadingState.LOADING;
	lastUpdatedAt: any;
	nextUpdatedAt: any;
	todayDate = new Date();
	sixHours = new Date();
	twelveHours = new Date();
	oneDay = new Date();
	weekly = new Date();
	monthly = new Date();
	quarterly = new Date();
	halfYearly = new Date();
	yearly = new Date();
	maxPeriods: any;
	updateOptionsData: any;
	graphFor = '6 hours';
	public updateOptions(option: any): void {
		const xaxis = this.updateOptionsData[option].xaxis.xaxis;
		this.getLoaDataNew(option, xaxis);
		this.graphFor = this.updateOptionsData[option].graphFor;
	}

	timeZone =moment.parseZone().utcOffset();// moment.parseZone("2013 01 01 +03:30", 'YYYY MM DD ZZ', 'fr', true).utcOffset();//moment.parseZone().utcOffset();
	getLoaDataNew(interval: string,xaxis: any){
		this.showLoaGraph = LoadingState.LOADING;
		let loa_data: any[] = [];
		let apiCall: any;
		switch(interval){
			case '6hr':
				apiCall = this.commonHttp.getActivityFeedSixHoursData(this.residentData.user_id);
				break;
			case '12hr':
				apiCall = this.commonHttp.getActivityFeedTwelveHoursData(this.residentData.user_id);
				break;
			case '24hrs':
				apiCall = this.commonHttp.getActivityFeedTwoFourHoursData(this.residentData.user_id);
				break;
			case '7 days':
				apiCall = this.commonHttp.getActivityFeedSevenDaysData(this.residentData.user_id);
				break;
		}
		apiCall.subscribe((data: any) => {
			if(data.itemCount > 0){
				data.body.forEach(val => {
					loa_data.push(...val.loa .graph_data);
				})
				const activityUnknown = [];
				const activitySleep = [];
				const activitySitting = [];
				const activityWalk = [];
				const activityRun = [];
				const activityActive = [];
				const activityDoffed = [];
				const activityCharging = [];
				loa_data.forEach((item : any,index : Number) => {
				switch(item.actper){
				case 0:
		            activityUnknown.push([parseInt(moment(parseInt(item['stmp'])*1000).add(this.timeZone,'minutes').format("X")) * 1000, '0.5']);
					break;
				case 1:
					activitySleep.push([parseInt(moment(parseInt(item['stmp'])*1000).add(this.timeZone,'minutes').format("X")) * 1000, '0.5']);
					break;
				case 2: 
				activitySitting.push([parseInt(moment(parseInt(item['stmp'])*1000).add(this.timeZone,'minutes').format("X")) * 1000, 1]);
					break;
				case 3:
					activityWalk.push([parseInt(moment(parseInt(item['stmp'])*1000).add(this.timeZone,'minutes').format("X")) * 1000, 2]);
					break;
				case 4:
					activityRun.push([parseInt(moment(parseInt(item['stmp'])*1000).add(this.timeZone,'minutes').format("X")) * 1000, 2]);
					break;
				case 13:
					activityActive.push([parseInt(moment(parseInt(item['stmp'])*1000).add(this.timeZone,'minutes').format("X")) * 1000, '1.5']);
					break;
				case 16:
					activityDoffed.push([parseInt(moment(parseInt(item['stmp'])*1000).add(this.timeZone,'minutes').format("X")) * 1000, '0.2']);
					break;
				case 255:
					activityCharging.push([parseInt(moment(parseInt(item['stmp'])*1000).add(this.timeZone,'minutes').format("X")) * 1000, '0.3']);
					break;
				}
				this.lastUpdatedAt = moment(parseInt(item['stmp'])*1000).fromNow(true);
				this.nextUpdatedAt = moment(parseInt(item['stmp'])*1000).add(1,'hours').fromNow(true);
				});
				const series = [
				{
					name: 'Active',
					data: activityActive
				},
				{
					name: 'Sitting',
					data: activitySitting
				},
				{
					name: 'Walking',
					data: activityWalk
				},
				{
					name: 'Sleeping',
					data: activitySleep
				},
				]
				if(xaxis){
					this.chartOptions.xaxis.max = parseInt(moment(xaxis.max).add(this.timeToAdded, 'minutes').format('X')) * 1000;
					this.chartOptions.xaxis.min = parseInt(moment(xaxis.min).add(this.timeToAdded, 'minutes').format('X')) * 1000;
				}
				this.chartOptions.series = series;
				this.showLoaGraph = LoadingState.LOADED;
			}else{
				this.showLoaGraph = LoadingState.NODATA;
			}
		})
	}
}
