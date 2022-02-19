import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-kpi-test',
  templateUrl: './kpi-test.component.html',
  styleUrls: ['./kpi-test.component.css']
})
export class KpiTestComponent implements OnInit {

  constructor() { }
  innerWDisplayedColumns = ['Type', 'Value', 'Date'];
  innerWardData = [];
  innerFacilityData = [];
  innerCustomerData = [];
  dashboardData = [];
  ngOnInit(): void {
    let localWard = localStorage.getItem('innerWard');
    localWard = JSON.parse(localWard);
    let localDates: any = localStorage.getItem('kpiDates');
    localDates = JSON.parse(localDates);
    const types = Object.keys(localWard);
    localDates.forEach((date: any, i: number) => {
      types.forEach((val: any) => {
        this.innerWardData.push({
          Type: val,
          Date: date,
          Value: localWard[val][i]
        })
      })
    })
    let localFacility = localStorage.getItem('innerFacility');
    localFacility = JSON.parse(localFacility);
    localDates.forEach((date: any, i: number) => {
      types.forEach((val: any) => {
        this.innerFacilityData.push({
          Type: val,
          Date: date,
          Value: localFacility[val][i]
        })
      })
    })
    let localCustomer = localStorage.getItem('innerCustomer');
    localCustomer = JSON.parse(localCustomer);
    localDates.forEach((date: any, i: number) => {
      types.forEach((val: any) => {
        this.innerCustomerData.push({
          Type: val,
          Date: date,
          Value: localCustomer[val][i]
        })
      })
    })
    let dashboard = localStorage.getItem('dashboard');
    dashboard = JSON.parse(dashboard);
    localDates.forEach((date: any, i: number) => {
      types.forEach((val: any) => {
        this.dashboardData.push({
          Type: val,
          Date: date,
          Value: dashboard[val][i]
        })
      })
    })
  }

}
