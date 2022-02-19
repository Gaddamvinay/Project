import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from "ngx-toastr";
import * as moment from "moment";
import { CommonHttpService } from '../../shared/services/http-services/common-http.service';

import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl
} from '@angular/forms';
import { snackBarMessages } from '../../constants/constants';
import { CookieService } from 'ngx-cookie-service';
import { data } from 'jquery';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TokenStorageServiceService } from './token-storage-service.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: []
})
export class LoginComponent implements OnInit {
  public form: FormGroup;
  activeForm: FormGroup;
  emailForm: FormGroup;
  checked = true;
  rememberMe: any;
  isError: boolean = false;
  errorMsg = {
    message: '',
    name: '',
    code: ''
  }
  isLoading: boolean = false;
  constructor(private toastr: ToastrService, private tokenStorage: TokenStorageServiceService, private http: HttpClient,private fb: FormBuilder, private router: Router,private commonHttp: CommonHttpService, private cookieService: CookieService) {
  }
  isLoggedIn = false;
  roles: string[] = [];
  isLoginFailed = false;
  wardAdmin: any;
  ngOnInit() {
    this.form = this.fb.group({
      uname: [null, Validators.compose([Validators.required])],
      password: [null, Validators.compose([Validators.required])],
      rememberMe: [true]
    });
    if (this.tokenStorage.getToken()) {
      this.isLoggedIn = true;
      this.roles = this.tokenStorage.getUser().roles;
    }
    this.activeForm = this.fb.group({
      uname: [null, Validators.compose([Validators.required])],
      password: [null, Validators.compose([Validators.required])],
      cpassword: [null, Validators.compose([Validators.required])],
    });
    this.emailForm = this.fb.group({
      uname: [null, Validators.compose([Validators.required])],
      email: [null, Validators.compose([Validators.required])],
    });
    this.commonHttp.getUserDetails().subscribe((val: any) => {
      if(val.itemCount > 0)
      this.userNames = val.body.map(val => {
        return val.details.username
      })
    })
    localStorage.clear();
  }
  userNames = [];
  validate(){
    if(this.activateUser){
      if(Object.values(this.activeForm.value).filter(val => val !== null).length == 3){
        return this.activeForm.get('password').value !== this.activeForm.get('cpassword').value;
      }
    }
    return false;
  }
  emailVerification(){
    console.log(this.emailForm.value)
  }
  changePassword(){
    let changePassword={
      username: this.activeForm.get('uname').value,
      password: this.activeForm.get('password').value
    }
      this.commonHttp.updatePassword(changePassword).subscribe(data => {
        this.onSubmit();
        this.toastr.success(`<div class="action-text"><span class="font-400">${data}</span></div><div class="action-buttons"></div>`, "", {
          timeOut: 2000,
          progressBar: true,
          enableHtml: true,
          closeButton: false,
        });
      })
  }
  validateUser(name: any){
    if(name){
      return this.userNames.includes(name)
    }
    return true
  }

  loggedInAlready = false;
  emailVerify = false;
  activateUser = false;
  onSubmit() {
    // this.router.navigate(['/dashboard']);
    this.isLoading = true;
    this.isError = false;
    let signInRawData = {
      email: this.form.value.uname,
      password:  this.form.value.password
    };
    if(this.activateUser){
      signInRawData = {
        email: this.activeForm.value.uname,
        password:  this.activeForm.value.password
      };
    }
    this.commonHttp.signInNew(signInRawData).subscribe((user: any) => {
      let routerId= "";
      if(user.data.email_verify === 1){
        if(user.data.useractive === 'Y'){
          if(user.data.login_enabled === 'Yes'){
            this.tokenStorage.saveToken(user.data.access_token);
            this.tokenStorage.saveUser(user.data.id);
            switch(user.data.user_type){
              
              case "Caregiver" : {
                routerId= 'ca';
              let  caregiverStatus={
                  caregiver_id: user.data.caregiver_id,
                  currently_active: 1,
                }
                this.commonHttp.updateCaregiverStatus(caregiverStatus).subscribe(() => {})
                //login time capture
                const user1 = JSON.parse(localStorage.getItem('loggedInUser'))
                const date = new Date();
                const dbPostData = {
                  caregiverId: user.data.caregiver_id,
                  customerId: user1.customers.customer_id,
                  facilityId:user1.facilities[0].facility_id,
                  wardId:user1.wards[0].ward_id,
                  loginTime:moment(date).format("YYYY-MM-DD HH:mm:ss"),
                }
                this.commonHttp.storeLoginDetails(dbPostData).subscribe(() => {})
              //end 

                break;
              }
              case "CA" : {
                routerId= 'hq'
                break;
              }
    
              case "FA" : {
                routerId= 'facility'
                break;
              }
              case "SSA": {
                routerId= 'ssa'
                break;
              }
              case "WA": {
                routerId= 'wa'
                break;
              }
            }
            // this.updateAnalytics();
            localStorage.setItem('notifyPrevDate', `${new Date()}`);
            this.router.navigate([routerId]).then(() => {
              if(!this.activateUser && !this.emailVerify){
                this.toastr.success(snackBarMessages.successful_Login, "", {
                  timeOut: 3000,
                  progressBar: true,
                  enableHtml: true,
                  closeButton: false
                })
              }
              setTimeout(() => {
                localStorage.clear();
                this.router.navigate(['/','auth','login'])
              }, 86400000);
            });
          }else{
            this.isLoading = false;
            this.toastr.error('Your login is disabled. Please contact your admin', "", {
              timeOut: 5000,
              progressBar: true,
              enableHtml: true,
              closeButton: false
            })
          }
        }else{
          this.isLoading =false;
          this.activateUser = true;
          this.activeForm.get('uname').setValue(this.form.value.uname);
          this.toastr.success(snackBarMessages.successful_Login, "", {
            timeOut: 3000,
            progressBar: true,
            enableHtml: true,
            closeButton: false
          })
        }
      }else{
        this.isLoading = false;
        this.emailVerify = true;
        this.toastr.error('Please verify your email', "", {
          timeOut: 5000,
          progressBar: true,
          enableHtml: true,
          closeButton: false
        })
      }
    }, (err: any) => {
      this.isLoading = false;
      this.toastr.error(`${err.error.messages[0]}`, "", {
        timeOut: 3000,
        progressBar: true,
        enableHtml: true,
        closeButton: false
      })
    })
  }

  logout(){
    this.isLoading = true;
    let updateStatus={
      caregiver_id: "e9sr55j6a800000",
      currently_active: 0
    }
    this.commonHttp.updateCaregiverStatus(updateStatus).subscribe(() => {
      this.isLoading = false;
      this.loggedInAlready = false;
      this.toastr.success('Logged out successfully. Now you can login in this device', "", {
        timeOut: 3000,
        progressBar: true,
        enableHtml: true,
        closeButton: false
      })
    })
  }
  updateAnalytics(tab?: string) {
    let body = {
      activityType: 'login',
      page: 'ca-login',
      time : moment.now(),
      // userId: this.Auth.userInfo['custom:user_id'],
      // residentId: this.userId,
      // tab: tab
    }
  }
  private setCookies(userName: string, password: string, rememberMe: boolean) {
    const expiryDate = new Date();
    expiryDate.setSeconds(expiryDate.getSeconds() + 3600);
    this.cookieService.set('rememberMe', `${rememberMe}`, expiryDate, '/');
    this.cookieService.set('userName', userName, expiryDate, '/');
    this.cookieService.set('password', password, expiryDate, '/');
  }
}
