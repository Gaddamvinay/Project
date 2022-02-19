import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from './../../shared/services/common.service'; import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl
} from '@angular/forms';
import { CustomValidators } from 'ngx-custom-validators';
import { snackBarMessages as toasterMessages } from '../../constants/constants';
import { CommonAddModelComponent } from '../../shared/common-add-model/common-add-model.component';
import { CommonHttpService } from '../../shared/services/http-services/common-http.service';


@Component({
  selector: 'app-forgot',
  templateUrl: './forgot.component.html',
  styleUrls: []
})
export class ForgotComponent implements OnInit {
  public isLoading: boolean = false;
  public errorMessage: string;
  public forgotPwdForm: FormGroup;
  public newPwdForm: FormGroup;
  public getVerificationForm: boolean = true;
  public newPasswordForm: boolean;
  public resetSuccess: boolean;
  public form: FormGroup;
  public errorMsg: string = "";
  public isError: boolean;
  constructor(public common: CommonService,
    private http: HttpClient,
    private commonHttp: CommonHttpService, private toastr: ToastrService, private fb: FormBuilder, private router: Router) { }

  ngOnInit() {

    this.form = this.fb.group({
      email: [null, Validators.compose([Validators.required])]
    });

    /////////////////////
    this.commonHttp.getUserDetails().subscribe((val: any) => {
      if (val.itemCount > 0)
        this.userNames = val.body.map(val => {
          return val.details.email
        })
    })
    localStorage.clear();
  }
  userNames = [];
  users: any[] = [];
  emailCheck = true;
  checkEmails(email: string) {
    const exists = this.users.find(val => val.email === email);
    if (exists) {
      this.emailCheck = false;
      return true;
    } else {
      this.emailCheck = true;
      return false;
    }
  }

  validateUser(name: any) {
    if (name) {
      return this.userNames.includes(name)
    }
    return true
  }
  usernameCheck = true;
  checkUserName(username: string) {
    const exists = this.users.find(val => val.username === username);
    if (exists) {
      this.usernameCheck = false;
      return true;
    } else {
      this.usernameCheck = true;
      return false;
    }
  }
  ////////////


  generateP(str: string, length: number) {
    let pass = '';
    for (let i = 1; i <= length; i++) {
      let char = Math.floor(Math.random() * str.length + 1);
      pass += str.charAt(char)
    }
    return pass;
  }
  onSubmit() {
    this.isLoading = true;

    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890/;[]\=-)(*&^%$#@!~";
    const lengthOfCode = 10
    const password = this.generateP(possible, lengthOfCode);

    const dbPostData = {

      password: password,
      email: this.form.get('email').value,
      useractive: 'N'
    }
    ///////////////
    this.commonHttp.forgetPassword(dbPostData).subscribe(data => {
      this.router.navigate(['/auth/login']).then(() => {
        this.toastr.success(`<div class="action-text"><span class="font-400">Password is send to email please check your email</span></div><div class="action-buttons"></div>`, "", {
          timeOut: 3000,
          progressBar: true,
          enableHtml: true,
          closeButton: false
        })
      });
      //console.log("email: "+this.form.get('email').value);
      //console.log("password"+password);
    })
    ////////////////

    //  this.dialogRef.close(false);


    // this.sendVerificationCode(this.forgotPwdForm.get('email').value)
    // this._cognitoService.sendVerificationCodeForForgotPassword(this.form.get('email').value).subscribe((data) => {

    //   this.isLoading = false;

    //   if (data.type && data.type === 'deliveryMedium') {
    //     this.getVerificationForm = false;
    //   }
    //   this.toastr.info(toasterMessages.verification_code_sent, "", {
    //     timeOut: 3000,
    //     progressBar: true,
    //     enableHtml: true,
    //     closeButton: false,
    //   })
    // }, (error) => {

    //   this.errorMsg = error.message || error;
    //   this.isError = true;
    //   this.isLoading = false;
    //   this.toastr.error(`${this.errorMsg}`, "", {
    //     timeOut: 3000,
    //     progressBar: true,
    //     enableHtml: true,
    //     closeButton: false
    //   });
    // })
  }

  resetPassword() {
    // this._cognitoService.verifyForgotPasswordCode(this.newPwdForm.get('verificationCode').value, this.newPwdForm.get('password').value).subscribe((data) => {
    //   this.isLoading = false;
    //   if (data.type && data.type == 'success') {
    //     this.newPwdForm.reset();
    //     this.resetSuccess = true;
    //     this.router.navigate(['/auth/login']).then(() => {
    //       this.toastr.info(toasterMessages.reset_password, "", {
    //         timeOut: 3000,
    //         progressBar: true,
    //         enableHtml: true,
    //         closeButton: false
    //       })
    //     });
    //   }      
    // }, (error) => {

    //   this.errorMsg = error.message || error;
    //   this.isError = true;
    //   this.resetSuccess = false;
    //   this.isLoading = false;
    //   this.toastr.error(`${this.errorMsg}`, "", {
    //     timeOut: 3000,
    //     progressBar: true,
    //     enableHtml: true,
    //     closeButton: false
    //   });
    // })
  }

  // onSubmit() {
  //   this.router.navigate(['/authentication/login']);
  // }
}
