import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonHttpService } from '../../../../../shared/services/http-services/common-http.service';

@Component({
  selector: 'app-medical-form',
  templateUrl: './medical-form.component.html',
  styleUrls: ['./medical-form.component.scss']
})
export class MedicalFormComponent implements OnInit {

  @Output() medicationData = new EventEmitter();
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private commonHttp: CommonHttpService) { }

  medicationInfo: any;
  questions: any[] = [];
  medicId: string;
  ngOnInit(): void {
    this.medicationInfo = {...this.data.medication};
    this.medicId = this.medicationInfo.id;
    delete this.medicationInfo.id
    this.commonHttp.getPreExsitingQuestions().subscribe((val : any) => {
      this.questions = val.body[0].data.items.questions.questions;
      this.data.medication.questions.forEach(val => {
        const exists = this.questions.find(value => value.questionID === val.questionID)
        if(exists){
          exists.answerValue = val.answerValue
        }
      })
      let exists = true;
      this.questions.forEach(data => {
        if(data.answerValue){
          exists = false;
        }
      })
      if(exists){
        this.disable = true;
      }else{
        this.disable = false;
      }
    })
  }
  medications: any[] = [
    [{
      label: 'No Pre-existing condition',
      questionId: 'pre123',
    }],
    [{
      label: 'Diabetic pills',
      questionId: 10205
    }, {
      label: 'Insulin',
      questionId: 10206
    }],
    [{
      label: 'Blood thinner pills(Stroke)',
      questionId: 10208
    }],
    [{
      label: 'Blood pressure pills',
      questionId: 10204
    }],
    [{
      label: 'Hip surgery',
      questionId: 10212
    }],
    [{
      label: 'Artificial joints',
      questionId: 10213
    }],
    [{
      label: 'Pacemaker',
      questionId: 10211
    }],
    [{
      label: 'Sleeping pills',
      questionId: 10203
    }, 
    {
      label: 'Anti-depressants',
      questionId: 10201
    }],
    [{
      label: 'Poly pharmacy(>4 pills)',
      questionId: 10207
    }]
  ]

  disable = false;
  changeMedication(checked: boolean,questionId: any){
    if(checked){
      if(questionId === 'pre123'){
        this.questions.forEach(data => {
          delete data.answerValue
        })
        this.disable = true;
      }else{
        this.questions.find((value: any) => value.questionID === questionId).answerValue = this.questions.find((value: any) => value.questionID === questionId)?.answers[0].answerID;
      }
    }else{
      if(questionId === 'pre123'){
        this.disable = false;
      }else{
        delete this.questions.find((value: any) => value.questionID === questionId)['answerValue']
      }
    }
    this.medicationInfo.questions = this.questions;
    this.medicationData.emit({data : this.medicationInfo, id: this.medicId, prevQuestions: this.data.medication.questions})
  }

  getValue(questionId: any){
    if(questionId === 'pre123'){
      return this.disable;
    }
    return this.questions.find((value: any) => value.questionID === questionId)?.answerValue ? true : false
  }


}
