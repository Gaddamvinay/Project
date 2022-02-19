import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TrackResidentComponent } from './track-resident/track-resident.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { CommonHttpService } from '../../../../shared/services/http-services/common-http.service';
import * as moment from 'moment';
interface marker {
	lat: number;
	lng: number;
	label?: string;
	draggable: boolean;
}
@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss']
})
export class LocationComponent implements OnInit {
 
  titleShow = false;
  zoom: number = 12;
  // initial center position for the map
  lat: number;
  lng: number;
  count:number;
  data:[];
  currentUpdate: string ='';
  currentPosture: string ='';
  previousUpdate: string ='';
  previousPosture: string ='';
  nextUpdate: string ='';
  minsToAdd = 60;
  refreshtime=60000;

  constructor(private commonHttp: CommonHttpService,private matDialog: MatDialog,private http: HttpClient) {
   }
  ngOnInit(): void {
  }
  residentData: any;
  @Input('userData')
	set user(event: any) {
    this.residentData = event;
    if(this.residentData!=null){
    this.location();}
  }
  location(){
    this.commonHttp.getLocationDetails(this.residentData.deviceId).subscribe((result: any) => {
      this.currentUpdate = `${result.endTime.etmp}`
      this.currentPosture = `${result.endTime.status}`
      this.previousUpdate = `${result.startTime.stmp}`
      this.previousPosture = `${result.startTime.status}`
      this.nextUpdate = new Date(new Date("1970/01/01 " + this.currentUpdate).getTime() + this.minsToAdd * 60000).toLocaleTimeString('en-UK', { hour: '2-digit', minute: '2-digit', hour12: false });
    })
    this.commonHttp.getLocationAuthenticateDetails(this.residentData.deviceId).subscribe((data: any) => {
     this.lat = +`${data.params.lat}`
      this.lng = +`${data.params.lng}`
    })
	}
  // trackResident(){
  //   this.http.get(`${environment.apiSpringUrl}/location/status/?thingKey=`+event.deviceId).subscribe((result: any) => {
  //     this.currentUpdate = `${result.endTime.etmp}`
  //     this.currentPosture = `${result.endTime.status}`
  //     this.previousUpdate = `${result.startTime.stmp}`
  //     this.previousPosture = `${result.startTime.status}`
  //     this.nextUpdate = new Date(new Date("1970/01/01 " + this.currentUpdate).getTime() + this.minsToAdd * 60000).toLocaleTimeString('en-UK', { hour: '2-digit', minute: '2-digit', hour12: false });
  //   })
  //   this.http.get(`${environment.apiSpringUrl}/location/auth/?thingKey=`+event.deviceId).subscribe((data: any) => {
  //     this.lat = +`${data.params.lat}`
  //     this.lng = +`${data.params.lng}`
  //   })
  // }
	get user() {
		return this.residentData;
	}
  trackResident(todaysTime:string){
    const int = setInterval( () => {
      var currentTime =  `${new Date().getHours()}:${(new Date().getMinutes()<10?'0':'') + new Date().getMinutes()}`;
    var format='hh:mm';
     var endTime=moment(todaysTime,format);
     var startTime=moment(currentTime,format);
      if(startTime >endTime)
        {
          clearInterval( int );
        }
      else
      {
        this.location();
      }  
    },this.refreshtime);//
   // }, this.miliseconds(0,this.refreshtime,0));
    
 }
  miliseconds(hrs,min,sec)
  {
      return((hrs*60*60+min*60+sec)*1000);
  }
  openTrack(){
    let dialog: any;
    dialog =this.matDialog.open(TrackResidentComponent, {
      disableClose: false,
      width: '448px',
      panelClass: 'dialog-popup',
      data: {
        residentdata: this.residentData
      }
    })
    dialog.afterClosed().subscribe(result => {
     if(result){
        this.refreshtime=result.refreshtime*60000;
        this.trackResident(result.todaytime);
     }
    })
  } 
  
}
