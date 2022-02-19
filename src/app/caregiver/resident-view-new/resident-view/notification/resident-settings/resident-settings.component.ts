import { Component, OnInit, Optional, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { CommonHttpService } from "../../../../../shared/services/http-services/common-http.service";
import { ToastrService } from "ngx-toastr";

@Component({
	selector: "app-resident-settings",
	templateUrl: "./resident-settings.component.html",
	styleUrls: ["./resident-settings.component.scss"],
})
export class ResidentSettingsComponent implements OnInit {
	constructor(@Optional() @Inject(MAT_DIALOG_DATA) public data: any, private matDialogRef: MatDialogRef<ResidentSettingsComponent>,
	private commonHttp: CommonHttpService, private toastr: ToastrService) { }
	residentData: any;
	updatedNotifications: any;
	prevNotifications: any;
	notifications: any;
	wardId = '';
	wardInfo: any = [];
	IsChecked: boolean = true;
	type: string = '';
	titleShow = false;
	
	orderedNotificatons = [
		{
			label: 'Fall alert',
			title: 'when_a_resident_fall_down'
		},
		{
			label: 'Night walk alert',
			title: 'when_a_resident_walks_during_night_time'
		},
		{
			label: 'Critical low battery',
			title: 'when_the_battery_less_than_7'
		},
		{
			label: 'Low battery',
			title: 'when_the_battery_less_than_15'
		},
		{
			label: 'No data',
			title: 'how_often_is_the_information_sent_from_the_wearable'
		}
	]
	ngOnInit(): void {
		this.residentData = this.data.payload;
		this.type = this.data.type;
		this.updatedNotifications = { ...this.residentData.notification_settings };
		this.prevNotifications = { ...this.residentData.notification_settings };

		let profileDetails = { ...this.data.payload };
		const user = JSON.parse(localStorage.getItem('loggedInUser'));
		if (user.user_type === "Caregiver") {
			const data = JSON.parse(localStorage.getItem('loggedInUser'));
			this.wardInfo = data.wards;
		}

	}
	/* Validating function to check whether change are made or not */
	checkChangeMade() {
		const prevValues = Object.values({ ...this.prevNotifications });
		const updateValues = Object.values({ ...this.updatedNotifications });
		let returnBool = true;
		prevValues.forEach((data, i) => {
			if (data !== updateValues[i]) {
				returnBool = false;
			}
		})
		if (this.type === 'resident') {
			return returnBool;
		} else {
			return this.wardId === ''
		}
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
		if (!event.checked && this.prevNotifications[key]) {
			this.showWarning = true;
			this.falseKey = key;
			this.falseKeyValue = event.checked;
		} else {
			this.updatedNotifications[key] = event.checked;
		}
	}
	/* Function to reverse the change of the notification settings */
	reverseChange() {
		this.orderedNotificatons = [];
		this.updatedNotifications[this.falseKey] = !this.falseKeyValue;
		this.showWarning = false;
		setTimeout(() => {
			this.orderedNotificatons = [
				{
					label: 'Fall alert',
					title: 'when_a_resident_fall_down'
				},
				{
					label: 'Night walk alert',
					title: 'when_a_resident_walks_during_night_time'
				},
				{
					label: 'Critical low battery',
					title: 'when_the_battery_less_than_7'
				},
				{
					label: 'Low battery',
					title: 'when_the_battery_less_than_15'
				},
				{
					label: 'No data',
					title: 'how_often_is_the_information_sent_from_the_wearable'
				}
			]
		}, 10);
	}
	makeChange() {
		this.updatedNotifications[this.falseKey] = this.falseKeyValue;
		this.showWarning = false;
	}
	/* Function for updating the notification settings*/
	updateNotifications() {
		const putData = {}
		if (this.residentData.role.toUpperCase() === 'CAREGIVER') {
			Object.assign(putData, { setting_type: 'CAREGIVER' });
			Object.assign(putData, { care_giver_id: this.residentData.userId });
			Object.assign(putData, { ward_id: this.residentData.org_unit_id })
			Object.assign(putData, { ward_id: this.wardId });
		} else {
			Object.assign(putData, { setting_type: 'USER' })
			Object.assign(putData, { user_id: this.residentData.userId });
		}
		Object.assign(putData, this.updatedNotifications);
		// this.commonHttp.updateSettings(putData).subscribe(() => {
		// 	this.saveConfig();
		// 	this.matDialogRef.close(true);
		// })
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
