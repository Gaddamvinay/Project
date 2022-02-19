import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonHttpService } from '../../../../../shared/services/http-services/common-http.service';

@Component({
  selector: 'app-stay-independent',
  templateUrl: './stay-independent.component.html',
  styleUrls: ['./stay-independent.component.scss']
})
export class StayIndependentComponent implements OnInit {

  questionnaire: any[] = [
    {
      label: 'Used / have been advised to use a cane / walker',
      questionID: 10105
    },
    {
      label: 'Often usage to the toilet',
      questionID: 10111
    },
    {
      label: 'Feel unsteady while walking',
      questionID: 10106
    },
    {
      label: 'Lost feeling in my feet',
      questionID: 10112
    },
    {
      label: 'Holding onto furniture when walking at home',
      questionID: 10107
    },
    {
      label: 'Medicine that makes feel light-headed',
      questionID: 10113
    },
    {
      label: 'Worried about falling',
      questionID: 10108
    },
    {
      label: 'Medicine to help sleep or improve my mood',
      questionID: 10114
    },
    {
      label: 'Use hands to stand up from a chair',
      questionID: 10109
    },
    {
      label: 'Often feel sad or depressed',
      questionID: 10115
    },
    {
      label: 'Trouble stepping up onto a curb',
      questionID: 10110
    }
  ]
  constructor(private commonHttp: CommonHttpService,@Inject(MAT_DIALOG_DATA) public data: any,) { }

  stayIndependent: any[] = [];
  loading = true;
  disableForm = false;
  ngOnInit(): void {
    if(this.data.dialogType && this.data.dialogType === 'Add stay independent'){
      this.previousQuestion = [...this.data.questions];
      this.commonHttp.getStayIndependentQuestions().subscribe((questionnaire: any) => {
        this.stayIndependent = [...questionnaire.body[0].data.items.questions.questions];
        this.stayIndependent.push({
          answerType: "Radio",
          answers: [
            {
              answer: "Unsafe (with or without walking aids)",
              answerID: "1011601",
              default: "N",
              risk: 1,
              sortOrder: 1,
            },
            {
              answer: "Normal (safe without walking aids)",
              answerID: "1011602",
              default: "Y",
              risk: 0,
              sortOrder: 2
            },
            {
              answer: "Unable",
              answerID: "1011603",
              default: "N",
              risk: 0,
              sortOrder: 3
            },
            {
              answer: "Safe with walking aids",
              answerID: "1011604",
              default: "Y",
              risk: 0,
              sortOrder: 4
            }
          ],
          dependentAnswerID: 0,
          question: "Walking ability",
          questionID: 10116,
        })
        this.initial('10102', 10101)
        this.loading = false;
      })
    }else if(this.data.payload.questions){
      this.stayIndependent = this.data.payload.questions;
      const exists = this.stayIndependent.find((value: any) => value.questionID === 10116);
      if(!exists){
        this.stayIndependent.push({
          answerType: "Radio",
          answers: [
            {
              answer: "Unsafe (with or without walking aids)",
              answerID: "1011601",
              default: "N",
              risk: 1,
              sortOrder: 1,
            },
            {
              answer: "Normal (safe without walking aids)",
              answerID: "1011602",
              default: "Y",
              risk: 0,
              sortOrder: 2
            },
            {
              answer: "Unable",
              answerID: "1011603",
              default: "N",
              risk: 0,
              sortOrder: 3
            },
            {
              answer: "Safe with walking aids",
              answerID: "1011604",
              default: "Y",
              risk: 0,
              sortOrder: 4
            }
          ],
          dependentAnswerID: 0,
          question: "Walking ability",
          questionID: 10116,
        })
      }
      this.loading = false;
      this.disableForm = true;
      this.riskScore = this.data.payload.risk;
    }else{
      this.commonHttp.getStayIndependentQuestions().subscribe((questionnaire: any) => {
        this.stayIndependent = [...questionnaire.body[0].data.items.questions.questions];
        this.stayIndependent.push({
          answerType: "Radio",
          answers: [
            {
              answer: "Unsafe (with or without walking aids)",
              answerID: "1011601",
              default: "N",
              risk: 1,
              sortOrder: 1,
            },
            {
              answer: "Normal (safe without walking aids)",
              answerID: "1011602",
              default: "Y",
              risk: 0,
              sortOrder: 2
            },
            {
              answer: "Unable",
              answerID: "1011603",
              default: "N",
              risk: 0,
              sortOrder: 3
            },
            {
              answer: "Safe with walking aids",
              answerID: "1011604",
              default: "Y",
              risk: 0,
              sortOrder: 4
            }
          ],
          dependentAnswerID: 0,
          question: "Walking ability",
          questionID: 10116,
        })
        this.initial('10102', 10101)
        this.loading = false;
      })
    }
  }
  initial(questionID: string, questionId: number){
    if(this.previousQuestion){
      const fallCount = this.previousQuestion.find((value: any) => value.question === 'How many times you have fallen?')?.answerValue;
      if(this.stayIndependent.find((value: any) => value.questionID === questionID)){
        if(fallCount){
         this.stayIndependent.find((value: any) => value.questionID === questionID).answerValue = fallCount;
        }else{
          this.stayIndependent.find((value: any) => value.questionID === questionID).answerValue = 0;
        }
      }
      const fallCount2 = this.previousQuestion.find((value: any) => value.question === 'Known previous falls')?.answerValue;
      if(this.stayIndependent.find((value: any) => value.questionID === questionId)){
        if(fallCount){
          this.stayIndependent.find((value: any) => value.questionID === questionId).answerValue = fallCount2;
          this.riskScore = this.riskScore + this.stayIndependent.find((value: any) => value.questionID === questionId).answers[0].risk
        }
      }
    }else{
      this.stayIndependent.find((value: any) => value.questionID === questionID).answerValue = '0';
      this.stayIndependent.find((value: any) => value.questionID === questionId).answerValue = '';
    }
  }
  previousQuestion: any;
  getFallCount(questionID: string){
    return this.stayIndependent?.find((value: any) => value.questionID === questionID)?.answerValue;
  }
  changeFallCount(value: string, questionID: string){
    this.stayIndependent.find((value: any) => value.questionID === questionID).answerValue = value;
    this.stayIndependentValues.emit({
      questions: this.stayIndependent,
      risk: this.riskScore,
      disable: this.validate(),
      userId: this.data.userId
    })
  }
  getFallenValue(questionId: number){
    return this.stayIndependent?.find((value: any) => value.questionID === questionId)?.answerValue ? true : false;
  }
  changeFallen(selectedValue: boolean,questionID: number){
    if(selectedValue){
      this.riskScore = this.riskScore + this.stayIndependent.find((value: any) => value.questionID === questionID)?.answers[0].risk;
      this.stayIndependent.find((value: any) => value.questionID === questionID).answerValue = this.stayIndependent.find((value: any) => value.questionID === questionID)?.answers[0].answerID;
    }else{
      this.riskScore = this.riskScore - this.stayIndependent.find((value: any) => value.questionID === questionID)?.answers[0].risk;
      delete this.stayIndependent.find((value: any) => value.questionID === questionID)['answerValue']
    }
    this.stayIndependentValues.emit({
      questions: this.stayIndependent,
      risk: this.riskScore,
      disable: this.validate(),
      userId: this.data.userId
    })
  }
  changeInjury(selectedValue: boolean,questionID: number){
    if(selectedValue){
      this.riskScore = this.riskScore + this.stayIndependent.find((value: any) => value.questionID === questionID)?.answers[0].risk;
      this.stayIndependent.find((value: any) => value.questionID === questionID).answerValue = this.stayIndependent.find((value: any) => value.questionID === questionID)?.answers[0].answerID;
    }else{
      this.riskScore = this.riskScore - this.stayIndependent.find((value: any) => value.questionID === questionID)?.answers[0].risk;
      delete this.stayIndependent.find((value: any) => value.questionID === questionID)['answerValue']
    }
    this.stayIndependentValues.emit({
      questions: this.stayIndependent,
      risk: this.riskScore,
      disable: this.validate(),
      userId: this.data.userId
    })
  }
  getWalkingValue(){
    if(this.data.dialogType && this.data.dialogType === 'Add stay independent'){
      return ''
    }else{
      return this.stayIndependent.find((value: any) => value.questionID === 10116).answerValue ? this.stayIndependent.find((value: any) => value.questionID === 10116).answerValue : ''
    }
  }
  getValue(questionId: string){
    if(this.stayIndependent.find((value: any) => value.questionID === questionId).answerValue){
      return true;
    }
    return false;
  }

  getWalking(){
    return this.stayIndependent.find((value: any) => value.questionID === 10116).answers
  }

  changeWalking(selected: string){
    if(this.stayIndependent.find((value: any) => value.questionID === 10116).answerValue){
      const prevAnswer = this.stayIndependent.find(val => val.questionID === 10116).answers.find(value => value.answerID === this.stayIndependent.find((value: any) => value.questionID === 10116).answerValue);
      this.riskScore = this.riskScore - prevAnswer.risk;
    }
    this.stayIndependent.find((value: any) => value.questionID === 10116).answerValue = selected;
    const currentAnswer = this.stayIndependent.find((value: any) => value.questionID === 10116).answers.find(value => value.answerID === selected);
    this.riskScore = this.riskScore + currentAnswer.risk;
    this.stayIndependentValues.emit({
      questions: this.stayIndependent,
      risk: this.riskScore,
      disable: this.validate(),
      userId: this.data.userId
    })
  }
  getInjuryValue(questionId: number){
    return this.stayIndependent.find((value: any) => value.questionID === questionId)?.answerValue ? true : false;
  }
  @Output() stayIndependentValues = new EventEmitter();
  riskScore = 0;
  changeInjuryDetails(value: string){
    this.stayIndependent.find((value: any) => value.questionID === 10104).answerValue = value;
    this.stayIndependentValues.emit({
      questions: this.stayIndependent,
      risk: this.riskScore,
      disable: this.validate(),
      userId: this.data.userId
    })
  }
  validate(){
    let returnBool = false;
    this.questionnaire.forEach(data => {
      if(this.stayIndependent.find(value => value.questionID === data.questionID).answerValue){
        const exists = this.stayIndependent.find(value => value.questionID === 10116).answerValue;
        if(exists){
          returnBool = true;
        }else{
          returnBool = false;
        }
      }
    })
    return returnBool;
  }
  getRisk(){
    return this.riskScore;
  }
  changeStay(checked: boolean, questionID: string){
    if(checked){
      this.riskScore = this.riskScore + this.stayIndependent.find((value: any) => value.questionID === questionID)?.answers[0].risk;
      this.stayIndependent.find((value: any) => value.questionID === questionID).answerValue = this.stayIndependent.find((value: any) => value.questionID === questionID)?.answers[0].answerID;
    }else{
      this.riskScore = this.riskScore - this.stayIndependent.find((value: any) => value.questionID === questionID)?.answers[0].risk;
      delete this.stayIndependent.find((value: any) => value.questionID === questionID)['answerValue']
    }
    this.stayIndependentValues.emit({
      questions: this.stayIndependent,
      risk: this.riskScore,
      disable: this.validate(),
      userId: this.data.userId
    })
  }

}
