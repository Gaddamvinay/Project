import { Component, OnInit, ɵConsole } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from "ngx-toastr";
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { snackBarMessages } from '../../constants/constants';
import { CookieService } from 'ngx-cookie-service';
// import { CustomValidators  } from 'ngx-custom-validators';
import { CustomValidators } from '../../shared/custom-validators';



@Component({
  // moduleId: module.id,
  selector: 'resetpassword',
  templateUrl: 'resetpassword.component.html',
  styleUrls: ['resetpassword.component.scss']
})
export class ResetpasswordComponent implements OnInit {

  public isLoading: boolean = false;
  public errorMessage: string;
  public resetForm: FormGroup;

  public errorMsg: string = "";
  public isError: boolean;
  public domains: any;
  // public passRegex :string = '^[]{3}[0-9]{3}$';
 
  private _redirectTo: string = '';

  constructor(private _fb: FormBuilder, private _router: Router, private _activatedRoute: ActivatedRoute, private toastr: ToastrService
  ) {
    this._activatedRoute.queryParams.subscribe(params => {
      this._redirectTo = params.r;
      this.initForm();
    });
  }
  // ngOnInit() {

  //   this.resetForm = this._fb.group({
  //     email: [
  //       null,
  //       Validators.compose([Validators.required])
  //     ]
  //   });

  //   this.resetForm = this._fb.group({
  //     password: [null ,[Validators.required]],
  //     confirm_password: [null ,[Validators.required]]
  //   });
  // }

  ngOnInit() {

  }

  initForm() {

    this.resetForm = this._fb.group({
      // password: ['', Validators.required],
      //  password: ['', [Validators.required, Validators.pattern("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$")]],
      password: [ null, Validators.compose([
        // 1. Password Field is Required
        Validators.required,
        // 2. check whether the entered password has a number
        CustomValidators.patternValidator(/\d/, { hasNumber: true }),
        // 3. check whether the entered password has upper case letter
        CustomValidators.patternValidator(/[A-Z]/, { hasCapitalCase: true }),
        // 4. check whether the entered password has a lower-case letter
        CustomValidators.patternValidator(/[a-z]/, { hasSmallCase: true }),
        // 5. check whether the entered password has a special character
        CustomValidators.patternValidator(/[#?!@$%^&*-]/, { hasSpecialCharacters: true }),
        // 6. Has a minimum length of 8 characters
        Validators.minLength(8)])
     ],
      // ^(?=.*[A-Z])(?=.*[a-z])(?=.*[@$!%*?&])(?=.*[0-9])[A-Za-z\d@$!%*?&]{8,}$
      confirm_password: [null, Validators.compose([Validators.required])]
    },
    {
      // check whether our password and confirm password match
      validator: CustomValidators.passwordMatchValidator
   });
  }

    onSubmit() {

      if ((this.resetForm.get('password').value !== this.resetForm.get('confirm_password').value) || this.resetForm.invalid) {
        return;
      }
      this.isLoading = true;
      this.errorMsg = '';
      this.isError = false;
      let payload = {
        newPassword: this.resetForm.get('password').value,
        userAttributes: {},
        email: ""
      }
      this._doReset(payload);
    }
    
    // private _doReset(payload: {
    //   newPassword: string,
    //   userAttributes: any,
    //   email: string
    // })
    private _doReset(payload: any) {
      // this._cognitoService.resetNewUserPassword(payload).subscribe((data) => {
      //   window.localStorage.removeItem('_isNewPassword');
      //   this._router.navigate(['/']).then(() => {
      //     this.toastr.success(snackBarMessages.successful_Login, "", {
      //       timeOut: 3000,
      //       progressBar: true,
      //       enableHtml: true,
      //       closeButton: false
      //     })
      //   });
      //   this.isLoading = false;
      // }, (error) => {
      //   this.errorMsg = error.message || error;
      //   this.isError = true;
      //   this.isLoading = false;
      // })
    }
  }





  // public passSmallCaseRegex :string = '[^A-Z]'
  // public passCapitalCaseRegex :string = '^(?=[^A-Z]*[A-Z])'
  // public passNumaricCaseRegex :string = '^(?=[^0-9])'
  // public passSpecialCharacterRegex :string = '^(?=.*[@$!%*?&])'

  // private _redirectTo: string = '';

  // constructor(private _fb: FormBuilder, private _router: Router, private _activatedRoute: ActivatedRoute, private _cognitoService: CognitoService, private toastr: ToastrService
  // ) {
  //   this._activatedRoute.queryParams.subscribe(params => {
  //     this._redirectTo = params.r;
  //     this.initForm();
  //   });
  // }
  // // ngOnInit() {

  // //   this.resetForm = this._fb.group({
  // //     email: [
  // //       null,
  // //       Validators.compose([Validators.required])
  // //     ]
  // //   });

  // //   this.resetForm = this._fb.group({
  // //     password: [null ,[Validators.required]],
  // //     confirm_password: [null ,[Validators.required]]
  // //   });
  // // }

  // ngOnInit() {

  // }

  // onTypePass(passValue: string){
  //   // console.log('onTypePass', event)

  //   console.log('passSmallCaseRegex ', passValue.includes('.*[0-9])')

  
  //   // if(passValue.includes(this.passSmallCaseRegex)){
  //   //   console.log('passSmallCaseRegex passed')
  //   // }



    

  //   // if(this.passSmallCaseRegex.match(event.target.value)){
  //   //   console.log('passSmallCaseRegex Passed')
  //   // } else  if(this.passCapitalCaseRegex.match(event.target.value)){
  //   //   console.log('passCapitalCaseRegex Passed')
  //   // } else   if(this.passSpecialCharacterRegex.match(event.target.value)){
  //   //   console.log('passSpecialCharacterRegex Passed')
  //   // } else  if(this.passNumaricCaseRegex.match(event.target.value)){
  //   //   console.log('passNumaricCaseRegex Passed')
  //   // }
  // }



  // initForm() {

  //   this.resetForm = this._fb.group({
  //     password: ['', Validators.required],
  //     // password: ['', [Validators.required, Validators.pattern(this.passRegex)]],
  //     confirm_password: ['', Validators.required]
  //   });
  // }

  //   onSubmit() {
  //     // console.log('adadadda ', this.resetForm.value);

  //     if ((this.resetForm.get('password').value !== this.resetForm.get('confirm_password').value) || this.resetForm.invalid) {
  //       return;
  //     }
  //     console.log('SAASASASSASASASA', this.resetForm.value)
  //     this.isLoading = true;
  //     this.errorMsg = '';
  //     this.isError = false;
  //     let payload = {
  //       newPassword: this.resetForm.get('password').value,
  //       userAttributes: {},
  //       email: ""
  //     }
  //     this._doReset(payload);
  //   }

  //   private _doReset(payload: any) {
  //     console.log('resetNewUserPassword', payload)
  //     this._cognitoService.resetNewUserPassword(payload).subscribe((data) => {
  //       window.localStorage.removeItem('_isNewPassword');
  //       this._router.navigate(['/']).then(() => {
  //         this.toastr.success(snackBarMessages.successful_Login, "", {
  //           timeOut: 3000,
  //           progressBar: true,
  //           enableHtml: true,
  //           closeButton: false
  //         })
  //       });
  //       this.isLoading = false;
  //     }, (error) => {
  //       this.errorMsg = error.message || error;
  //       this.isError = true;
  //       this.isLoading = false;
  //     })
  //   }
  // }

  





  



