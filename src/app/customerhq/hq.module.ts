import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material-module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { QuillModule } from 'ngx-quill';
import { CalendarModule, DateAdapter, CalendarDateFormatter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { HqRoutes } from './hq.routing';
import { NgxPaginationModule } from 'ngx-pagination';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgApexchartsModule } from "ng-apexcharts";
import { WardsComponent } from './wards/wards.component';
import { SharedModule } from '../shared/shared.module';
import { FacilitiesComponent } from './facilities/facilities.component';
import { questionnireService } from '../caregiver/questionnaire-service/ques.service';
import { InnerFacilityComponent } from './facilities/inner-facility/inner-facility.component';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { ChqSettingsComponent } from './chq-settings/chq-settings.component';
import { InnerWardComponent } from './wards/inner-ward/inner-ward.component';
// import { InnerWardComponent } from './wards/inner-ward/inner-ward.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(HqRoutes),
        MaterialModule,
        SharedModule,
        FormsModule,
        ReactiveFormsModule,
        CalendarModule.forRoot({
            provide: DateAdapter,
            useFactory: adapterFactory
        }),
        FlexLayoutModule,
        QuillModule.forRoot(),
       NgApexchartsModule,
        PerfectScrollbarModule,
        Ng2SearchPipeModule,
        DragDropModule,
        NgxPaginationModule,
        NgxDaterangepickerMd.forRoot()
    ],
    declarations: [
        WardsComponent,
        FacilitiesComponent,
        InnerFacilityComponent,
        ChqSettingsComponent,
        InnerWardComponent,
    ],
    providers: [
        questionnireService
    ],
    entryComponents: []
})
export class HqModule { }
