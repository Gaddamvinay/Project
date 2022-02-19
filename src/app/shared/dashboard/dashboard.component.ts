import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  forType: string = '';
  type: string = '';
  constructor() { 
    let user: any = localStorage.getItem('loggedInUser');
		if(user){
			user = JSON.parse(user);
      switch(user.user_type){
        case "CA" : {
          this.forType = '';
          this.type = 'customer'
          break;
        }
        case "FA" : {
          this.forType = '';
          this.type = 'facility'
          break;
        }
        case "SSA" : {
          this.forType = '(all customers)';
          this.type = 'dashboard'
          break;
        }
        case 'WA': {
          this.forType = '';
          this.type = 'ward';
        }
      }
    }
  }
  ngOnInit(): void {
  }
}
