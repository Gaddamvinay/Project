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
import { FacilityRoutes } from './facility.routing';
import { NgxDaterangepickerMd } from "ngx-daterangepicker-material";
import { NgxPaginationModule } from 'ngx-pagination';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgApexchartsModule } from "ng-apexcharts";
import { WearablesComponent } from './wearables/wearables.component';
import { CaregiversComponent } from './caregivers/caregivers.component';
import { WardsComponent } from './wards/wards.component';
import { ResidentsComponent } from './residents/residents.component';
import { SharedModule } from '../shared/shared.module';
import { InnerWardComponent } from './wards/inner-ward/inner-ward.component';
import { questionnireService} from '../caregiver/questionnaire-service/ques.service'

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(FacilityRoutes),
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
        WearablesComponent,
        CaregiversComponent,
        WardsComponent,
        ResidentsComponent,
        InnerWardComponent
    ],
    providers: [
        questionnireService
    ],
    entryComponents: []
})
export class FacilityModule { }
