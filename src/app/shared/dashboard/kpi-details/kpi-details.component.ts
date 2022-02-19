import { Component, Input, OnInit, ViewChild } from '@angular/core';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexFill,
  ApexTooltip,
  ApexXAxis,
  ApexLegend,
  ApexDataLabels,
  ApexTitleSubtitle,
  ApexPlotOptions,
  ApexYAxis
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  markers: any; //ApexMarkers;
  stroke: any; //ApexStroke;
  yaxis: ApexYAxis | ApexYAxis[];
  plotOptions: ApexPlotOptions;
  dataLabels: ApexDataLabels;
  colors: string[];
  labels: string[] | number[];
  title: ApexTitleSubtitle;
  subtitle: ApexTitleSubtitle;
  legend: ApexLegend;
  fill: ApexFill;
  tooltip: ApexTooltip;
};

declare global {
  interface Window {
    Apex: any;
  }
}

const sparkLineData = [
  47,
  45,
  54,
  38,
  56,
  24,
  65,
  31,
  37,
  39,
  62,
  51,
  35,
  41,
  35,
  27,
  93,
  53,
  61,
  27,
  54,
  43,
  19,
  46
];

@Component({
  selector: 'app-kpi-details',
  templateUrl: './kpi-details.component.html',
  styleUrls: ['./kpi-details.component.scss']
})

export class KpiDetailsComponent implements OnInit {
  widths: string[] = ['39%', '19%', '42%'];
  displayedColumns: string[] = ['KPI_name',"%_change",'Trend'];
  tableData: any[] = [
  ]
  selectedInterval: string = 'Last 7 days';
  @Input() titleShow = false;
  @Input() type: string;
  isLoading = false;
  constructor() {
  }
  KPIDetails = {
      screenTime: {
        previous: {
          7: 200,
          4: 900,
          3: 3000,
          6: 6000
        },
        present: {
          7: 300,
          4: 500,
          3: 6000,
          6: 10000
        }
      },
      lowBattery: {
        previous: {
          7: 20,
          4: 90,
          3: 30,
          6: 60
        },
        present: {
          7: 30,
          4: 50,
          3: 20,
          6: 10
        }
      },
      active: {
        previous: {
          7: 20,
          4: 90,
          3: 30,
          6: 60
        },
        present: {
          7: 30,
          4: 50,
          3: 20,
          6: 10
        }
      },
      response: {
        previous: {
          7: 200,
          4: 900,
          3: 3000,
          6: 6000
        },
        present: {
          7: 300,
          4: 500,
          3: 6000,
          6: 10000
        }
      },
      fall: {
        previous: {
          7: 200,
          4: 900,
          3: 3000,
          6: 6000
        },
        present: {
          7: 300,
          4: 500,
          3: 6000,
          6: 10000
        }
      },
      escalations: {
        previous: {
          7: 200,
          4: 400,
          3: 3000,
          6: 6000
        },
        present: {
          7: 300,
          4: 500,
          3: 6000,
          6: 10000
        }
      },
      timeOnChanger: {
        previous: {
          7: 200,
          4: 400,
          3: 3000,
          6: 6000
        },
        present: {
          7: 300,
          4: 500,
          3: 6000,
          6: 10000
        }
      }
    }
    getScreenTime(count: number){
      const previous = this.KPIDetails.screenTime.previous[count];
      const present = this.KPIDetails.screenTime.present[count];
      const changePercentage = this.changePercentage(present, previous);
      return changePercentage;
    }
    getLowBatteryTime(count: number){
      const previous = this.KPIDetails.lowBattery.previous[count];
      const present = this.KPIDetails.lowBattery.present[count];
      const changePercentage = this.changePercentage(present, previous);
      return changePercentage;
    }
    getResponseTime(count: number){
      const previous = this.KPIDetails.response.previous[count];
      const present = this.KPIDetails.response.present[count];
      const changePercentage = this.changePercentage(present, previous);
      return changePercentage;
    }
    
    getTimeOnChanger(count: number){
      const previous = this.KPIDetails.timeOnChanger.previous[count];
      const present = this.KPIDetails.timeOnChanger.present[count];
      const changePercentage = this.changePercentage(present, previous);
      return changePercentage;
    }
    getFall(count: number){
      const previous = this.KPIDetails.fall.previous[count];
      const present = this.KPIDetails.fall.present[count];
      const changePercentage = this.changePercentage(present, previous);
      return changePercentage;
    }
    getActive(count: number){
      const previous = this.KPIDetails.active.previous[count];
      const present = this.KPIDetails.active.present[count];
      const changePercentage = this.changePercentage(present, previous);
      return changePercentage;
    }
    getEscalationTime(count: number){
      const previous = this.KPIDetails.escalations.previous[count];
      const present = this.KPIDetails.escalations.present[count];
      const changePercentage = this.changePercentage(present, previous);
      return changePercentage;
    }
    changePercentage(present: number, previous: number){
      let changePercentage: any;
      changePercentage = (present - previous) / present;
      changePercentage = Math.round(changePercentage);
      changePercentage = changePercentage > 0 ? `+${changePercentage}%`: `${changePercentage}%`;
      return changePercentage;
    }

  public randomizeArray(arg): number[] {
    var array = arg.slice();
    var currentIndex = array.length,
      temporaryValue,
      randomIndex;

    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }
  changeSeriesData(count: number){
    this.tableData = [
      {
        KPI_name: 'Resident profiles viewed',
        "%_change": this.getEscalationTime(count),
        Trend: [
          {
            data: this.randomizeArray(sparkLineData.slice(0, count))
          }
        ]
      },
      {
        KPI_name: 'Screen time usage',
        "%_change": this.getScreenTime(count),
        Trend:  [
          {
            data: this.randomizeArray(sparkLineData.slice(0, count))
          }
        ]
      },
      {
        KPI_name: 'Fall activity / 1000 steps',
        "%_change": this.getFall(count),
        Trend: [
          {
            data: this.randomizeArray(sparkLineData.slice(0, count))
          }
        ]
      },
      {
        KPI_name: 'Night walk activity',
        "%_change": this.getTimeOnChanger(count),
        Trend: [
          {
            data: this.randomizeArray(sparkLineData.slice(0, count))
          }
        ]
      },
      {
        KPI_name: 'Critically low battery avoidance',
        "%_change": this.getLowBatteryTime(count),
        Trend: [
          {
            data: this.randomizeArray(sparkLineData.slice(0, count))
          }
        ]
      },
      {
        KPI_name: 'Notification response time',
        "%_change": this.getResponseTime(count),
        Trend: [
          {
            data: this.randomizeArray(sparkLineData.slice(0, count))
          }
        ]
      },
      
      // {
      //   KPI_name: 'Active time (super user)',
      //   "%_change": this.getActive(count),
      //   Trend: [
      //     {
      //       data: this.randomizeArray(sparkLineData.slice(0, count))
      //     }
      //   ]
      // },
      
    ]
  }

  ngOnInit(): void {
    this.changeSeriesData(7);
  }

}
