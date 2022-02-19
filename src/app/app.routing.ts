import { Routes } from "@angular/router";
import { FullComponent } from "./layouts/full/full.component";
import { AppBlankComponent } from "./layouts/blank/blank.component";
import { AuthGuardService, UnAuthGuardService } from './shared/auth-guard/auth-guard.service'
import { SupportComponent } from "./shared/support/support.component";
import { ContactComponent } from "./shared/support/contact/contact.component";
import { AddTextComponent } from "./shared/add-text/add-text.component";
import { WardSummaryComponent } from "./salesserviceadmin/wards/ward-summary/ward-summary.component";
import { KpiTestComponent } from './shared/kpi-test/kpi-test.component';
import { KpiSummaryDataComponent } from "./shared/kpi-summary-data/kpi-summary-data.component";
import { SendCommandsComponent } from "./salesserviceadmin/wards/send-commands/send-commands.component";

export const AppRoutes: Routes = [
	{
		path: "",
		component: FullComponent,
		children: [
			{
				path: "",
				redirectTo: "/auth/login",
				pathMatch: "full",
			},

			{
				path: "ca",
				loadChildren: () => import("./caregiver/caregiver.module").then((m) => m.caregiverModule),
				canActivate: [AuthGuardService]
			},
			{
                path: 'facility',
                loadChildren: () => import('./facilitywardadmin/facility.module').then(m => m.FacilityModule),
				canActivate: [AuthGuardService]
			},
			{
                path: 'hq',
                loadChildren: () => import('./customerhq/hq.module').then(m => m.HqModule),
				canActivate: [AuthGuardService]
			},
			{
                path: 'ssa',
                loadChildren: () => import('./salesserviceadmin/ssa.module').then(m => m.ssaModule)
			},
			{
                path: 'wa',
                loadChildren: () => import('./wardadmin/wa.module').then(m => m.waModule)
			},
			{
				path: 'support',
				component: SupportComponent,
				data: {
					title: 'Support',
					urls: [
						{ title: 'Home', url: '/facility/dashboard' },
						{ title: 'Support' }
					]
				}
			},
			{
				path: 'contact',
				component: ContactComponent,
				data: {
					title: 'Contact',
					urls: [
						{ title: 'Home', url: '/facility/dashboard' },
						{ title: 'Contact' }
					]
				}
			},
		],
	},
	{
		path: "",
		component: AppBlankComponent,
		children: [
			{
				path: "auth",
				loadChildren: () => import("./auth/authentication.module").then((m) => m.AuthenticationModule),
				canActivate: [UnAuthGuardService]
			},
			{
				path: 'test-add',
				component: AddTextComponent,
				data: {
					title: 'Test Add',
					urls: [
						{ title: 'Test Add' }
					]
				}
			},
			{
				path: 'ward-posting',
				component: WardSummaryComponent,
				data: {
					title: "Ward's summary update",
					urls: [
						{title: "ward's summary"}
					]
				}
			},
			{
				path: 'send-commands',
				component: SendCommandsComponent,
				data: {
					title: "Send commands from Dashboard to device",
					urls: [
						{title: "send commands"}
					]
				}
			},
			{
				path: 'notification/:posting',
				component: WardSummaryComponent,
				data: {
					title: "Notification posting",
					urls: [
						{title: "ward's summary"}
					]
				}
			},
			{
				path: 'kpi-test',
				component: KpiTestComponent,
			},
			{
				path: 'kpi-summary-data',
				component: KpiSummaryDataComponent
			}
		],
	},
	{
		path: 'readme',
		loadChildren: () => import('./readme/readme.module').then(m => m.ReadmeModule),
	},
	{
		path: "**",
		redirectTo: "auth/404",
	},
];
