import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.css']
})
export class RoomsComponent implements OnInit {

  isLoading = false;
  widths: string[] = ['12%', '10%', '10%', '9%', '7%', '7%', '7%', '9%', '9%', '9%', '10%', '9%']
  displayedColumns: string[] = ['Resident_name','Last_known_status','Questionnaire_fall','Wearable_fall','Balance','Strength', 'Sleep', 'Ward_name','Room_name', 'Name_on_wearable', 'Battery_status'];
  tableData: any[] = [
    {
        Ward_name: 'Ward A',
        Last_known_status: 'Sleeping',
        Questionnaire_fall: 10,
        Wearable_fall: 3,
        Balance: 'low',
        Strength: 'low',
        wearableFallIncreased: true,
        fallDiff: 4,
        Sleep: 'low',
        Wearables_name: 'JDXC',
        Room_name: '11-1123',
        Resident_name: 'Camilia D',
        Battery_status: 80
    },
    {
      Ward_name: 'Ward B',
      Last_known_status: 'Sleeping',
      Questionnaire_fall: 10,
      Wearable_fall: 3,
      Balance: 'low',
      Strength: 'low',
      wearableFallIncreased: true,
      fallDiff: 4,
      Sleep: 'low',
      Wearables_name: 'JDXC',
      Room_name: '11-1123',
      Resident_name: 'John D',
      Battery_status: 80
    },
    {
      Ward_name: 'Ward C',
      Last_known_status: 'Sleeping',
      Questionnaire_fall: 10,
      Wearable_fall: 3,
      Balance: 'low',
      Strength: 'low',
      wearableFallIncreased: true,
      fallDiff: 4,
      Sleep: 'low',
      Wearables_name: 'JDXC',
      Room_name: '11-1123',
      Resident_name: 'Camilia P',
      Battery_status: 80
    },
    {
      Ward_name: 'Ward D',
      Last_known_status: 'Sleeping',
      Questionnaire_fall: 10,
      Wearable_fall: 3,
      Balance: 'low',
      Strength: 'low',
      wearableFallIncreased: true,
      fallDiff: 4,
      Sleep: 'low',
      Wearables_name: 'JDXC',
      Room_name: '11-1123',
      Resident_name: 'Jessica P',
      Battery_status: 80
    },
  ];
 
  constructor() { }

  ngOnInit(): void {
  }

}
