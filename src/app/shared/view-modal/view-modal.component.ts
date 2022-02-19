import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-view-modal',
  templateUrl: './view-modal.component.html',
  styleUrls: []
})
export class ViewModalComponent implements OnInit {

  edit = true;
  constructor(public dialogRef: MatDialogRef<ViewModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,) {
      this.profileDetails = this.data.payload;
      if(this.data.editDisable){
        this.edit = false;
      }
  }
  profileDetails: any;
  ngOnInit(): void {
  }

  getWards(){
    return this.profileDetails.wards.map(ward => {
      return  ' ' + ward.ward_name
    })
  }
  openEdit(){
    this.dialogRef.close('Edit')
  }
}
