import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { CommonAddModelComponent } from '../../../../shared/common-add-model/common-add-model.component';
import { questionnireService } from '../../../questionnaire-service/ques.service';
import { ChartOptions } from '../overview/overview.component';
import * as _LODASH from 'lodash';
import * as moment from 'moment';
import { DatePipe } from '@angular/common';
import { ChartComponent } from 'ng-apexcharts';
import { TimeFormatService } from '../../../../shared/services/time-format.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { CommonHttpService } from '../../../../shared/services/http-services/common-http.service';
interface questionnaire {
  Questionnaire_type: string;
  Taken_by: string;
  Date_taken_on: string;
  Questionnaire_score: string;
  Recommended_to_retake: string
}
@Component({
  selector: 'app-questionnaire',
  templateUrl: './questionnaire.component.html',
  styleUrls: ['./questionnaire.component.scss']
})
export class QuestionnaireComponent implements OnInit {
	defaultValue:string='';
  titleShow = false;
  widths = ['20%','12%','12%','11%','15%','15%','15%','11%'];
  displayedColumns: string[] = ['Questionnaire_name','Risk_of_fals','Walking_ability','Cognitive_ability','Medication','Taken_by','Date_taken_on','Interventions_acted_upon'];
  tableData: questionnaire[] = [];
  showFilter = false;

  @ViewChild("chart", { static: false }) chart: ChartComponent;
  @ViewChild('comment') inputName;
  public chartOptions: Partial<ChartOptions>;
  userId: string = '';
  commentCount:number=0;
  isDisabled:boolean;
  timeToAdded = 0;
  constructor(private matDialog: MatDialog,private datePipe:DatePipe,
    private commonHttp: CommonHttpService, private http: HttpClient,private questionnaireService: questionnireService, private timeFormat: TimeFormatService,private route:ActivatedRoute) {
	this.timeToAdded = moment.parseZone().utcOffset();
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.userId = params.get('userId');
      this.getQuestionnaire();
    })
    this.chartOptions = {
		series: [
			{
			name: 'Downton fall risk index',
			data: []
			},
			{
			name: 'Stay independent',
			data: []
			}
      	],
		chart: {
			type: "bar",
			height: 340,
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
			type: "category",
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
			  formatter: function(val: any) {
				const display = moment(val).format('DD/MM/YYYY')
				return display
			  },
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
				text: 'Risk level',
				offsetX: 6,
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
				show: true,
				style: {
				  colors: '#aaa093',
				  fontSize: '12px',
				  fontFamily: 'Whitney A,Whitney B,Helvetica,Arial,sans-serif',
				  fontWeight: 500,
				  cssClass: 'apexcharts-xaxis-label',
				},
				formatter: function(val: any) {
					const display = val === 2 ? 'High' : val === 1 ? 'Normal' : ''
					return display
				},
			  },
			tickAmount: 2,
			min: 0,
			max: 2
		},
		tooltip: {
			x: {
				formatter: function(val: any) {
					const display = moment(val).format('DD/MM/YYYY')
					return display
				},
			},
			y: {
				formatter: function(val: any) {
					const display = val === 2 ? 'High' : 'Normal'
					return display
				},
			},
		},
		colors: ['#015074','#87657d'],
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

  ngOnInit(): void {

  }
  @Output() callResident = new EventEmitter();

  questionnaires: any[] = [];
  questionnairesInfoLoading = false;
  count:number;
  noData = false;
  getFilterFormat(){
    return this.timeFormat.getFilterFormat();
  }
  momentToday = moment();
  physioDates: any;
  selectedFilter: string = 'Last 6 months';
  change(e: any){
    this.physioDates = {
      startDate: e.startDate,
      endDate: e.endDate
    }
    this.updateOptions(new Date(e.startDate).getTime(), new Date(e.endDate).getTime());
  }
  @HostListener('window:click', ['$event'])
  resetRightData (event: any) {
	this.rightData = false
  }
  getValue (val: any) {
	if (typeof val !== 'object') {
		return val
	}
  }
  specificInterval: number = 6;
  graphLoading = false;
  updateOptions(startDate?: any,endDate?: any){
	let max: number;
	let min: number;
	this.graphLoading = true;
	if(startDate){
		max = parseInt(moment(endDate).format('X')) * 1000;
		min =  parseInt(moment(startDate).format('X')) * 1000;
	}else{
		if(this.specificInterval === 6){
			min = parseInt(moment().subtract(6, 'months').add(this.timeToAdded, 'minutes').format('X')) * 1000;
			max =  parseInt(moment().add(this.timeToAdded, 'minutes').format('X')) * 1000;
			this.selectedFilter = 'Last 6 months';
		}else if(this.specificInterval === 12){
			min = parseInt(moment().subtract(12, "months").add(this.timeToAdded, 'minutes').format('X')) * 1000;
			max =  parseInt(moment().add(this.timeToAdded, 'minutes').format('X')) * 1000;
			this.selectedFilter = 'Last 12 months'
		}
	}
	let graphData: any[] = [];
	let categories: any[] = [];
	this.questionnaires.forEach(data => {
		const riskLabel = data.Interpretations === 'High' ? 2 : 1;
		graphData.push({
			date: moment(data.Date_taken_on).format(),
			type: data.Questionnaire_type,
			count: riskLabel
		})
	})
	let stayInter = graphData.filter(value => value.type === 'Stay Independent' || value.type === 'Stay Independent A').sort((a: any,b: any) => {
		return new Date(a.date).getTime() > new Date(b.date).getTime() ? -1 : 1
	})
	let intermediate = [];
	stayInter.forEach(val => {
		const exists = intermediate.find(value => moment(value.date).format('DD/MM/YYYY') === moment(val.date).format('DD/MM/YYYY'));
		if(!exists){
			intermediate.push(val);
		}
	})
	stayInter = intermediate;
	let downInter = graphData.filter(value => value.type !== 'Stay Independent' && value.type !== 'Stay Independent A').sort((a: any,b: any) => {
		return new Date(a.date).getTime() > new Date(b.date).getTime() ? -1 : 1
	})
	intermediate = [];
	downInter.forEach(val => {
		const exists = intermediate.find(value => moment(value.date).format('DD/MM/YYYY') === moment(val.date).format('DD/MM/YYYY'));
		if(!exists){
			intermediate.push(val);
		}
	})
	downInter = intermediate;
	graphData = [...downInter, ...stayInter];
	const maxEnd = graphData.find(value => moment(value.date).format('DD/MM/YYYY') === moment().format('DD/MM/YYYY'));
	const minEnd = graphData.find(value => moment(value.date).format('DD/MM/YYYY') === moment().subtract(this.specificInterval, 'months').format('DD/MM/YYYY'));
	if(!maxEnd){
		graphData.push({
			date: moment(max).format(),
			type: '',
		})
	}
	if(!minEnd){
		graphData.push({
			date: moment(min).format(),
			type: '',
		})
	}
	graphData = graphData.filter(value => max >= parseInt(moment(value.date).format('X')) * 1000 && min <= parseInt(moment(value.date).format('X')) * 1000);
	graphData.sort((a: any,b: any) => {
		return new Date(a.date).getTime() > new Date(b.date).getTime() ? 1 : -1
	})
	const down = [];
	const stay = [];
	graphData.forEach(value => {
		categories.push(value.date);
		if(value.type === 'Downton Fall Risk Index' || value.type === 'Downton Fall Risk Index A'){
			down.push(value.count);
			stay.push(null);
		}else if(value.type !== ''){
			stay.push(value.count);
			down.push(null);
		}else{
			stay.push(null);
			down.push(null)
		}
	})
	if(stay.length > 0 || down.length > 0){
		this.chartOptions.series[0].data = down;
		this.chartOptions.series[1].data = stay;
		this.chartOptions.xaxis.categories = categories;
	}else{
		this.noData = false;
	}
	setTimeout(() => {
		this.graphLoading = false;
	}, 400);
  }
  viewQuestion(event: any){
	let dialog: any;
    if(event.selected.Questionnaire_type === 'Stay Independent'){
      dialog = this.matDialog.open(CommonAddModelComponent, {
        disableClose: true,
        panelClass: 'dialog-popup',
        width: '920px',
        data: {
		  dialogType: 'View stay independent',
		  payload: event.selected.total
        }
      })
    }else{
      dialog = this.matDialog.open(CommonAddModelComponent,{
        disableClose: true,
        panelClass: 'dialog-popup',
        width: '920px',
        data: {
		  dialogType: 'View downton fall risk index',
		  payload: event.selected.total
        }
      })
	}
	dialog.afterClosed().subscribe(data => {
		if(data){
			this.callResident.emit();
			this.getQuestionnaire();
		}
	})
  }

  rightData = false
  rightDataValue: any;
  invData:any;
  comments:any; 
  openSideDiv (event: any) {
	  let eventAction=event.action?.split('-')
	  //console.log(event.selected.id);
	  if (eventAction[0] === 'showRight') {
		  this.count=eventAction[1]
		  setTimeout(() => {
			this.rightData = true;
			this.invData = event; 
			this.commonHttp.getComments(this.invData.selected.id).subscribe(data => {
			
				this.comments = data
			  
		  })
		  }, 1000)
		  this.rightDataValue = event.selected
	  }
  }
  getText (status) {     
	if(status==1) {
	  return "TO DO";       
	}else if(status==2) {
	  return "PLANNED";
	}else if(status==3){
	  return "IN PROGRESS";
	}
	else if(status==4){
	  return "DONE";
	}else {
	  return null;
	}
  }
  GetStatusValue(Info: string) {
    
	if (Info === "TO DO") {
	   return 1;
	 }else if (Info === "PLANNED") {
	   return 2;
	 }else if (Info === "IN PROGRESS") {
	   return 3;
	 }else if (Info === "DONE") {
	   return 4;
	 } else  {
	   return 0;
	 } 
	}
  select(pText: string, rowInfo: any) {
	// this.rightData = true;
	
	rowInfo.status = this.GetStatusValue(pText);
	let postdata={
		"id":rowInfo.id,
		"updatedBy":rowInfo.createdBy,
		"status" : this.GetStatusValue(pText),
	  }
	this.commonHttp.sendStatus(postdata).subscribe(data => {
             
  
      });
  }


sendit(data){
    var comment =data;

	var intervention = this.rightDataValue.id;
	var resident_id=this.rightDataValue.residentId;
	
	let user: any = localStorage.getItem('loggedInUser');
	if(user){
		user = JSON.parse(user);
	}
	const date = new Date();
	let postdata={
		"intervention_id":this.rightDataValue.id,
		"resident_id":this.rightDataValue.residentId,
		"caregiver_id":user.caregiver_id,
		"questionnaire_id":this.rightDataValue.questionnaire_id,
		"comment":comment,
		"created_at":moment(date).format("YYYY-MM-DD HH:mm:ss"),// this.datePipe.transform(new Date(), 'YYYY-MM-dd HH:mm:ss', 'UTC'),//
		
		
	  }
		this.commonHttp.sendComment(postdata).subscribe(data => {
		
	})
	this.defaultValue='';
	setTimeout(() => {
		
		this.commonHttp.getComments(this.invData.selected.id).subscribe(data => {
			this.comments = data
		  
	  })
	  }, 1000)
	
  this.inputName.nativeElement.value = ' ';
 }



  getRightValues (obj: any) {
	  return Object.keys(obj).length > 0 ? Object.keys(obj) : []
  }
  today = new Date();
  oneDay = new Date();
  getQuestionnaire() {
	let data = [];
	this.questionnairesInfoLoading = true;
	this.graphLoading = true;
	this.noData = false;
		this.commonHttp.getQuestionnaireDetails().subscribe((allQuestionnaires: any) => {
			//this.commonHttp.getNursingQuestionnaireDetails().subscribe((allQuestionnaires: any) => {
		
			if(allQuestionnaires.itemCount > 0){
				const questions = allQuestionnaires.body.filter(value => value.details.resident_id === this.userId)
				let count=0;
				questions.forEach(questionnaire => {
					const buildObj = {};
					buildObj['count'] =count++;
					buildObj['id'] = questionnaire.details['questionnaire_id'];
					buildObj['Questionnaire_name'] = questionnaire.details['questionnaire_type'];
					buildObj['Questionnaire_score'] = questionnaire.details['questionnaire_score'];
					buildObj['Date_taken_on'] = questionnaire.meta['created_at'];
					Risk_of_fals: //value.questionnaire_fall_count > 0 ? 'High' : 'Normal',
					buildObj['Interventions_acted_upon'] = questionnaire.details['intervention'] + ' out of ' + questionnaire.details['intervention_totalcount'];	
					buildObj['Taken_by'] = `${questionnaire.meta['created_by'].first_name} ${questionnaire.meta['created_by'].last_name}`;
					buildObj['Interpretations'] = this.calculateQues(parseInt(questionnaire.details['questionnaire_score']));
					buildObj['Risk_of_fals'] = this.calculateQueScore(parseInt(questionnaire.details['questionnaire_score']))+' ('+parseInt(questionnaire.details['questionnaire_score'])+')'
					buildObj['Walking_ability']= this.getWalkAbility({Questionnaire_type: questionnaire.details['questionnaire_type'], questions: questionnaire.questions.questions})
					buildObj['Cognitive_ability']= this.getCognitiveAbility({Questionnaire_type: questionnaire.details['questionnaire_type'], questions: questionnaire.questions.questions})
					buildObj['Medication']= this.getMedication({Questionnaire_type: questionnaire.details['questionnaire_type'], questions: questionnaire.questions.questions})
					buildObj['total'] = questionnaire.questions.questions;
					buildObj['showDetails'] = false;  
					
				
					data.push(buildObj);
				})
				this.questionnaires = data
			}
				this.tableData = data
				let graphData = [];
				let categories = [];
				this.questionnaires.forEach(data => {
					const riskLabel = data.Interpretations === 'High' ? 2 : 1;
					graphData.push({
						date: moment(data.Date_taken_on).format(),
						type: data.Questionnaire_type,
						count: riskLabel
					})
				})
				let stayInter = graphData.filter(value => value.type === 'Stay Independent' || value.type === 'Stay Independent A').sort((a: any,b: any) => {
					return new Date(a.date).getTime() > new Date(b.date).getTime() ? -1 : 1
				})
				let intermediate = [];
				stayInter.forEach(val => {
					const exists = intermediate.find(value => moment(value.date).format('DD/MM/YYYY') === moment(val.date).format('DD/MM/YYYY'));
					if(!exists){
						intermediate.push(val);
					}
				})
				stayInter = intermediate;
				let downInter = graphData.filter(value => value.type !== 'Stay Independent' && value.type !== 'Stay Independent A').sort((a: any,b: any) => {
					return new Date(a.date).getTime() > new Date(b.date).getTime() ? -1 : 1
				})
				intermediate = [];
				downInter.forEach(val => {
					const exists = intermediate.find(value => moment(value.date).format('DD/MM/YYYY') === moment(val.date).format('DD/MM/YYYY'));
					if(!exists){
						intermediate.push(val);
					}
				})
				downInter = intermediate;
				graphData = [...downInter, ...stayInter];
				const maxEnd = graphData.find(value => moment(value.date).format('DD/MM/YYYY') === moment().format('DD/MM/YYYY'));
				const minEnd = graphData.find(value => moment(value.date).format('DD/MM/YYYY') === moment().subtract(6, 'months').format('DD/MM/YYYY'));
				if(!maxEnd){
					graphData.push({
						date: moment().format(),
						type: '',
					})
				}
				if(!minEnd){
					graphData.push({
						date: moment().subtract(6, 'months').format(),
						type: '',
					})
				}
				graphData = graphData.filter(value => parseInt(moment().format('X')) * 1000 >= parseInt(moment(value.date).format('X')) * 1000 && parseInt(moment().subtract(6 , 'months').format('X')) * 1000 <= parseInt(moment(value.date).format('X')) * 1000);
				graphData.sort((a: any,b: any) => {
					return new Date(a.date).getTime() > new Date(b.date).getTime() ? 1 : -1
				})
				const down = [];
				const stay = [];
				graphData.forEach(value => {
					categories.push(value.date);
					if(value.type === 'Downton Fall Risk Index' || value.type === 'Downton Fall Risk Index A'){
						down.push(value.count);
						stay.push(null);
					}else if(value.type !== ''){
						stay.push(value.count);
						down.push(null);
					}else{
						stay.push(null);
						down.push(null)
					}
				})
				if(stay.length > 0 || down.length > 0){
					this.chartOptions.series[0].data = down;
					this.chartOptions.series[1].data = stay;
					this.chartOptions.xaxis.categories = categories;
				}else{
					this.noData = false;
				}
				this.questionnairesInfoLoading = false;
				this.graphLoading = false;
			// this.updateOptions(parseInt(moment(this.oneDay.setHours(this.today.getHours() - 4380)).format('X')) * 1000,parseInt(moment(this.today.getTime()).format('X')) * 1000);
		})
	}
	getRetakeValue(risk: any){
		const riskLabel = this.calculateQues(risk);
		return riskLabel === 'Normal' ? 'No' : 'Yes';
	}
	calculateQues(scoreValue: Number) {
		let value = '';
		if( _LODASH.inRange(scoreValue,0,3) )
		value = 'Normal';
    // else if( _LODASH.inRange(scoreValue,2,5))
    //   value = 'Medium Risk';
    else
      value = 'High';
    return value;
  }
  residentData:any = {};
  @Input('userData')
	set user(event: any) {
		this.residentData = event;
	}
	get user() {
		return this.residentData;
	}
	calculateQueScore(scoreValue: Number) {
		let value = '';
		if( _LODASH.inRange(scoreValue,0,3) || scoreValue > 100)
			value = 'Normal';
		// else if( _LODASH.inRange(scoreValue,2,5))
		// 	value = 'Normal';
		else
			value = 'High';
		return value;
	}
	getWalkAbility(questionnaire: any) {
		if(questionnaire && questionnaire?.questions){
			if(questionnaire?.Questionnaire_type === 'Stay Independent'){
				const walkingAbility = questionnaire?.questions.find(question => question.questionID === 10116);
				if(walkingAbility){
					const answer = questionnaire?.questions.find(question => question.questionID === 10116).answers.find(answer => answer.answerID === walkingAbility.answerValue);
					return answer.answer.split(' ')[0];
				}else{
					return 'Safe'
				}
			}else{
				const walkingAbility = questionnaire?.questions.find(question => question.questionID === 10305);
				if(walkingAbility){
					const answer = questionnaire?.questions.find(question => question.questionID === 10305).answers.find(answer => answer.answerID === walkingAbility.answerValue);
					return answer.answer.split(' ')[0];
				}else{
					return 'Safe'
				}
			}
		}else{
			return '--'
		}
	}
	getCognitiveAbility(questionnaire: any) {
		if(questionnaire && questionnaire?.questions){
				const walkingAbility = questionnaire?.questions.find(question => question.questionID === 10304);
				if(walkingAbility){
					const answer = questionnaire?.questions.find(question => question.questionID === 10304).answers.find(answer => answer.answerID === walkingAbility.answerValue);
					//console.log(answer);
					return answer.answer.split(' ')[0];
				}else{
					return 'Safe'
				}
			//}
		}else{
			return '--'
		}
	}

	
	// getMedication(questionnaire: any) {
	// 	if(questionnaire && questionnaire?.questions){
	// 		//console.log(JSON.stringify(questionnaire?.questions))
	// 			const walkingAbility = questionnaire?.questions.find(question => question.questionID === 10302);
	// 			if(walkingAbility){
	// 				//const answer = questionnaire?.questions.find(question => question.questionID === 10302).answers.find(answer => answer.answerID === walkingAbility.answerValue[0]);
	// 				const answer = questionnaire?.questions.find(question => question.questionID === 10302).answers.find(answer => answer.answerID === walkingAbility.answerValue[0]);
	// 				return answer.answer.split(' ')[0];
	// 				//return 'unsafe'
	// 			}else{
	// 				return 'Safe'
	// 			}
	// 		//}
	// 	}else{
	// 		return '--'
	// 	}
	// }
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

  openDialog(type: string){
	let dialog: any;
	const lastFallen = this.questionnaires[0];
    if(type === 'stayIndependent'){
      dialog = this.matDialog.open(CommonAddModelComponent, {
        disableClose: true,
        panelClass: 'dialog-popup',
        width: '920px',
        data: {
		  dialogType: 'Add stay independent',
		  questions: lastFallen ? lastFallen.total : [],
		  userId: this.userId,
		  wardId: this.residentData.wardId,
		  firstName: this.residentData.firstName,
		  lastName: this.residentData.lastName
        }
      })
    }else{
      dialog = this.matDialog.open(CommonAddModelComponent,{
        disableClose: true,
        panelClass: 'dialog-popup',
        width: '920px',
        data: {
			dialogType: 'Add downton fall risk index',
		  	questions: lastFallen? lastFallen.total : [],
		  	userId: this.userId,
			wardId: this.residentData.wardId,
			firstName: this.residentData.firstName,
			lastName: this.residentData.lastName
        }
      })
	}
	dialog.afterClosed().subscribe(data => {
		if(data){
			this.callResident.emit();
			this.getQuestionnaire();
		}
	})
  }
}


