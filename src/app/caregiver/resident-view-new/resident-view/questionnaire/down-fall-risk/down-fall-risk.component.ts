import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { CommonHttpService } from '../../../../../shared/services/http-services/common-http.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-down-fall-risk',
  templateUrl: './down-fall-risk.component.html',
  styleUrls: ['./down-fall-risk.component.scss']
})
export class DownFallRiskComponent implements OnInit {

  @Output() downFallValues = new EventEmitter();
  titleShow = false;
  medications: any[] = [
    {
      label: 'Tranquilizers / sedatives',
      answerId: '1030201' 
    },
    {
      label: 'Antidepressants',
      answerId: '1030202'
    },
    {
      label: 'Antihypertensives (other than diuretics)',
      answerId: '1030203'
    },
    {
      label: 'Diuretics',
      answerId: '1030205'
    },
    {
      label: 'Anti-Parkinson drugs',
      answerId: '1030204'
    },
    {
      label: 'Other medications',
      answerId: '1030206'
    },
    {
      label: 'None',
      answerId: '1030207'
    },
  ]
  disableText:boolean;
  checkOtherMedic(){
    if(this.downFallRiskIndex.length > 1){
      const medications = this.downFallRiskIndex.find((value: any) => value.questionID === 10302)?.answerValue?.includes('1030206');
      if(medications){
        return true;
      }
    }
    return false;
  }
  downFallRiskIndex: any[] = [];
  riskScore = 0;
  previousQuestion: any;
  loading = true;
  disabled = false;
  disableForm = false;
  constructor(private commonHttp: CommonHttpService,@Inject(MAT_DIALOG_DATA) public data: any,) {
    this.disableText = true;
    if(this.data.dialogType && this.data.dialogType === 'Add downton fall risk index'){
      this.previousQuestion = [...this.data.questions];
      this.commonHttp.getDowntonQuestions().subscribe((questionnaire: any) => {
        this.downFallRiskIndex = [...questionnaire.body[0].data.items.questions.questions];
        this.initial('10300', 10301);
        this.loading = false;
        this.downFallRiskIndex.find((value: any) => value.questionID === 10302).answerValue = []
      })
    }else if(data.payload.questions){
      this.disableForm = true;
      this.downFallRiskIndex = this.data.payload.questions;
      this.loading = false;
      this.riskScore = this.data.payload.risk;
    }else{
      this.commonHttp.getDowntonQuestions().subscribe((questionnaire: any) => {
        this.downFallRiskIndex = [...questionnaire.body[0].data.items.questions.questions];
        this.initial('10300', 10301);
        this.loading = false;
        this.downFallRiskIndex.find((value: any) => value.questionID === 10302).answerValue = []
      })
    }
  }
  isFallen = false;
  changeText()
  {
    if(this.disableText==true){
      this.disableText=false;
    }else{
      this.disableText=true;
    }
  }
  getRisk(){
    return this.riskScore;
  }
  getSensoryValue(){
    return this.sensory
  }
  getWalkingValue(){
    if(this.data.dialogType && this.data.dialogType === 'Add downton fall risk index'){
      return ''
    }else{
      return this.downFallRiskIndex.find((value: any) => value.questionID === 10305).answerValue ? this.downFallRiskIndex.find((value: any) => value.questionID === 10305).answerValue : ''
    }
  }
  getCognitiveValue(){
    if(this.data.dialogType && this.data.dialogType === 'Add downton fall risk index'){
      return ''
    }else{
      return this.downFallRiskIndex.find((value: any) => value.questionID === 10304).answerValue ? this.downFallRiskIndex.find((value: any) => value.questionID === 10304).answerValue : ''
    }
  }
  initial(questionID: string, questionId: number){
    if(this.previousQuestion){
      const fallCount = this.previousQuestion.find((value: any) => value.question === 'How many times you have fallen?')?.answerValue;
      if(this.downFallRiskIndex.find((value: any) => value.questionID === questionID)){
        if(fallCount){
         this.downFallRiskIndex.find((value: any) => value.questionID === questionID).answerValue = fallCount;
        }else{
          this.downFallRiskIndex.find((value: any) => value.questionID === questionID).answerValue = 0;
        }
      }
      const fallCount2 = this.previousQuestion.find((value: any) => value.question === 'Known previous falls')?.answerValue;
      if(this.downFallRiskIndex.find((value: any) => value.questionID === questionId)){
        if(fallCount2){
          this.downFallRiskIndex.find((value: any) => value.questionID === questionId).answerValue = fallCount2;
          // this.riskScore = this.riskScore + this.downFallRiskIndex.find((value: any) => value.questionID === questionId).answers[0].risk
        }
      }
    }else{
      this.downFallRiskIndex.find((value: any) => value.questionID === questionID).answerValue = '0';
      this.downFallRiskIndex.find((value: any) => value.questionID === questionId).answerValue = '';
    }
  }
  getFallCount(questionID: string){
    return this.downFallRiskIndex?.find((value: any) => value.questionID === questionID)?.answerValue;
  }
  changeCount(value: string,questionID: string){
    this.downFallRiskIndex.find((value: any) => value.questionID === questionID).answerValue = value;
    this.downFallValues.emit({
      questions: this.downFallRiskIndex,
      risk: this.riskScore,
      disable: this.validate(),
      userId: this.data.userId
    })
  }
  getFallenValue(questionId: number){
    return this.downFallRiskIndex?.find((value: any) => value.questionID === questionId)?.answerValue ? true : false;
  }
  changeFallen(selectedValue: boolean,questionID: number){
    if(selectedValue){
      this.riskScore = this.riskScore + this.downFallRiskIndex.find((value: any) => value.questionID === questionID)?.answers[0].risk;
      this.downFallRiskIndex.find((value: any) => value.questionID === questionID).answerValue = this.downFallRiskIndex.find((value: any) => value.questionID === questionID)?.answers[0].answerID;
    }else{
      this.riskScore = this.riskScore - this.downFallRiskIndex.find((value: any) => value.questionID === questionID)?.answers[0].risk;
      delete this.downFallRiskIndex.find((value: any) => value.questionID === questionID)['answerValue']
      delete this.downFallRiskIndex.find((value: any) => value.questionID === 10301)['answerValue']
    }
    this.downFallValues.emit({
      questions: this.downFallRiskIndex,
      risk: this.riskScore,
      disable: this.validate(),
      userId: this.data.userId
    })
  }
  getValue(answerId: string){
    return this.downFallRiskIndex.find((value: any) => value.questionID === 10302).answerValue.includes(answerId);
  }
  
  changeDownFall(checked: boolean, value: string){
    let prevRisk = this.downFallRiskIndex.find((value: any) => value.questionID === 10302).answerValue.length > 1 ? this.downFallRiskIndex.find((value: any) => value.questionID === 10302).answerValue.length > 0 ? this.downFallRiskIndex.find((value: any) => value.questionID === 10302).answerValue.length : this.downFallRiskIndex.find((value: any) => value.questionID === 10302).answerValue[0] === '1030207' ? 0 : 1 : this.downFallRiskIndex.find((value: any) => value.questionID === 10302).answerValue.length;
    prevRisk = this.downFallRiskIndex.find((value: any) => value.questionID === 10302).answerValue.includes('1030206') ? prevRisk - 1 : prevRisk;
    prevRisk = this.downFallRiskIndex.find((value: any) => value.questionID === 10302).answerValue.includes('1030207') ? prevRisk - 1 : prevRisk;
   
    this.riskScore = this.riskScore - prevRisk;
    if(checked){
      if(value === '1030207'){
        this.downFallRiskIndex.find((value: any) => value.questionID === 10302).answerValue = [];
        this.disabled =true;
      }
      this.downFallRiskIndex.find((value: any) => value.questionID === 10302)?.answerValue.push(value);
    }else{
      if(value === '1030207'){
        this.disabled = false;
      }
      this.downFallRiskIndex.find((value: any) => value.questionID === 10302).answerValue = this.downFallRiskIndex.find(value => value.questionID === 10302)?.answerValue.filter(answer => answer !== value )
    }
    let currentRisk = this.downFallRiskIndex.find((value: any) => value.questionID === 10302).answerValue.length;
    currentRisk = this.downFallRiskIndex.find((value: any) => value.questionID === 10302).answerValue.includes('1030206') ? currentRisk - 1 : currentRisk;
    currentRisk = this.downFallRiskIndex.find((value: any) => value.questionID === 10302).answerValue.includes('1030207') ?currentRisk - 1 : currentRisk;
    this.riskScore = this.riskScore + currentRisk;
    this.downFallValues.emit({
      questions: this.downFallRiskIndex,
      risk: this.riskScore,
      disable: this.validate(),
      userId: this.data.userId
    })
  }
  validate(){
    const booleans = [];
    this.downFallRiskIndex.forEach(value => {
      if(value.answerType === 'Radio'){
        if(value.answerValue){
          booleans.push(true)
        }else{
          booleans.push(false)
        }
      }
    })
    return booleans.every(value => value);
  }
  getSensory(){
    return this.downFallRiskIndex.find((value: any) => value.questionID === 10303).answers
  }
  sensory = []
  changeSensory(event: {
    source: { value: any; selected: any };
  }){
    var selected=event.source.value;
    let disabledOther = false;
    let downFall10303= this.downFallRiskIndex.find((value: any) => value.questionID === 10303);
    if(downFall10303.answerValue && !event.source.selected){
      const prevAnswer = downFall10303.answers.find(value => value.answerID == selected);
      this.riskScore = this.riskScore - prevAnswer.risk;
      var indexOfDeleteitem= downFall10303.answerValue.indexOf(prevAnswer.answerID);
      downFall10303.answerValue.splice(indexOfDeleteitem,1);
      this.sensory = downFall10303.answerValue
    }
    else if(event.source.selected){
      if(selected=="1030301")
      {
        this.downFallRiskIndex.find((value: any) => value.questionID === 10303).answerValue =[];
        this.sensory = ['1030301'];
        disabledOther = true
      }
      const currentAnswer = downFall10303.answers.find(value => value.answerID == selected);
      this.riskScore = this.riskScore + currentAnswer.risk;
      if(downFall10303.answerValue==undefined){
        downFall10303.answerValue= new Array();
      }
      downFall10303.answerValue.push(selected);
      if (!disabledOther) {
        this.sensory = downFall10303.answerValue
      }
    }
    this.downFallValues.emit({
      questions: this.downFallRiskIndex,
      risk: this.riskScore,
      disable: this.validate(),
      userId: this.data.userId
    })
  }

  isDisabled () {
    return this.sensory.length > 0 && this.sensory.includes('1030301')
  }

  getCognitive(){
    return this.downFallRiskIndex.find((value: any) => value.questionID === 10304).answers
  }

  // changeCognitive(selected: string){
  //   if(this.downFallRiskIndex.find((value: any) => value.questionID === 10304).answerValue){
  //     const prevAnswer = this.downFallRiskIndex.find((value: any) => value.questionID === 10304).answers.find(value => value.questionID = this.downFallRiskIndex.find((value: any) => value.questionID === 10303).answerValue);
  //     this.riskScore = this.riskScore - prevAnswer.risk;
  //   }
  //   this.downFallRiskIndex.find((value: any) => value.questionID === 10304).answerValue = selected;
  //   const currentAnswer = this.downFallRiskIndex.find((value: any) => value.questionID === 10304).answers.find(value => value.answerID === selected);
  //   this.riskScore = this.riskScore + currentAnswer.risk;
  //   this.downFallValues.emit({
  //     questions: this.downFallRiskIndex,
  //     risk: this.riskScore,
  //     disable: this.validate(),
  //     userId: this.data.userId
  //   })
  // }
  changeCognitive(selected: string){
    let prevAnswer = this.downFallRiskIndex.find((selected: any) => selected.questionID === 10304).answers.find(selected => selected.questionID = this.downFallRiskIndex.find((selected: any) => selected.questionID === 10304).answerValue);
   this.downFallRiskIndex.find((value: any) => value.questionID === 10304).answerValue = selected;
 let currentRisk = this.downFallRiskIndex.find((selected: any) => selected.questionID === 10304).answerValue.includes('1030401') ? 0  : 1;
  if((prevAnswer)&&(currentRisk===0))
  {
    this.riskScore=this.riskScore-1;
  }else{
  this.riskScore=this.riskScore+currentRisk;
  }
  this.downFallValues.emit({
    questions: this.downFallRiskIndex,
    risk: this.riskScore,
    disable: this.validate(),
    userId: this.data.userId
  })
}

  getWalking(){
    return this.downFallRiskIndex.find((value: any) => value.questionID === 10305).answers
  }
  changeWalking(selected: string){
    let prevAnswer= this.downFallRiskIndex.find((selected: any) => selected.questionID === 10305).answers.find(selected => selected.questionID = this.downFallRiskIndex.find((selected: any) => selected.questionID === 10305).answerValue);
    this.downFallRiskIndex.find((value: any) => value.questionID === 10305).answerValue = selected;
    let currentRisk = this.downFallRiskIndex.find((selected: any) => selected.questionID === 10305).answerValue.includes('1030501') ? 1  : 0;
    if( prevAnswer){
      if( prevAnswer.questionID==='1030501')
      {
         this.riskScore=this.riskScore-1;
      }else{
        this.riskScore=this.riskScore+currentRisk;
      }
    }else{
    this.riskScore=this.riskScore+currentRisk;
    }
       this.downFallValues.emit({
      questions: this.downFallRiskIndex,
      risk: this.riskScore,
      disable: this.validate(),
      userId: this.data.userId
    })
  }
  // changeWalking(selected: string){
    

  //   if(this.downFallRiskIndex.find((value: any) => value.questionID === 10305).answerValue){
  //     const prevAnswer = this.downFallRiskIndex.find((value: any) => value.questionID === 10305).answers.find(value => value.questionID = this.downFallRiskIndex.find((value: any) => value.questionID === 10303).answerValue);
  //     this.riskScore = this.riskScore - prevAnswer.risk;
  //   }
  //   this.downFallRiskIndex.find((value: any) => value.questionID === 10305).answerValue = selected;
  //   const currentAnswer = this.downFallRiskIndex.find((value: any) => value.questionID === 10305).answers.find(value => value.answerID === selected);
  //   this.riskScore = this.riskScore + currentAnswer.risk;
  //   this.downFallValues.emit({
  //     questions: this.downFallRiskIndex,
  //     risk: this.riskScore,
  //     disable: this.validate(),
  //     userId: this.data.userId
  //   })
  // }
  changeMedicDetails(value: string){
    this.downFallRiskIndex.find((value: any) => value.questionID === 10302).answers.find(value => value.questionID === '10302061').answerValue = value;
    this.downFallValues.emit({
      questions: this.downFallRiskIndex,
      risk: this.riskScore,
      disable: this.validate(),
      userId: this.data.userId
    })
  }

  ngOnInit(): void {
    if(this.data.dialogType && this.data.dialogType === 'Add downton fall risk index'){
      this.sensory = []
    }else{
      this.sensory = this.downFallRiskIndex.find((value: any) => value.questionID === 10303).answerValue ? this.downFallRiskIndex.find((value: any) => value.questionID === 10303).answerValue : ''
    }
  }
}