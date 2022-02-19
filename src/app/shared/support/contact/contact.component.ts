import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { TimeFormatService } from '../../../shared/services/time-format.service';
import { Router } from '@angular/router';
import { CommonHttpService } from '../../../shared/services/http-services/common-http.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  contactForm: FormGroup;
  loggedInUser: any;
  countries = [
    {
        value: 'Sweden',
        label: 'Sweden'
    }
  ]
  titleShow = false;
  today = new Date();
  user: any;
  constructor(private http: HttpClient, private commonHttp: CommonHttpService,private router: Router,private timeFormat: TimeFormatService, private _fb: FormBuilder, private toaster: ToastrService) { 
		this.contactForm = this._fb.group({
			country: [this.countries[0].value],
			firstName: [null, [Validators.required, Validators.pattern('^[a-zA-Z0-9äåö_]*$')]],
			lastName: [null, [Validators.required, Validators.pattern('^[a-zA-Z0-9äåö_]*$')]],
			email: [null, [Validators.required]],
			question: ['Physical damage'],
			message: [null, [Validators.required]]
    });
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    this.user = user;
    switch(user['user_type']){

      case "Caregiver" : {
        this.startLink = 'ca'
        break;
      }
      case "CA" : {
        this.startLink = 'hq'
        break;
      }

      case "FA" : {
        this.startLink = 'facility'
        break;
      }
      case "SSA" : {
        this.startLink = 'ssa'
        break;
      }
      case "WA" : {
        this.startLink = 'wa'
        break;
      }

    }
    this.getUserInfo();
  }
  startLink = '';
  navigate(){
    this.router.navigate(['/', this.startLink])
  }
  getFormat(){
	const format = this.timeFormat.getFormat();
	return format;
  }
  changeFormat(format: string){
	this.timeFormat.changeFormat(format);
  }
  ngOnInit(): void {
  }
  /**
   * Function to post contact question
   */
  sendQuestion(){
		const postData = {
			first_name: this.contactForm.value.firstName,
			last_name: this.contactForm.value.lastName,
      email: this.contactForm.value.email,
      enquiry: this.contactForm.value.message,
			message: this.contactForm.value.message,
			country: this.contactForm.value.country
		}
		this.commonHttp.sendContact(postData).subscribe(() =>{
			this.sendSuccessfully();
			this.contactForm.reset();
			this.getUserInfo();
		})
  }
  sendSuccessfully() {
		this.toaster.success('<div class="action-text"><span class="font-400">Question is successfully send</span></div><div class="action-buttons"></div>', "", {
			timeOut: 2000,
			progressBar: true,
			enableHtml: true,
			closeButton: false,
		});
	}
  /**
   * Function to get user info
   */
  getUserInfo(){
    const data = JSON.parse(localStorage.getItem('loggedInUser'))
    if(data){
        const {first_name: firstName, last_name: lastName, email} = data;
        this.contactForm.patchValue({
            firstName,
            lastName,
            email
        })
    }	
  }
}
