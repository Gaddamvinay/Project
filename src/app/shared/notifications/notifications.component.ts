import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  notifications: any[] = [
    {
      title: "Alexandra J's wearable has low battery (less than %15). Please charge the wearable soon.",
      class: 'warning'
    },
    {
      title: "David Williams's wearable has low battery (less than 7%). Please charge the wearable soon.",
      class: 'critical'
    }
  ]
  listExpanded = 0;
  changeExpandedIndex(index: number){
		if(this.listExpanded === index){
			this.listExpanded = -1;
		}else {
			this.listExpanded = index;
		}
	}

}
