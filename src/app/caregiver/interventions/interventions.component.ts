import { Component, HostListener, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { CommonHttpService } from '../../shared/services/http-services/common-http.service';

@Component({
  selector: 'app-interventions',
  templateUrl: './interventions.component.html',
  styleUrls: ['./interventions.component.scss']
})
export class InterventionsComponent implements OnInit {
  
  dropdownSettings: IDropdownSettings = {};
  constructor(private commonHttp: CommonHttpService, private router: Router) { }

  ngOnInit(): void {
    this.getIntervenSummary();
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'label',
      textField: 'value',
      unSelectAllText: 'UnSelect All',
      enableCheckAll: false,
      clearSearchFilter: true,
      itemsShowLimit: 2,
      allowSearchFilter: false
    };
  }
  interven = new FormControl();
  widths = ['50%','10%','10%','10%','10%','10%'];
  displayedColumns: string[] = ['Interventions','No_of_elderly','Todo', 'Planned','In_progress','Done'];
  tableData: any[] = [];
  isLoading=false;
  selectedList:string[]
  // tableData: any[] = [
  //   {
  //     'Interventions': 'Medication Intake',
  //     'No_of_elderly': '50',
  //     'Todo': '20',
  //     'Planned': '5',
  //     'In_progress': '20',
  //     'Done': '5',
  //     dropData: {
  //       widths: ['50%','10%','10%','10%','10%','10%'],
  //       displayedColumns: ['Interventions','No_of_elderly','Todo', 'Planned','In_progress','Done'],
  //       tableData: [
  //         {
  //           'Interventions': "Collude with other health care team members to access and evaluate patient's medications that contribute to falling",
  //           'No_of_elderly': '20',
  //           'Todo': '20',
  //           'Planned': '',
  //           'In_progress': '',
  //           'Done': ''
  //         },
  //         {
  //           'Interventions': 'Examine peak effects for prescribed medications that affect level of consciousness',
  //           'No_of_elderly': '5',
  //           'Todo': '',
  //           'Planned': '5',
  //           'In_progress': '',
  //           'Done': ''
  //         },
  //         {
  //           'Interventions': 'Check if the elderly has side effects like dizziness, orthostatic hypotension, drowsiness, and incontinence',
  //           'No_of_elderly': '25',
  //           'Todo': '',
  //           'Planned': '',
  //           'In_progress': '20',
  //           'Done': '5'
  //         },
  //       ]
  //     }
  //   },
  //   {
  //     'Interventions': 'Sensory Impairment',
  //     'No_of_elderly': '45',
  //     'Todo': '15',
  //     'Planned': '15',
  //     'In_progress': '5',
  //     'Done': '10',
  //     dropData: {
  //       widths: ['50%','10%','10%','10%','10%','10%'],
  //       displayedColumns: ['Interventions','No_of_elderly','Todo', 'Planned','In_progress','Done'],
  //       tableData: [
  //         {
  //           'Interventions': "Educate the elderly the ",
  //           'No_of_elderly': '15',
  //           'Todo': '15',
  //           'Planned': '',
  //           'In_progress': '',
  //           'Done': ''
  //         },
  //         {
  //           'Interventions': 'Examine peak effects for prescribed medications that affect level of consciousness',
  //           'No_of_elderly': '15',
  //           'Todo': '',
  //           'Planned': '15',
  //           'In_progress': '',
  //           'Done': ''
  //         },
  //         {
  //           'Interventions': 'Check if the elderly has side effects like dizziness, orthostatic hypotension, drowsiness, and incontinence',
  //           'No_of_elderly': '15',
  //           'Todo': '',
  //           'Planned': '',
  //           'In_progress': '5',
  //           'Done': '10'
  //         },
  //       ]
  //     }
  //   },
  // ];
  @HostListener('window:click', ['$event'])
  resetRightData (event: any) {
    if (!this.ignoreClosing) {
      this.rightData = false
    }
  }
  ignoreClosing = false
  statusList: string[] = ['TO DO', 'PLANNED', 'IN PROGRESS', 'DONE'];
  
  checkClicking () {
    console.log('coming here')
  }
  rWidths = ['33.33%','33.33%','33.3%'];
  displayedRColumns: string[] = ['List_of_elderly','Status','No_of_comments'];
  tableDataR: any[] = [];
  beforeFilterData:any[]=[];
  filteredList:any[]=[]
  // tableDataR: any[] = [
  //   {
  //     List_of_elderly: 'Elder 1',
  //     Status: '',
  //     No_of_comments: '5'
  //   },
  //   {
  //     List_of_elderly: 'Elder 2',
  //     Status: '',
  //     No_of_comments: '2'
  //   },
  //   {
  //     List_of_elderly: 'Elder 3',
  //     Status: '',
  //     No_of_comments: '4'
  //   },
  //   {
  //     List_of_elderly: 'Elder 4',
  //     Status: '',
  //     No_of_comments: '5'
  //   },
  //   {
  //     List_of_elderly: 'Elder 5',
  //     Status: '',
  //     No_of_comments: ''
  //   },
  //   {
  //     List_of_elderly: 'Elder 6',
  //     Status: '',
  //     No_of_comments: ''
  //   },
  //   {
  //     List_of_elderly: 'Elder 7',
  //     Status: '',
  //     No_of_comments: ''
  //   },
  // ];
  inteventionSummary: string[] = [];
  interventionSummaryData:any;
  rightData = false
  rightDataValue: any;
  openSideDiv (event: any) {
	  if (event.action === 'showRight') {
		  setTimeout(() => {
        this.interventionSummaryData=event;
         this.getIntervenSummaryData(event.selected.Invervention_index);
			this.rightData = true;
		  }, 1000)
		  this.rightDataValue = event.selected
    } else if (event.key === 'List_of_elderly') {
      const url = 'ca/residents/residentview/' + event.selected.resident_id
      this.router.navigate([url])
    }
  }
  getIntervenSummary(){
    // let data = [];
    this.inteventionSummary = [] ;
    this.isLoading=true;
    let data = [];
    let i ;
    // this.noData = false;
    	
	let user: any = localStorage.getItem('loggedInUser');
	if(user){
		user = JSON.parse(user);
	}
    this.commonHttp.getInterventionSummary(user.caregiver_id).subscribe((Data: any) => {
       
      if(Data.itemCount > 0){
				Data.body.forEach((value: any) => {
					const buildObj = {};
					buildObj['id'] = value['id'];
					buildObj['Interventions'] = value['dfri_question'];
					buildObj['Todo'] = value['todoCount'];
					buildObj['Planned'] = value['plannedCount'];
          buildObj['In_progress'] = value['inProgresscount'];
          buildObj['Done'] = value['doneCount'];
          buildObj['No_of_elderly']=value['residentCount'];
          buildObj['elementdata']='Interventions';
					data.push(buildObj);
				})
				this.tableData = data
        this.isLoading=false;
			}
    
    
      })
    }

    getIntervenSummaryData(inverventionIndex:string){
      this.inteventionSummary = [] ;
      let data = [];
      this.selectedList=[]
      this.filteredList=[]
      let i ;
      // this.noData = false;
      let user: any = localStorage.getItem('loggedInUser');
      if(user){
        user = JSON.parse(user);
      }
      this.commonHttp.getInterventionSummaryData(user.caregiver_id,inverventionIndex).subscribe((Data: any) => {
         
        if(Data.itemCount > 0){
          Data.body.forEach((value: any) => {
            const buildObj = {};
            buildObj['id'] = value['intervention_index'];
            buildObj['List_of_elderly'] = value['residnetName'];
            buildObj['Status'] = value['status'];
            buildObj['No_of_comments'] = value['comments_Count'];
            buildObj['resident_id'] = value['resident_id']
            data.push(buildObj);
          })
          this.tableDataR = data
          this.beforeFilterData=this.tableDataR;
          this.filteredList=[]
          this.selectedList=[]
          
        }
      
        })

    }
  onDeSelect(deselect: any) {
    if(this.selectedList){
    this.filteredList=[]
    let jsonObject = JSON.parse(JSON.stringify(this.selectedList));
    if(this.selectedList.length>0){
    for (var val of jsonObject) {
        if(val=='PLANNED'){
          if(this.filteredList){
            let data=this.beforeFilterData.filter(value=>value.Status=='PLANNED')
            this.filteredList=[...this.filteredList,...data]
          }else{
            this.filteredList=this.beforeFilterData.filter(value=>value.Status=='PLANNED')
          }
        }
        if(val=='TO DO')
        {
          if(this.filteredList){
          let data=this.beforeFilterData.filter(value=>value.Status=='TO DO')
          this.filteredList=[...this.filteredList,...data]
          }
          else {
            this.filteredList=this.beforeFilterData.filter(value=>value.Status=='TO DO')
          }
          
        }
        if(val=='IN PROGRESS')
        {
          if(this.filteredList){
          let data=this.beforeFilterData.filter(value=>value.Status=='IN PROGRESS')
          this.filteredList=[...this.filteredList,...data]
          }
          else {
            this.filteredList=this.beforeFilterData.filter(value=>value.Status=='IN PROGRESS')
          }
          
        }
        if(val=='DONE')
        {
          if(this.filteredList){
          let data=this.beforeFilterData.filter(value=>value.Status=='DONE')
          this.filteredList=[...this.filteredList,...data]
          }
          else {
            this.filteredList=this.beforeFilterData.filter(value=>value.Status=='DONE')
          }
          
        }

        this.tableDataR=this.filteredList;
      }
    }else{
      this.tableDataR=this.beforeFilterData;
    }
   }else{
     this.tableDataR=this.beforeFilterData;
   }

  }
    onSelect(list: any) {
      this.selectedList.push(list)
      if(list){
        
        if(list=='PLANNED'){
          if(this.filteredList){
            let data=this.beforeFilterData.filter(value=>value.Status=='PLANNED')
            this.filteredList=[...this.filteredList,...data]
          }else{
            this.filteredList=this.beforeFilterData.filter(value=>value.Status=='PLANNED')
          }
        }
        if(list=='TO DO')
        {
          if(this.filteredList){
          let data=this.beforeFilterData.filter(value=>value.Status=='TO DO')
          this.filteredList=[...this.filteredList,...data]
          }
          else {
            this.filteredList=this.beforeFilterData.filter(value=>value.Status=='TO DO')
          }
          
        }
        if(list=='IN PROGRESS')
        {
          if(this.filteredList){
          let data=this.beforeFilterData.filter(value=>value.Status=='IN PROGRESS')
          this.filteredList=[...this.filteredList,...data]
          }
          else {
            this.filteredList=this.beforeFilterData.filter(value=>value.Status=='IN PROGRESS')
          }
          
        }
        if(list=='DONE')
        {
          if(this.filteredList){
          let data=this.beforeFilterData.filter(value=>value.Status=='DONE')
          this.filteredList=[...this.filteredList,...data]
          }
          else {
            this.filteredList=this.beforeFilterData.filter(value=>value.Status=='DONE')
          }
          
        }
        this.tableDataR=this.filteredList;
      }else{
        this.filteredList=[]
        this.tableDataR=this.beforeFilterData;
      }
      
    }


    filterbyStatus(list: any){
      if(list){
        
        if(list=='PLANNED'){
          if(this.filteredList){
            let data=this.beforeFilterData.filter(value=>value.Status=='PLANNED')
            this.filteredList=[...this.filteredList,...data]
          }else{
            this.filteredList=this.beforeFilterData.filter(value=>value.Status=='PLANNED')
          }
        }
        if(list=='TO DO')
        {
          if(this.filteredList){
          let data=this.beforeFilterData.filter(value=>value.Status=='TO DO')
          this.filteredList=[...this.filteredList,...data]
          }
          else {
            this.filteredList=this.beforeFilterData.filter(value=>value.Status=='TO DO')
          }
          
        }
        if(list=='IN PROGRESS')
        {
          if(this.filteredList){
          let data=this.beforeFilterData.filter(value=>value.Status=='IN PROGRESS')
          this.filteredList=[...this.filteredList,...data]
          }
          else {
            this.filteredList=this.beforeFilterData.filter(value=>value.Status=='IN PROGRESS')
          }
          
        }
        if(list=='DONE')
        {
          if(this.filteredList){
          let data=this.beforeFilterData.filter(value=>value.Status=='DONE')
          this.filteredList=[...this.filteredList,...data]
          }
          else {
            this.filteredList=this.beforeFilterData.filter(value=>value.Status=='DONE')
          }
          
        }
        this.tableDataR=this.filteredList;
      }else{
        this.filteredList=[]
        this.tableDataR=this.beforeFilterData;
      }

    }
  
}