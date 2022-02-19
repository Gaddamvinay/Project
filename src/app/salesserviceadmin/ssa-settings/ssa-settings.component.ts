import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-ssa-settings',
  templateUrl: './ssa-settings.component.html',
  styleUrls: ['./ssa-settings.component.scss']
})
export class SsaSettingsComponent implements OnInit {

  constructor(@Optional() @Inject(MAT_DIALOG_DATA) public data: any, private matDialogRef: MatDialogRef<SsaSettingsComponent>,  private toastr: ToastrService) { }
	
  	access: boolean = false;
	ngOnInit(): void {

	}
	/* Validating function to check whether change are made or not */
	checkChangeMade() {
		
	}
	getNotificationName(name: any) {
		const notificationName = name.split('_').join(" ");
		return notificationName;
	}
	showWarning = false;
	falseKey: any;
	falseKeyValue: any;
	/* Function to change the notification in the form*/
	change(key: any, event: any) {
		
	}
	/* Function to reverse the change of the notification settings */
	reverseChange() {
	}
	makeChange() {
		
	}
	/*Succes toaster */
	saveConfig() {
		this.toastr.success('<div class="action-text"><span class="font-400">Configuration is successfully saved</span></div><div class="action-buttons"></div>', "", {
			timeOut: 2000,
			progressBar: true,
			enableHtml: true,
			closeButton: false,
		});
	}
}
