import { Component, OnInit, ViewChild, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import * as _LODASH from "lodash";
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexFill, ApexLegend, ApexPlotOptions, ApexTitleSubtitle, ApexTooltip, ApexXAxis, ApexYAxis } from 'ng-apexcharts';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonHttpService } from '../services/http-services/common-http.service';

declare global {
  interface Window {
    Apex: any;
  }
}
export interface UserData {
  id: string;
  name: string;
  progress: string;
  color: string;
}

/** Constants used to fill up our data base. */
const COLORS: string[] = [
  'maroon', 'red', 'orange', 'yellow', 'olive', 'green', 'purple', 'fuchsia', 'lime', 'teal',
  'aqua', 'blue', 'navy', 'black', 'gray'
];
const NAMES: string[] = [
  'Maia', 'Asher', 'Olivia', 'Atticus', 'Amelia', 'Jack', 'Charlotte', 'Theodore', 'Isla', 'Oliver',
  'Isabella', 'Jasper', 'Cora', 'Levi', 'Violet', 'Arthur', 'Mia', 'Thomas', 'Elizabeth'
];

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

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})

export class TableComponent implements OnInit {
 
  
  @Input() displayedColumns: string[] = [];
  @Input() textRemove: boolean = false;
  public _tableData: any[] = [];
  recordsLength = 0;
  @Input() sortValues: boolean = true;
  toastr: any;
  @Input('tableData')
  set tableData(event: any[]){
      this._tableData = event;
      setTimeout(() => {
        this.dataSource = new MatTableDataSource(this._tableData);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });
  } 
  inteventionSummaryData:string[]=[];
  inteventionData: string[] = [];
  isData:boolean;
  isDisabled:boolean;
  count:number;
//questionnairesInfoLoading = false;
noData = false;
  getDataSource (element: any) {
    return new MatTableDataSource(element)
  }
  get tableData(){
    return this._tableData;
  }
  expandedElement: any | null;
  selectedRow: any;
  getInterventions(tdData)
  {this.isDisabled=false;
    if(tdData.elementdata=='Interventions'){
      let intervention=tdData.Interventions
      this.isData = false;
     
      this.getInterventionSummary(intervention);

    }else{
     var id =tdData.id;
     this.isData = false;
     this.count=tdData.count;
     this.getIntervenHistory(id);
    }
     
  }
  getIntervenHistory(id:any ){
    // let data = [];
    this.inteventionData = [] ;
    let arr =[]
    let i ;
    // this.noData = false;
    this.commonHttp.getInterven(id).subscribe((Data: any) => {
      this.isData=false;
       for(i = 0;i <Data.body.length; i++) {
    
          if(arr[Data.body[i].differIntervention] && arr[Data.body[i].differIntervention].length ){
            arr[Data.body[i].differIntervention].push(Data.body[i])
          } else {
            arr[Data.body[i].differIntervention] = [];
            arr[Data.body[i].differIntervention].push(Data.body[i]);
          }
       }
      
      this.inteventionData = arr;
      if(Data.body.length>1)
      {
        this.isLoading =false;
        this.isData=true;
      }
      this.isLoading = false;
      // this.updateOptions(parseInt(moment(this.oneDay.setHours(this.today.getHours() - 4380)).format('X')) * 1000,parseInt(moment(this.today.getTime()).format('X')) * 1000);
    })
    }
    getInterventionSummary(intervention:string){
      let user: any = localStorage.getItem('loggedInUser');
      if(user){
        user = JSON.parse(user);
      }
     let param={
        "caregiverId":user.caregiver_id,
        "differIntervention":intervention,
      }
     
      this.inteventionSummaryData = [] ;
      let data = [];
    this.commonHttp.getInterventionsSummary(user.caregiver_id,intervention).subscribe((Data: any) => {
       
      if(Data.itemCount > 0){
				Data.body.forEach((value: any) => {
					const buildObj = {};
					buildObj['Invervention_index'] = value['interventionIndex'];
          buildObj['dfriQuestion']=value['dfriQuestion'];
					buildObj['Interventions'] = value['riskIntervention'];
					buildObj['Todo'] = value['todoCount'];
					buildObj['Planned'] = value['plannedCount'];
          buildObj['In_progress'] = value['inprogressCount'];
          buildObj['Done'] = value['doneCount'];
          buildObj['No_of_residents']=value['residentCount'];
					data.push(buildObj);
				})
				this.inteventionSummaryData = data
        this.isData = true
			}
    
    
      })
    

    }
    getText (status) {     
      if(status==1) {
        return "TO DO";       
      }else if(status==2) {
        return "PLANNED";
      }else if(status==3){
        return "IN PROGRESS";
      }
      else if(status==4){
        return "DONE";
      }else {
        return null;
      }
    }
    
  getData () {
    return this.selectedRow?.id
  }


  
  
  getShowDetails (row: any) {
    return Object.keys(row).includes('showDetails')
  }
  getInterval(){
    return this.tableData[0]['Trend'][0].data.length;
  }
  kpiDetails = ['KPI_name', '%_change'];
  @Input() noDataMessage: string = "No Data available";
  @Input() tableType: string;
  @Input() widths: string[] = [];
  @Input() actions: string[] = [];
  @Input() isLoading: boolean = false;
  @Input() actionEnable: boolean = true;
  @Input() link: boolean = true;
  @Input() Filtered: boolean = false;
  @Input() paginationDisable = false;
  @Input() hoverAction: boolean[] = [];
  @Input() description: boolean = false;
  @Input() noHeadings: boolean = false;
  @Input() deleteAction = true;
  @Input() passwordAction = false;
  @Output() selectedValue = new EventEmitter();
  @Output() actionEvent = new EventEmitter();
  
  iconValues = ['Balance', 'Strength', 'Sleep'];
  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  public commonLineSparklineOptions: Partial<ChartOptions> = {
    chart: {
      type: "line",
      width: 200,
      height: 35,
      sparkline: {
        enabled: true
      }
    },
    colors: ["#015174"],
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: false,
      x: {
        show: false
      },
      y: {
        title: {
          formatter: function(seriesName) {
            return "";
          }
        }
      },
      marker: {
        show: false
      }
    },
    fill: {
      colors: ['#015174']
    }
  };
  constructor(private commonHttp: CommonHttpService) {
    window.Apex = {
      stroke: {
        width: 3
      },
      markers: {
        size: 0
      },
      tooltip: {
        fixed: {
          enabled: true
        }
      }
    };
    // Assign the data to the data source for the table to render
  }
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  ngAfterViewInit() {
    // this.dataSource.paginator = this.paginator;
    // this.dataSource.sort = this.sort;
  }
  ngOnInit(): void {
    // this.dataSource.paginator = this.paginator;
    // this.dataSource.sort = this.sort;
  }
  getLabel(value: string){
    return value?.split('_').join(" ");
  }
  showTitle(value: string){
    if(value?.length > 15){
      return value
    }
  }
  eventEmit(action: string,value: any, key?: string){
    if(action === 'click'){
      this.selectedValue.emit({selected: value, key});
    } else if (action === 'showRight') {
      this.selectedValue.emit({action: 'showRight-'+this.count, selected: value,key})
    } else {
      this.actionEvent.emit({action: 'hover', selected: value});
    }
  }
  sendData(action: string,value: any, key?: string){
    if(action === 'click'){
      this.selectedValue.emit({selected: value, key});
    } else if (action === 'showRight') {
      this.selectedValue.emit({action: 'showRight', selected: value,key})
    } else {
      this.actionEvent.emit({action: 'hover', selected: value});
    }
  }
  percaregiver = ['Night_walk_activity', 'Critically_low_battery_activity',  'Resident_profiles_viewed'];
  //minutespercaregiver = ['Screen_time_usage', 'Notification_response_time'];
  perhour = ['Screen_time_usage'];
  perminutes=['Notification_response_time'];
  getBatteryStatus(value:string){
    return parseInt(value);
  }
  checkNumber(value: any){
    if(typeof value === 'number'){
      return true;
    }else{
      return false;
    }
  }

  getFallType(value: string){
    if(value.split("_")[1] === 'fall'){
      return value.split("_")[0]
    }
    return value
  }
  emitEvent(action: string,value: any, key: string){
    this.actionEvent.emit({action: action, selected: value});
  }
  checkPageIndex(event: any){
    // console.log(event)
  }

  // GetStatus(sIndex: Number) {
  //   if (sIndex === 0) {
  //     return 'Default'
  //   } else if (sIndex == 1) {
  //     return 'TODO';
  //   }
  //    else {
  //     return '';
  //   }
  //  }

  GetStatusValue(Info: string) {
    
   if (Info === "TO DO") {
      return 1;
    }else if (Info === "PLANNED") {
      return 2;
    }else if (Info === "IN PROGRESS") {
      return 3;
    }else if (Info === "DONE") {
      return 4;
    } else  {
      return 0;
    } 
   }
  // select(pText: string, rowInfo: any) {
  //   rowInfo.status = pText;
 
  //   }
  selected: string;

  select(pText: string, rowInfo: any,keyName:any) {
    var arr = this.inteventionData[keyName];
    for(var i=0;i<arr.length;i++){
      if(arr[i]['id'] == rowInfo.id){
        arr[i]['status'] = this.GetStatusValue(pText);

      }
    }
       let postdata={
      "id":rowInfo.id,
      "updatedBy":rowInfo.createdBy,
      "status" :this.GetStatusValue(pText)
    }
      this.commonHttp.sendStatus(postdata).subscribe(data => {
        
        // this.toastr.success(`<div class="action-text"><span class="font-400">${data}</span></div><div class="action-buttons"></div>`, "", {
        //   timeOut: 2000,
        //   progressBar: true,
        //   enableHtml: true,
        //   closeButton: false,
        // });
      
  
      });
    // this.selected = pText;
  }

}