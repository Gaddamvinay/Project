import { Component, Input, OnInit } from '@angular/core';
import { TimeFormatService } from '../../../shared/services/time-format.service';
import { ChartOptions } from '../battery-statistics/battery-statistics.component';
import * as moment from 'moment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { TokenStorageServiceService } from '../../../auth/login/token-storage-service.service';
@Component({
  selector: 'app-resident-statistics',
  templateUrl: './resident-statistics.component.html',
  styleUrls: []
})
export class ResidentStatisticsComponent implements OnInit {

  public chartOptions: Partial<ChartOptions>;
  header:any;
  selectedInterval: string = 'Last 7 days';
  @Input() titleShow = false;
  @Input() type: string;
  @Input() forType: string = "";
  role = '';
  constructor(private tokenStorage: TokenStorageServiceService,private timeFormat: TimeFormatService,private http: HttpClient,private routeActivate: ActivatedRoute ) { 
    let user: any = localStorage.getItem('loggedInUser');
		if(user){
      user = JSON.parse(user);
      this.role = user.user_type;
    }
    this.chartOptions = {
      series: [
        {
          name: 'Resident profile viewed',
          data: [10, 30, 50, 60, 70, 30, 70],
        },
        {
          name: 'Unique profile viewed',
          data: [2, 15, 20, 5, 21, 9, 18],
        },
      ],
      chart: {
        type: 'line',
        height: 320,
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
      // title: {
      //   text: "Screen time usage (Hours)",
      //   align: 'center',
      //   margin: 0,
      //   offsetX: 0,
      //   offsetY: 0,
      //   style: {
      //     fontSize:  '18px',
      //     fontWeight:  600,
      //     fontFamily:  'Whitney A,Whitney B,Helvetica,Arial,sans-serif',
      //     color:  '#434342'
      //   },
      // },
      dataLabels: {
        enabled: false,
      },
      legend: {
        show: true,
        position: "bottom",
        fontSize: '14px',
        fontFamily: 'Whitney A,Whitney B,Helvetica,Arial,sans-serif',
        fontWeight: 500,
        offsetY: 8,
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
      xaxis: {
        type: 'datetime',
        title: {
          text: 'Date',
          offsetX: 0,
          offsetY: 12,
          style: {
            color: '#434342',
            fontSize: '14px',
            fontFamily: 'Whitney A,Whitney B,Helvetica,Arial,sans-serif',
            fontWeight: 500,
            cssClass: 'apexcharts-xaxis-title',
          },
        },
        categories: [
          '7 Dec 2020',
          '8 Dec 2020',
          '9 Dec 2020',
          '10 Dec 2020',
          '11 Dec 2020',
          '12 Dec 2020',
          '13 Dec 2020',
        ],
        labels: {
          style: {
            colors: '#aaa093',
            fontSize: '12px',
            fontFamily: 'Whitney A,Whitney B,Helvetica,Arial,sans-serif',
            fontWeight: 500,
            cssClass: 'apexcharts-xaxis-label',
          },
        },
      },
      markers: {
        size: 5
      },
      yaxis: {
        title: {
          text: 'Number of profiles viewed',
          offsetX: -6,
          offsetY: 0,
          style: {
            color: '#434342',
            fontSize: '14px',
            fontFamily: 'Whitney A,Whitney B,Helvetica,Arial,sans-serif',
            fontWeight: 500,
            cssClass: 'apexcharts-xaxis-title',
          },
        },
        min: 0,
        tickAmount: 4,
        labels: {
          style: {
            colors: '#aaa093',
            fontSize: '12px',
            fontFamily: 'Whitney A,Whitney B,Helvetica,Arial,sans-serif',
            fontWeight: 500,
            cssClass: 'apexcharts-xaxis-label',
          },
        },
      },
      tooltip: {
        x: {
          format: 'dd/MM/yyyy',
        },
        y: {
          formatter: function (val: any) {
            return val;
          },
        },
        fixed: {
          enabled: false,
          position: 'topRight',
          offsetX: 0,
          offsetY: 0,
        },
      },
      colors: ['#025174', '#bfb4ae', '#87657d', '#8cab88'],
      // stroke: {
      // 	show: true,
      // 	curve: 'straight',
      // 	lineCap: 'butt',
      // 	colors: undefined,
      // 	width: 5,
      // 	dashArray: [0, 0, 0, 10],
      // },
      fill: {
        colors: ['#025174'],
        opacity: 1,
        type: 'solid',
        gradient: {
          shade: 'light',
          type: 'vertical',
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
  momentToday = moment();
  customProgressDates: any = {};
  getFilterFormat(){
    return  this.timeFormat.getFilterFormat();
  }
  getHeaders(){
		this.header = new HttpHeaders().set(
		  "Authorization",
		  this.tokenStorage.getToken()
		);
	  }
  noData = false;
  changeDate(e: any){
    this.customProgressDates = {
      startDate: new Date(e.startDate),
      endDate: new Date(e.endDate)
    }
    const diff = moment(e.endDate).diff(moment(e.startDate), 'days');
    const dates = [];
    for(let i = 0; i < diff + 1; i++){
      dates.push(moment(e.startDate).add(i,'days').format('YYYY-MM-DD'))
    }
    this.isLoading = true;
    this.getHeaders();
    this.http.get(`${environment.apiUrlNew}/kpi/get/`,{headers:this.header}).subscribe((data: any) => {
      let KPIData = [];
      if(this.type === 'ward' && this.role === 'SSA'){
        data.body.filter(value => value.details.ward_id === this.wardId).forEach(value =>{
          const exists = dates.includes(value.meta.Rdate);
          if(exists){
            KPIData.push(value)
          }
        })
        const intermediate = [];
        KPIData.forEach(val => {
          const exists = intermediate.find(value => value.meta.Rdate === val.meta.Rdate);
          if(!exists){
            val.KPI.ResidentProfilesViewed = parseFloat(val.KPI.ResidentProfilesViewed);
            val.KPI.UniqueProfilesViewed = parseFloat(val.KPI.UniqueProfilesViewed)
            Object.assign(val, {count : 1})
            intermediate.push(val);
          }else{
            exists.KPI.ResidentProfilesViewed = exists.KPI.ResidentProfilesViewed + parseFloat(val.KPI.ResidentProfilesViewed);
            exists.KPI.UniqueProfilesViewed = exists.KPI.UniqueProfilesViewed + parseFloat(val.KPI.UniqueProfilesViewed);
            exists.count = exists.count + 1;
          }
        })
        KPIData = intermediate;
      }else if(this.type === 'facility' && this.role === 'SSA'){
        data.body.filter(value => value.details.facility_id === this.facilityId).forEach(value =>{
          const exists = dates.includes(value.meta.Rdate);
          if(exists){
            KPIData.push(value)
          }
        })
        const intermediate = [];
        KPIData.forEach(val => {
          const exists = intermediate.find(value => value.meta.Rdate === val.meta.Rdate);
          if(!exists){
            val.KPI.ResidentProfilesViewed = parseFloat(val.KPI.ResidentProfilesViewed);
            val.KPI.UniqueProfilesViewed = parseFloat(val.KPI.UniqueProfilesViewed)
            Object.assign(val, {count : 1})
            intermediate.push(val);
          }else{
            exists.KPI.ResidentProfilesViewed = exists.KPI.ResidentProfilesViewed + parseFloat(val.KPI.ResidentProfilesViewed);
            exists.KPI.UniqueProfilesViewed = exists.KPI.UniqueProfilesViewed + parseFloat(val.KPI.UniqueProfilesViewed);
            exists.count = exists.count + 1;
          }
        })
        KPIData = intermediate;
      }else if(this.type === 'customer' && this.role === 'SSA'){
        data.body.filter(value => value.details.customer_id === this.customerId).forEach(value =>{
          const exists = dates.includes(value.meta.Rdate);
          if(exists){
            KPIData.push(value)
          }
        })
        const intermediate = [];
        KPIData.forEach(val => {
          const exists = intermediate.find(value => value.meta.Rdate === val.meta.Rdate);
          if(!exists){
            val.KPI.ResidentProfilesViewed = parseFloat(val.KPI.ResidentProfilesViewed);
            val.KPI.UniqueProfilesViewed = parseFloat(val.KPI.UniqueProfilesViewed)
            Object.assign(val, {count : 1})
            intermediate.push(val);
          }else{
            exists.KPI.ResidentProfilesViewed = exists.KPI.ResidentProfilesViewed + parseFloat(val.KPI.ResidentProfilesViewed);
            exists.KPI.UniqueProfilesViewed = exists.KPI.UniqueProfilesViewed + parseFloat(val.KPI.UniqueProfilesViewed);
            exists.count = exists.count + 1;
     
          }
        })
        KPIData = intermediate;
      }else if(this.type === 'dashboard' && this.role === 'SSA'){
        data.body.forEach(value =>{
          const exists = dates.includes(value.meta.Rdate);
          if(exists){
            KPIData.push(value)
          }
        })
        const intermediate = [];
        KPIData.forEach(val => {
          const exists = intermediate.find(value => value.meta.Rdate === val.meta.Rdate);
          if(!exists){
            val.KPI.ResidentProfilesViewed = parseFloat(val.KPI.ResidentProfilesViewed);
            val.KPI.UniqueProfilesViewed = parseFloat(val.KPI.UniqueProfilesViewed)
            Object.assign(val, {count : 1})
            intermediate.push(val);
          }else{
            exists.KPI.ResidentProfilesViewed = exists.KPI.ResidentProfilesViewed + parseFloat(val.KPI.ResidentProfilesViewed);
            exists.KPI.UniqueProfilesViewed = exists.KPI.UniqueProfilesViewed + parseFloat(val.KPI.UniqueProfilesViewed);
            exists.count = exists.count + 1;
          }
        })
        KPIData = intermediate;
      }else if(this.type === 'ward' && this.role === 'CA'){
        data.body.filter(value => value.details.ward_id === this.wardId).forEach(value =>{
          const exists = dates.includes(value.meta.Rdate);
          if(exists){
            KPIData.push(value)
          }
        })
        const intermediate = [];
        KPIData.forEach(val => {
          const exists = intermediate.find(value => value.meta.Rdate === val.meta.Rdate);
          if(!exists){
            val.KPI.ResidentProfilesViewed = parseFloat(val.KPI.ResidentProfilesViewed);
            val.KPI.UniqueProfilesViewed = parseFloat(val.KPI.UniqueProfilesViewed)
            Object.assign(val, {count : 1})
            intermediate.push(val);
          }else{
            exists.KPI.ResidentProfilesViewed = exists.KPI.ResidentProfilesViewed + parseFloat(val.KPI.ResidentProfilesViewed);
            exists.KPI.UniqueProfilesViewed = exists.KPI.UniqueProfilesViewed + parseFloat(val.KPI.UniqueProfilesViewed);
            exists.count = exists.count + 1;
          }
        })
        KPIData = intermediate;
      }else if(this.type === 'facility' && this.role === 'CA'){
        data.body.filter(value => value.details.facility_id === this.facilityId).forEach(value =>{
          const exists = dates.includes(value.meta.Rdate);
          if(exists){
            KPIData.push(value)
          }
        })
        const intermediate = [];
        KPIData.forEach(val => {
          const exists = intermediate.find(value => value.meta.Rdate === val.meta.Rdate);
          if(!exists){
            val.KPI.ResidentProfilesViewed = parseFloat(val.KPI.ResidentProfilesViewed);
            val.KPI.UniqueProfilesViewed = parseFloat(val.KPI.UniqueProfilesViewed)
            Object.assign(val, {count : 1})
            intermediate.push(val);
          }else{
            exists.KPI.ResidentProfilesViewed = exists.KPI.ResidentProfilesViewed + parseFloat(val.KPI.ResidentProfilesViewed);
            exists.KPI.UniqueProfilesViewed = exists.KPI.UniqueProfilesViewed + parseFloat(val.KPI.UniqueProfilesViewed);
            exists.count = exists.count + 1;
          }
        })
        KPIData = intermediate;
      }else if(this.type === 'customer' && this.role === 'CA'){
        const user = JSON.parse(localStorage.getItem('loggedInUser'));
      this.customerId = user.customers.customer_id;
        data.body.filter(value => value.details.customer_id === this.customerId).forEach(value =>{
          const exists = dates.includes(value.meta.Rdate);
          if(exists){
            KPIData.push(value)
          }
        })
        const intermediate = [];
        KPIData.forEach(val => {
          const exists = intermediate.find(value => value.meta.Rdate === val.meta.Rdate);
          if(!exists){
            val.KPI.ResidentProfilesViewed = parseFloat(val.KPI.ResidentProfilesViewed);
            val.KPI.UniqueProfilesViewed = parseFloat(val.KPI.UniqueProfilesViewed)
            Object.assign(val, {count : 1})
            intermediate.push(val);
          }else{
            exists.KPI.ResidentProfilesViewed = exists.KPI.ResidentProfilesViewed + parseFloat(val.KPI.ResidentProfilesViewed);
            exists.KPI.UniqueProfilesViewed = exists.KPI.UniqueProfilesViewed + parseFloat(val.KPI.UniqueProfilesViewed);
            exists.count = exists.count + 1;
          }
        })
        KPIData = intermediate;
      }else if(this.type === 'ward' && this.role === 'FA'){
        data.body.filter(value => value.details.ward_id === this.wardId).forEach(value =>{
          const exists = dates.includes(value.meta.Rdate);
          if(exists){
            KPIData.push(value)
          }
        })
        const intermediate = [];
        KPIData.forEach(val => {
          const exists = intermediate.find(value => value.meta.Rdate === val.meta.Rdate);
          if(!exists){
            val.KPI.ResidentProfilesViewed = parseFloat(val.KPI.ResidentProfilesViewed);
            val.KPI.UniqueProfilesViewed = parseFloat(val.KPI.UniqueProfilesViewed)
            Object.assign(val, {count : 1})
            intermediate.push(val);
          }else{
            exists.KPI.ResidentProfilesViewed = exists.KPI.ResidentProfilesViewed + parseFloat(val.KPI.ResidentProfilesViewed);
            exists.KPI.UniqueProfilesViewed = exists.KPI.UniqueProfilesViewed + parseFloat(val.KPI.UniqueProfilesViewed);
            exists.count = exists.count + 1;
          }
        })
        KPIData = intermediate;
      }else if(this.type === 'facility' && this.role === 'FA'){
        data.body.filter(value => value.details.facility_id === this.facilityId).forEach(value =>{
          const exists = dates.includes(value.meta.Rdate);
          if(exists){
            KPIData.push(value)
          }
        })
        const intermediate = [];
        KPIData.forEach(val => {
          const exists = intermediate.find(value => value.meta.Rdate === val.meta.Rdate);
          if(!exists){
            val.KPI.ResidentProfilesViewed = parseFloat(val.KPI.ResidentProfilesViewed);
            val.KPI.UniqueProfilesViewed = parseFloat(val.KPI.UniqueProfilesViewed)
            Object.assign(val, {count : 1})
            intermediate.push(val);
          }else{
            exists.KPI.ResidentProfilesViewed = exists.KPI.ResidentProfilesViewed + parseFloat(val.KPI.ResidentProfilesViewed);
            exists.KPI.UniqueProfilesViewed = exists.KPI.UniqueProfilesViewed + parseFloat(val.KPI.UniqueProfilesViewed);
            exists.count = exists.count + 1;
          }
        })
        KPIData = intermediate;
      }else if(this.type === 'ward' && this.role === 'WA'){
        data.body.filter(value => value.details.ward_id === this.wardId).forEach(value =>{
          const exists = dates.includes(value.meta.Rdate);
          if(exists){
            KPIData.push(value)
          }
        })
        const intermediate = [];
        KPIData.forEach(val => {
          const exists = intermediate.find(value => value.meta.Rdate === val.meta.Rdate);
          if(!exists){
            val.KPI.ResidentProfilesViewed = parseFloat(val.KPI.ResidentProfilesViewed);
            val.KPI.UniqueProfilesViewed = parseFloat(val.KPI.UniqueProfilesViewed)
            Object.assign(val, {count : 1})
            intermediate.push(val);
          }else{
            exists.KPI.ResidentProfilesViewed = exists.KPI.ResidentProfilesViewed + parseFloat(val.KPI.ResidentProfilesViewed);
            exists.KPI.UniqueProfilesViewed = exists.KPI.UniqueProfilesViewed + parseFloat(val.KPI.UniqueProfilesViewed);
            exists.count = exists.count + 1;
          }
        })
        KPIData = intermediate;
      }
      KPIData.sort((a,b) => {
        return parseInt(a.meta.timestamp) > parseInt(b.meta.timestamp) ? 1 : -1;
      });
      const categories = KPIData.map((value: any) => {
        return value.meta.Rdate;
      })
      const resident = KPIData.map((value: any, i: number )=> {
        return value.KPI.ResidentProfilesViewed
      })
      let max = 0;
      if(KPIData.length > 0){
        this.isDataAvailable = true;
      }
      KPIData.forEach(val => {
        if(parseInt(val.KPI.ResidentProfilesViewed) > max){
          max = parseInt(val.KPI.ResidentProfilesViewed);
        }
        if(parseInt(val.KPI.UniqueProfilesViewed) > max){
          max = parseInt(val.KPI.UniqueProfilesViewed)
        }
      })
      const unique = KPIData.map((value: any, i: number ) => {
        return value.KPI.UniqueProfilesViewed;
      })
      this.chartOptions.series[0].data = resident;
      this.chartOptions.series[1].data = unique;
      this.chartOptions.xaxis.categories = categories;
      this.customProgressDates = {
        startDate: categories[0],
        endDate: categories[categories.length - 1]
      }
      this.chartOptions.yaxis.max = this.rounded(max);
      this.isLoading = false
    })
  }

  wardId = '';
  ngOnInit(): void {
    this.getLast7days();
  }
  getLast7days(){
    this.selectedInterval = 'Last 7 days';
    if(this.type === 'ward' && this.role === 'SSA'){
      this.routeActivate.paramMap.subscribe(data => {
        this.wardId = data.get('wardId');
        this.getKPIWardData('week');
      });
    }else if(this.type === 'facility' && this.role === 'SSA'){
      this.routeActivate.paramMap.subscribe(data => {
        this.facilityId = data.get('facilityId');
        this.getKPIFacilityData('week');
      });
    }else if(this.type === 'customer' && this.role === 'SSA'){
      this.routeActivate.paramMap.subscribe(data => {
        this.customerId = data.get('customer_id');
        this.getKPICustomerData('week');
      });
    }else if(this.type === 'dashboard' && this.role === 'SSA'){
      this.getKPIDashboardData('week');
    }else if(this.type === 'ward' && this.role === 'CA'){
      this.routeActivate.paramMap.subscribe(data => {
        this.wardId = data.get('wardId');
        this.getKPIWardData('week');
      });
    }else if(this.type === 'facility' && this.role === 'CA'){
      this.routeActivate.paramMap.subscribe(data => {
        this.facilityId = data.get('facilityId');
        this.getKPIFacilityData('week');
      });
    }else if(this.type === 'customer' && this.role === 'CA'){
      const user = JSON.parse(localStorage.getItem('loggedInUser'));
      this.customerId = user.customers.customer_id;
      this.getKPICustomerData('week');
    }else if(this.type === 'ward' && this.role === 'FA'){
      this.routeActivate.paramMap.subscribe(data => {
        this.wardId = data.get('wardId');
        this.getKPIWardData('week');
      });
    }else if(this.type === 'facility' && this.role === 'FA'){
        const user = JSON.parse(localStorage.getItem('loggedInUser'));
        this.facilityId = user.facilities.facility_id;
        this.getKPIFacilityData('week');
    }else if(this.type === 'ward' && this.role === 'WA'){
      let user: any = localStorage.getItem('loggedInUser');
      if(user){
        user = JSON.parse(user);
        this.wardId = user.wards[0].ward_id;
        this.getKPIWardData('week');
      }
    }
  }
	  
  isLoading = false;
  isDataAvailable = false;
	getKPIWardData(interval: string){
		this.isLoading = true;
    this.getHeaders();
		if(interval === 'week'){
      this.http.get(`${environment.apiUrlNew}/kpi/getSevenDaysWSummary/?ward_id=${this.wardId}`,{headers:this.header}).subscribe((data: any) => {
        if(data.itemCount > 0){
          let KPIData = data.body.filter(value => value.details.ward_id === this.wardId)
                .sort((a,b) => {
                return new Date(a.details.Rdate).getTime() > new Date(b.details.Rdate).getTime() ? 1 : -1;
                });
          ;
          if(KPIData.length > 0){
            this.isDataAvailable = true;
          }
          const categories = KPIData.map((value: any) => {
            return value.details.Rdate;
          })
          const resident = KPIData.map((value: any, i: number )=> {
            return value.Graph.ResidentProfilesViewed
          })
          let max = 0;
          KPIData.forEach(val => {
            if(parseInt(val.Graph.ResidentProfilesViewed) > max){
              max = parseInt(val.Graph.ResidentProfilesViewed);
            }
            if(parseInt(val.Graph.UniqueProfilesViewed) > max){
              max = parseInt(val.Graph.UniqueProfilesViewed)
            }
          })
          const unique = KPIData.map((value: any, i: number ) => {
            return value.Graph.UniqueProfilesViewed;
          })
          this.chartOptions.series[0].data = resident;
          this.chartOptions.series[1].data = unique;
          this.chartOptions.xaxis.categories = categories;
          this.chartOptions.yaxis.max = this.rounded(max);
          this.customProgressDates = {
            startDate: categories[categories.length - 1],
            endDate: categories[0]
          }
        
        if(this.rounded(max)==0 ){
          this.isDataAvailable = false;
        }else {
       this.isDataAvailable = true;
        }
      }
        this.isLoading = false;
      })
    }else if(interval === 'month'){
			this.http.get(`${environment.apiUrlNew}/kpi/getOneMonthWSummary/?ward_id=${this.wardId}`,{headers:this.header}).subscribe((data: any) => {
				if(data.itemCount > 0){
          let KPIData = data.body.filter(value => value.details.ward_id === this.wardId)
                .sort((a,b) => {
                return new Date(a.details.Rdate).getTime() > new Date(b.details.Rdate).getTime() ? 1 : -1;
                });
          ;
          if(KPIData.length > 0){
            this.isDataAvailable = true;
          }
          const categories = KPIData.map((value: any) => {
            return value.details.Rdate;
          })
          const resident = KPIData.map((value: any, i: number )=> {
            return value.Graph.ResidentProfilesViewed
          })
          let max = 0;
          KPIData.forEach(val => {
            if(parseInt(val.Graph.ResidentProfilesViewed) > max){
              max = parseInt(val.Graph.ResidentProfilesViewed);
            }
            if(parseInt(val.Graph.UniqueProfilesViewed) > max){
              max = parseInt(val.Graph.UniqueProfilesViewed)
            }
          })
          const unique = KPIData.map((value: any, i: number ) => {
            return value.Graph.UniqueProfilesViewed;
          })
          this.chartOptions.series[0].data = resident;
          this.chartOptions.series[1].data = unique;
          this.chartOptions.xaxis.categories = categories;
          this.chartOptions.yaxis.max = this.rounded(max);
          this.customProgressDates = {
            startDate: categories[categories.length - 1],
            endDate: categories[0]
          }
          if(this.rounded(max)==0 ){
            this.isDataAvailable = false;
          }else  {
         this.isDataAvailable = true;
       
          }
        }
        this.isLoading = false;
			})
    }else if(interval === 'threeMonth'){
			this.http.get(`${environment.apiUrlNew}/kpi/getThreeMonthsWSummary/?ward_id=${this.wardId}`,{headers:this.header}).subscribe((data: any) => {
				if(data.itemCount > 0){
          let KPIData = data.body.filter(value => value.details.ward_id === this.wardId)
                .sort((a,b) => {
                return new Date(a.details.Rdate).getTime() > new Date(b.details.Rdate).getTime() ? 1 : -1;
                });
          ;
          if(KPIData.length > 0){
            this.isDataAvailable = true;
          }
          let categories = KPIData.map((value: any) => {
            return value.details.Rdate;
          })
          let resident = KPIData.map((value: any, i: number )=> {
            return value.Graph.ResidentProfilesViewed
          })
          let max = 0;
          KPIData.forEach(val => {
            if(parseInt(val.Graph.ResidentProfilesViewed) > max){
              max = parseInt(val.Graph.ResidentProfilesViewed);
            }
            if(parseInt(val.Graph.UniqueProfilesViewed) > max){
              max = parseInt(val.Graph.UniqueProfilesViewed)
            }
          })
          let unique = KPIData.map((value: any, i: number ) => {
            return value.Graph.UniqueProfilesViewed;
          })
          // unique = unique.filter((val: any, i: number) => ((i - 1)%3 === 0 && i > 1) || i === 0 || i === KPIData.length - 1);
          // resident = resident.filter((val: any, i: number) => ((i - 1)%3 === 0 && i > 1) || i === 0 || i === KPIData.length - 1);
          // categories = categories.filter((val: any, i: number) => ((i - 1)%3 === 0 && i > 1) || i === 0 || i === KPIData.length - 1)
          this.chartOptions.series[0].data = resident;
          this.chartOptions.series[1].data = unique;
          this.chartOptions.xaxis.categories = categories;
          this.chartOptions.yaxis.max = this.rounded(max);
          this.customProgressDates = {
            startDate: categories[categories.length - 1],
            endDate: categories[0]
          }
          if(this.rounded(max)==0 ){
            this.isDataAvailable = false;
          }else  {
         this.isDataAvailable = true;
       
          }
        }
        this.isLoading = false;
			})
    }else if(interval === 'sixMonth'){
			this.http.get(`${environment.apiUrlNew}/kpi/getSixMonthsWSummary/?ward_id=${this.wardId}`,{headers:this.header}).subscribe((data: any) => {
				if(data.itemCount > 0){
          let KPIData = data.body.filter(value => value.details.ward_id === this.wardId)
                .sort((a,b) => {
                return new Date(a.details.Rdate).getTime() > new Date(b.details.Rdate).getTime() ? 1 : -1;
                });
          ;
          if(KPIData.length > 0){
            this.isDataAvailable = true;
          }
          let categories = KPIData.map((value: any) => {
            return value.details.Rdate;
          })
          let resident = KPIData.map((value: any, i: number )=> {
            return value.Graph.ResidentProfilesViewed
          })
          let max = 0;
          KPIData.forEach(val => {
            if(parseInt(val.Graph.ResidentProfilesViewed) > max){
              max = parseInt(val.Graph.ResidentProfilesViewed);
            }
            if(parseInt(val.Graph.UniqueProfilesViewed) > max){
              max = parseInt(val.Graph.UniqueProfilesViewed)
            }
          })
          let unique = KPIData.map((value: any, i: number ) => {
            return value.Graph.UniqueProfilesViewed;
          })
          // unique = unique.filter((val: any, i: number) => ((i - 1)%6 === 0 && i > 1) || i === 0 || i === KPIData.length - 1);
          // resident = resident.filter((val: any, i: number) => ((i - 1)%6 === 0 && i > 1) || i === 0 || i === KPIData.length - 1);
          // categories = categories.filter((val: any, i: number) => ((i - 1)%6 === 0 && i > 1) || i === 0 || i === KPIData.length - 1)
          this.chartOptions.series[0].data = resident;
          this.chartOptions.series[1].data = unique;
          this.chartOptions.xaxis.categories = categories;
          this.chartOptions.yaxis.max = this.rounded(max);
          this.customProgressDates = {
            startDate: categories[categories.length - 1],
            endDate: categories[0]
          }
          if(this.rounded(max)==0 ){
            this.isDataAvailable = false;
          }else  {
         this.isDataAvailable = true;
       
          }
        }
        this.isLoading = false;
			})
    }
  }
  rounded(numb: number){
    const round = Math.round(numb);
    return Math.ceil(round / 5) * 5;
  }
	facilityId = '';
	getKPIFacilityData(interval: string){
    this.isLoading = true;
    this.getHeaders();
    if(interval === 'week'){
      this.http.get(`${environment.apiUrlNew}/kpi/getSevenDaysFSummary/?facility_id=${this.facilityId}`,{headers:this.header}).subscribe((data: any) => {
        if(data.itemCount > 0){
          let KPIData = data.body.filter(value => value.details.facility_id === this.facilityId)
                .sort((a,b) => {
                return new Date(a.details.Rdate).getTime() > new Date(b.details.Rdate).getTime() ? 1 : -1;
                });
          ;
          if(KPIData.length > 0){
            this.isDataAvailable = true;
          }
          const categories = KPIData.map((value: any) => {
            return value.details.Rdate;
          })
          const resident = KPIData.map((value: any, i: number )=> {
            return value.Graph.ResidentProfilesViewed
          })
          let max = 0;
          KPIData.forEach(val => {
            if(parseInt(val.Graph.ResidentProfilesViewed) > max){
              max = parseInt(val.Graph.ResidentProfilesViewed);
            }
            if(parseInt(val.Graph.UniqueProfilesViewed) > max){
              max = parseInt(val.Graph.UniqueProfilesViewed)
            }
          })
          const unique = KPIData.map((value: any, i: number ) => {
            return value.Graph.UniqueProfilesViewed;
          })
          this.chartOptions.series[0].data = resident;
          this.chartOptions.series[1].data = unique;
          this.chartOptions.xaxis.categories = categories;
          this.chartOptions.yaxis.max = this.rounded(max);
          this.customProgressDates = {
            startDate: categories[categories.length - 1],
            endDate: categories[0]
          }
          //console.log("maxtime"+ this.rounded(max));
          if(this.rounded(max)==0 ){
            this.isDataAvailable = false;
          }else  {
         this.isDataAvailable = true;
       
          }
        }
      
        this.isLoading = false;
      })
    }else if(interval === 'month'){
			this.http.get(`${environment.apiUrlNew}/kpi/getOneMonthFSummary/?facility_id=${this.facilityId}`,{headers:this.header}).subscribe((data: any) => {
				if(data.itemCount > 0){
          let KPIData = data.body.filter(value => value.details.facility_id === this.facilityId)
                .sort((a,b) => {
                return new Date(a.details.Rdate).getTime() > new Date(b.details.Rdate).getTime() ? 1 : -1;
                });
          ;
          if(KPIData.length > 0){
            this.isDataAvailable = true;
          }
          const categories = KPIData.map((value: any) => {
            return value.details.Rdate;
          })
          const resident = KPIData.map((value: any, i: number )=> {
            return value.Graph.ResidentProfilesViewed
          })
          let max = 0;
          KPIData.forEach(val => {
            if(parseInt(val.Graph.ResidentProfilesViewed) > max){
              max = parseInt(val.Graph.ResidentProfilesViewed);
            }
            if(parseInt(val.Graph.UniqueProfilesViewed) > max){
              max = parseInt(val.Graph.UniqueProfilesViewed)
            }
          })
          const unique = KPIData.map((value: any, i: number ) => {
            return value.Graph.UniqueProfilesViewed;
          })
          this.chartOptions.series[0].data = resident;
          this.chartOptions.series[1].data = unique;
          this.chartOptions.xaxis.categories = categories;
          this.chartOptions.yaxis.max = this.rounded(max);
          this.customProgressDates = {
            startDate: categories[categories.length - 1],
            endDate: categories[0]
          }
          if(this.rounded(max)==0 ){
            this.isDataAvailable = false;
          }else  {
         this.isDataAvailable = true;
       
          }
        }
        this.isLoading = false;
			})
    }else if(interval === 'threeMonth'){
			this.http.get(`${environment.apiUrlNew}/kpi/getThreeMonthsFSummary/?facility_id=${this.facilityId}`,{headers:this.header}).subscribe((data: any) => {
				if(data.itemCount > 0){
          let KPIData = data.body.filter(value => value.details.facility_id === this.facilityId)
                .sort((a,b) => {
                return new Date(a.details.Rdate).getTime() > new Date(b.details.Rdate).getTime() ? 1 : -1;
                });
          ;
          if(KPIData.length > 0){
            this.isDataAvailable = true;
          }
          let categories = KPIData.map((value: any) => {
            return value.details.Rdate;
          })
          let resident = KPIData.map((value: any, i: number )=> {
            return value.Graph.ResidentProfilesViewed
          })
          let max = 0;
          KPIData.forEach(val => {
            if(parseInt(val.Graph.ResidentProfilesViewed) > max){
              max = parseInt(val.Graph.ResidentProfilesViewed);
            }
            if(parseInt(val.Graph.UniqueProfilesViewed) > max){
              max = parseInt(val.Graph.UniqueProfilesViewed)
            }
          })
          let unique = KPIData.map((value: any, i: number ) => {
            return value.Graph.UniqueProfilesViewed;
          })
          // unique = unique.filter((val: any, i: number) => ((i - 1)%3 === 0 && i > 1) || i === 0 || i === KPIData.length - 1);
          // resident = resident.filter((val: any, i: number) => ((i - 1)%3 === 0 && i > 1) || i === 0 || i === KPIData.length - 1);
          // categories = categories.filter((val: any, i: number) => ((i - 1)%3 === 0 && i > 1) || i === 0 || i === KPIData.length - 1);
          this.chartOptions.series[0].data = resident;
          this.chartOptions.series[1].data = unique;
          this.chartOptions.xaxis.categories = categories;
          this.chartOptions.yaxis.max = this.rounded(max);
          this.customProgressDates = {
            startDate: categories[categories.length - 1],
            endDate: categories[0]
          }
        }
        this.isLoading = false;
			})
    }else if(interval === 'sixMonth'){
			this.http.get(`${environment.apiUrlNew}/kpi/getSixMonthsFSummary/?facility_id=${this.facilityId}`,{headers:this.header}).subscribe((data: any) => {
				if(data.itemCount > 0){
          let KPIData = data.body.filter(value => value.details.facility_id === this.facilityId)
                .sort((a,b) => {
                return new Date(a.details.Rdate).getTime() > new Date(b.details.Rdate).getTime() ? 1 : -1;
                });
          ;
          if(KPIData.length > 0){
            this.isDataAvailable = true;
          }
          let categories = KPIData.map((value: any) => {
            return value.details.Rdate;
          })
          let resident = KPIData.map((value: any, i: number )=> {
            return value.Graph.ResidentProfilesViewed
          })
          let max = 0;
          KPIData.forEach(val => {
            if(parseInt(val.Graph.ResidentProfilesViewed) > max){
              max = parseInt(val.Graph.ResidentProfilesViewed);
            }
            if(parseInt(val.Graph.UniqueProfilesViewed) > max){
              max = parseInt(val.Graph.UniqueProfilesViewed)
            }
          })
          let unique = KPIData.map((value: any, i: number ) => {
            return value.Graph.UniqueProfilesViewed;
          })
          // unique = unique.filter((val: any, i: number) => ((i - 1)%6 === 0 && i > 1) || i === 0 || i === KPIData.length - 1);
          // resident = resident.filter((val: any, i: number) => ((i - 1)%6 === 0 && i > 1) || i === 0 || i === KPIData.length - 1);
          // categories = categories.filter((val: any, i: number) => ((i - 1)%6 === 0 && i > 1) || i === 0 || i === KPIData.length - 1)
          this.chartOptions.series[0].data = resident;
          this.chartOptions.series[1].data = unique;
          this.chartOptions.xaxis.categories = categories;
          this.chartOptions.yaxis.max = this.rounded(max);
          this.customProgressDates = {
            startDate: categories[categories.length - 1],
            endDate: categories[0]
          }
          if(this.rounded(max)==0 ){
            this.isDataAvailable = false;
          }else  {
         this.isDataAvailable = true;
       
          }
        }
        this.isLoading = false;
			})
    }
	}
	
	customerId = '';
	getKPICustomerData(interval: string){
    this.isLoading = true;
    this.getHeaders();
    if(interval === 'week'){
      this.http.get(`${environment.apiUrlNew}/kpi/getSevenDaysCSummary/?customer_id=${this.customerId}`,{headers:this.header}).subscribe((data: any) => {
        if(data.itemCount > 0){
          let KPIData = data.body.filter(value => value.details.customer_id === this.customerId)
                .sort((a,b) => {
                return new Date(a.details.Rdate).getTime() > new Date(b.details.Rdate).getTime() ? 1 : -1;
                });
          ;
          const categories = KPIData.map((value: any) => {
            console.log(value.details.Rdate);
            return value.details.Rdate;
          })
          const resident = KPIData.map((value: any, i: number )=> {
            //console.log(value.Graph.UniqueProfilesViewed);
            return value.Graph.ResidentProfilesViewed
          })
          let max = 0;
          KPIData.forEach(val => {
            if(parseInt(val.Graph.ResidentProfilesViewed) > max){
              max = parseInt(val.Graph.ResidentProfilesViewed);
            }
            if(parseInt(val.Graph.UniqueProfilesViewed) > max){
              max = parseInt(val.Graph.UniqueProfilesViewed)
            }
          })
          const unique = KPIData.map((value: any, i: number ) => {
            console.log(value.Graph.UniqueProfilesViewed);
            return value.Graph.UniqueProfilesViewed;
          })
         
          this.chartOptions.series[0].data = resident;
          this.chartOptions.series[1].data = unique;
          this.chartOptions.xaxis.categories = categories;
          this.customProgressDates = {
            startDate: categories[categories.length - 1],
            endDate: categories[0]
            
          }
          this.chartOptions.yaxis.max = this.rounded(max);
          if(this.rounded(max)==0 ){
            this.isDataAvailable = false;
          }else 
         //if(unique.length > 0 || resident.length > 0)
         {
         this.isDataAvailable = true;
           //this.isDataAvailable = false;
          }
     
        }
        this.isLoading = false;
      })
    }else if(interval === 'month'){
			this.http.get(`${environment.apiUrlNew}/kpi/getOneMonthCSummary/?customer_id=${this.customerId}`,{headers:this.header}).subscribe((data: any) => {
				if(data.itemCount > 0){
          let KPIData = data.body.filter(value => value.details.customer_id === this.customerId)
                .sort((a,b) => {
                return new Date(a.details.Rdate).getTime() > new Date(b.details.Rdate).getTime() ? 1 : -1;
                });
          ;
        let categories = KPIData.map((value: any) => {
            console.log(value.Graph.UniqueProfilesViewed);
            return value.details.Rdate;
          })
          let resident = KPIData.map((value: any, i: number )=> {
            return value.Graph.ResidentProfilesViewed
          })
          let max = 0;
          KPIData.forEach(val => {
            if(parseInt(val.Graph.ResidentProfilesViewed) > max){
              max = parseInt(val.Graph.ResidentProfilesViewed);
            }
            if(parseInt(val.Graph.UniqueProfilesViewed) > max){
              max = parseInt(val.Graph.UniqueProfilesViewed)
            }
          })
       let  unique = KPIData.map((value: any, i: number ) => {
            //console.log(value.Graph.UniqueProfilesViewed);
            return value.Graph.UniqueProfilesViewed;

          })
          this.chartOptions.series[0].data = resident;
          this.chartOptions.series[1].data = unique;
          this.chartOptions.xaxis.categories = categories;
          console.log(categories);
          this.customProgressDates = {
            startDate: categories[categories.length - 1],
            endDate: categories[0]
          }
          this.chartOptions.yaxis.max = this.rounded(max);
          if(this.rounded(max)==0 ){
            this.isDataAvailable = false;
          }else {
         this.isDataAvailable = true;
          }
          // if(unique.length > 0 || resident.length > 0){
          //  this.isDataAvailable = true;
          //  //this.isDataAvailable = false;
          // }
        }
        this.isLoading = false;
			})
    }else if(interval === 'threeMonth'){
			this.http.get(`${environment.apiUrlNew}/kpi/getThreeMonthsCSummary/?customer_id=${this.customerId}`,{headers:this.header}).subscribe((data: any) => {
				if(data.itemCount > 0){
          let KPIData = data.body.filter(value => value.details.customer_id === this.customerId)
                .sort((a,b) => {
                return new Date(a.details.Rdate).getTime() > new Date(b.details.Rdate).getTime() ? 1 : -1;
                });
          ;
          let categories = KPIData.map((value: any) => {
            return value.details.Rdate;
          })
          let resident = KPIData.map((value: any, i: number )=> {
            
            return value.Graph.ResidentProfilesViewed
          })
          let max = 0;
          KPIData.forEach(val => {
            if(parseInt(val.Graph.ResidentProfilesViewed) > max){
              max = parseInt(val.Graph.ResidentProfilesViewed);
            }
            if(parseInt(val.Graph.UniqueProfilesViewed) > max){
              max = parseInt(val.Graph.UniqueProfilesViewed)
            }
          })
          let unique = KPIData.map((value: any, i: number ) => {
            return value.Graph.UniqueProfilesViewed;
          })
          // unique = unique.filter((val: any, i: number) => ((i - 1)%3 === 0 && i > 1) || i === 0 || i === KPIData.length - 1);
          // resident = resident.filter((val: any, i: number) => ((i - 1)%3 === 0 && i > 1) || i === 0 || i === KPIData.length - 1);
          // categories = categories.filter((val: any, i: number) => ((i - 1)%3 === 0 && i > 1) || i === 0 || i === KPIData.length - 1)
          this.chartOptions.series[0].data = resident;
          this.chartOptions.series[1].data = unique;
          this.chartOptions.xaxis.categories = categories;
          this.customProgressDates = {
            startDate: categories[categories.length - 1],
            endDate: categories[0]
          }
          this.chartOptions.yaxis.max = this.rounded(max);
          if(this.rounded(max)==0 ){
            this.isDataAvailable = false;
          }else {
         this.isDataAvailable = true;
          }
          // if(unique.length > 0 || resident.length > 0){
          //   this.isDataAvailable = true;
          // }else {
          //   this.isDataAvailable = false;
          // }
        }
        this.isLoading = false;
			})
    }else if(interval === 'sixMonth'){
			this.http.get(`${environment.apiUrlNew}/kpi/getSixMonthsCSummary/?customer_id=${this.customerId}`,{headers:this.header}).subscribe((data: any) => {
				if(data.itemCount > 0){
          let KPIData = data.body.filter(value => value.details.customer_id === this.customerId)
                .sort((a,b) => {
                return new Date(a.details.Rdate).getTime() > new Date(b.details.Rdate).getTime() ? 1 : -1;
                });
          ;
          let categories = KPIData.map((value: any) => {
            return value.details.Rdate;
          })
          let resident = KPIData.map((value: any, i: number )=> {
            return value.Graph.ResidentProfilesViewed
          })
          let max = 0;
          KPIData.forEach(val => {
            if(parseInt(val.Graph.ResidentProfilesViewed) > max){
              max = parseInt(val.Graph.ResidentProfilesViewed);
            }
            if(parseInt(val.Graph.UniqueProfilesViewed) > max){
              max = parseInt(val.Graph.UniqueProfilesViewed)
            }
          })
          let unique = KPIData.map((value: any, i: number ) => {
            return value.Graph.UniqueProfilesViewed;
          })
          // unique = unique.filter((val: any, i: number) => ((i - 1)%6 === 0 && i > 1) || i === 0 || i === KPIData.length - 1);
          // resident = resident.filter((val: any, i: number) => ((i - 1)%6 === 0 && i > 1) || i === 0 || i === KPIData.length - 1);
          // categories = categories.filter((val: any, i: number) => ((i - 1)%6 === 0 && i > 1) || i === 0 || i === KPIData.length - 1)
          this.chartOptions.series[0].data = resident;
          this.chartOptions.series[1].data = unique;
          this.chartOptions.xaxis.categories = categories;
          this.customProgressDates = {
            startDate: categories[categories.length - 1],
            endDate: categories[0]
          }
          this.chartOptions.yaxis.max = this.rounded(max);
          if(this.rounded(max)==0 ){
            this.isDataAvailable = false;
          }else {
         this.isDataAvailable = true;
          }
          // if(unique.length > 0 || resident.length > 0){
          //   this.isDataAvailable = true;
          // }
        }
        this.isLoading = false;
			})
    }
  }
  getLast1Month(){
    this.selectedInterval = 'Last 1 month';
    if(this.type === 'ward' && this.role === 'SSA'){
      this.routeActivate.paramMap.subscribe(data => {
        this.wardId = data.get('wardId');
        this.getKPIWardData('month');
      });
    }else if(this.type === 'facility' && this.role === 'SSA'){
      this.routeActivate.paramMap.subscribe(data => {
        this.facilityId = data.get('facilityId');
        this.getKPIFacilityData('month');
      });
    }else if(this.type === 'customer' && this.role === 'SSA'){
      this.routeActivate.paramMap.subscribe(data => {
        this.customerId = data.get('customer_id');
        this.getKPICustomerData('month');
      });
    }else if(this.type === 'dashboard' && this.role === 'SSA'){
      this.getKPIDashboardData('month');
    }else if(this.type === 'ward' && this.role === 'CA'){
      this.routeActivate.paramMap.subscribe(data => {
        this.wardId = data.get('wardId');
        this.getKPIWardData('month');
      });
    }else if(this.type === 'facility' && this.role === 'CA'){
      this.routeActivate.paramMap.subscribe(data => {
        this.facilityId = data.get('facilityId');
        this.getKPIFacilityData('month');
      });
    }else if(this.type === 'customer' && this.role === 'CA'){
      const user = JSON.parse(localStorage.getItem('loggedInUser'));
      this.customerId = user.customers.customer_id;
      this.getKPICustomerData('month');
    }else if(this.type === 'ward' && this.role === 'FA'){
      this.routeActivate.paramMap.subscribe(data => {
        this.wardId = data.get('wardId');
        this.getKPIWardData('month');
      });
    }else if(this.type === 'facility' && this.role === 'FA'){
        const user = JSON.parse(localStorage.getItem('loggedInUser'));
        this.facilityId = user.facilities.facility_id;
        this.getKPIFacilityData('month');
    }else if(this.type === 'ward' && this.role === 'WA'){
      let user: any = localStorage.getItem('loggedInUser');
      if(user){
        user = JSON.parse(user);
        this.wardId = user.wards[0].ward_id;
        this.getKPIWardData('month');
      }
    }
  }
  
  getLast3Month(){
    this.selectedInterval = 'Last 3 months';
    if(this.type === 'ward' && this.role === 'SSA'){
      this.routeActivate.paramMap.subscribe(data => {
        this.wardId = data.get('wardId');
        this.getKPIWardData('threeMonth');
      });
    }else if(this.type === 'facility' && this.role === 'SSA'){
      this.routeActivate.paramMap.subscribe(data => {
        this.facilityId = data.get('facilityId');
        this.getKPIFacilityData('threeMonth');
      });
    }else if(this.type === 'customer' && this.role === 'SSA'){
      this.routeActivate.paramMap.subscribe(data => {
        this.customerId = data.get('customer_id');
        this.getKPICustomerData('threeMonth');
      });
    }else if(this.type === 'dashboard' && this.role === 'SSA'){
      this.getKPIDashboardData('threeMonth');
    }else if(this.type === 'ward' && this.role === 'CA'){
      this.routeActivate.paramMap.subscribe(data => {
        this.wardId = data.get('wardId');
        this.getKPIWardData('threeMonth');
      });
    }else if(this.type === 'facility' && this.role === 'CA'){
      this.routeActivate.paramMap.subscribe(data => {
        this.facilityId = data.get('facilityId');
        this.getKPIFacilityData('threeMonth');
      });
    }else if(this.type === 'customer' && this.role === 'CA'){
      const user = JSON.parse(localStorage.getItem('loggedInUser'));
      this.customerId = user.customers.customer_id;
      this.getKPICustomerData('threeMonth');
    }else if(this.type === 'ward' && this.role === 'FA'){
      this.routeActivate.paramMap.subscribe(data => {
        this.wardId = data.get('wardId');
        this.getKPIWardData('threeMonth');
      });
    }else if(this.type === 'facility' && this.role === 'FA'){
        const user = JSON.parse(localStorage.getItem('loggedInUser'));
        this.facilityId = user.facilities.facility_id;
        this.getKPIFacilityData('threeMonth');
    }else if(this.type === 'ward' && this.role === 'WA'){
      let user: any = localStorage.getItem('loggedInUser');
      if(user){
        user = JSON.parse(user);
        this.wardId = user.wards[0].ward_id;
        this.getKPIWardData('threeMonth');
      }
    }
  }

  getLast6Month(){
    this.selectedInterval = 'Last 6 months';
    if(this.type === 'ward' && this.role === 'SSA'){
      this.routeActivate.paramMap.subscribe(data => {
        this.wardId = data.get('wardId');
        this.getKPIWardData('sixMonth');
      });
    }else if(this.type === 'facility' && this.role === 'SSA'){
      this.routeActivate.paramMap.subscribe(data => {
        this.facilityId = data.get('facilityId');
        this.getKPIFacilityData('sixMonth');
      });
    }else if(this.type === 'customer' && this.role === 'SSA'){
      this.routeActivate.paramMap.subscribe(data => {
        this.customerId = data.get('customer_id');
        this.getKPICustomerData('sixMonth');
      });
    }else if(this.type === 'dashboard' && this.role === 'SSA'){
      this.getKPIDashboardData('sixMonth');
    }else if(this.type === 'ward' && this.role === 'CA'){
      this.routeActivate.paramMap.subscribe(data => {
        this.wardId = data.get('wardId');
        this.getKPIWardData('sixMonth');
      });
    }else if(this.type === 'facility' && this.role === 'CA'){
      this.routeActivate.paramMap.subscribe(data => {
        this.facilityId = data.get('facilityId');
        this.getKPIFacilityData('sixMonth');
      });
    }else if(this.type === 'customer' && this.role === 'CA'){
      const user = JSON.parse(localStorage.getItem('loggedInUser'));
      this.customerId = user.customers.customer_id;
      this.getKPICustomerData('sixMonth');
    }else if(this.type === 'ward' && this.role === 'FA'){
      this.routeActivate.paramMap.subscribe(data => {
        this.wardId = data.get('wardId');
        this.getKPIWardData('sixMonth');
      });
    }else if(this.type === 'facility' && this.role === 'FA'){
        const user = JSON.parse(localStorage.getItem('loggedInUser'));
        this.facilityId = user.facilities.facility_id;
        this.getKPIFacilityData('sixMonth');
    }else if(this.type === 'ward' && this.role === 'WA'){
      let user: any = localStorage.getItem('loggedInUser');
      if(user){
        user = JSON.parse(user);
        this.wardId = user.wards[0].ward_id;
        this.getKPIWardData('sixMonth');
      }
    }
  }
	
	getKPIDashboardData(interval: string){
    this.isLoading = true;
    this.getHeaders();
    if(interval === 'week'){
      this.http.get(`${environment.apiUrlNew}/kpi/getSevenDaysSummary/`,{headers:this.header}).subscribe((data: any) => {
        if(data.itemCount > 0){
          let KPIData = data.body
                .sort((a,b) => {
                return new Date(a.details.Rdate).getTime() > new Date(b.details.Rdate).getTime() ? 1 : -1;
                });
          const intermediate = [];
          
          KPIData.forEach(value => {
            const exists = intermediate.find(val => val.details.Rdate === value.details.Rdate);
            if(!exists){
              value.Graph.ResidentProfilesViewed = parseFloat(value.Graph.ResidentProfilesViewed);
              value.Graph.UniqueProfilesViewed = parseFloat(value.Graph.UniqueProfilesViewed)
              intermediate.push(value);
            }
          })
          KPIData = intermediate;
          let categories = KPIData.map((value: any) => {
            return value.details.Rdate;
          })
          let max = 0;
          KPIData.forEach(val => {
            if(parseInt(val.Graph.ResidentProfilesViewed) > max){
              max = parseInt(val.Graph.ResidentProfilesViewed);
            }
            if(parseInt(val.Graph.UniqueProfilesViewed) > max){
              max = parseInt(val.Graph.UniqueProfilesViewed)
            }
          })
          let resident = KPIData.map((value: any, i: number )=> {
            return (value.Graph.ResidentProfilesViewed)
          })
          let unique = KPIData.map((value: any, i: number ) => {
            return (value.Graph.UniqueProfilesViewed);
          })
          this.customProgressDates = {
            startDate: categories[categories.length - 1],
            endDate: categories[0]
          }
          this.chartOptions.series[0].data = resident;
          this.chartOptions.series[1].data = unique;
          this.chartOptions.xaxis.categories = categories;
          this.chartOptions.yaxis.max = this.rounded(max);
          if(unique.length > 0 || resident.length > 0){
            this.isDataAvailable = true;
          }
        }
        this.isLoading = false;
      })
    }
    else if(interval === 'month'){
        this.http.get(`${environment.apiUrlNew}/kpi/getOneMonthSummary/`,{headers:this.header}).subscribe((data: any) => {
          if(data.itemCount > 0){
            let KPIData = data.body
                  .sort((a,b) => {
                  return new Date(a.details.Rdate).getTime() > new Date(b.details.Rdate).getTime() ? 1 : -1;
                  });
            const intermediate = [];
            
            KPIData.forEach(value => {
              const exists = intermediate.find(val => val.details.Rdate === value.details.Rdate);
              if(!exists){
                value.Graph.ResidentProfilesViewed = parseFloat(value.Graph.ResidentProfilesViewed);
                value.Graph.UniqueProfilesViewed = parseFloat(value.Graph.UniqueProfilesViewed)
                intermediate.push(value);
              }else{
                exists.Graph.ResidentProfilesViewed = exists.Graph.ResidentProfilesViewed + parseFloat(value.Graph.ResidentProfilesViewed);
                exists.Graph.UniqueProfilesViewed = exists.Graph.UniqueProfilesViewed + parseFloat(value.Graph.UniqueProfilesViewed)
              }
            })
            KPIData = intermediate;
            const categories = KPIData.map((value: any) => {
              return value.details.Rdate;
            })
            let max = 0;
            KPIData.forEach(val => {
              if(parseInt(val.Graph.ResidentProfilesViewed) > max){
                max = parseInt(val.Graph.ResidentProfilesViewed);
              }
              if(parseInt(val.Graph.UniqueProfilesViewed) > max){
                max = parseInt(val.Graph.UniqueProfilesViewed)
              }
            })
            const resident = KPIData.map((value: any, i: number )=> {
              return (value.Graph.ResidentProfilesViewed)
            })
            const unique = KPIData.map((value: any, i: number ) => {
              return (value.Graph.UniqueProfilesViewed);
            })
            this.customProgressDates = {
              startDate: categories[categories.length - 1],
              endDate: categories[0]
            }
            this.chartOptions.series[0].data = resident;
            this.chartOptions.series[1].data = unique;
            this.chartOptions.xaxis.categories = categories;
            this.chartOptions.yaxis.max = this.rounded(max);
            if(unique.length > 0 || resident.length > 0){
              this.isDataAvailable = true;
            }
          }
          this.isLoading = false;
        })
    }
    else if(interval === 'threeMonth'){
        this.http.get(`${environment.apiUrlNew}/kpi/getThreeMonthsSummary/`,{headers:this.header}).subscribe((data: any) => {
          if(data.itemCount > 0){
            let KPIData = data.body
                  .sort((a,b) => {
                  return new Date(a.details.Rdate).getTime() > new Date(b.details.Rdate).getTime() ? 1 : -1;
                  });
            const intermediate = [];
            
            KPIData.forEach(value => {
              const exists = intermediate.find(val => val.details.Rdate === value.details.Rdate);
              if(!exists){
                value.Graph.ResidentProfilesViewed = parseFloat(value.Graph.ResidentProfilesViewed);
                value.Graph.UniqueProfilesViewed = parseFloat(value.Graph.UniqueProfilesViewed)
                intermediate.push(value);
              }
            })
            KPIData = intermediate;
            let categories = KPIData.map((value: any) => {
              return value.details.Rdate;
            })
            let max = 0;
            KPIData.forEach(val => {
              if(parseInt(val.Graph.ResidentProfilesViewed) > max){
                max = parseInt(val.Graph.ResidentProfilesViewed);
              }
              if(parseInt(val.Graph.UniqueProfilesViewed) > max){
                max = parseInt(val.Graph.UniqueProfilesViewed)
              }
            })
            let resident = KPIData.map((value: any, i: number )=> {
              return (value.Graph.ResidentProfilesViewed)
            })
            let unique = KPIData.map((value: any, i: number ) => {
              return (value.Graph.UniqueProfilesViewed);
            })
            // unique = unique.filter((val: any, i: number) => ((i - 1)%3 === 0 && i > 1) || i === 0 || i === KPIData.length - 1);
            // resident = resident.filter((val: any, i: number) => ((i - 1)%3 === 0 && i > 1) || i === 0 || i === KPIData.length - 1);
            // categories = categories.filter((val: any, i: number) => ((i - 1)%3 === 0 && i > 1) || i === 0 || i === KPIData.length - 1)
            this.customProgressDates = {
              startDate: categories[categories.length - 1],
              endDate: categories[0]
            }
            this.chartOptions.series[0].data = resident;
            this.chartOptions.series[1].data = unique;
            this.chartOptions.xaxis.categories = categories;
            this.chartOptions.yaxis.max = this.rounded(max);
            if(unique.length > 0 || resident.length > 0){
              this.isDataAvailable = true;
            }
          }
          this.isLoading = false;
        })
    }
    else if(interval === 'sixMonth'){
        this.http.get(`${environment.apiUrlNew}/kpi/getSixMonthsSummary/`,{headers:this.header}).subscribe((data: any) => {
          if(data.itemCount > 0){
            let KPIData = data.body
                  .sort((a,b) => {
                  return new Date(a.details.Rdate).getTime() > new Date(b.details.Rdate).getTime() ? 1 : -1;
                  });
            const intermediate = [];
            
            KPIData.forEach(value => {
              const exists = intermediate.find(val => val.details.Rdate === value.details.Rdate);
              if(!exists){
                value.Graph.ResidentProfilesViewed = parseFloat(value.Graph.ResidentProfilesViewed);
                value.Graph.UniqueProfilesViewed = parseFloat(value.Graph.UniqueProfilesViewed)
                intermediate.push(value);
              }
            })
            KPIData = intermediate;
            let categories = KPIData.map((value: any) => {
              return value.details.Rdate;
            })
            let max = 0;
            KPIData.forEach(val => {
              if(parseInt(val.Graph.ResidentProfilesViewed) > max){
                max = parseInt(val.Graph.ResidentProfilesViewed);
              }
              if(parseInt(val.Graph.UniqueProfilesViewed) > max){
                max = parseInt(val.Graph.UniqueProfilesViewed)
              }
            })
            let resident = KPIData.map((value: any, i: number )=> {
              return (value.Graph.ResidentProfilesViewed)
            })
            let unique = KPIData.map((value: any, i: number ) => {
              return (value.Graph.UniqueProfilesViewed);
            })
            // unique = unique.filter((val: any, i: number) => ((i - 1)%6 === 0 && i > 1) || i === 0 || i === KPIData.length - 1);
            // resident = resident.filter((val: any, i: number) => ((i - 1)%6 === 0 && i > 1) || i === 0 || i === KPIData.length - 1);
            // categories = categories.filter((val: any, i: number) => ((i - 1)%6 === 0 && i > 1) || i === 0 || i === KPIData.length - 1)
            this.customProgressDates = {
              startDate: categories[categories.length - 1],
              endDate: categories[0]
            }
            this.chartOptions.series[0].data = resident;
            this.chartOptions.series[1].data = unique;
            this.chartOptions.xaxis.categories = categories;
            this.chartOptions.yaxis.max = this.rounded(max);
            if(unique.length > 0 || resident.length > 0){
              this.isDataAvailable = true;
            }
          }
          this.isLoading = false;
        })
    }
	}

}
