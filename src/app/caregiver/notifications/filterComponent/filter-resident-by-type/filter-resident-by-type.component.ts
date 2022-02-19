import { Component, NgModule, OnInit,Inject, Optional, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import * as moment from "moment";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import * as _LODASH from "lodash";
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-filter-resident-by-type',
  templateUrl: './filter-resident-by-type.component.html',
  styleUrls: ['./filter-resident-by-type.component.scss']
})
export class FilterResidentByTypeComponent implements OnInit {
  filterTypes: any = {
		filterResidents: [''],
	}
  notificationType: string[] = [];
  resident: string[] = [];
  typeList=null;
  typeFilters: string[] = [];
  beforeResidentNames:string[]=[];
  isSelected = true;
  constructor(public dialogRef: MatDialogRef<FilterResidentByTypeComponent>,private formBuilder: FormBuilder,private datePipe: DatePipe, private http: HttpClient,@Optional() @Inject(MAT_DIALOG_DATA) public data: any){
		if(this.data.payload){
      this.notificationType=this.data.payload;
      
			this.filterTypes = {...this.data.payload};
		
		}
	}
  changeSelectType(list: any){
    this.typeFilters = list.source._value.map((type: string) => {
      return type.split(" ").join("").toLowerCase();
    })
   // this.typeFilters=list;
  }
  ngOnInit(): void {
  }
  apply(){
	this.dialogRef.close(this.typeFilters);
	}
}
