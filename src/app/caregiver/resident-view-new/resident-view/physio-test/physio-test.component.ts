import { Component, Input, OnInit, ViewChild } from '@angular/core';
//import { ChartOptions } from '../overview/overview.component';
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexMarkers, ApexTitleSubtitle, ApexYAxis, ApexXAxis, ApexTooltip, ApexStroke, ApexAnnotations, ApexGrid, ApexLegend, ApexPlotOptions, ChartComponent } from 'ng-apexcharts';
import { MatDialog } from '@angular/material/dialog';
import { SixMWTComponent } from './six-mwt/six-mwt.component';
import { TUGComponent } from './tug/tug.component';
import { ThirtySCSComponent } from './thirty-scs/thirty-scs.component';
import * as moment from 'moment';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { CommonHttpService } from '../../../../shared/services/http-services/common-http.service';
//import { ChartComponent } from 'ng-apexcharts';
import { TimeFormatService } from '../../../../shared/services/time-format.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
export type ChartOptions = {
	series: ApexAxisChartSeries;
	chart: ApexChart;
	dataLabels: ApexDataLabels;
	markers: ApexMarkers;
	title: ApexTitleSubtitle;
	fill: any;
	yaxis: ApexYAxis;
	xaxis: ApexXAxis;
	tooltip: ApexTooltip;
	stroke: ApexStroke;
	annotations: ApexAnnotations;
	colors: any;
	grid: ApexGrid;
	toolbar: any;
	legend: ApexLegend;
	plotOptions: ApexPlotOptions;
};

export enum LoadingState {
	LOADING,
	LOADED,
	NODATA
}

interface physio {
  Physio_test: string;
  Taken_by: string;
  Date_taken_on: string;
  Actual_result: string;
  Expected_result: string;
  Interpretations: string;
}
@Component({
  selector: 'app-physio-test',
  templateUrl: './physio-test.component.html',
  styleUrls: ['./physio-test.component.scss']
})
export class PhysioTestComponent implements OnInit {

  titleShow = false;
  widths = ['15%','15%','15%','15%','15%','15%'];
  displayedColumns: string[] = ['Physio_test','Actual_result','Expected_result','Interpretations','Taken_by','Date_taken_on'];
  tableData: physio[] = [
    {
      Physio_test: '6MWT',
      Taken_by: 'caregiver',
      Date_taken_on: '09/14/2020',
      Actual_result: '200 meters',
      Expected_result: '400 meters',
      Interpretations: 'High',
    },
    {
      Physio_test: '6MWT',
      Taken_by: 'caregiver',
      Date_taken_on: '09/14/2020',
      Actual_result: '500 meters',
      Expected_result: '400 meters',
      Interpretations: 'Normal',
    },
    {
      Physio_test: 'TUG',
      Taken_by: 'caregiver',
      Date_taken_on: '09/14/2020',
      Actual_result: '13 transitions',
      Expected_result: '12-15 transitions',
      Interpretations: 'Normal',
    },
    {
      Physio_test: 'TUG',
      Taken_by: 'caregiver',
      Date_taken_on: '09/14/2020',
      Actual_result: '11 transitions',
      Expected_result: '12-15 transitions',
      Interpretations: 'High',
    },{
      Physio_test: '30SCS',
      Taken_by: 'caregiver',
      Date_taken_on: '09/14/2020',
      Actual_result: '13 seconds',
      Expected_result: '12-15 seconds',
      Interpretations: 'Normal',
    },{
      Physio_test: '30SCS',
      Taken_by: 'caregiver',
      Date_taken_on: '09/14/2020',
      Actual_result: '16 meters',
      Expected_result: '12-15 seconds',
      Interpretations: 'High',
    },
  ]
  showFilter = false;
  @ViewChild("chart", { static: false }) chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;
  userId: string = '';
  timeToAdded = 0;
  today = new Date();
  oneDay = new Date();
  constructor(private matDialog: MatDialog, private http: HttpClient, private route: ActivatedRoute, private timeFormat: TimeFormatService, private commonHttp: CommonHttpService) {
    this.timeToAdded = moment.parseZone().utcOffset();
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.userId = params.get('userId');
      this.getPhysioTestInfo();
    })
    this.chartOptions = {
			series: [
        {
          name: '6MWT',
          data: []
        },
        {
          name: '30SCS',
          data: []
        },
        {
          name: 'TUG',
          data: []
        }
      ],
			chart: {
        type: "bar",
        height: 340,
        animations: {
          enabled: false,
          },
          zoom: {
          enabled: false,
          type: 'x',
          },
          toolbar: {
          show: false
          }
      },
			dataLabels: {
				enabled: false
			},
			legend: {
        show: true,
        position: "bottom",
        fontSize: '14px',
        fontFamily: 'Whitney A,Whitney B,Helvetica,Arial,sans-serif',
        fontWeight: 500,
        offsetY: 6,
        itemMargin: {
          horizontal: 5,
          vertical: 10
      },
        markers: {
          width: 15,
          height: 15,
          radius: 0,
          offsetX: 0,
          offsetY: 0
        },
      },
			markers: {
				size: 5,
			},
      xaxis: {
        type: "category",
        title: {
          text: 'Date',
          offsetX: 0,
          offsetY: 8,
            style: {
              color: '#434342',
              fontSize: '14px',
              fontFamily: 'Whitney A,Whitney B,Helvetica,Arial,sans-serif',
              fontWeight: 500,
              cssClass: 'apexcharts-xaxis-title',
            },
        },
        labels: {
          formatter: function(val: any) {
            const display = moment(val).format('DD/MM/YYYY')
            return display
          },
          style: {
            colors: '#aaa093',
            fontSize: '12px',
            fontFamily: 'Whitney A,Whitney B,Helvetica,Arial,sans-serif',
            fontWeight: 500,
            cssClass: 'apexcharts-xaxis-label',
          },
        }
      },
			yaxis: {
        title: {
          text: 'Risk level',
          offsetX: 6,
          offsetY: 0,
          style: {
            color: '#434342',
            fontSize: '14px',
            fontFamily: 'Whitney A,Whitney B,Helvetica,Arial,sans-serif',
            fontWeight: 500,
            cssClass: 'apexcharts-xaxis-title',
          },
          },
          labels: {
            show: true,
            style: {
              colors: '#aaa093',
              fontSize: '12px',
              fontFamily: 'Whitney A,Whitney B,Helvetica,Arial,sans-serif',
              fontWeight: 500,
              cssClass: 'apexcharts-xaxis-label',
            },
            formatter: function(val: any) {
              const display = val === 2 ? 'High' : val === 1 ? 'Normal' : ''
              return display
            },
          },
          tickAmount: 2,
          min: 0,
          max: 2
      },
			tooltip: {
				x: {
				  format: "dd/MM/yyyy HH:mm"
				},
				y: {
					formatter: function(val: any) {
						const display = val === 2 ? 'High' : 'Normal'
					  return display
					},
				},
			},
			colors: ['#015074','#87657d','#bfb4ae'],
			stroke: {
				show: true,
				curve: 'stepline',
				lineCap: 'butt',
				colors: undefined,
				width: 2,
				dashArray: 0,
			},
			fill: {
				colors: ['#aaa093','#87657d','#a6bcc9','#a6bcc9','#015174','red','green'],
				opacity: 1,
				type: 'solid',
				gradient: {
					shade: 'light',
					type: "vertical",
					shadeIntensity: 1,
					gradientToColors: undefined,
					inverseColors: false,
					opacityFrom: 1,
					opacityTo: 1,
					stops: [1],
				},
			},
    };
  }
  getFilterFormat(){
    return this.timeFormat.getFilterFormat();
  }
  momentToday = moment();
  physioDates: any;
  selectedFilter: string = 'Last 6 months';
   change(e: any){
    console.log("E physiotest"+e);
    this.physioDates = {
      startDate: e.startDate,
      endDate: e.endDate
    }
    this.updateOptions(new Date(e.startDate).getTime(), new Date(e.endDate).getTime());
  }
  specificInterval: number = 6;
  graphLoading = false;
  updateOptions(startDate?: any,endDate?: any){
	let max: number;
	let min: number;
	this.graphLoading = true;
	if(startDate){
		max = parseInt(moment(endDate).format('X')) * 1000;
		min =  parseInt(moment(startDate).format('X')) * 1000;
	}else{
		if(this.specificInterval === 6){
			min = parseInt(moment().subtract(6, 'months').add(this.timeToAdded, 'minutes').format('X')) * 1000;
			max =  parseInt(moment().add(this.timeToAdded, 'minutes').format('X')) * 1000;
			this.selectedFilter = 'Last 6 months';
		}else if(this.specificInterval === 12){
			min = parseInt(moment().subtract(12, "months").add(this.timeToAdded, 'minutes').format('X')) * 1000;
			max =  parseInt(moment().add(this.timeToAdded, 'minutes').format('X')) * 1000;
			this.selectedFilter = 'Last 12 months'
		}
	}
	let graphData = [];
      let categories = [];
      this.physioTests.forEach(data => {
        const riskLabel = data.Interpretations === 'High' ? 2 : 1
        graphData.push({
          date: parseInt(moment(data.Date_taken_on).add(this.timeToAdded, 'minutes').format('X')) * 1000,
          type: data.Physio_test,
          count: riskLabel
        })
      })
      let sixInter = graphData.filter(value => value.type === '6MWT').sort((a: any,b: any) => {
        return new Date(a.date).getTime() > new Date(b.date).getTime() ? -1 : 1
      })
      let intermediate = [];
      sixInter.forEach(val => {
        const exists = intermediate.find(value => moment(value.date).format('DD/MM/YYYY') === moment(val.date).format('DD/MM/YYYY'));
        if(!exists){
          intermediate.push(val);
        }
      })
      sixInter = intermediate;
      let TUGInter = graphData.filter(value => value.type !== 'TUG').sort((a: any,b: any) => {
        return new Date(a.date).getTime() > new Date(b.date).getTime() ? -1 : 1
      })
      intermediate = [];
      TUGInter.forEach(val => {
        const exists = intermediate.find(value => moment(value.date).format('DD/MM/YYYY') === moment(val.date).format('DD/MM/YYYY'));
        if(!exists){
          intermediate.push(val);
        }
      })
      TUGInter = intermediate;
      let SCSInter = graphData.filter(value => value.type === '30SCS').sort((a: any,b: any) => {
        return new Date(a.date).getTime() > new Date(b.date).getTime() ? -1 : 1
      })
      intermediate = [];
      SCSInter.forEach(val => {
        const exists = intermediate.find(value => moment(value.date).format('DD/MM/YYYY') === moment(val.date).format('DD/MM/YYYY'));
        if(!exists){
          intermediate.push(val);
        }
      })
      SCSInter = intermediate;
      graphData = [...TUGInter, ...sixInter, ...SCSInter];
      const maxEnd = graphData.find(value => moment(value.date).format('DD/MM/YYYY') === moment().format('DD/MM/YYYY'));
      const minEnd = graphData.find(value => moment(value.date).format('DD/MM/YYYY') === moment().subtract(6, 'months').format('DD/MM/YYYY'));
      if(!maxEnd){
        graphData.push({
          date: moment(max).format(),
          type: '',
        })
      }
      if(!minEnd){
        graphData.push({
          date: moment(min).format(),
          type: '',
        })
      }
      graphData.sort((a: any,b: any) => {
        return new Date(a.date).getTime() > new Date(b.date).getTime() ? 1 : -1
      })
      const TUG = [];
      const SCS = [];
      const sixMin = [];
      graphData.forEach(value => {
        categories.push(value.date);
        if(value.type === '6MWT'){
          sixMin.push(value.count);
          TUG.push(null);
          SCS.push(null);
        }else if(value.type === 'TUG'){
          sixMin.push(null);
          TUG.push(value.count);
          SCS.push(null);
        }else if(value.type === '30SCS'){
          sixMin.push(null);
          TUG.push(null);
          SCS.push(value.count);
        }else{
          sixMin.push(null);
          TUG.push(null);
          SCS.push(null)
        }
      })
      if(TUG.length > 0 || SCS.length > 0 || sixMin.length > 0){
        this.chartOptions.series[0].data = sixMin;
        this.chartOptions.series[1].data = SCS;
        this.chartOptions.series[2].data = TUG;
        this.chartOptions.xaxis.categories = categories;
      }else{
        this.noData = true;
      }
	setTimeout(() => {
		this.graphLoading = false;
	}, 400);
  }
  residentData:any = {};
  @Input('userData')
	set user(event: any) {
		this.residentData = event;
	}
	get user() {
		return this.residentData;
	}
  ngOnInit(): void {
  }
  physioTestsLoading = false;
  noData = false;
  physioTests: any[] = [];
  getUnits(type: string){
    switch(type){
      case '6MWT':
        return 'meters';
      case '30SCS': 
        return 'transitions';
      case 'TUG':
        return 'seconds'
    }
  }
  getPhysioTestInfo() {
    let totalData = [];
    this.physioTestsLoading = true;
    this.noData = false;
		this.commonHttp.getPhysioTestData().subscribe( (response: any) => {
      if(response.itemCount > 0){
        const physioTests = response.body.filter(value => value.details.resident_id === this.userId)
        physioTests.forEach((data: any) => {
          let items = {};
          items['Physio_test'] = data.details.physiotest_type;
          items['Taken_by'] = `${data.meta.created_by.first_name} ${data.meta.created_by.last_name}`;
          items['Actual_result'] = data.details.actual_results + " " + this.getUnits(data.details.physiotest_type);
          items['Expected_result'] = data.details.expected_results;
          items['Interpretations'] = data.details.interpretation;
          items['Date_taken_on'] = data.meta.created_at;
          totalData.push(items);
        });
      }
			this.physioTestsLoading = false;
      this.physioTests = totalData
      this.tableData = totalData
      let graphData = [];
      let categories = [];
      this.physioTests.forEach(data => {
        const riskLabel = data.Interpretations === 'High' ? 2 : 1
        graphData.push({
          date: parseInt(moment(data.Date_taken_on).add(this.timeToAdded, 'minutes').format('X')) * 1000,
          type: data.Physio_test,
          count: riskLabel
        })
      })
      let sixInter = graphData.filter(value => value.type === '6MWT').sort((a: any,b: any) => {
        return new Date(a.date).getTime() > new Date(b.date).getTime() ? -1 : 1
      })
      let intermediate = [];
      sixInter.forEach(val => {
        const exists = intermediate.find(value => moment(value.date).format('DD/MM/YYYY') === moment(val.date).format('DD/MM/YYYY'));
        if(!exists){
          intermediate.push(val);
        }
      })
      sixInter = intermediate;
      let TUGInter = graphData.filter(value => value.type === 'TUG').sort((a: any,b: any) => {
        return new Date(a.date).getTime() > new Date(b.date).getTime() ? -1 : 1
      })
      intermediate = [];
      TUGInter.forEach(val => {
        const exists = intermediate.find(value => moment(value.date).format('DD/MM/YYYY') === moment(val.date).format('DD/MM/YYYY'));
        if(!exists){
          intermediate.push(val);
        }
      })
      TUGInter = intermediate;
      let SCSInter = graphData.filter(value => value.type === '30SCS').sort((a: any,b: any) => {
        return new Date(a.date).getTime() > new Date(b.date).getTime() ? -1 : 1
      })
      intermediate = [];
      SCSInter.forEach(val => {
        const exists = intermediate.find(value => moment(value.date).format('DD/MM/YYYY') === moment(val.date).format('DD/MM/YYYY'));
        if(!exists){
          intermediate.push(val);
        }
      })
      SCSInter = intermediate;
      graphData = [...TUGInter, ...sixInter, ...SCSInter];
      const maxEnd = graphData.find(value => moment(value.date).format('DD/MM/YYYY') === moment().format('DD/MM/YYYY'));
      const minEnd = graphData.find(value => moment(value.date).format('DD/MM/YYYY') === moment().subtract(6, 'months').format('DD/MM/YYYY'));
      if(!maxEnd){
        graphData.push({
          date: parseInt(moment().add(this.timeToAdded, 'minutes').format("X")) * 1000,
          type: '',
        })
      }
      if(!minEnd){
        graphData.push({
          date: parseInt(moment().add(this.timeToAdded, 'minutes').subtract(6, 'months').format("X")) * 1000,
          type: '',
        })
      }
      graphData.sort((a: any,b: any) => {
        return new Date(a.date).getTime() > new Date(b.date).getTime() ? 1 : -1
      })
      const TUG = [];
      const SCS = [];
      const sixMin = [];
      graphData.forEach(value => {
        categories.push(value.date);
        if(value.type === '6MWT'){
          sixMin.push(value.count);
          TUG.push(null);
          SCS.push(null);
        }else if(value.type === 'TUG'){
          sixMin.push(null);
          TUG.push(value.count);
          SCS.push(null);
        }else if(value.type === '30SCS'){
          sixMin.push(null);
          TUG.push(null);
          SCS.push(value.count);
        }else{
          sixMin.push(null);
          TUG.push(null);
          SCS.push(null)
        }
      })
      if(TUG.length > 0 || SCS.length > 0 || sixMin.length > 0){
        this.chartOptions.series[0].data = sixMin;
        this.chartOptions.series[1].data = SCS;
        this.chartOptions.series[2].data = TUG;
        this.chartOptions.xaxis.categories = categories;
      }else{
        this.noData = true;
      }
		})
	}
  openDialog(type: string){
    let dialog: any;
    if(type === '6MWT'){
      dialog =this.matDialog.open(SixMWTComponent, {
        disableClose: true,
        panelClass: 'dialog-popup',
        width: '920px',
        data: {
          dialogType: 'Add 6MWT',
          userId: this.userId,
          payload: this.residentData
        }
      })
    }else if(type === 'TUG'){
      dialog = this.matDialog.open(TUGComponent,{
        disableClose: true,
        panelClass: 'dialog-popup',
        width: '920px',
        data: {
          dialogType: 'Add TUG',
          userId: this.userId,
          payload: this.residentData
        }
      })
    }else{
      dialog= this.matDialog.open(ThirtySCSComponent,{
        disableClose: true,
        panelClass: 'dialog-popup',
        width: '920px',
        data: {
          dialogType: 'Add 30SCS',
          userId: this.userId,
          payload: this.residentData
        }
      })
    }
    dialog.afterClosed().subscribe(data => {
      if(data){
        this.getPhysioTestInfo()
      }
    })
  }

}
