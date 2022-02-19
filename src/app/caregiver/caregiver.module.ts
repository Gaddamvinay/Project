import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { MatDialogModule } from "@angular/material/dialog";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DataTablesModule } from "angular-datatables";
import { MaterialModule } from "../material-module";
import { MatStepperModule } from "@angular/material/stepper";
import { FlexLayoutModule } from "@angular/flex-layout";
import { QuillModule } from "ngx-quill";
import { CalendarModule, DateAdapter, CalendarDateFormatter } from "angular-calendar";
import { adapterFactory } from "angular-calendar/date-adapters/date-fns";
import { PerfectScrollbarModule } from "ngx-perfect-scrollbar";
import { DragulaModule } from "ng2-dragula";
import { AgmCoreModule } from '@agm/core';
import { Ng2SearchPipeModule } from "ng2-search-filter";
import { caregiverRoutes } from "./caregiver.routing";
import { DialogContent, FilterComponent } from "./residents/residents.component";
import { ResidentComponent } from "./residents/residents.component";
import { ResidentService } from "./residents/resident.service";
import { NgxDatatableModule } from "@swimlane/ngx-datatable";
import { ModalModule } from "../_modal";
// import { ResidentviewComponent, DominateModelComponent } from "./residentview/residentview.component";
import { ResidentViewComponent } from './resident-view-new/resident-view/resident-view.component';
import { ChartistModule } from "ng-chartist";
import { ChartsModule } from "ng2-charts";
import { NgApexchartsModule } from "ng-apexcharts";
import { GaugeModule } from 'angular-gauge';
import { NgxDaterangepickerMd } from "ngx-daterangepicker-material";
import { questionnireService } from "./questionnaire-service/ques.service";
import { SharedModule } from './../shared/shared.module'
// import { ResidentSettingsComponent } from './resident-settings/resident-settings.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { OverviewComponent } from "./resident-view-new/resident-view/overview/overview.component";
import { TrendReportComponent } from "./resident-view-new/resident-view/trend-report/trend-report.component";
import { QuestionnaireComponent } from "./resident-view-new/resident-view/questionnaire/questionnaire.component";
import { MedicalInformationComponent } from "./resident-view-new/resident-view/medical-information/medical-information.component";
import { PhysioTestComponent } from "./resident-view-new/resident-view/physio-test/physio-test.component";
import { LocationComponent } from "./resident-view-new/resident-view/location/location.component";
import { NotificationComponent } from "./resident-view-new/resident-view/notification/notification.component";
import { InsightComponent } from "./resident-view-new/resident-view/insight/insight.component";
import { SavedComponent } from "./resident-view-new/resident-view/saved/saved.component";
import { SixMWTComponent } from "./resident-view-new/resident-view/physio-test/six-mwt/six-mwt.component";
import { TUGComponent } from "./resident-view-new/resident-view/physio-test/tug/tug.component";
import { ThirtySCSComponent } from "./resident-view-new/resident-view/physio-test/thirty-scs/thirty-scs.component";
import { ResidentSettingsComponent } from "./resident-view-new/resident-view/notification/resident-settings/resident-settings.component";
import { ProfileComponent } from "./resident-view-new/resident-view/profile/profile.component";
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";
import { TrackResidentComponent } from './resident-view-new/resident-view/location/track-resident/track-resident.component';
import { FilterResidentByNameComponent } from './notifications/filterComponent/filter-resident-by-name/filter-resident-by-name.component';
import { FilterResidentByTypeComponent } from './notifications/filterComponent/filter-resident-by-type/filter-resident-by-type.component';
import { DischargeResidentComponent } from './resident-view-new/resident-view/discharge-resident/discharge-resident.component';
import { InterventionsComponent } from './interventions/interventions.component';
@NgModule({
	imports: [
		CommonModule,
		RouterModule.forChild(caregiverRoutes),
		MaterialModule,
		MatStepperModule,
		MatDialogModule,
		FormsModule,
		ModalModule,
		ReactiveFormsModule,
		SharedModule,NgMultiSelectDropDownModule.forRoot(),
		CalendarModule.forRoot({
			provide: DateAdapter,
			useFactory: adapterFactory,
		}),
		GaugeModule.forRoot(),
		FlexLayoutModule,
		QuillModule.forRoot(),
		DragulaModule.forRoot(),
		AgmCoreModule.forRoot({
			// please get your own API key here:
			// https://developers.google.com/maps/documentation/javascript/get-api-key?hl=en
			apiKey: 'AIzaSyDUVdWkTA9UL3cXBLq7axvrG0muxQxvg2U'
		}),
		PerfectScrollbarModule,
		Ng2SearchPipeModule,
		NgxDatatableModule,
		DataTablesModule,
		ChartistModule,
		ChartsModule,
		NgApexchartsModule,
		NgxDaterangepickerMd.forRoot(),
	],
	declarations: [
		ResidentComponent, 
		DialogContent,
		FilterComponent,
		ResidentViewComponent,
        OverviewComponent,
        TrendReportComponent,
        QuestionnaireComponent,
        PhysioTestComponent,
        MedicalInformationComponent,
        LocationComponent,
        NotificationComponent,
        InsightComponent,
        SavedComponent,
        SixMWTComponent,
        TUGComponent,
        ThirtySCSComponent,
		ResidentSettingsComponent, 
		ProfileComponent,
		NotificationsComponent, 
		TrackResidentComponent, FilterResidentByNameComponent, FilterResidentByTypeComponent, DischargeResidentComponent, InterventionsComponent,
	],
	providers: [ResidentService, questionnireService],
	entryComponents: [DialogContent,FilterComponent, ResidentSettingsComponent],
})
export class caregiverModule {}
