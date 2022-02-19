import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  disable = false;
  constructor() {
    let user: any = localStorage.getItem('loggedInUser');
    if(user){
      this.disable = true;
    }
  }
  
  ngOnInit(): void {
  }

}
