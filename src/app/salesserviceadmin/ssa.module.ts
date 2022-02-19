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
import { SsaRoutes } from './ssa.routing';
import { NgxPaginationModule } from 'ngx-pagination';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgApexchartsModule } from "ng-apexcharts";
import { WardsComponent } from './wards/wards.component';
import { SharedModule } from '../shared/shared.module';
import { FacilitiesComponent } from './facilities/facilities.component';
import { questionnireService } from '../caregiver/questionnaire-service/ques.service';
import { InnerFacilityComponent } from './facilities/inner-facility/inner-facility.component';
import { CustomersComponent } from './customers/customers.component';
import { InnerCustomersComponent } from './customers/inner-customers/inner-customers.component';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { UsersComponent } from './users/users.component';
import { WardSummaryComponent } from './wards/ward-summary/ward-summary.component';
import { SsaSettingsComponent } from './ssa-settings/ssa-settings.component';
import { InnerWardComponent } from './wards/inner-ward/inner-ward.component';
import { SendCommandsComponent } from './wards/send-commands/send-commands.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(SsaRoutes),
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
        CustomersComponent,
        InnerCustomersComponent,
        UsersComponent,
        WardSummaryComponent,
        InnerWardComponent,
        SsaSettingsComponent,
        SendCommandsComponent,
    ],
    providers: [
        questionnireService
    ],
    entryComponents: []
})
export class ssaModule { }
