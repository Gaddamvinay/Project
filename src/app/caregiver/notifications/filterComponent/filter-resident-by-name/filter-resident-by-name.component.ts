import { Component, NgModule, OnInit,Inject, Optional, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import * as moment from "moment";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import * as _LODASH from "lodash";
import { DatePipe } from '@angular/common';
import { count, filter } from 'rxjs/operators';
import { Observable, forkJoin } from 'rxjs';
import * as Diff from 'diff';
@Component({
  selector: 'app-filter-resident-by-name',
  templateUrl: './filter-resident-by-name.component.html',
  styleUrls: ['./filter-resident-by-name.component.scss']
})
export class FilterResidentByNameComponent implements OnInit {
	filterTypes: any = {
		filterResidents: [''],
	}
  residentNames: string[] = [];
  resident: string[] = [];
  personFilters: string[] = [];
  personName : string;
  person:string = null;
  personList = null;
  beforeResidentNames:string[]=[];
  isSelected = true;
  constructor(public dialogRef: MatDialogRef<FilterResidentByNameComponent>,private formBuilder: FormBuilder,private datePipe: DatePipe, private http: HttpClient,@Optional() @Inject(MAT_DIALOG_DATA) public data: any){
		if(this.data.payload){
      this.residentNames=this.data.payload;
      
			this.filterTypes = {...this.data.payload};
		
		}
	}
  changeSelectPerson(list: any){

    if(typeof list === 'string'){
      this.personName = list.toLowerCase();
      if(list !== ''){
        this.resident= this.beforeResidentNames.filter(name => {
          return name.toLowerCase().includes(list.toLowerCase())
        })
      }else{
        this.resident = this.beforeResidentNames;
      }
    }else if(list.source && Array.isArray(list.source._value)){
      this.personFilters = list.source._value.map((person: string) => {
        return person.toLowerCase();
      })
    }
    
  }
  ngOnInit(): void {
  }
  apply(){
	this.dialogRef.close(this.personFilters);
	}

}
