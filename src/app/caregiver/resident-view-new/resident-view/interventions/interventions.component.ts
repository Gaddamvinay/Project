import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-interventions',
  templateUrl: './interventions.component.html',
  styleUrls: ['./interventions.component.scss']
})
export class InterventionsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  widths = ['50%','10%','10%','10%','10%','10%'];
  displayedColumns: string[] = ['Interventions','No_of_residents','Todo', 'Planned','In_progress','Done'];
  tableData: any[] = [
    {
      'Interventions': 'Medication Intake',
      'No_of_residents': '50',
      'Todo': '20',
      'Planned': '5',
      'In_progress': '20',
      'Done': '5',
      dropData: {
        widths: ['50%','10%','10%','10%','10%','10%'],
        displayedColumns: ['Interventions','No_of_residents','Todo', 'Planned','In_progress','Done'],
        tableData: [
          {
            'Interventions': "Collude with other health care team members to access and evaluate patient's medications that contribute to falling",
            'No_of_residents': '20',
            'Todo': '20',
            'Planned': '',
            'In_progress': '',
            'Done': ''
          },
          {
            'Interventions': 'Examine peak effects for prescribed medications that affect level of consciousness',
            'No_of_residents': '5',
            'Todo': '',
            'Planned': '5',
            'In_progress': '',
            'Done': ''
          },
          {
            'Interventions': 'Check if the elderly has side effects like dizziness, orthostatic hypotension, drowsiness, and incontinence',
            'No_of_residents': '25',
            'Todo': '',
            'Planned': '',
            'In_progress': '20',
            'Done': '5'
          },
        ]
      }
    },
    {
      'Interventions': 'Sensory Impairment',
      'No_of_residents': '45',
      'Todo': '15',
      'Planned': '15',
      'In_progress': '5',
      'Done': '10',
      dropData: {
        widths: ['50%','10%','10%','10%','10%','10%'],
        displayedColumns: ['Interventions','No_of_residents','Todo', 'Planned','In_progress','Done'],
        tableData: [
          {
            'Interventions': "Educate the elderly the ",
            'No_of_residents': '15',
            'Todo': '15',
            'Planned': '',
            'In_progress': '',
            'Done': ''
          },
          {
            'Interventions': 'Examine peak effects for prescribed medications that affect level of consciousness',
            'No_of_residents': '15',
            'Todo': '',
            'Planned': '15',
            'In_progress': '',
            'Done': ''
          },
          {
            'Interventions': 'Check if the elderly has side effects like dizziness, orthostatic hypotension, drowsiness, and incontinence',
            'No_of_residents': '15',
            'Todo': '',
            'Planned': '',
            'In_progress': '5',
            'Done': '10'
          },
        ]
      }
    },
  ];
  @HostListener('window:click', ['$event'])
  resetRightData (event: any) {
	  this.rightData = false
  }

  rWidths = ['33.33%','33.33%','33.3%'];
  displayedRColumns: string[] = ['List_of_residents','Status','No_of_comments'];
  tableDataR: any[] = [
    {
      List_of_residents: 'Elder 1',
      Status: '',
      No_of_comments: '5'
    },
    {
      List_of_residents: 'Elder 2',
      Status: '',
      No_of_comments: '2'
    },
    {
      List_of_residents: 'Elder 3',
      Status: '',
      No_of_comments: '4'
    },
    {
      List_of_residents: 'Elder 4',
      Status: '',
      No_of_comments: '5'
    },
    {
      List_of_residents: 'Elder 5',
      Status: '',
      No_of_comments: ''
    },
    {
      List_of_residents: 'Elder 6',
      Status: '',
      No_of_comments: ''
    },
    {
      List_of_residents: 'Elder 7',
      Status: '',
      No_of_comments: ''
    },
  ];

  rightData = false
  rightDataValue: any;
  openSideDiv (event: any) {
	  if (event.action === 'showRight') {
		  setTimeout(() => {
			this.rightData = true;
		  }, 1000)
		  this.rightDataValue = event.selected
	  }
  }
}
