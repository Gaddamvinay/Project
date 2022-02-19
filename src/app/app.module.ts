import * as $ from "jquery";
import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from "@angular/common/http";
import { AppRoutes } from "./app.routing";
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
import { AppComponent } from "./app.component";
import { MatDialogModule } from "@angular/material/dialog";
import { FlexLayoutModule } from "@angular/flex-layout";
import { FullComponent } from "./layouts/full/full.component";
import { AppBlankComponent } from "./layouts/blank/blank.component";
import { AppHeaderComponent, MyprofileComponent } from "./layouts/full/header/header.component";
import { AppSidebarComponent } from "./layouts/full/sidebar/sidebar.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MaterialModule } from "./material-module";
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";
import { PerfectScrollbarModule } from "ngx-perfect-scrollbar";
import { PERFECT_SCROLLBAR_CONFIG } from "ngx-perfect-scrollbar";
import { PerfectScrollbarConfigInterface } from "ngx-perfect-scrollbar";
import { SharedModule } from "./shared/shared.module";
import { SpinnerComponent } from "./shared/spinner.component";
import { NgxDaterangepickerMd } from "ngx-daterangepicker-material";
import { ToastrModule } from "ngx-toastr";
import { InterceptorService } from './../app/shared/interceptor/interceptor.service'
import { CookieService } from "ngx-cookie-service";
import { ResidentService } from "./caregiver/residents/resident.service";
import { AttendPromptComponent } from './layouts/full/attend-prompt/attend-prompt.component';
import { FooterComponent } from './layouts/full/footer/footer.component';
import { WebsocketService } from './common/commonData.service';
import { CriticalFilter } from './layouts/full/full.component';
import { CartComponent } from './shop/cart/cart.component';
import { authInterceptorProviders } from "./auth/login/auth.interceptor";

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
	suppressScrollX: true,
	wheelSpeed: 4,
	wheelPropagation: true,
};

@NgModule({
	declarations: [
		AppComponent,
		FullComponent,
		MyprofileComponent,
		AppHeaderComponent,
		SpinnerComponent,
		AppBlankComponent,
		AppSidebarComponent,
		AttendPromptComponent,
		FooterComponent,
		CriticalFilter,
		CartComponent,
	],
	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		MaterialModule,
		FormsModule,
		ReactiveFormsModule,
		MatDialogModule,
		FlexLayoutModule,
		HttpClientModule,
		PerfectScrollbarModule,
		SharedModule,
		NgIdleKeepaliveModule.forRoot(),
		RouterModule.forRoot(AppRoutes, { relativeLinkResolution: 'legacy' }),
		NgMultiSelectDropDownModule.forRoot(),
		NgxDaterangepickerMd.forRoot(),
		ToastrModule.forRoot(),
	],
	providers: [
		{
			provide: PERFECT_SCROLLBAR_CONFIG,
			useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG,
		},
		{
			provide: HTTP_INTERCEPTORS,
			useClass: InterceptorService,
			multi: true
		},
		CookieService,
		ResidentService,
		WebsocketService,
		DatePipe,authInterceptorProviders,
	],
	bootstrap: [AppComponent],
	entryComponents: [MyprofileComponent]
})
export class AppModule { }
