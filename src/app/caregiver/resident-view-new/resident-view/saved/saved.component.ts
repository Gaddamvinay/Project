import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-saved',
  templateUrl: './saved.component.html',
  styleUrls: ['./saved.component.scss']
})
export class SavedComponent implements OnInit {

  savedHistory: any[] = [
    // {
    //   eventType: 'Sleeping',
    //   content: "Alexander has slept lower and with less quality than the last 7 days. Also in the last month, he has woken up 7 times in the night which hasn't happened prior to this month.",
    //   date: '09/15/2020'
    // },
    // {
    //   eventType: 'Sleeping',
    //   content: "Alexander has slept lower and with less quality than the last 7 days. Also in the last month, he has woken up 7 times in the night which hasn't happened prior to this month.",
    //   date: '09/15/2020'
    // },
    // {
    //   eventType: 'Sleeping',
    //   content: "Alexander has slept lower and with less quality than the last 7 days. Also in the last month, he has woken up 7 times in the night which hasn't happened prior to this month.",
    //   date: '09/15/2020'
    // },
  ];
  constructor() { }

  ngOnInit(): void {
  }

}
