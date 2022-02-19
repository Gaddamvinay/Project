import { Routes } from "@angular/router";
import { ResidentComponent } from "./residents/residents.component";
import { ResidentViewComponent } from './resident-view-new/resident-view/resident-view.component';
import { NotificationsComponent } from "./notifications/notifications.component";
import { InterventionsComponent } from "./interventions/interventions.component";

export const caregiverRoutes: Routes = [
	{
		path: "",
		children: [
			{
                path: '',
                redirectTo: 'residents'
            },
			{
				path: "residents",
				component: ResidentComponent,
				data: {
					title: "Residents",
					urls: [{ title: "Home", url: "/dashboard" }, { title: "Residents" }],
				},
			},
			{
				path: "residents/residentview/:userId",
				component: ResidentViewComponent,
				data: {
					title: "Resident Dashboard",
					urls: [{ title: "Home", url: "/dashboard" }, { title: "Resident Dashboard" }],
				},
			},
			{
				path: "notifications",
				component: NotificationsComponent,
				data: {
					title: "Notifications",
					urls: [{ title: "Home", url: "/dashboard" }, { title: "Notifications" }],
				},
			},
			{
				path: "interventions",
				component: InterventionsComponent,
				data: {
					title: "Notifications",
					urls: [{ title: "Home", url: "/dashboard" }, { title: "INTERVENTIONS" }],
				},
			}
		],
	},
];
