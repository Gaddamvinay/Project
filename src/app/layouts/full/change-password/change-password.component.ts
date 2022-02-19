import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {

  isLoading = true;
  @Output() password = new EventEmitter();
  constructor(private _fb: FormBuilder) {
    const user: any = JSON.parse(localStorage.getItem('loggedInUser'));
    this.activeForm = this._fb.group({
      uname: [user.username, Validators.compose([Validators.required])],
      password: [null, Validators.compose([Validators.required])],
      cpassword: [null, Validators.compose([Validators.required])],
    });
    this.activeForm.valueChanges.subscribe(data => {
      if(!this.validate() && this.activeForm.valid){
        this.password.emit(this.activeForm.get('password').value)
      }
    })
  }
  validate(){
    if(Object.values(this.activeForm.value).filter(val => val !== null).length == 3){
      return this.activeForm.get('password').value !== this.activeForm.get('cpassword').value;
    }
  }
  activeForm: FormGroup;

  ngOnInit(): void {
  }

}
