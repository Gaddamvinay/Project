import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import * as moment from 'moment';
import { date } from 'ngx-custom-validators/src/app/date/validator';
import { environment } from '../../../../../environments/environment';
import { CommonHttpService } from '../../../../shared/services/http-services/common-http.service';

@Component({
  selector: 'app-insight',
  templateUrl: './insight.component.html',
  styleUrls: ['./insight.component.scss']
})
export class InsightComponent implements OnInit {
  insightHistory: any[] = [];
  constructor(private commonHttp: CommonHttpService,private route: ActivatedRoute, private http: HttpClient) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.userId = params.get('userId');
      // this.getResidentData();
    })
  }

  ngOnInit(): void {
  }
  userId: string = '';
  residentName: string = '';
  todaysActivityRecord: any = {
		active_time: 0,
    battery_time: 0,
    doffed_time: 0,
    sitting_time: 0,
    sleeping_time: 0,
    walking_steps: 0,
    walking_time: 0
  };
  residentData: any;
  @Input('userData')
	set user(event: any) {
    this.residentData = event;
    this.residentName = this.residentData?.firstName + " " + this.residentData?.lastName
    const dates = [];
    for(let i=0; i<8; i++){
      dates.push(moment().subtract(i, 'days').format('YYYY-MM-DD'))
    }
    if(this.residentData && this.residentData.user_id){
      this.getAnalysisData(dates);
    }
	}
	get user() {
		return this.residentData;
	}
  getTimeInHrs(minutes: number) {

		return `${Math.floor(minutes / 60) > 9 ? Math.floor(minutes / 60) : '0' + Math.floor(minutes / 60)}:${Math.ceil(minutes % 60 / 5) * 5 > 5 ? Math.ceil(minutes % 60 / 5) * 5 : '0' + Math.ceil(minutes % 60 / 5) * 5}`
}
  activeActivityPercentage = 0;
	avgActivePercentage = 0;
	stepActivityPercentage = 0;
	avgStepPercentage = 0;
	sittingActivityPercentage = 0;
	avgSittingPercentage = 0;
	sleepActivityPercentage = 0;
  avgSleepPercentage = 0;
  noData = true;
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
		this.noData = false;
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
						this.noData = true;
					}else{
            avgActive = avgActive / residentValues.length;
            avgActive = parseFloat((Math.round(avgActive * 100) / 100).toFixed(2));
            avgSitTime = avgSitTime / residentValues.length;
            avgSitTime = parseFloat((Math.round(avgSitTime * 100) / 100).toFixed(2));
            avgSleepTime = avgSleepTime / residentValues.length;
            avgSleepTime = parseFloat((Math.round(avgSleepTime * 100) / 100).toFixed(2));
           avgStep = avgStep / residentValues.length;
            avgStep = Math.round(avgStep);
            const activityRecord = {
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
            const dominate = this.getDominate(this.todaysActivityRecord.sleeping_time,this.todaysActivityRecord.sitting_time,this.todaysActivityRecord.active_time);
           this.insightHistory = [
            {
              eventType: 'sleeping',
              content: `${this.residentName} has been in sleeping state for ${this.getTimeInHrs(this.todaysActivityRecord.sleeping_time)} hours today. When compared to last 7 days, average sleeping time is ${this.getTimeInHrs(activityRecord.avgSleep)} hours and maximum sleeping time is ${this.getTimeInHrs(activityRecord.maxSleep)} hours`,
              date: new Date()
            },
            {
              eventType: 'sitting',
              content: `${this.residentName} has been in sitting state for ${this.getTimeInHrs(this.todaysActivityRecord.sitting_time)} hours today. When compared to last 7 days, average sitting time is ${this.getTimeInHrs(activityRecord.avgSit)} hours and maximum sitting time is ${this.getTimeInHrs(activityRecord.maxSit)} hours`,
              date: new Date()
            },
            {
              eventType: 'active',
              content: `${this.residentName} has been in active state for ${this.getTimeInHrs(this.todaysActivityRecord.active_time)} hours today.  When compared to last 7 days, average active time is ${this.getTimeInHrs(activityRecord.avgActive)} hours and maximum active time is ${this.getTimeInHrs(activityRecord.maxActive)} hours`,
              date: new Date()
            },
            {
              eventType: 'walking',
              content: `${this.residentName} has walked ${this.todaysActivityRecord.walking_steps} steps today.  When compared to last 7 days, average steps are ${activityRecord.avgWalk} and maximum steps are ${activityRecord.maxWalk}`,
              date: new Date()
            },
            {
              eventType: dominate.type.toLowerCase(),
              content: `${this.residentName}'s today's dominant position is "${dominate.type.toUpperCase()}"`,
              date: new Date()
            }
          ];
          }

				}else{
					this.noData = true;
				}
			}else{
				this.noData = true;
			}
		})
	}
  getDominate(sleep?: number,sit?: number, walk?: number, active?: number, doffed?: number, charging?: number, unknown?: number){
    const unsorted = [];
    if(sit)
    unsorted.push({
      type: 'Sitting',
      data: sit
    })
    if(sleep)
    unsorted.push({
      type: 'Sleeping',
      data: sleep
    })
    if(walk)
    unsorted.push({
      type: 'Walking',
      data: walk
    })
    if(active)
    unsorted.push({
      type: 'Active',
      data: active
    })
    if(charging)
    unsorted.push({
      type: 'Charging',
      data: charging
    })
    if(doffed)
    unsorted.push({
      type: 'Doffed',
      data: doffed
    })
    if(unknown)
    unsorted.push({
      type: 'Unknown',
      data: unknown
    })
    const sorted = unsorted.sort((a,b) => {
      return a.data < b.data ? 1: -1
    })
    const allZero = sorted.every(value => value.data === 0);
    return allZero ? {type: 'No data'}: sorted[0];
  }

}