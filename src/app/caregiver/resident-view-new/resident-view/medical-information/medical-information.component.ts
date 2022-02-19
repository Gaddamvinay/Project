import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { CommonAddModelComponent } from '../../../../shared/common-add-model/common-add-model.component';

@Component({
  selector: 'app-medical-information',
  templateUrl: './medical-information.component.html',
  styleUrls: ['./medical-information.component.scss']
})
export class MedicalInformationComponent implements OnInit {

  medicalHistory : any[] = [
    {
      heading: 'General medicines',
      list: [
      ]
    },
    {
      heading: 'Surgery',
      list: [
      ]
    },
    {
      heading: 'Sleeping problems',
      list: [
      ]
    },
    {
      heading: 'Poly pharmacy',
      list: [
      ]
    }
  ];

  medicationInfo: any;
  @Output() callResident = new EventEmitter();
  @Input('medication')
  set medication(event: any){
    this.medicationInfo = event;
    const pills = this.medicationInfo?.questions.filter(value => value.questionID != 10209 && value.questionID !== 10210).filter(value => value.question !== 'Pacemaker' && value.question !== 'Artificial joints' && value.question !== 'Hip surgery').filter(value => value.answerValue);
    const surgery = this.medicationInfo?.questions.filter(value => value.questionID != 10209 && value.questionID !== 10210).filter(value => value.question === 'Pacemaker' || value.question === 'Artificial joints' || value.question === 'Hip surgery').filter(value => value.answerValue);
    if(pills){
      const sleepPills = pills.filter(value => value.question === 'Anti depressants' || value.question === 'Sleeping pills').filter(value => value.answerValue);
      const generalPills = pills.filter(value => value.question !== 'Anti depressants' && value.question !== 'Sleeping pills' && value.question !== 'Polypharmacy');
      const polyPharmacy = pills.find(value => value.question === 'Polypharmacy');
      this.medicalHistory[0].list = [...generalPills];
      this.medicalHistory[2].list = [...sleepPills];
      this.medicalHistory[3].list[0] =  polyPharmacy?.answerValue ? 'Yes': 'No';
    }
    if(surgery)
    this.medicalHistory[1].list = [...surgery];
  }
  get medication(){
    return this.medicationInfo;
  }

  constructor(private dialog: MatDialog, private route: ActivatedRoute) { }

  userId: string = '';
  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.userId = params.get('userId');
    })
  }

  openDialog(){
    const dialog =this.dialog.open(CommonAddModelComponent, {
      disableClose: true,
        panelClass: 'dialog-popup',
        minWidth: '800px',
        data: {
          dialogType: 'Edit medications',
          medication: this.medicationInfo,
          userId: this.userId
        }
    })
    dialog.afterClosed().subscribe(data => {
      if(data){
        this.medicalHistory.forEach(data => {
          data.list = [];
          this.callResident.emit();
        })
      }
    })
  }

}
