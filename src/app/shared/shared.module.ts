import { NgModule } from "@angular/core";

import { MenuItems } from "./menu-items/menu-items";
import { AccordionAnchorDirective, AccordionLinkDirective, AccordionDirective } from "./accordion";
import { ConformationPopComponent } from "./conformation-pop/conformation-pop.component";
import { TimePipe } from './time.pipe';
import { TimeAgoPipe } from './time-ago.pipe';
import { DownFallRiskComponent } from "../caregiver/resident-view-new/resident-view/questionnaire/down-fall-risk/down-fall-risk.component";
import { StayIndependentComponent } from "../caregiver/resident-view-new/resident-view/questionnaire/stay-independent/stay-independent.component";
import { MedicalFormComponent } from "../caregiver/resident-view-new/resident-view/medical-information/medical-form/medical-form.component";
import { CommonAddModelComponent } from "./common-add-model/common-add-model.component";
import { TableComponent } from "./table/table.component";
import { MaterialModule } from "../material-module";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FlexLayoutModule } from "@angular/flex-layout";
import { FilterComponent } from './filter/filter.component';
import { NgOtpInputModule } from 'ng-otp-input';
import { NotificationsComponent } from './notifications/notifications.component';
import { CommonEditModelComponent } from "./common-edit-model/common-edit-model.component";
import { SupportComponent } from "./support/support.component";
import { ContactComponent } from "./support/contact/contact.component";
import { ViewModalComponent } from './view-modal/view-modal.component';
import { AddTextComponent } from './add-text/add-text.component';
import { CommonTestAddComponent } from './add-text/common-test-add/common-test-add.component';
import { CommonTestEditComponent } from './add-text/common-test-edit/common-test-edit.component';
import { AddResientTestComponent } from './add-text/add-resient-test/add-resient-test.component';
import { GooglePlaceModule } from "ngx-google-places-autocomplete";
import { NgApexchartsModule } from "ng-apexcharts";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { UserStatisticsComponent } from "./dashboard/user-statistics/user-statistics.component";
import { ResidentsSummaryDashComponent } from "./dashboard/residents-summary/residents-summary.component";
import { ResidentStatisticsComponent } from "./dashboard/caregiver-summary/resident-statistics.component";
import { QuickSummaryComponent } from "./dashboard/quick-summary/quick-summary.component";
import { BatteryStatisticsComponent } from "./dashboard/battery-statistics/battery-statistics.component";
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { KpiTestComponent } from './kpi-test/kpi-test.component';
import { KpiSummaryDataComponent } from './kpi-summary-data/kpi-summary-data.component';
import { ChangePasswordComponent } from "../layouts/full/change-password/change-password.component";
@NgModule({
	declarations: [
		AccordionAnchorDirective, 
		AccordionLinkDirective, 
		AccordionDirective, 
		ConformationPopComponent, 
		TimePipe, 
		TimeAgoPipe,
		TableComponent,
		CommonAddModelComponent,
		DownFallRiskComponent,
		StayIndependentComponent,
		ChangePasswordComponent,
		MedicalFormComponent,
		FilterComponent,
		CommonEditModelComponent,
		NotificationsComponent,
		SupportComponent,
		ContactComponent,
		ViewModalComponent,
		AddTextComponent,
		CommonTestAddComponent,
		CommonTestEditComponent,
		AddResientTestComponent,
		DashboardComponent,
		UserStatisticsComponent,
		ResidentsSummaryDashComponent,
		ResidentStatisticsComponent,
		QuickSummaryComponent,
		BatteryStatisticsComponent,
		KpiTestComponent,
		KpiSummaryDataComponent
	],
	imports: [
		MaterialModule,
		CommonModule,
		ReactiveFormsModule,
		FlexLayoutModule,
		FormsModule,
		NgOtpInputModule,
		GooglePlaceModule,
		NgApexchartsModule,
		NgxDaterangepickerMd
	],
	exports: [
		AccordionAnchorDirective, 
		AccordionLinkDirective, 
		NotificationsComponent, 
		CommonEditModelComponent,
		AccordionDirective,
		TimePipe,
		TimeAgoPipe,
		TableComponent,
		DownFallRiskComponent,
		StayIndependentComponent,
		MedicalFormComponent,
		UserStatisticsComponent,
		ResidentsSummaryDashComponent,
		ResidentStatisticsComponent,
		QuickSummaryComponent,
		BatteryStatisticsComponent
	],
	providers: [MenuItems],
	entryComponents: [ConformationPopComponent],
})
export class SharedModule {}
