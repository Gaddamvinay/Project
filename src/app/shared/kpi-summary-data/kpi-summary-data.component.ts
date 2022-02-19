import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';
import * as _LODASH from "lodash";
import { TokenStorageServiceService } from '../../auth/login/token-storage-service.service';

@Component({
  selector: 'app-kpi-summary-data',
  templateUrl: './kpi-summary-data.component.html',
  styleUrls: ['./kpi-summary-data.component.css']
})
export class KpiSummaryDataComponent implements OnInit {
sheader:any;
  constructor(private tokenStorage: TokenStorageServiceService,private http: HttpClient,private routeActivate: ActivatedRoute) {  }

  ngOnInit(): void {
    this.get7Days();
  }
   getSHeader(){
    let accessToken='ODkxZmQ1MzExMGVjYWU3ZTA3ZTkzYWMz7777MmI2NmYxMGE1OWIxYjBmYTNiYzg4MDRkNTMzYjA1ODU1NWM4ZDhlNDEyZDU3NjQxNDBkMjdkOWEwZTIzMzNjMzFhMGU5ODlmYjcwZTkwMGY2N2Y2YzA0ZDc3NmY3M2IwZDc4YmQ5N2YxNjQxNTQ4MjY0';
    this.sheader = new HttpHeaders().set(
      "x-access-token",
      accessToken
    );
   }
  get1Month(){
    if(this.type === 'ward' && this.role === 'Super-Admin-SSA'){
      this.routeActivate.paramMap.subscribe(data => {
        this.wardId = data.get('wardId');
        this.getKPIWardData('month');
      });
    }else if(this.type === 'facility' && this.role === 'Super-Admin-SSA'){
      this.routeActivate.paramMap.subscribe(data => {
        this.facilityId = data.get('facilityId');
        this.getKPIFacilityData('month');
      });
    }else if(this.type === 'customer' && this.role === 'Super-Admin-SSA'){
      this.routeActivate.paramMap.subscribe(data => {
        this.customerId = data.get('customer_id');
        this.getKPICustomerData('month');
      });
    }else if(this.type === 'dashboard' && this.role === 'Super-Admin-SSA'){
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
			this.customerId = 'nw2mc0dhkw00000';
			this.getKPICustomerData('month');
		}else if(this.type === 'ward' && this.role === 'FA'){
      this.routeActivate.paramMap.subscribe(data => {
        this.wardId = data.get('wardId');
        this.getKPIWardData('month');
      });
    }else if(this.type === 'facility' && this.role === 'FA'){
        this.facilityId = 'k378u38g0000000';
        this.getKPIFacilityData('month');
    }else if(this.type === 'ward' && this.role === 'WA'){
      this.wardId = 'g3r25dfmgg00000';
      this.getKPIWardData('month');
    }
  }
  get3Month(){
    if(this.type === 'ward' && this.role === 'Super-Admin-SSA'){
      this.routeActivate.paramMap.subscribe(data => {
        this.wardId = data.get('wardId');
        this.getKPIWardData('threeMonth');
      });
    }else if(this.type === 'facility' && this.role === 'Super-Admin-SSA'){
      this.routeActivate.paramMap.subscribe(data => {
        this.facilityId = data.get('facilityId');
        this.getKPIFacilityData('threeMonth');
      });
    }else if(this.type === 'customer' && this.role === 'Super-Admin-SSA'){
      this.routeActivate.paramMap.subscribe(data => {
        this.customerId = data.get('customer_id');
        this.getKPICustomerData('threeMonth');
      });
    }else if(this.type === 'dashboard' && this.role === 'Super-Admin-SSA'){
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
			this.customerId = 'nw2mc0dhkw00000';
			this.getKPICustomerData('threeMonth');
		}else if(this.type === 'ward' && this.role === 'FA'){
      this.routeActivate.paramMap.subscribe(data => {
        this.wardId = data.get('wardId');
        this.getKPIWardData('threeMonth');
      });
    }else if(this.type === 'facility' && this.role === 'FA'){
        this.facilityId = 'k378u38g0000000';
        this.getKPIFacilityData('threeMonth');
    }else if(this.type === 'ward' && this.role === 'WA'){
      this.wardId = 'g3r25dfmgg00000';
      this.getKPIWardData('threeMonth');
    }
  }
  get6Month(){
    if(this.type === 'ward' && this.role === 'Super-Admin-SSA'){
      this.routeActivate.paramMap.subscribe(data => {
        this.wardId = data.get('wardId');
        this.getKPIWardData('sixMonth');
      });
    }else if(this.type === 'facility' && this.role === 'Super-Admin-SSA'){
      this.routeActivate.paramMap.subscribe(data => {
        this.facilityId = data.get('facilityId');
        this.getKPIFacilityData('sixMonth');
      });
    }else if(this.type === 'customer' && this.role === 'Super-Admin-SSA'){
      this.routeActivate.paramMap.subscribe(data => {
        this.customerId = data.get('customer_id');
        this.getKPICustomerData('sixMonth');
      });
    }else if(this.type === 'dashboard' && this.role === 'Super-Admin-SSA'){
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
			this.customerId = 'nw2mc0dhkw00000';
			this.getKPICustomerData('sixMonth');
		}else if(this.type === 'ward' && this.role === 'FA'){
      this.routeActivate.paramMap.subscribe(data => {
        this.wardId = data.get('wardId');
        this.getKPIWardData('sixMonth');
      });
    }else if(this.type === 'facility' && this.role === 'FA'){
        this.facilityId = 'k378u38g0000000';
        this.getKPIFacilityData('sixMonth');
    }else if(this.type === 'ward' && this.role === 'WA'){
      this.wardId = 'g3r25dfmgg00000';
      this.getKPIWardData('sixMonth');
    }
  }
  type: string = 'dashboard';
  facilityId ='';
  customerId = '';
  wardId = '';
  role= "Super-Admin-SSA"
  get7Days(){
    if(this.type === 'ward' && this.role === 'Super-Admin-SSA'){
      this.routeActivate.paramMap.subscribe(data => {
        this.wardId = data.get('wardId');
        this.getKPIWardData('week');
      });
    }else if(this.type === 'facility' && this.role === 'Super-Admin-SSA'){
      this.routeActivate.paramMap.subscribe(data => {
        this.facilityId = data.get('facilityId');
        this.getKPIFacilityData('week');
      });
    }else if(this.type === 'customer' && this.role === 'Super-Admin-SSA'){
      this.routeActivate.paramMap.subscribe(data => {
        this.customerId = data.get('customer_id');
        this.getKPICustomerData('week');
      });
    }else if(this.type === 'dashboard' && this.role === 'Super-Admin-SSA'){
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
			this.customerId = 'nw2mc0dhkw00000';
			this.getKPICustomerData('week');
		}else if(this.type === 'ward' && this.role === 'FA'){
      this.routeActivate.paramMap.subscribe(data => {
        this.wardId = data.get('wardId');
        this.getKPIWardData('week');
      });
    }else if(this.type === 'facility' && this.role === 'FA'){
        this.facilityId = 'k378u38g0000000';
        this.getKPIFacilityData('week');
    }else if(this.type === 'ward' && this.role === 'WA'){
      this.wardId = 'g3r25dfmgg00000';
      this.getKPIWardData('week');
    }
  }
  tableData: any[] = [];
  tableDisplayColumn: string[] = ['Type', 'Previous_date_value', 'Previous_date', 'Present_date_value', 'Present_date', 'Difference', 'Percentage'];
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
  getKPIFacilityData(interval: string){
    this.isLoading = true;
    this.getSHeader();
    if(interval === 'week'){
      this.http.get(`${environment.apiUrlNew}/kpi/getSevenDaysFSummary/?facility_id=${this.facilityId}`,{headers:this.sheader}).subscribe((data: any) => {
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
      this.http.get(`${environment.apiUrlNew}/kpi/getOneMonthFSummary/?facility_id=${this.facilityId}`,{headers:this.sheader}).subscribe((data: any) => {
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
      this.http.get(`${environment.apiUrlNew}/kpi/getThreeMonthsFSummary/?facility_id=${this.facilityId}`,{headers:this.sheader}).subscribe((data: any) => {
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
      this.http.get(`${environment.apiUrlNew}/kpi/getSixMonthsFSummary/?facility_id=${this.facilityId}`,{headers:this.sheader}).subscribe((data: any) => {
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
    this.getSHeader();
    if(interval === 'week'){
      this.http.get(`${environment.apiUrlNew}/kpi/getSevenDaysWSummary/?ward_id=${this.wardId}`,{headers:this.sheader}).subscribe((data: any) => {
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
      this.http.get(`${environment.apiUrlNew}/kpi/getOneMonthWSummary/?ward_id=${this.wardId}`,{headers:this.sheader}).subscribe((data: any) => {
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
          }
        }
        this.isLoading = false;
      })
    }else if(interval === 'sixMonth'){
      this.http.get(`${environment.apiUrlNew}/kpi/getSixMonthsWSummary/?ward_id=${this.wardId}`,{headers:this.sheader}).subscribe((data: any) => {
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
          }
        }
        this.isLoading = false;
      })
    }else if(interval === 'threeMonth'){
      this.http.get(`${environment.apiUrlNew}/kpi/getSixMonthsWSummary/?ward_id=${this.wardId}`,{headers:this.sheader}).subscribe((data: any) => {
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
          }
        }
        this.isLoading = false;
      })
    }
  }
  getKPICustomerData(interval: string){
    this.isLoading = true;
    this.getSHeader();
    if(interval === 'week'){
      this.http.get(`${environment.apiUrlNew}/kpi/getSevenDaysCSummary/?customer_id=${this.customerId}`,{headers:this.sheader}).subscribe((data: any) => {
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
      this.http.get(`${environment.apiUrlNew}/kpi/getOneMonthCSummary/?customer_id=${this.customerId}`,{headers:this.sheader}).subscribe((data: any) => {
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
          }
        }
        this.isLoading = false;
      })
    }else if(interval === 'threeMonth'){
      this.http.get(`${environment.apiUrlNew}/kpi/getThreeMonthsCSummary/?customer_id=${this.customerId}`,{headers:this.sheader}).subscribe((data: any) => {
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
          }
        }
        this.isLoading = false;
      })
    }else if(interval === 'sixMonth'){
      this.http.get(`${environment.apiUrlNew}/kpi/getSixMonthsCSummary/?customer_id=${this.customerId}`,{headers:this.sheader}).subscribe((data: any) => {
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
          }
        }
        this.isLoading = false;
      })
    }
  }
  isDataAvailable = false;
  getKPIDashBoardData(interval: string){
    this.isLoading = true;
    this.getSHeader();
      if(interval === 'week'){
        this.http.get(`${environment.apiUrlNew}/kpi/getSevenDaysSummary/`,{headers:this.sheader}).subscribe((data: any) => {
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
              this.getTableValues(screenTimeUsage, lowBatteryQuick, responseQuick, residentQuick, fallActivity, nightWalkQuick, KPIData[0].details.Rdate, KPIData[KPIData.length - 1].details.Rdate)
            }
          }
          this.isLoading = false;
        })
      }else if(interval === 'month'){
        this.http.get(`${environment.apiUrlNew}/kpi/getOneMonthSummary/`,{headers:this.sheader}).subscribe((data: any) => {
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
              this.getTableValues(screenTimeUsage, lowBatteryQuick, responseQuick, residentQuick, fallActivity, nightWalkQuick, KPIData[0].details.Rdate, KPIData[KPIData.length - 1].details.Rdate)
            }
          }
          this.isLoading = false;
        })
      }else if(interval === 'threeMonth'){
        this.http.get(`${environment.apiUrlNew}/kpi/getThreeMonthsSummary/`,{headers:this.sheader}).subscribe((data: any) => {
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
              this.getTableValues(screenTimeUsage, lowBatteryQuick, responseQuick, residentQuick, fallActivity, nightWalkQuick,  KPIData[0].details.Rdate, KPIData[KPIData.length - 1].details.Rdate)
            }
          }
          this.isLoading = false;
        })
      }else if(interval === 'sixMonth'){
        this.http.get(`${environment.apiUrlNew}/kpi/getSixMonthsSummary/`,{headers:this.sheader}).subscribe((data: any) => {
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
              this.getTableValues(screenTimeUsage, lowBatteryQuick, responseQuick, residentQuick, fallActivity, nightWalkQuick,  KPIData[0].details.Rdate, KPIData[KPIData.length - 1].details.Rdate)
            }
          }
          this.isLoading = false;
        })
      }
  }
  getValue(value: any){
    let changePercentage = value;
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
  getTableValues(screenTime: any[], lowBattery: any[], response: any[], resident: any[], fall: any[], nightWalk: any[], previousDate: any, presentDate: any){
    this.tableData = [];
    const lowPer = this.getValue(((lowBattery[lowBattery.length -1] - lowBattery[0]) / lowBattery[0] * 100))
    const screen = this.getValue(((screenTime[screenTime.length -1] - screenTime[0]) / screenTime[0] * 100))
    const resp = this.getValue(((response[response.length -1] - response[0]) / response[0] * 100))
    const res = this.getValue(((resident[resident.length -1] - resident[0]) / resident[0] * 100))
    const fallPer = this.getValue(((fall[fall.length -1] - fall[0]) / fall[0] * 100))
    const night = this.getValue(((nightWalk[nightWalk.length -1] - nightWalk[0]) / nightWalk[0] * 100))
    this.tableData.push({
      Type: 'Resident profiles viewed',
      Previous_date_value: resident[0],
      Previous_date: previousDate,
      Present_date: presentDate,
      Present_date_value: resident[resident.length -1],
      Difference: (resident[resident.length -1] - resident[0]),
      Percentage: res
    });
    this.tableData.push({
      Type: 'Screen time usage',
      Previous_date_value: screenTime[0],
      Previous_date: previousDate,
      Present_date: presentDate,
      Present_date_value: screenTime[screenTime.length -1],
      Difference: (screenTime[screenTime.length -1] - screenTime[0]),
      Percentage: screen
    });
    this.tableData.push({
      Type: 'Falls activity avoidance',
      Previous_date_value: fall[0],
      Previous_date: previousDate,
      Present_date: presentDate,
      Present_date_value: fall[fall.length -1],
      Difference: (fall[fall.length -1] - fall[0]),
      Percentage: fallPer* -1
    });
    this.tableData.push({
      Type: 'Night walk activity avoidance',
      Previous_date_value: nightWalk[0],
      Previous_date: previousDate,
      Present_date: presentDate,
      Present_date_value: nightWalk[nightWalk.length -1],
      Difference: (nightWalk[nightWalk.length -1] - nightWalk[0]),
      Percentage: night * -1
    });
    this.tableData.push({
      Type: 'Critically low battery avoidance',
      Previous_date_value: lowBattery[0],
      Previous_date: previousDate,
      Present_date: presentDate,
      Present_date_value: lowBattery[lowBattery.length -1],
      Difference: (lowBattery[lowBattery.length -1] - lowBattery[0]),
      Percentage: lowPer * -1
    });
    this.tableData.push({
      Type: 'Notification response time',
      Previous_date_value: response[0],
      Previous_date: previousDate,
      Present_date: presentDate,
      Present_date_value: response[response.length -1],
      Difference: (response[response.length -1] - response[0]),
      Percentage: resp * -1
    })
  }

  changeGraph(){
    const startDate = new Date();
    startDate.setDate(new Date().getDate() - 1);
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
  }
}
