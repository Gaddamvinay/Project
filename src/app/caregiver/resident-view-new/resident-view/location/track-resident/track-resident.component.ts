import { Component, Inject, OnInit } from '@angular/core';
import {MAT_DIALOG_DATA,MatDialogRef} from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CommonHttpService } from '../../../../../shared/services/http-services/common-http.service';
import { ToastrService } from "ngx-toastr";
import { snackBarMessages } from '../../../../../constants/constants';
@Component({
  selector: 'app-track-resident',
  templateUrl: './track-resident.component.html',
  styleUrls: ['./track-resident.component.scss']
})
export class TrackResidentComponent implements OnInit {
  
  todaysTime ='';
  signInRawData='';
  
  constructor(private router: Router,public dialogRef: MatDialogRef<TrackResidentComponent>,private commonHttp: CommonHttpService,private toastr: ToastrService,@Inject(MAT_DIALOG_DATA)public data: any) {
   }

  ngOnInit(): void {
    this.todaysTime = `${new Date().getHours()}:${(new Date().getMinutes()<10?'0':'') + new Date().getMinutes()}`;    
  }
  isLoading: boolean = false;
  isLogged:boolean;
  refreshTime='';
  
  pass = '';
  trackResident() {
    const user1 = JSON.parse(localStorage.getItem('loggedInUser'));
    let signInRawData = {
      email: user1.username,
      password:  this.pass
    };

    this.commonHttp.signInNew(signInRawData).subscribe((user: any) => {             
                this.toastr.success(snackBarMessages.successful_Login, "", {
                  timeOut: 3000,
                  progressBar: true,
                  enableHtml: true,
                  closeButton: false
                })
                this.isLogged = true;
                if(this.isLogged){
                  let currentUrl = this.router.url;
                  // const int = setInterval( () => {
                  //   var currentTime =  `${new Date().getHours()}:${(new Date().getMinutes()<10?'0':'') + new Date().getMinutes()}`;
                  //   if(this.todaysTime == currentTime)
                  //     {
                  //       clearInterval( int );
                  //     }
                  //   else
                  //   {
                      
                  //     this.router.routeReuseStrategy.shouldReuseRoute = () => false;
                  //     this.router.onSameUrlNavigation = 'reload';
                  //     this.router.navigate([currentUrl]);
                  //   }  
                  // },10000);
                  //}, this.miliseconds(0,this.refreshTime,0));
                  this.dialogRef.close({refreshtime:this.refreshTime,todaytime:this.todaysTime,residentdata:this.data});
                }
    }, (err: any) => {
      this.isLogged = false;
      this.isLoading = false;
      this.toastr.error(`${err.error.messages[0]}`, "", {
        timeOut: 3000,
        progressBar: true,
        enableHtml: true,
        closeButton: false
      })
    })
  }
 

  miliseconds(hrs,min,sec)
  {
      return((hrs*60*60+min*60+sec)*1000);
  }
  
}
