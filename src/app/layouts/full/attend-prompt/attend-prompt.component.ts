import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-attend-prompt',
  templateUrl: './attend-prompt.component.html',
  styleUrls: ['./attend-prompt.component.scss']
})
export class AttendPromptComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<AttendPromptComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
  ) {
  }
  check = 'no';
  rating_scale_1_5 = '3';
  observations = '';

  ngOnInit() {}

  /*------------------------------------------------------------
  Description: Closes the Create Account Dialog
  Input: updated flag which tells if new account is created or not
  Output: void
  ---------------------------------------------------------*/
  closeDialog(result: boolean): void {
    this.dialogRef.close(result);
  }
  callAck(){
    const obj: any = {
      observations: this.observations,
    };
    if(this.data.type === 'Fall'){
      obj.real = this.check;
      obj.rate = this.rating_scale_1_5;
    }else if(this.data.type === 'Nightwalk'){
      obj.real = this.check;
      obj.rate = this.rating_scale_1_5;
    }
    this.dialogRef.close(obj);
  }

}