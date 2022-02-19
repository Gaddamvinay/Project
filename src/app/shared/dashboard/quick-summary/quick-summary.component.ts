import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexFill, ApexLegend, ApexPlotOptions, ApexTitleSubtitle, ApexTooltip, ApexXAxis, ApexYAxis } from 'ng-apexcharts';
import * as _LODASH from "lodash";
import { environment } from '../../../../environments/environment';
import { number } from 'ngx-custom-validators/src/app/number/validator';
import { TokenStorageServiceService } from '../../../auth/login/token-storage-service.service';

declare global {
  interface Window {
    Apex: any;
  }
}
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
  selector: 'app-quick-summary',
  templateUrl: './quick-summary.component.html',
  styleUrls: ['./quick-summary.component.scss']
})
export class QuickSummaryComponent implements OnInit {

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
  wardId = '';
  role = '';
  header:any;
  constructor(private tokenStorage: TokenStorageServiceService,private http: HttpClient,private routeActivate: ActivatedRoute) { 
    let user: any = localStorage.getItem('loggedInUser');
		if(user){
      user = JSON.parse(user);
      this.role = user.user_type;
    }
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
  }

  facilityId ='';
  customerId = '';
  ngOnInit(): void {
    this.get7Days()
  }
  getHeaders(){
		this.header = new HttpHeaders().set(
		  "Authorization",
		  this.tokenStorage.getToken()
		);
	  }
  get1Month(){
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
      this.getKPIDashBoardData('month');
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
  get3Month(){
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
      this.getKPIDashBoardData('threeMonth');
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
  get6Month(){
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
      this.getKPIDashBoardData('sixMonth');
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
  get7Days(){
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
      this.getKPIDashBoardData('week');
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
  @Input() type: string;
  @Input() forType: string = "";
  titleShow = false;
  changeTitleShow(value: boolean){
    this.titleShow = value;
  }
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
          if(KPIData.length > 0){
            this.isDataAvailable = true;
            const screenTimeUsage = KPIData.map(value => {
              return parseFloat(value.KPI.ScreenTimeUsage)
            })
            const fallActivity = KPIData.map(value => {
              return parseFloat(value.KPI.FallActivity)
            })
            const nightWalkQuick = KPIData.map(value => {
              return parseFloat(value.KPI.NightWalkActivity)
            })
            const lowBatteryQuick = KPIData.map(value => {
              return parseFloat(value.KPI.CriticallyLowBattery)
            })
            const responseQuick = KPIData.map(value => {
              return parseFloat(value.KPI.NotificationResponseTime)
            })
            const residentQuick = KPIData.map(value => {
              return parseFloat(value.KPI.ResidentProfilesViewed)
            })
            this.quickBoxValues.screenTime.present[interval] = screenTimeUsage[screenTimeUsage.length - 1];
            this.quickBoxValues.nightWalk.present[interval] = nightWalkQuick[nightWalkQuick.length - 1];
            this.quickBoxValues.fall.present[interval] = fallActivity[fallActivity.length - 1];
            this.quickBoxValues.resident.present[interval] = residentQuick[residentQuick.length - 1];
            this.quickBoxValues.response.present[interval] = responseQuick[responseQuick.length - 1];
            this.quickBoxValues.lowBattery.present[interval] = lowBatteryQuick[lowBatteryQuick.length -1];
            this.quickBoxValues.screenTime.previous[interval] = screenTimeUsage[0];
            this.quickBoxValues.nightWalk.previous[interval] = nightWalkQuick[0];
            this.quickBoxValues.fall.previous[interval] = fallActivity[0];
            this.quickBoxValues.resident.previous[interval] = residentQuick[0];
            this.quickBoxValues.response.previous[interval] = responseQuick[0];
            this.quickBoxValues.lowBattery.previous[interval] = lowBatteryQuick[0];
            this.quickBoxValues.screenTime.series = [{ data: screenTimeUsage}];
            this.quickBoxValues.nightWalk.series = [{data: nightWalkQuick}];
            this.quickBoxValues.fall.series = [{data: fallActivity}];
            this.quickBoxValues.resident.series = [{data: residentQuick}];
            this.quickBoxValues.response.series = [{data :responseQuick}];
            this.quickBoxValues.lowBattery.series = [{data :lowBatteryQuick}];
            
            this.quickBoxSeries.screenTime = screenTimeUsage;
            this.quickBoxSeries.nightWalk = nightWalkQuick;
            this.quickBoxSeries.fall = fallActivity;
            this.quickBoxSeries.resident = residentQuick;
            this.quickBoxSeries.response = responseQuick;
            this.quickBoxSeries.lowBattery = lowBatteryQuick;
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
          if(KPIData.length > 0){
            this.isDataAvailable = true;
            const screenTimeUsage = KPIData.map(value => {
              return parseFloat(value.KPI.ScreenTimeUsage)
            })
            const fallActivity = KPIData.map(value => {
              return parseFloat(value.KPI.FallActivity)
            })
            const nightWalkQuick = KPIData.map(value => {
              return parseFloat(value.KPI.NightWalkActivity)
            })
            const lowBatteryQuick = KPIData.map(value => {
              return parseFloat(value.KPI.CriticallyLowBattery)
            })
            const responseQuick = KPIData.map(value => {
              return parseFloat(value.KPI.NotificationResponseTime)
            })
            const residentQuick = KPIData.map(value => {
              return parseFloat(value.KPI.ResidentProfilesViewed)
            })
            this.quickBoxValues.screenTime.present[interval] = screenTimeUsage[screenTimeUsage.length - 1];
            this.quickBoxValues.nightWalk.present[interval] = nightWalkQuick[nightWalkQuick.length - 1];
            this.quickBoxValues.fall.present[interval] = fallActivity[fallActivity.length - 1];
            this.quickBoxValues.resident.present[interval] = residentQuick[residentQuick.length - 1];
            this.quickBoxValues.response.present[interval] = responseQuick[responseQuick.length - 1];
            this.quickBoxValues.lowBattery.present[interval] = lowBatteryQuick[lowBatteryQuick.length -1];
           
            
            this.quickBoxSeries.screenTime = screenTimeUsage;
            this.quickBoxSeries.nightWalk = nightWalkQuick;
            this.quickBoxSeries.fall = fallActivity;
            this.quickBoxSeries.resident = residentQuick;
            this.quickBoxSeries.response = responseQuick;
            this.quickBoxSeries.lowBattery = lowBatteryQuick;
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
          if(KPIData.length > 0){
            this.isDataAvailable = true;
            const screenTimeUsage = KPIData.map(value => {
              return parseFloat(value.KPI.ScreenTimeUsage)
            })
            const fallActivity = KPIData.map(value => {
              return parseFloat(value.KPI.FallActivity)
            })
            const nightWalkQuick = KPIData.map(value => {
              return parseFloat(value.KPI.NightWalkActivity)
            })
            const lowBatteryQuick = KPIData.map(value => {
              return parseFloat(value.KPI.CriticallyLowBattery)
            })
            const responseQuick = KPIData.map(value => {
              return parseFloat(value.KPI.NotificationResponseTime)
            })
            const residentQuick = KPIData.map(value => {
              return parseFloat(value.KPI.ResidentProfilesViewed)
            })
            this.quickBoxValues.screenTime.present[interval] = screenTimeUsage[screenTimeUsage.length - 1];
            this.quickBoxValues.nightWalk.present[interval] = nightWalkQuick[nightWalkQuick.length - 1];
            this.quickBoxValues.fall.present[interval] = fallActivity[fallActivity.length - 1];
            this.quickBoxValues.resident.present[interval] = residentQuick[residentQuick.length - 1];
            this.quickBoxValues.response.present[interval] = responseQuick[responseQuick.length - 1];
            this.quickBoxValues.lowBattery.present[interval] = lowBatteryQuick[lowBatteryQuick.length -1];
            this.quickBoxSeries.screenTime = screenTimeUsage;
            this.quickBoxSeries.nightWalk = nightWalkQuick;
            this.quickBoxSeries.fall = fallActivity;
            this.quickBoxSeries.resident = residentQuick;
            this.quickBoxSeries.response = responseQuick;
            this.quickBoxSeries.lowBattery = lowBatteryQuick;
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
          if(KPIData.length > 0){
            this.isDataAvailable = true;
            const screenTimeUsage = KPIData.map(value => {
              return parseFloat(value.KPI.ScreenTimeUsage)
            })
            const fallActivity = KPIData.map(value => {
              return parseFloat(value.KPI.FallActivity)
            })
            const nightWalkQuick = KPIData.map(value => {
              return parseFloat(value.KPI.NightWalkActivity)
            })
            const lowBatteryQuick = KPIData.map(value => {
              return parseFloat(value.KPI.CriticallyLowBattery)
            })
            const responseQuick = KPIData.map(value => {
              return parseFloat(value.KPI.NotificationResponseTime)
            })
            const residentQuick = KPIData.map(value => {
              return parseFloat(value.KPI.ResidentProfilesViewed)
            })
            this.quickBoxValues.screenTime.present[interval] = screenTimeUsage[screenTimeUsage.length - 1];
            this.quickBoxValues.nightWalk.present[interval] = nightWalkQuick[nightWalkQuick.length - 1];
            this.quickBoxValues.fall.present[interval] = fallActivity[fallActivity.length - 1];
            this.quickBoxValues.resident.present[interval] = residentQuick[residentQuick.length - 1];
            this.quickBoxValues.response.present[interval] = responseQuick[responseQuick.length - 1];
            this.quickBoxValues.lowBattery.present[interval] = lowBatteryQuick[lowBatteryQuick.length -1];
            
            this.quickBoxSeries.screenTime = screenTimeUsage;
            this.quickBoxSeries.nightWalk = nightWalkQuick;
            this.quickBoxSeries.fall = fallActivity;
            this.quickBoxSeries.resident = residentQuick;
            this.quickBoxSeries.response = responseQuick;
            this.quickBoxSeries.lowBattery = lowBatteryQuick;
          }
        }
        this.isLoading = false;
      })
    }
	}
  isLoading = false
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
          if(KPIData.length > 0){
            this.isDataAvailable = true;
            const screenTimeUsage = KPIData.map(value => {
              return parseFloat(value.KPI.ScreenTimeUsage)
            })
            const fallActivity = KPIData.map(value => {
              return parseFloat(value.KPI.FallActivity)
            })
            const nightWalkQuick = KPIData.map(value => {
              return parseFloat(value.KPI.NightWalkActivity)
            })
            const lowBatteryQuick = KPIData.map(value => {
              return parseFloat(value.KPI.CriticallyLowBattery)
            })
            const responseQuick = KPIData.map(value => {
              return parseFloat(value.KPI.NotificationResponseTime)
            })
            const residentQuick = KPIData.map(value => {
              return parseFloat(value.KPI.ResidentProfilesViewed)
            })
            this.quickBoxValues.screenTime.present[interval] = screenTimeUsage[screenTimeUsage.length - 1];
            this.quickBoxValues.nightWalk.present[interval] = nightWalkQuick[nightWalkQuick.length - 1];
            this.quickBoxValues.fall.present[interval] = fallActivity[fallActivity.length - 1];
            this.quickBoxValues.resident.present[interval] = residentQuick[residentQuick.length - 1];
            this.quickBoxValues.response.present[interval] = responseQuick[responseQuick.length - 1];
            this.quickBoxValues.lowBattery.present[interval] = lowBatteryQuick[lowBatteryQuick.length -1];
            this.quickBoxValues.screenTime.previous[interval] = screenTimeUsage[0];
            this.quickBoxValues.nightWalk.previous[interval] = nightWalkQuick[0];
            this.quickBoxValues.fall.previous[interval] = fallActivity[0];
            this.quickBoxValues.resident.previous[interval] = residentQuick[0];
            this.quickBoxValues.response.previous[interval] = responseQuick[0];
            this.quickBoxValues.lowBattery.previous[interval] = lowBatteryQuick[0];
            this.quickBoxValues.screenTime.series = [{ data: screenTimeUsage}];
            this.quickBoxValues.nightWalk.series = [{data: nightWalkQuick}];
            this.quickBoxValues.fall.series = [{data: fallActivity}];
            this.quickBoxValues.resident.series = [{data: residentQuick}];
            this.quickBoxValues.response.series = [{data :responseQuick}];
            this.quickBoxValues.lowBattery.series = [{data :lowBatteryQuick}];
            
            this.quickBoxSeries.screenTime = screenTimeUsage;
            this.quickBoxSeries.nightWalk = nightWalkQuick;
            this.quickBoxSeries.fall = fallActivity;
            this.quickBoxSeries.resident = residentQuick;
            this.quickBoxSeries.response = responseQuick;
            this.quickBoxSeries.lowBattery = lowBatteryQuick;
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
          if(KPIData.length > 0){
            this.isDataAvailable = true;
            const screenTimeUsage = KPIData.map(value => {
              return parseFloat(value.KPI.ScreenTimeUsage)
            })
            const fallActivity = KPIData.map(value => {
              return parseFloat(value.KPI.FallActivity)
            })
            const nightWalkQuick = KPIData.map(value => {
              return parseFloat(value.KPI.NightWalkActivity)
            })
            const lowBatteryQuick = KPIData.map(value => {
              return parseFloat(value.KPI.CriticallyLowBattery)
            })
            const responseQuick = KPIData.map(value => {
              return parseFloat(value.KPI.NotificationResponseTime)
            })
            const residentQuick = KPIData.map(value => {
              return parseFloat(value.KPI.ResidentProfilesViewed)
            })
            this.quickBoxValues.screenTime.present[interval] = screenTimeUsage[screenTimeUsage.length - 1];
            this.quickBoxValues.nightWalk.present[interval] = nightWalkQuick[nightWalkQuick.length - 1];
            this.quickBoxValues.fall.present[interval] = fallActivity[fallActivity.length - 1];
            this.quickBoxValues.resident.present[interval] = residentQuick[residentQuick.length - 1];
            this.quickBoxValues.response.present[interval] = responseQuick[responseQuick.length - 1];
            this.quickBoxValues.lowBattery.present[interval] = lowBatteryQuick[lowBatteryQuick.length -1];
            this.quickBoxValues.screenTime.previous[interval] = screenTimeUsage[0];
            this.quickBoxValues.nightWalk.previous[interval] = nightWalkQuick[0];
            this.quickBoxValues.fall.previous[interval] = fallActivity[0];
            this.quickBoxValues.resident.previous[interval] = residentQuick[0];
            this.quickBoxValues.response.previous[interval] = responseQuick[0];
            this.quickBoxValues.lowBattery.previous[interval] = lowBatteryQuick[0];
            
            this.quickBoxSeries.screenTime = screenTimeUsage;
            this.quickBoxSeries.nightWalk = nightWalkQuick;
            this.quickBoxSeries.fall = fallActivity;
            this.quickBoxSeries.resident = residentQuick;
            this.quickBoxSeries.response = responseQuick;
            this.quickBoxSeries.lowBattery = lowBatteryQuick;
            this.quickBoxValues.screenTime.series = this.getGraph('screenTime');
            this.quickBoxValues.resident.series = this.getGraph('resident');
            this.quickBoxValues.lowBattery.series = this.getGraph('lowBattery');
            this.quickBoxValues.response.series = this.getGraph('response');
            this.quickBoxValues.fall.series = this.getGraph('fall');
            this.quickBoxValues.nightWalk.series = this.getGraph('nightWalk');
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
          if(KPIData.length > 0){
            this.isDataAvailable = true;
            const screenTimeUsage = KPIData.map(value => {
              return parseFloat(value.KPI.ScreenTimeUsage)
            })
            const fallActivity = KPIData.map(value => {
              return parseFloat(value.KPI.FallActivity)
            })
            const nightWalkQuick = KPIData.map(value => {
              return parseFloat(value.KPI.NightWalkActivity)
            })
            const lowBatteryQuick = KPIData.map(value => {
              return parseFloat(value.KPI.CriticallyLowBattery)
            })
            const responseQuick = KPIData.map(value => {
              return parseFloat(value.KPI.NotificationResponseTime)
            })
            const residentQuick = KPIData.map(value => {
              return parseFloat(value.KPI.ResidentProfilesViewed)
            })
            this.quickBoxValues.screenTime.present[interval] = screenTimeUsage[screenTimeUsage.length - 1];
            this.quickBoxValues.nightWalk.present[interval] = nightWalkQuick[nightWalkQuick.length - 1];
            this.quickBoxValues.fall.present[interval] = fallActivity[fallActivity.length - 1];
            this.quickBoxValues.resident.present[interval] = residentQuick[residentQuick.length - 1];
            this.quickBoxValues.response.present[interval] = responseQuick[responseQuick.length - 1];
            this.quickBoxValues.lowBattery.present[interval] = lowBatteryQuick[lowBatteryQuick.length -1];
            this.quickBoxValues.screenTime.previous[interval] = screenTimeUsage[0];
            this.quickBoxValues.nightWalk.previous[interval] = nightWalkQuick[0];
            this.quickBoxValues.fall.previous[interval] = fallActivity[0];
            this.quickBoxValues.resident.previous[interval] = residentQuick[0];
            this.quickBoxValues.response.previous[interval] = responseQuick[0];
            this.quickBoxValues.lowBattery.previous[interval] = lowBatteryQuick[0];
            
            this.quickBoxSeries.screenTime = screenTimeUsage;
            this.quickBoxSeries.nightWalk = nightWalkQuick;
            this.quickBoxSeries.fall = fallActivity;
            this.quickBoxSeries.resident = residentQuick;
            this.quickBoxSeries.response = responseQuick;
            this.quickBoxSeries.lowBattery = lowBatteryQuick;
            this.quickBoxValues.screenTime.series = this.getGraph('screenTime');
            this.quickBoxValues.resident.series = this.getGraph('resident');
            this.quickBoxValues.lowBattery.series = this.getGraph('lowBattery');
            this.quickBoxValues.response.series = this.getGraph('response');
            this.quickBoxValues.fall.series = this.getGraph('fall');
            this.quickBoxValues.nightWalk.series = this.getGraph('nightWalk');
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
          if(KPIData.length > 0){
            this.isDataAvailable = true;
            const screenTimeUsage = KPIData.map(value => {
              return parseFloat(value.KPI.ScreenTimeUsage)
            })
            const fallActivity = KPIData.map(value => {
              return parseFloat(value.KPI.FallActivity)
            })
            const nightWalkQuick = KPIData.map(value => {
              return parseFloat(value.KPI.NightWalkActivity)
            })
            const lowBatteryQuick = KPIData.map(value => {
              return parseFloat(value.KPI.CriticallyLowBattery)
            })
            const responseQuick = KPIData.map(value => {
              return parseFloat(value.KPI.NotificationResponseTime)
            })
            const residentQuick = KPIData.map(value => {
              return parseFloat(value.KPI.ResidentProfilesViewed)
            })
            this.quickBoxValues.screenTime.present[interval] = screenTimeUsage[screenTimeUsage.length - 1];
            this.quickBoxValues.nightWalk.present[interval] = nightWalkQuick[nightWalkQuick.length - 1];
            this.quickBoxValues.fall.present[interval] = fallActivity[fallActivity.length - 1];
            this.quickBoxValues.resident.present[interval] = residentQuick[residentQuick.length - 1];
            this.quickBoxValues.response.present[interval] = responseQuick[responseQuick.length - 1];
            this.quickBoxValues.lowBattery.present[interval] = lowBatteryQuick[lowBatteryQuick.length -1];
            this.quickBoxValues.screenTime.previous[interval] = screenTimeUsage[0];
            this.quickBoxValues.nightWalk.previous[interval] = nightWalkQuick[0];
            this.quickBoxValues.fall.previous[interval] = fallActivity[0];
            this.quickBoxValues.resident.previous[interval] = residentQuick[0];
            this.quickBoxValues.response.previous[interval] = responseQuick[0];
            this.quickBoxValues.lowBattery.previous[interval] = lowBatteryQuick[0];
            
            this.quickBoxSeries.screenTime = screenTimeUsage;
            this.quickBoxSeries.nightWalk = nightWalkQuick;
            this.quickBoxSeries.fall = fallActivity;
            this.quickBoxSeries.resident = residentQuick;
            this.quickBoxSeries.response = responseQuick;
            this.quickBoxSeries.lowBattery = lowBatteryQuick;
            this.quickBoxValues.screenTime.series = this.getGraph('screenTime');
            this.quickBoxValues.resident.series = this.getGraph('resident');
            this.quickBoxValues.lowBattery.series = this.getGraph('lowBattery');
            this.quickBoxValues.response.series = this.getGraph('response');
            this.quickBoxValues.fall.series = this.getGraph('fall');
            this.quickBoxValues.nightWalk.series = this.getGraph('nightWalk');
          }
        }
        this.isLoading = false;
      })
    }
  }
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
          if(KPIData.length > 0){
            this.isDataAvailable = true;
            const screenTimeUsage = KPIData.map(value => {
              return parseFloat(value.KPI.ScreenTimeUsage)
            })
            const fallActivity = KPIData.map(value => {
              return parseFloat(value.KPI.FallActivity)
            })
            const nightWalkQuick = KPIData.map(value => {
              return parseFloat(value.KPI.NightWalkActivity)
            })
            const lowBatteryQuick = KPIData.map(value => {
              return parseFloat(value.KPI.CriticallyLowBattery)
            })
            const responseQuick = KPIData.map(value => {
             return parseFloat(value.KPI.NotificationResponseTime)
            })
            const residentQuick = KPIData.map(value => {
              return parseFloat(value.KPI.ResidentProfilesViewed)
            })
            this.quickBoxValues.screenTime.present[interval] = screenTimeUsage[screenTimeUsage.length - 1];
            this.quickBoxValues.nightWalk.present[interval] = nightWalkQuick[nightWalkQuick.length - 1];
            this.quickBoxValues.fall.present[interval] = fallActivity[fallActivity.length - 1];
            this.quickBoxValues.resident.present[interval] = residentQuick[residentQuick.length - 1];
            this.quickBoxValues.response.present[interval] = responseQuick[responseQuick.length - 1];
            this.quickBoxValues.lowBattery.present[interval] = lowBatteryQuick[lowBatteryQuick.length -1];
            this.quickBoxValues.screenTime.previous[interval] = screenTimeUsage[0];
            this.quickBoxValues.nightWalk.previous[interval] = nightWalkQuick[0];
            this.quickBoxValues.fall.previous[interval] = fallActivity[0];
            this.quickBoxValues.resident.previous[interval] = residentQuick[0];
            this.quickBoxValues.response.previous[interval] = responseQuick[0];
            this.quickBoxValues.lowBattery.previous[interval] = lowBatteryQuick[0];
            this.quickBoxValues.screenTime.series = [{ data: screenTimeUsage}];
            this.quickBoxValues.nightWalk.series = [{data: nightWalkQuick}];
            this.quickBoxValues.fall.series = [{data: fallActivity}];
            this.quickBoxValues.resident.series = [{data: residentQuick}];
            this.quickBoxValues.response.series = [{data :responseQuick}];
            this.quickBoxValues.lowBattery.series = [{data :lowBatteryQuick}];
             this.quickBoxSeries.screenTime = screenTimeUsage;
            this.quickBoxSeries.nightWalk = nightWalkQuick;
            this.quickBoxSeries.fall = fallActivity;
            this.quickBoxSeries.resident = residentQuick;
            this.quickBoxSeries.response = responseQuick;
            this.quickBoxSeries.lowBattery = lowBatteryQuick;
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
          if(KPIData.length > 0){
            this.isDataAvailable = true;
            const screenTimeUsage = KPIData.map(value => {
              return parseFloat(value.KPI.ScreenTimeUsage)
            })
            const fallActivity = KPIData.map(value => {
              return parseFloat(value.KPI.FallActivity)
            })
            const nightWalkQuick = KPIData.map(value => {
              return parseFloat(value.KPI.NightWalkActivity)
            })
            const lowBatteryQuick = KPIData.map(value => {
              return parseFloat(value.KPI.CriticallyLowBattery)
            })
            const responseQuick = KPIData.map(value => {
              return parseFloat(value.KPI.NotificationResponseTime)
            })
            const residentQuick = KPIData.map(value => {
              return parseFloat(value.KPI.ResidentProfilesViewed)
            })
            this.quickBoxValues.screenTime.present[interval] = screenTimeUsage[screenTimeUsage.length - 1];
            this.quickBoxValues.nightWalk.present[interval] = nightWalkQuick[nightWalkQuick.length - 1];
            this.quickBoxValues.fall.present[interval] = fallActivity[fallActivity.length - 1];
            this.quickBoxValues.resident.present[interval] = residentQuick[residentQuick.length - 1];
            this.quickBoxValues.response.present[interval] = responseQuick[responseQuick.length - 1];
            this.quickBoxValues.lowBattery.present[interval] = lowBatteryQuick[lowBatteryQuick.length -1];
            this.quickBoxValues.screenTime.previous[interval] = screenTimeUsage[0];
            this.quickBoxValues.nightWalk.previous[interval] = nightWalkQuick[0];
            this.quickBoxValues.fall.previous[interval] = fallActivity[0];
            this.quickBoxValues.resident.previous[interval] = residentQuick[0];
            this.quickBoxValues.response.previous[interval] = responseQuick[0];
            this.quickBoxValues.lowBattery.previous[interval] = lowBatteryQuick[0];
            
            this.quickBoxSeries.screenTime = screenTimeUsage;
            this.quickBoxSeries.nightWalk = nightWalkQuick;
            this.quickBoxSeries.fall = fallActivity;
            this.quickBoxSeries.resident = residentQuick;
            this.quickBoxSeries.response = responseQuick;
            this.quickBoxSeries.lowBattery = lowBatteryQuick;
            this.quickBoxValues.screenTime.series = this.getGraph('screenTime');
            this.quickBoxValues.resident.series = this.getGraph('resident');
            this.quickBoxValues.lowBattery.series = this.getGraph('lowBattery');
            this.quickBoxValues.response.series = this.getGraph('response');
            this.quickBoxValues.fall.series = this.getGraph('fall');
            this.quickBoxValues.nightWalk.series = this.getGraph('nightWalk');
          }
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
          if(KPIData.length > 0){
            this.isDataAvailable = true;
            const screenTimeUsage = KPIData.map(value => {
              return parseFloat(value.KPI.ScreenTimeUsage)
            })
            const fallActivity = KPIData.map(value => {
              return parseFloat(value.KPI.FallActivity)
            })
            const nightWalkQuick = KPIData.map(value => {
              return parseFloat(value.KPI.NightWalkActivity)
            })
            const lowBatteryQuick = KPIData.map(value => {
              return parseFloat(value.KPI.CriticallyLowBattery)
            })
            const responseQuick = KPIData.map(value => {
              return parseFloat(value.KPI.NotificationResponseTime)
            })
            const residentQuick = KPIData.map(value => {
              return parseFloat(value.KPI.ResidentProfilesViewed)
            })
            this.quickBoxValues.screenTime.present[interval] = screenTimeUsage[screenTimeUsage.length - 1];
            this.quickBoxValues.nightWalk.present[interval] = nightWalkQuick[nightWalkQuick.length - 1];
            this.quickBoxValues.fall.present[interval] = fallActivity[fallActivity.length - 1];
            this.quickBoxValues.resident.present[interval] = residentQuick[residentQuick.length - 1];
            this.quickBoxValues.response.present[interval] = responseQuick[responseQuick.length - 1];
            this.quickBoxValues.lowBattery.present[interval] = lowBatteryQuick[lowBatteryQuick.length -1];
            this.quickBoxValues.screenTime.previous[interval] = screenTimeUsage[0];
            this.quickBoxValues.nightWalk.previous[interval] = nightWalkQuick[0];
            this.quickBoxValues.fall.previous[interval] = fallActivity[0];
            this.quickBoxValues.resident.previous[interval] = residentQuick[0];
            this.quickBoxValues.response.previous[interval] = responseQuick[0];
            this.quickBoxValues.lowBattery.previous[interval] = lowBatteryQuick[0];
            
            this.quickBoxSeries.screenTime = screenTimeUsage;
            this.quickBoxSeries.nightWalk = nightWalkQuick;
            this.quickBoxSeries.fall = fallActivity;
            this.quickBoxSeries.resident = residentQuick;
            this.quickBoxSeries.response = responseQuick;
            this.quickBoxSeries.lowBattery = lowBatteryQuick;
            this.quickBoxValues.screenTime.series = this.getGraph('screenTime');
            this.quickBoxValues.resident.series = this.getGraph('resident');
            this.quickBoxValues.lowBattery.series = this.getGraph('lowBattery');
            this.quickBoxValues.response.series = this.getGraph('response');
            this.quickBoxValues.fall.series = this.getGraph('fall');
            this.quickBoxValues.nightWalk.series = this.getGraph('nightWalk');
          }
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
          if(KPIData.length > 0){
            this.isDataAvailable = true;
            const screenTimeUsage = KPIData.map(value => {
              return parseFloat(value.KPI.ScreenTimeUsage)
            })
            const fallActivity = KPIData.map(value => {
              return parseFloat(value.KPI.FallActivity)
            })
            const nightWalkQuick = KPIData.map(value => {
              return parseFloat(value.KPI.NightWalkActivity)
            })
            const lowBatteryQuick = KPIData.map(value => {
              return parseFloat(value.KPI.CriticallyLowBattery)
            })
            const responseQuick = KPIData.map(value => {
              return parseFloat(value.KPI.NotificationResponseTime)
            })
            const residentQuick = KPIData.map(value => {
              return parseFloat(value.KPI.ResidentProfilesViewed)
            })
            this.quickBoxValues.screenTime.present[interval] = screenTimeUsage[screenTimeUsage.length - 1];
            this.quickBoxValues.nightWalk.present[interval] = nightWalkQuick[nightWalkQuick.length - 1];
            this.quickBoxValues.fall.present[interval] = fallActivity[fallActivity.length - 1];
            this.quickBoxValues.resident.present[interval] = residentQuick[residentQuick.length - 1];
            this.quickBoxValues.response.present[interval] = responseQuick[responseQuick.length - 1];
            this.quickBoxValues.lowBattery.present[interval] = lowBatteryQuick[lowBatteryQuick.length -1];
            this.quickBoxValues.screenTime.previous[interval] = screenTimeUsage[0];
            this.quickBoxValues.nightWalk.previous[interval] = nightWalkQuick[0];
            this.quickBoxValues.fall.previous[interval] = fallActivity[0];
            this.quickBoxValues.resident.previous[interval] = residentQuick[0];
            this.quickBoxValues.response.previous[interval] = responseQuick[0];
            this.quickBoxValues.lowBattery.previous[interval] = lowBatteryQuick[0];
            
            this.quickBoxSeries.screenTime = screenTimeUsage;
            this.quickBoxSeries.nightWalk = nightWalkQuick;
            this.quickBoxSeries.fall = fallActivity;
            this.quickBoxSeries.resident = residentQuick;
            this.quickBoxSeries.response = responseQuick;
            this.quickBoxSeries.lowBattery = lowBatteryQuick;
            this.quickBoxValues.screenTime.series = this.getGraph('screenTime');
            this.quickBoxValues.resident.series = this.getGraph('resident');
            this.quickBoxValues.lowBattery.series = this.getGraph('lowBattery');
            this.quickBoxValues.response.series = this.getGraph('response');
            this.quickBoxValues.fall.series = this.getGraph('fall');
            this.quickBoxValues.nightWalk.series = this.getGraph('nightWalk');
          }
        }
        this.isLoading = false;
      })
    }
  }
  isDataAvailable = false;
  getKPIDashBoardData(interval: string){
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
                value.KPI.CriticallyLowBattery = parseFloat(value.KPI.CriticallyLowBattery)
                value.KPI.FallActivity = parseFloat(value.KPI.FallActivity)
                value.KPI.NightWalkActivity = parseFloat(value.KPI.NightWalkActivity)
                value.KPI.NotificationResponseTime = parseFloat(value.KPI.NotificationResponseTime)
                value.KPI.ResidentProfilesViewed = parseFloat(value.KPI.ResidentProfilesViewed)
                value.KPI.ScreenTimeUsage = parseFloat(value.KPI.ScreenTimeUsage)
                intermediate.push(value);
              }
            })
            KPIData = intermediate;
            if(KPIData.length > 0){
              this.isDataAvailable = true;
              const screenTimeUsage = KPIData.map(value => {
                return (value.KPI.ScreenTimeUsage)
              })
              const fallActivity = KPIData.map(value => {
                return (value.KPI.FallActivity)
              })
              const nightWalkQuick = KPIData.map(value => {
                return (value.KPI.NightWalkActivity)
              })
              const lowBatteryQuick = KPIData.map(value => {
                return (value.KPI.CriticallyLowBattery)
              })
              const responseQuick = KPIData.map(value => {
                return (value.KPI.NotificationResponseTime)
              })
              const residentQuick = KPIData.map(value => {
                return (value.KPI.ResidentProfilesViewed)
              })
              this.quickBoxValues.screenTime.present[interval] = screenTimeUsage[screenTimeUsage.length - 1];
              this.quickBoxValues.nightWalk.present[interval] = nightWalkQuick[nightWalkQuick.length - 1];
              this.quickBoxValues.fall.present[interval] = fallActivity[fallActivity.length - 1];
              this.quickBoxValues.resident.present[interval] = residentQuick[residentQuick.length - 1];
              this.quickBoxValues.response.present[interval] = responseQuick[responseQuick.length - 1];
              this.quickBoxValues.lowBattery.present[interval] = lowBatteryQuick[lowBatteryQuick.length -1];
              this.quickBoxValues.screenTime.previous[interval] = screenTimeUsage[0];
              this.quickBoxValues.nightWalk.previous[interval] = nightWalkQuick[0];
              this.quickBoxValues.fall.previous[interval] = fallActivity[0];
              this.quickBoxValues.resident.previous[interval] = residentQuick[0];
              this.quickBoxValues.response.previous[interval] = responseQuick[0];
              this.quickBoxValues.lowBattery.previous[interval] = lowBatteryQuick[0];
              this.quickBoxValues.screenTime.series = [{ data: screenTimeUsage}];
              this.quickBoxValues.nightWalk.series = [{data: nightWalkQuick}];
              this.quickBoxValues.fall.series = [{data: fallActivity}];
              this.quickBoxValues.resident.series = [{data: residentQuick}];
              this.quickBoxValues.response.series = [{data :responseQuick}];
              this.quickBoxValues.lowBattery.series = [{data :lowBatteryQuick}];
            }
          }
          this.isLoading = false;
        })
      }else if(interval === 'month'){
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
                value.KPI.CriticallyLowBattery = parseFloat(value.KPI.CriticallyLowBattery)
                value.KPI.FallActivity = parseFloat(value.KPI.FallActivity)
                value.KPI.NightWalkActivity = parseFloat(value.KPI.NightWalkActivity)
                value.KPI.NotificationResponseTime = parseFloat(value.KPI.NotificationResponseTime)
                value.KPI.ResidentProfilesViewed = parseFloat(value.KPI.ResidentProfilesViewed)
                value.KPI.ScreenTimeUsage = parseFloat(value.KPI.ScreenTimeUsage)
                intermediate.push(value);
              }
            })
            KPIData = intermediate;
            
            if(KPIData.length > 0){
              this.isDataAvailable = true;
              const screenTimeUsage = KPIData.map(value => {
                return (value.KPI.ScreenTimeUsage)
              })
              const fallActivity = KPIData.map(value => {
                return (value.KPI.FallActivity)
              })
              const nightWalkQuick = KPIData.map(value => {
                return (value.KPI.NightWalkActivity)
              })
              const lowBatteryQuick = KPIData.map(value => {
                return (value.KPI.CriticallyLowBattery)
              })
              const responseQuick = KPIData.map(value => {
                return (value.KPI.NotificationResponseTime)
              })
              const residentQuick = KPIData.map(value => {
                return (value.KPI.ResidentProfilesViewed)
              })
              this.quickBoxValues.screenTime.present[interval] = screenTimeUsage[screenTimeUsage.length - 1];
              this.quickBoxValues.nightWalk.present[interval] = nightWalkQuick[nightWalkQuick.length - 1];
              this.quickBoxValues.fall.present[interval] = fallActivity[fallActivity.length - 1];
              this.quickBoxValues.resident.present[interval] = residentQuick[residentQuick.length - 1];
              this.quickBoxValues.response.present[interval] = responseQuick[responseQuick.length - 1];
              this.quickBoxValues.lowBattery.present[interval] = lowBatteryQuick[lowBatteryQuick.length -1];
              this.quickBoxValues.screenTime.previous[interval] = screenTimeUsage[0];
              this.quickBoxValues.nightWalk.previous[interval] = nightWalkQuick[0];
              this.quickBoxValues.fall.previous[interval] = fallActivity[0];
              this.quickBoxValues.resident.previous[interval] = residentQuick[0];
              this.quickBoxValues.response.previous[interval] = responseQuick[0];
              this.quickBoxValues.lowBattery.previous[interval] = lowBatteryQuick[0];
              
              this.quickBoxSeries.screenTime = screenTimeUsage;
              this.quickBoxSeries.nightWalk = nightWalkQuick;
              this.quickBoxSeries.fall = fallActivity;
              this.quickBoxSeries.resident = residentQuick;
              this.quickBoxSeries.response = responseQuick;
              this.quickBoxSeries.lowBattery = lowBatteryQuick;
              this.quickBoxValues.screenTime.series = this.getGraph('screenTime');
              this.quickBoxValues.resident.series = this.getGraph('resident');
              this.quickBoxValues.lowBattery.series = this.getGraph('lowBattery');
              this.quickBoxValues.response.series = this.getGraph('response');
              this.quickBoxValues.fall.series = this.getGraph('fall');
              this.quickBoxValues.nightWalk.series = this.getGraph('nightWalk');
            }
          }
          this.isLoading = false;
        })
      }else if(interval === 'threeMonth'){
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
                value.KPI.CriticallyLowBattery = parseFloat(value.KPI.CriticallyLowBattery)
                value.KPI.FallActivity = parseFloat(value.KPI.FallActivity)
                value.KPI.NightWalkActivity = parseFloat(value.KPI.NightWalkActivity)
                value.KPI.NotificationResponseTime = parseFloat(value.KPI.NotificationResponseTime)
                value.KPI.ResidentProfilesViewed = parseFloat(value.KPI.ResidentProfilesViewed)
                value.KPI.ScreenTimeUsage = parseFloat(value.KPI.ScreenTimeUsage)
                intermediate.push(value);
              }
            })
            KPIData = intermediate;
            
            if(KPIData.length > 0){
              this.isDataAvailable = true;
              const screenTimeUsage = KPIData.map(value => {
                return (value.KPI.ScreenTimeUsage)
              })
              const fallActivity = KPIData.map(value => {
                return (value.KPI.FallActivity)
              })
              const nightWalkQuick = KPIData.map(value => {
                return (value.KPI.NightWalkActivity)
              })
              const lowBatteryQuick = KPIData.map(value => {
                return (value.KPI.CriticallyLowBattery)
              })
              const responseQuick = KPIData.map(value => {
                return (value.KPI.NotificationResponseTime)
              })
              const residentQuick = KPIData.map(value => {
                return (value.KPI.ResidentProfilesViewed)
              })
              this.quickBoxValues.screenTime.present[interval] = screenTimeUsage[screenTimeUsage.length - 1];
              this.quickBoxValues.nightWalk.present[interval] = nightWalkQuick[nightWalkQuick.length - 1];
              this.quickBoxValues.fall.present[interval] = fallActivity[fallActivity.length - 1];
              this.quickBoxValues.resident.present[interval] = residentQuick[residentQuick.length - 1];
              this.quickBoxValues.response.present[interval] = responseQuick[responseQuick.length - 1];
              this.quickBoxValues.lowBattery.present[interval] = lowBatteryQuick[lowBatteryQuick.length -1];
              this.quickBoxValues.screenTime.previous[interval] = screenTimeUsage[0];
              this.quickBoxValues.nightWalk.previous[interval] = nightWalkQuick[0];
              this.quickBoxValues.fall.previous[interval] = fallActivity[0];
              this.quickBoxValues.resident.previous[interval] = residentQuick[0];
              this.quickBoxValues.response.previous[interval] = responseQuick[0];
              this.quickBoxValues.lowBattery.previous[interval] = lowBatteryQuick[0];
              
              this.quickBoxSeries.screenTime = screenTimeUsage;
              this.quickBoxSeries.nightWalk = nightWalkQuick;
              this.quickBoxSeries.fall = fallActivity;
              this.quickBoxSeries.resident = residentQuick;
              this.quickBoxSeries.response = responseQuick;
              this.quickBoxSeries.lowBattery = lowBatteryQuick;
              this.quickBoxValues.screenTime.series = this.getGraph('screenTime');
              this.quickBoxValues.resident.series = this.getGraph('resident');
              this.quickBoxValues.lowBattery.series = this.getGraph('lowBattery');
              this.quickBoxValues.response.series = this.getGraph('response');
              this.quickBoxValues.fall.series = this.getGraph('fall');
              this.quickBoxValues.nightWalk.series = this.getGraph('nightWalk');
            }
          }
          this.isLoading = false;
        })
      }else if(interval === 'sixMonth'){
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
                value.KPI.CriticallyLowBattery = parseFloat(value.KPI.CriticallyLowBattery)
                value.KPI.FallActivity = parseFloat(value.KPI.FallActivity)
                value.KPI.NightWalkActivity = parseFloat(value.KPI.NightWalkActivity)
                value.KPI.NotificationResponseTime = parseFloat(value.KPI.NotificationResponseTime)
                value.KPI.ResidentProfilesViewed = parseFloat(value.KPI.ResidentProfilesViewed)
                value.KPI.ScreenTimeUsage = parseFloat(value.KPI.ScreenTimeUsage)
                intermediate.push(value);
              }
            })
            KPIData = intermediate;
            
            if(KPIData.length > 0){
              this.isDataAvailable = true;
              const screenTimeUsage = KPIData.map(value => {
                return (value.KPI.ScreenTimeUsage)
              })
              const fallActivity = KPIData.map(value => {
                return (value.KPI.FallActivity)
              })
              const nightWalkQuick = KPIData.map(value => {
                return (value.KPI.NightWalkActivity)
              })
              const lowBatteryQuick = KPIData.map(value => {
                return (value.KPI.CriticallyLowBattery)
              })
              const responseQuick = KPIData.map(value => {
                return (value.KPI.NotificationResponseTime)
              })
              const residentQuick = KPIData.map(value => {
                return (value.KPI.ResidentProfilesViewed)
              })
              this.quickBoxValues.screenTime.present[interval] = screenTimeUsage[screenTimeUsage.length - 1];
              this.quickBoxValues.nightWalk.present[interval] = nightWalkQuick[nightWalkQuick.length - 1];
              this.quickBoxValues.fall.present[interval] = fallActivity[fallActivity.length - 1];
              this.quickBoxValues.resident.present[interval] = residentQuick[residentQuick.length - 1];
              this.quickBoxValues.response.present[interval] = responseQuick[responseQuick.length - 1];
              this.quickBoxValues.lowBattery.present[interval] = lowBatteryQuick[lowBatteryQuick.length -1];
              this.quickBoxValues.screenTime.previous[interval] = screenTimeUsage[0];
              this.quickBoxValues.nightWalk.previous[interval] = nightWalkQuick[0];
              this.quickBoxValues.fall.previous[interval] = fallActivity[0];
              this.quickBoxValues.resident.previous[interval] = residentQuick[0];
              this.quickBoxValues.response.previous[interval] = responseQuick[0];
              this.quickBoxValues.lowBattery.previous[interval] = lowBatteryQuick[0];
              
              this.quickBoxSeries.screenTime = screenTimeUsage;
              this.quickBoxSeries.nightWalk = nightWalkQuick;
              this.quickBoxSeries.fall = fallActivity;
              this.quickBoxSeries.resident = residentQuick;
              this.quickBoxSeries.response = responseQuick;
              this.quickBoxSeries.lowBattery = lowBatteryQuick;
              this.quickBoxValues.screenTime.series = this.getGraph('screenTime');
              this.quickBoxValues.resident.series = this.getGraph('resident');
              this.quickBoxValues.lowBattery.series = this.getGraph('lowBattery');
              this.quickBoxValues.response.series = this.getGraph('response');
              this.quickBoxValues.fall.series = this.getGraph('fall');
              this.quickBoxValues.nightWalk.series = this.getGraph('nightWalk');
            }
          }
          this.isLoading = false;
        })
      }
	}
  getFall(){
      const previous = this.quickBoxValues.fall.previous[this.quickSelection];
      const present = this.quickBoxValues.fall.present[this.quickSelection];
      let changePercentage: any = this.changePercentage(present, previous) * -1;
      changePercentage = changePercentage > 0 ? `+${changePercentage}%`: `${changePercentage}%`;
      return this.isDataAvailable ? changePercentage : '--';
  }
  getNightWalk(){
      const previous = this.quickBoxValues.nightWalk.previous[this.quickSelection];
      const present = this.quickBoxValues.nightWalk.present[this.quickSelection];
      let changePercentage: any = this.changePercentage(present, previous) * -1;
      changePercentage = changePercentage > 0 ? `+${changePercentage}%`: `${changePercentage}%`;
      return this.isDataAvailable ? changePercentage : '--';
  }
  quickSelection: string = 'week';
  quickBoxSeries = {
    screenTime : [],
    lowBattery: [],
    fall: [],
    nightWalk: [],
    response: [],
    resident: []
  }
  quickBoxValues = {
    screenTime: {
      previous: {
        week: 200,
        month: 900,
        threeMonth: 3000,
        sixMonth: 6000
      },
      present: {
        week: 300,
        month: 500,
        threeMonth: 6000,
        sixMonth: 10000
      },
      series: []
    },
    lowBattery: {
      previous: {
        week: 20,
        month: 90,
        threeMonth: 30,
        sixMonth: 60
      },
      present: {
        week: 30,
        month: 50,
        threeMonth: 20,
        sixMonth: 10
      },
      series: []
    },
    fall: {
      previous: {
        week: 200,
        month: 900,
        threeMonth: 3000,
        sixMonth: 6000
      },
      present: {
        week: 300,
        month: 500,
        threeMonth: 6000,
        sixMonth: 10000
      },
      series: []
    },
    nightWalk: {
      previous: {
        week: 20,
        month: 90,
        threeMonth: 30,
        sixMonth: 60
      },
      present: {
        week: 30,
        month: 50,
        threeMonth: 20,
        sixMonth: 10
      },
      series: []
    },
    response: {
      previous: {
        week: 200,
        month: 900,
        threeMonth: 3000,
        sixMonth: 6000
      },
      present: {
        week: 300,
        month: 500,
        threeMonth: 6000,
        sixMonth: 10000
      },
      series: []
    },
    resident: {
      previous: {
        week: 200,
        month: 400,
        threeMonth: 3000,
        sixMonth: 6000
      },
      present: {
        week: 300,
        month: 500,
        threeMonth: 6000,
        sixMonth: 10000
      },
      series: []
    }
  }
    getScreenTime(){
        const previous = this.quickBoxValues.screenTime.previous[this.quickSelection];
        const present = this.quickBoxValues.screenTime.present[this.quickSelection];
        let changePercentage: any = this.changePercentage(present, previous);
        changePercentage = changePercentage > 0 ? `+${changePercentage}%`: `${changePercentage}%`;
        return this.isDataAvailable ? changePercentage : '--';
      
    }
  
    getResponseTime(){
        const previous = this.quickBoxValues.response.previous[this.quickSelection];
        const present = this.quickBoxValues.response.present[this.quickSelection];
         let changePercentage: any = this.changePercentage(present, previous) * -1;
       changePercentage = changePercentage > 0 ? `+${changePercentage}%`: `${changePercentage}%`;
        return this.isDataAvailable ? changePercentage : '--';
      
    }
    getLowBatteryTime(){
        const previous = this.quickBoxValues.lowBattery.previous[this.quickSelection];
        const present = this.quickBoxValues.lowBattery.present[this.quickSelection];
        let changePercentage: any = this.changePercentage(present, previous,'lba') * -1;
        changePercentage = changePercentage > 0 ? `+${changePercentage}%`: `${changePercentage}%`;
        return this.isDataAvailable ? changePercentage : '--';
      
    }
    getResidentTime(){
        const previous = this.quickBoxValues.resident.previous[this.quickSelection];
        const present = this.quickBoxValues.resident.present[this.quickSelection];
        let changePercentage: any = this.changePercentage(present, previous);
        changePercentage = changePercentage > 0 ? `+${changePercentage}%`: `${changePercentage}%`;
        return this.isDataAvailable ? changePercentage : '--';
      
    }
    changePercentage(present: number, previous: number, type?:string){
       let changePercentage: any;
       changePercentage = ((present - previous) / previous * 100);
      // if (isNaN(changePercentage)) {
      //   changePercentage= 0;
      // }
      if(changePercentage < 0){
        changePercentage = Math.abs(changePercentage) < 1 ? (Math.abs(changePercentage) < 0.25 ? (Math.abs(changePercentage) < 0.1 ? 0.1 : (Math.round(Math.abs(changePercentage) * 10) / 10).toFixed(1)) : this.roundingTechnique(Math.abs(changePercentage))) : Math.round(Math.abs(changePercentage));
        changePercentage = changePercentage * -1;
      }else{
        changePercentage = changePercentage < 1 ? (changePercentage < 0.25 ? (changePercentage < 0.1 ? 0.1 : (Math.round(changePercentage * 10) / 10).toFixed(1)) : this.roundingTechnique(changePercentage)) : Math.round(changePercentage);
      }
      return changePercentage;
    }
    roundingTechnique(numb: number){
      const floor = Math.floor(numb);
      const decimal = (numb - floor) * 100;
      let rounded = 0;
      if(_LODASH.inRange(decimal, 24, 75)){
        rounded = floor + 0.5;
      }else if(_LODASH.inRange(decimal, 74, 100)){
        rounded = floor + 1
      }else{
        rounded = floor;
      }
      return rounded;
    }
    getGraph(type: string){
      let data = []     
      switch(this.quickSelection){
        case 'week': 
          data = [
            {
              data: this.quickBoxSeries[type].slice(0, 6)
            }
          ];
          data[0].data.push(this.quickBoxSeries[type][this.quickBoxSeries[type].length - 1])
          return data;
        case 'month':
          data = [
            {
              data: this.quickBoxSeries[type].slice(0, 4)
            }
          ];
          data[0].data.push(this.quickBoxSeries[type][this.quickBoxSeries[type].length - 1])
          return data;
        case 'threeMonth':
          data = [
            {
              data: this.quickBoxSeries[type].slice(0, 3)
            }
          ];
          data[0].data.push(this.quickBoxSeries[type][this.quickBoxSeries[type].length - 1])
          return data;
        case 'sixMonth':
          data = [
            {
              data: this.quickBoxSeries[type].slice(0, 6)
            }
          ];
          data[0].data.push(this.quickBoxSeries[type][this.quickBoxSeries[type].length - 1])
          return data;
      }
    }
    changeGraph(){
      const startDate = new Date();
      startDate.setDate(new Date().getDate() - 1);
      const endDate = new Date();
      switch(this.quickSelection){
        case 'week': {
          this.get7Days();
          break;
        }
        case 'month': {
          this.get1Month();
          break;
        }
        case 'threeMonth': {
          this.get3Month();
          break;
        }
        case 'sixMonth': {
          this.get6Month();
          break;
        }
      }
      // if(this.quickSelection !== 'week'){
      //   const diff = moment(startDate).diff(moment(endDate), 'days');
      //   console.log(diff)
      //   const dates = [];
      //   for(let i = 1; i < diff + 1; i++){
      //     dates.push(moment(endDate).add(i,'days').format('YYYY-MM-DD'))
      //   }
      //   this.quickBoxValues.screenTime.series = this.getGraph('screenTime');
      //   this.quickBoxValues.resident.series = this.getGraph('resident');
      //   this.quickBoxValues.lowBattery.series = this.getGraph('lowBattery');
      //   this.quickBoxValues.response.series = this.getGraph('response');
      //   this.quickBoxValues.fall.series = this.getGraph('fall');
      //   this.quickBoxValues.nightWalk.series = this.getGraph('nightWalk');
      //   this.isLoading = true;
      //   this.http.get(`${environment.apiUrlNew}/kpi/get/`).subscribe((data: any) => {
      //     let KPIData = [];
      //     if(this.type === 'ward' && this.role === 'SSA'){
      //       data.body.filter(value => value.details.ward_id === this.wardId).forEach(value =>{
      //         const exists = dates.includes(value.meta.Rdate);
      //         if(exists){
      //           KPIData.push(value)
      //         }
      //       })
      //       const intermediate = [];
      //       KPIData.forEach(val => {
      //         const exists = intermediate.find(value => value.meta.Rdate === val.meta.Rdate);
      //         if(!exists){
      //           val.KPI.CriticallyLowBattery = parseFloat(val.KPI.CriticallyLowBattery)
      //           val.KPI.FallActivity = parseFloat(val.KPI.FallActivity)
      //           val.KPI.NightWalkActivity = parseFloat(val.KPI.NightWalkActivity)
      //           val.KPI.NotificationResponseTime = parseFloat(val.KPI.NRT_FallActivity) + parseFloat(val.KPI.NRT_NightWalkActivity) + parseFloat(val.KPI.NRT_CriticallyLowActivity)
      //           val.KPI.ResidentProfilesViewed = parseFloat(val.KPI.ResidentProfilesViewed)
      //           val.KPI.ScreenTimeUsage = parseFloat(val.KPI.ScreenTimeUsage)
      //           Object.assign(val, {count: 1})
      //           intermediate.push(val);
      //         }else{
      //           exists.KPI.CriticallyLowBattery = exists.KPI.CriticallyLowBattery + parseFloat(val.KPI.CriticallyLowBattery)
      //           exists.KPI.FallActivity = exists.KPI.FallActivity + parseFloat(val.KPI.FallActivity)
      //           exists.KPI.NightWalkActivity = exists.KPI.NightWalkActivity + parseFloat(val.KPI.NightWalkActivity)
      //           exists.KPI.NotificationResponseTime = exists.KPI.NotificationResponseTime + parseFloat(val.KPI.NRT_FallActivity) + parseFloat(val.KPI.NRT_NightWalkActivity) + parseFloat(val.KPI.NRT_CriticallyLowActivity)
      //           exists.KPI.ResidentProfilesViewed = exists.KPI.ResidentProfilesViewed + parseFloat(val.KPI.ResidentProfilesViewed)
      //           exists.KPI.ScreenTimeUsage = exists.KPI.ScreenTimeUsage + parseFloat(val.KPI.ScreenTimeUsage)
      //           exists.count++;
      //         }
      //       })
      //       KPIData = intermediate;
      //     }else if(this.type === 'facility' && this.role === 'SSA'){
      //       data.body.filter(value => value.details.facility_id === this.facilityId).forEach(value =>{
      //         const exists = dates.includes(value.meta.Rdate);
      //         if(exists){
      //           KPIData.push(value)
      //         }
      //       })
      //       const intermediate = [];
      //       KPIData.forEach(val => {
      //         const exists = intermediate.find(value => value.meta.Rdate === val.meta.Rdate);
      //         if(!exists){
      //           val.KPI.CriticallyLowBattery = parseFloat(val.KPI.CriticallyLowBattery)
      //           val.KPI.FallActivity = parseFloat(val.KPI.FallActivity)
      //           val.KPI.NightWalkActivity = parseFloat(val.KPI.NightWalkActivity)
      //           val.KPI.NotificationResponseTime = parseFloat(val.KPI.NRT_FallActivity) + parseFloat(val.KPI.NRT_NightWalkActivity) + parseFloat(val.KPI.NRT_CriticallyLowActivity)
      //           val.KPI.ResidentProfilesViewed = parseFloat(val.KPI.ResidentProfilesViewed)
      //           val.KPI.ScreenTimeUsage = parseFloat(val.KPI.ScreenTimeUsage)
      //           Object.assign(val, {count: 1})
      //           intermediate.push(val);
      //         }else{
      //           exists.KPI.CriticallyLowBattery = exists.KPI.CriticallyLowBattery + parseFloat(val.KPI.CriticallyLowBattery)
      //           exists.KPI.FallActivity = exists.KPI.FallActivity + parseFloat(val.KPI.FallActivity)
      //           exists.KPI.NightWalkActivity = exists.KPI.NightWalkActivity + parseFloat(val.KPI.NightWalkActivity)
      //           exists.KPI.NotificationResponseTime = exists.KPI.NotificationResponseTime + parseFloat(val.KPI.NRT_FallActivity) + parseFloat(val.KPI.NRT_NightWalkActivity) + parseFloat(val.KPI.NRT_CriticallyLowActivity)
      //           exists.KPI.ResidentProfilesViewed = exists.KPI.ResidentProfilesViewed + parseFloat(val.KPI.ResidentProfilesViewed)
      //           exists.KPI.ScreenTimeUsage = exists.KPI.ScreenTimeUsage + parseFloat(val.KPI.ScreenTimeUsage)
      //           exists.count++;
      //         }
      //       })
      //       KPIData = intermediate;
      //     }else if(this.type === 'customer' && this.role === 'SSA'){
      //       data.body.filter(value => value.details.customer_id === this.customerId).forEach(value =>{
      //         const exists = dates.includes(value.meta.Rdate);
      //         if(exists){
      //           KPIData.push(value)
      //         }
      //       })
      //       const intermediate = [];
      //       KPIData.forEach(val => {
      //         const exists = intermediate.find(value => value.meta.Rdate === val.meta.Rdate);
      //         if(!exists){
      //           val.KPI.CriticallyLowBattery = parseFloat(val.KPI.CriticallyLowBattery)
      //           val.KPI.FallActivity = parseFloat(val.KPI.FallActivity)
      //           val.KPI.NightWalkActivity = parseFloat(val.KPI.NightWalkActivity)
      //           val.KPI.NotificationResponseTime = parseFloat(val.KPI.NRT_FallActivity) + parseFloat(val.KPI.NRT_NightWalkActivity) + parseFloat(val.KPI.NRT_CriticallyLowActivity)
      //           val.KPI.ResidentProfilesViewed = parseFloat(val.KPI.ResidentProfilesViewed)
      //           val.KPI.ScreenTimeUsage = parseFloat(val.KPI.ScreenTimeUsage)
      //           Object.assign(val, {count: 1})
      //           intermediate.push(val);
      //         }else{
      //           exists.KPI.CriticallyLowBattery = exists.KPI.CriticallyLowBattery + parseFloat(val.KPI.CriticallyLowBattery)
      //           exists.KPI.FallActivity = exists.KPI.FallActivity + parseFloat(val.KPI.FallActivity)
      //           exists.KPI.NightWalkActivity = exists.KPI.NightWalkActivity + parseFloat(val.KPI.NightWalkActivity)
      //           exists.KPI.NotificationResponseTime = exists.KPI.NotificationResponseTime + parseFloat(val.KPI.NRT_FallActivity) + parseFloat(val.KPI.NRT_NightWalkActivity) + parseFloat(val.KPI.NRT_CriticallyLowActivity)
      //           exists.KPI.ResidentProfilesViewed = exists.KPI.ResidentProfilesViewed + parseFloat(val.KPI.ResidentProfilesViewed)
      //           exists.KPI.ScreenTimeUsage = exists.KPI.ScreenTimeUsage + parseFloat(val.KPI.ScreenTimeUsage)
      //           exists.count++;
      //         }
      //       })
      //       KPIData = intermediate;
      //     }else if(this.type === 'dashboard' && this.role === 'SSA'){
      //       data.body.forEach(value =>{
      //         const exists = dates.includes(value.meta.Rdate);
      //         if(exists){
      //           KPIData.push(value)
      //         }
      //       })
      //       const intermediate = [];
      //       KPIData.forEach(val => {
      //         const exists = intermediate.find(value => value.meta.Rdate === val.meta.Rdate);
      //         if(!exists){
      //           val.KPI.CriticallyLowBattery = parseFloat(val.KPI.CriticallyLowBattery)
      //           val.KPI.FallActivity = parseFloat(val.KPI.FallActivity)
      //           val.KPI.NightWalkActivity = parseFloat(val.KPI.NightWalkActivity)
      //           val.KPI.NotificationResponseTime = parseFloat(val.KPI.NRT_FallActivity) + parseFloat(val.KPI.NRT_NightWalkActivity) + parseFloat(val.KPI.NRT_CriticallyLowActivity)
      //           val.KPI.ResidentProfilesViewed = parseFloat(val.KPI.ResidentProfilesViewed)
      //           val.KPI.ScreenTimeUsage = parseFloat(val.KPI.ScreenTimeUsage)
      //           Object.assign(val, {count: 1})
      //           intermediate.push(val);
      //         }else{
      //           exists.KPI.CriticallyLowBattery = exists.KPI.CriticallyLowBattery + parseFloat(val.KPI.CriticallyLowBattery)
      //           exists.KPI.FallActivity = exists.KPI.FallActivity + parseFloat(val.KPI.FallActivity)
      //           exists.KPI.NightWalkActivity = exists.KPI.NightWalkActivity + parseFloat(val.KPI.NightWalkActivity)
      //           exists.KPI.NotificationResponseTime = exists.KPI.NotificationResponseTime + parseFloat(val.KPI.NRT_FallActivity) + parseFloat(val.KPI.NRT_NightWalkActivity) + parseFloat(val.KPI.NRT_CriticallyLowActivity)
      //           exists.KPI.ResidentProfilesViewed = exists.KPI.ResidentProfilesViewed + parseFloat(val.KPI.ResidentProfilesViewed)
      //           exists.KPI.ScreenTimeUsage = exists.KPI.ScreenTimeUsage + parseFloat(val.KPI.ScreenTimeUsage)
      //           exists.count++;
      //         }
      //       })
      //       KPIData = intermediate;
      //     }else if(this.type === 'ward' && this.role === 'CA'){
      //       data.body.filter(value => value.details.ward_id === this.wardId).forEach(value =>{
      //         const exists = dates.includes(value.meta.Rdate);
      //         if(exists){
      //           KPIData.push(value)
      //         }
      //       })
      //       const intermediate = [];
      //       KPIData.forEach(val => {
      //         const exists = intermediate.find(value => value.meta.Rdate === val.meta.Rdate);
      //         if(!exists){
      //           val.KPI.CriticallyLowBattery = parseFloat(val.KPI.CriticallyLowBattery)
      //           val.KPI.FallActivity = parseFloat(val.KPI.FallActivity)
      //           val.KPI.NightWalkActivity = parseFloat(val.KPI.NightWalkActivity)
      //           val.KPI.NotificationResponseTime = parseFloat(val.KPI.NRT_FallActivity) + parseFloat(val.KPI.NRT_NightWalkActivity) + parseFloat(val.KPI.NRT_CriticallyLowActivity)
      //           val.KPI.ResidentProfilesViewed = parseFloat(val.KPI.ResidentProfilesViewed)
      //           val.KPI.ScreenTimeUsage = parseFloat(val.KPI.ScreenTimeUsage)
      //           Object.assign(val, {count: 1})
      //           intermediate.push(val);
      //         }else{
      //           exists.KPI.CriticallyLowBattery = exists.KPI.CriticallyLowBattery + parseFloat(val.KPI.CriticallyLowBattery)
      //           exists.KPI.FallActivity = exists.KPI.FallActivity + parseFloat(val.KPI.FallActivity)
      //           exists.KPI.NightWalkActivity = exists.KPI.NightWalkActivity + parseFloat(val.KPI.NightWalkActivity)
      //           exists.KPI.NotificationResponseTime = exists.KPI.NotificationResponseTime + parseFloat(val.KPI.NRT_FallActivity) + parseFloat(val.KPI.NRT_NightWalkActivity) + parseFloat(val.KPI.NRT_CriticallyLowActivity)
      //           exists.KPI.ResidentProfilesViewed = exists.KPI.ResidentProfilesViewed + parseFloat(val.KPI.ResidentProfilesViewed)
      //           exists.KPI.ScreenTimeUsage = exists.KPI.ScreenTimeUsage + parseFloat(val.KPI.ScreenTimeUsage)
      //           exists.count++;
      //         }
      //       })
      //       KPIData = intermediate;
      //     }else if(this.type === 'facility' && this.role === 'CA'){
      //       data.body.filter(value => value.details.facility_id === this.facilityId).forEach(value =>{
      //         const exists = dates.includes(value.meta.Rdate);
      //         if(exists){
      //           KPIData.push(value)
      //         }
      //       })
      //       const intermediate = [];
      //       KPIData.forEach(val => {
      //         const exists = intermediate.find(value => value.meta.Rdate === val.meta.Rdate);
      //         if(!exists){
      //           val.KPI.CriticallyLowBattery = parseFloat(val.KPI.CriticallyLowBattery)
      //           val.KPI.FallActivity = parseFloat(val.KPI.FallActivity)
      //           val.KPI.NightWalkActivity = parseFloat(val.KPI.NightWalkActivity)
      //           val.KPI.NotificationResponseTime = parseFloat(val.KPI.NRT_FallActivity) + parseFloat(val.KPI.NRT_NightWalkActivity) + parseFloat(val.KPI.NRT_CriticallyLowActivity)
      //           val.KPI.ResidentProfilesViewed = parseFloat(val.KPI.ResidentProfilesViewed)
      //           val.KPI.ScreenTimeUsage = parseFloat(val.KPI.ScreenTimeUsage)
      //           Object.assign(val, {count: 1})
      //           intermediate.push(val);
      //         }else{
      //           exists.KPI.CriticallyLowBattery = exists.KPI.CriticallyLowBattery + parseFloat(val.KPI.CriticallyLowBattery)
      //           exists.KPI.FallActivity = exists.KPI.FallActivity + parseFloat(val.KPI.FallActivity)
      //           exists.KPI.NightWalkActivity = exists.KPI.NightWalkActivity + parseFloat(val.KPI.NightWalkActivity)
      //           exists.KPI.NotificationResponseTime = exists.KPI.NotificationResponseTime + parseFloat(val.KPI.NRT_FallActivity) + parseFloat(val.KPI.NRT_NightWalkActivity) + parseFloat(val.KPI.NRT_CriticallyLowActivity)
      //           exists.KPI.ResidentProfilesViewed = exists.KPI.ResidentProfilesViewed + parseFloat(val.KPI.ResidentProfilesViewed)
      //           exists.KPI.ScreenTimeUsage = exists.KPI.ScreenTimeUsage + parseFloat(val.KPI.ScreenTimeUsage)
      //           exists.count++;
      //         }
      //       })
      //       KPIData = intermediate;
      //     }else if(this.type === 'customer' && this.role === 'CA'){
      //       const user = JSON.parse(localStorage.getItem('loggedInUser'));
      // this.customerId = user.customers.customer_id;
      //       data.body.filter(value => value.details.customer_id === this.customerId).forEach(value =>{
      //         const exists = dates.includes(value.meta.Rdate);
      //         if(exists){
      //           KPIData.push(value)
      //         }
      //       })
      //       const intermediate = [];
      //       KPIData.forEach(val => {
      //         const exists = intermediate.find(value => value.meta.Rdate === val.meta.Rdate);
      //         if(!exists){
      //           val.KPI.CriticallyLowBattery = parseFloat(val.KPI.CriticallyLowBattery)
      //           val.KPI.FallActivity = parseFloat(val.KPI.FallActivity)
      //           val.KPI.NightWalkActivity = parseFloat(val.KPI.NightWalkActivity)
      //           val.KPI.NotificationResponseTime = parseFloat(val.KPI.NRT_FallActivity) + parseFloat(val.KPI.NRT_NightWalkActivity) + parseFloat(val.KPI.NRT_CriticallyLowActivity)
      //           val.KPI.ResidentProfilesViewed = parseFloat(val.KPI.ResidentProfilesViewed)
      //           val.KPI.ScreenTimeUsage = parseFloat(val.KPI.ScreenTimeUsage)
      //           Object.assign(val, {count: 1})
      //           intermediate.push(val);
      //         }else{
      //           exists.KPI.CriticallyLowBattery = exists.KPI.CriticallyLowBattery + parseFloat(val.KPI.CriticallyLowBattery)
      //           exists.KPI.FallActivity = exists.KPI.FallActivity + parseFloat(val.KPI.FallActivity)
      //           exists.KPI.NightWalkActivity = exists.KPI.NightWalkActivity + parseFloat(val.KPI.NightWalkActivity)
      //           exists.KPI.NotificationResponseTime = exists.KPI.NotificationResponseTime + parseFloat(val.KPI.NRT_FallActivity) + parseFloat(val.KPI.NRT_NightWalkActivity) + parseFloat(val.KPI.NRT_CriticallyLowActivity)
      //           exists.KPI.ResidentProfilesViewed = exists.KPI.ResidentProfilesViewed + parseFloat(val.KPI.ResidentProfilesViewed)
      //           exists.KPI.ScreenTimeUsage = exists.KPI.ScreenTimeUsage + parseFloat(val.KPI.ScreenTimeUsage)
      //           exists.count++;
      //         }
      //       })
      //       KPIData = intermediate;
      //     }else if(this.type === 'ward' && this.role === 'FA'){
      //       data.body.filter(value => value.details.ward_id === this.wardId).forEach(value =>{
      //         const exists = dates.includes(value.meta.Rdate);
      //         if(exists){
      //           KPIData.push(value)
      //         }
      //       })
      //       const intermediate = [];
      //       KPIData.forEach(val => {
      //         const exists = intermediate.find(value => value.meta.Rdate === val.meta.Rdate);
      //         if(!exists){
      //           val.KPI.CriticallyLowBattery = parseFloat(val.KPI.CriticallyLowBattery)
      //           val.KPI.FallActivity = parseFloat(val.KPI.FallActivity)
      //           val.KPI.NightWalkActivity = parseFloat(val.KPI.NightWalkActivity)
      //           val.KPI.NotificationResponseTime = parseFloat(val.KPI.NRT_FallActivity) + parseFloat(val.KPI.NRT_NightWalkActivity) + parseFloat(val.KPI.NRT_CriticallyLowActivity)
      //           val.KPI.ResidentProfilesViewed = parseFloat(val.KPI.ResidentProfilesViewed)
      //           val.KPI.ScreenTimeUsage = parseFloat(val.KPI.ScreenTimeUsage)
      //           Object.assign(val, {count: 1})
      //           intermediate.push(val);
      //         }else{
      //           exists.KPI.CriticallyLowBattery = exists.KPI.CriticallyLowBattery + parseFloat(val.KPI.CriticallyLowBattery)
      //           exists.KPI.FallActivity = exists.KPI.FallActivity + parseFloat(val.KPI.FallActivity)
      //           exists.KPI.NightWalkActivity = exists.KPI.NightWalkActivity + parseFloat(val.KPI.NightWalkActivity)
      //           exists.KPI.NotificationResponseTime = exists.KPI.NotificationResponseTime + parseFloat(val.KPI.NRT_FallActivity) + parseFloat(val.KPI.NRT_NightWalkActivity) + parseFloat(val.KPI.NRT_CriticallyLowActivity)
      //           exists.KPI.ResidentProfilesViewed = exists.KPI.ResidentProfilesViewed + parseFloat(val.KPI.ResidentProfilesViewed)
      //           exists.KPI.ScreenTimeUsage = exists.KPI.ScreenTimeUsage + parseFloat(val.KPI.ScreenTimeUsage)
      //           exists.count++;
      //         }
      //       })
      //       KPIData = intermediate;
      //     }else if(this.type === 'facility' && this.role === 'FA'){
      //       console.log(this.facilityId)
      //       data.body.filter(value => value.details.facility_id === this.facilityId).forEach(value =>{
      //         const exists = dates.includes(value.meta.Rdate);
      //         if(exists){
      //           KPIData.push(value)
      //         }
      //       })
      //       console.log({intermediate: KPIData})
      //       const intermediate = [];
      //       KPIData.forEach(val => {
      //         const exists = intermediate.find(value => value.meta.Rdate === val.meta.Rdate);
      //         if(!exists){
      //           val.KPI.CriticallyLowBattery = parseFloat(val.KPI.CriticallyLowBattery)
      //           val.KPI.FallActivity = parseFloat(val.KPI.FallActivity)
      //           val.KPI.NightWalkActivity = parseFloat(val.KPI.NightWalkActivity)
      //           val.KPI.NotificationResponseTime = parseFloat(val.KPI.NRT_FallActivity) + parseFloat(val.KPI.NRT_NightWalkActivity) + parseFloat(val.KPI.NRT_CriticallyLowActivity)
      //           val.KPI.ResidentProfilesViewed = parseFloat(val.KPI.ResidentProfilesViewed)
      //           val.KPI.ScreenTimeUsage = parseFloat(val.KPI.ScreenTimeUsage)
      //           Object.assign(val, {count: 1})
      //           intermediate.push(val);
      //         }else{
      //           exists.KPI.CriticallyLowBattery = exists.KPI.CriticallyLowBattery + parseFloat(val.KPI.CriticallyLowBattery)
      //           exists.KPI.FallActivity = exists.KPI.FallActivity + parseFloat(val.KPI.FallActivity)
      //           exists.KPI.NightWalkActivity = exists.KPI.NightWalkActivity + parseFloat(val.KPI.NightWalkActivity)
      //           exists.KPI.NotificationResponseTime = exists.KPI.NotificationResponseTime + parseFloat(val.KPI.NRT_FallActivity) + parseFloat(val.KPI.NRT_NightWalkActivity) + parseFloat(val.KPI.NRT_CriticallyLowActivity)
      //           exists.KPI.ResidentProfilesViewed = exists.KPI.ResidentProfilesViewed + parseFloat(val.KPI.ResidentProfilesViewed)
      //           exists.KPI.ScreenTimeUsage = exists.KPI.ScreenTimeUsage + parseFloat(val.KPI.ScreenTimeUsage)
      //           exists.count++;
      //         }
      //       })
      //       KPIData = intermediate;
      //     }else if(this.type === 'ward' && this.role === 'WA'){
      //       data.body.filter(value => value.details.ward_id === this.wardId).forEach(value =>{
      //         const exists = dates.includes(value.meta.Rdate);
      //         if(exists){
      //           KPIData.push(value)
      //         }
      //       })
      //       const intermediate = [];
      //       KPIData.forEach(val => {
      //         const exists = intermediate.find(value => value.meta.Rdate === val.meta.Rdate);
      //         if(!exists){
      //           val.KPI.CriticallyLowBattery = parseFloat(val.KPI.CriticallyLowBattery)
      //           val.KPI.FallActivity = parseFloat(val.KPI.FallActivity)
      //           val.KPI.NightWalkActivity = parseFloat(val.KPI.NightWalkActivity)
      //           val.KPI.NotificationResponseTime = parseFloat(val.KPI.NRT_FallActivity) + parseFloat(val.KPI.NRT_NightWalkActivity) + parseFloat(val.KPI.NRT_CriticallyLowActivity)
      //           val.KPI.ResidentProfilesViewed = parseFloat(val.KPI.ResidentProfilesViewed)
      //           val.KPI.ScreenTimeUsage = parseFloat(val.KPI.ScreenTimeUsage)
      //           Object.assign(val, {count: 1})
      //           intermediate.push(val);
      //         }else{
      //           exists.KPI.CriticallyLowBattery = exists.KPI.CriticallyLowBattery + parseFloat(val.KPI.CriticallyLowBattery)
      //           exists.KPI.FallActivity = exists.KPI.FallActivity + parseFloat(val.KPI.FallActivity)
      //           exists.KPI.NightWalkActivity = exists.KPI.NightWalkActivity + parseFloat(val.KPI.NightWalkActivity)
      //           exists.KPI.NotificationResponseTime = exists.KPI.NotificationResponseTime + parseFloat(val.KPI.NRT_FallActivity) + parseFloat(val.KPI.NRT_NightWalkActivity) + parseFloat(val.KPI.NRT_CriticallyLowActivity)
      //           exists.KPI.ResidentProfilesViewed = exists.KPI.ResidentProfilesViewed + parseFloat(val.KPI.ResidentProfilesViewed)
      //           exists.KPI.ScreenTimeUsage = exists.KPI.ScreenTimeUsage + parseFloat(val.KPI.ScreenTimeUsage)
      //           exists.count++;
      //         }
      //       })
      //       KPIData = intermediate;
      //     }
      //     KPIData.sort((a,b) => {
      //       return parseInt(a.meta.timestamp) > parseInt(b.meta.timestamp) ? 1 : -1;
      //     });
      //     ;
      //     const screenTimeUsage = KPIData.map(value => {
      //       return (value.KPI.ScreenTimeUsage/value.count)
      //     })
      //     const fallActivity = KPIData.map(value => {
      //       return (value.KPI.FallActivity/value.count)
      //     })
      //     const nightWalkQuick = KPIData.map(value => {
      //       return (value.KPI.NightWalkActivity/value.count)
      //     })
      //     const lowBatteryQuick = KPIData.map(value => {
      //       return (value.KPI.CriticallyLowBattery/value.count)
      //     })
      //     const responseQuick = KPIData.map(value => {
      //       return (value.KPI.NotificationResponseTime/value.count)
      //     })
      //     const residentQuick = KPIData.map(value => {
      //       return (value.KPI.ResidentProfilesViewed/value.count)
      //     })
      //     console.log({screenTimeUsage})
      //     this.quickBoxValues.screenTime.present[this.quickSelection] = screenTimeUsage[0];
      //     this.quickBoxValues.nightWalk.present[this.quickSelection] = nightWalkQuick[0];
      //     this.quickBoxValues.fall.present[this.quickSelection] = fallActivity[0];
      //     this.quickBoxValues.resident.present[this.quickSelection] = residentQuick[0];
      //     this.quickBoxValues.response.present[this.quickSelection] = responseQuick[0];
      //     this.quickBoxValues.lowBattery.present[this.quickSelection] = lowBatteryQuick[0];
      //     this.quickBoxValues.screenTime.previous[this.quickSelection] = screenTimeUsage[screenTimeUsage.length - 1];
      //     this.quickBoxValues.nightWalk.previous[this.quickSelection] = nightWalkQuick[nightWalkQuick.length - 1];
      //     this.quickBoxValues.fall.previous[this.quickSelection] = fallActivity[fallActivity.length - 1];
      //     this.quickBoxValues.resident.previous[this.quickSelection] = residentQuick[residentQuick.length - 1];
      //     this.quickBoxValues.response.previous[this.quickSelection] = responseQuick[responseQuick.length - 1];
      //     this.quickBoxValues.lowBattery.previous[this.quickSelection] = lowBatteryQuick[lowBatteryQuick.length -1];
      //     this.isLoading = false;
      //   })
      // }else{
      //   if(this.type === 'ward' && this.role === 'SSA'){
      //     this.routeActivate.paramMap.subscribe(data => {
      //       this.wardId = data.get('wardId');
      //       this.getKPIWardData(this.quickSelection);
      //     });
      //   }else if(this.type === 'facility' && this.role === 'SSA'){
      //     this.routeActivate.paramMap.subscribe(data => {
      //       this.facilityId = data.get('facilityId');
      //       this.getKPIFacilityData(this.quickSelection);
      //     });
      //   }else if(this.type === 'customer' && this.role === 'SSA'){
      //     this.routeActivate.paramMap.subscribe(data => {
      //       this.customerId = data.get('customer_id');
      //       this.getKPICustomerData(this.quickSelection);
      //     });
      //   }else if(this.type === 'dashboard' && this.role === 'SSA'){
      //     this.getKPIDashBoardData(this.quickSelection);
      //   }else if(this.type === 'ward' && this.role === 'CA'){
      //     this.routeActivate.paramMap.subscribe(data => {
      //       this.wardId = data.get('wardId');
      //       this.getKPIWardData('week');
      //     });
      //   }else if(this.type === 'facility' && this.role === 'CA'){
      //     this.routeActivate.paramMap.subscribe(data => {
      //       this.facilityId = data.get('facilityId');
      //       this.getKPIFacilityData('week');
      //     });
      //   }else if(this.type === 'customer' && this.role === 'CA'){
      //     const user = JSON.parse(localStorage.getItem('loggedInUser'));
      // this.customerId = user.customers.customer_id;
      //     this.getKPICustomerData('week');
      //   }else if(this.type === 'ward' && this.role === 'FA'){
      //     this.routeActivate.paramMap.subscribe(data => {
      //       this.wardId = data.get('wardId');
      //       this.getKPIWardData('week');
      //     });
      //   }else if(this.type === 'facility' && this.role === 'FA'){
      //       const user = JSON.parse(localStorage.getItem('loggedInUser'));
        // this.facilityId = user.facilities.facility_id;
      //       this.getKPIFacilityData('week');
      //   }else if(this.type === 'ward' && this.role === 'WA'){
      //     this.wardId = 'g3r25dfmgg00000';
      //     this.getKPIWardData('week');
      //   }
      // }
    }

}
