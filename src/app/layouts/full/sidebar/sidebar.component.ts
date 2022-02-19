import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, HostListener, Directive, AfterViewInit } from "@angular/core";
import { PerfectScrollbarConfigInterface } from "ngx-perfect-scrollbar";
import { MediaMatcher } from "@angular/cdk/layout";
import { MenuItems } from "../../../shared/menu-items/menu-items";
import { Router } from '@angular/router';
@Component({
	selector: "app-sidebar",
	templateUrl: "./sidebar.component.html",
	styleUrls: [],
})
export class AppSidebarComponent implements OnInit, OnDestroy {
	today: number = Date.now();
	public config: PerfectScrollbarConfigInterface = {};
	mobileQuery: MediaQueryList;

	private _mobileQueryListener: () => void;

	changeMenuItems: any[] = [];
	private _role: string = '';
	startLink: string = '';

	constructor(changeDetectorRef: ChangeDetectorRef, media: MediaMatcher, public menuItems: MenuItems, private router: Router, ) {
		this.mobileQuery = media.matchMedia("(min-width: 768px)");
		this._mobileQueryListener = () => changeDetectorRef.detectChanges();
		this.mobileQuery.addListener(this._mobileQueryListener);
		

	}

	ngOnInit(){
		let user: any = localStorage.getItem('loggedInUser');
		user = JSON.parse(user);
		if(user.user_type){
			this.updateRole(user.user_type);
		}
		// if(this.cognitoService.userInfo['custom:role']){
		// 	this.updateRole(this.cognitoService.userInfo["custom:role"]);
		// }else if(this.cognitoService.userInfo['role']){
		// 	this.updateRole(this.cognitoService.userInfo["role"]);
		// }else if(this.cognitoService.userInfo['cognito:username']){
		// 	this.updateRole(this.cognitoService.userInfo["cognito:username"]);
		// }
	}

	updateRole(event: any) {
		this._role = event;
		const facilityAndWardAdmin: string[] = ['wearables', 'residents', 'caregivers', 'wards','dashboard'];
		const wardAdmin: string[] = ['wearables', 'residents', 'caregivers','dashboard'];
		const customerHq: string[] = ['dashboard', 'wards', 'facilities'];
		const ssa: string[] = ['dashboard', 'wards', 'facilities', 'customers','users'];
		const caregiver: string[] = ['residents','notifications', 'interventions'];
		switch(event){
			case 'CA': {
				this.startLink = 'hq';
				this.changeMenuItems = this.menuItems.getMenuitem().filter(value => customerHq.includes(value.state))
				break;
			}
			case 'FA': {
				this.startLink = 'facility';
				this.changeMenuItems = this.menuItems.getMenuitem().filter(value => facilityAndWardAdmin.includes(value.state))
				break;
			}
			case 'Caregiver': {
				this.startLink = 'ca';
				this.changeMenuItems = this.menuItems.getMenuitem().filter(value => caregiver.includes(value.state))
				break;
			}
			case "SSA": {
				this.startLink = 'ssa';
				this.changeMenuItems = this.menuItems.getMenuitem().filter(value => ssa.includes(value.state))
				break;
			  }
			case "WA": {
				this.startLink = 'wa';
				this.changeMenuItems = this.menuItems.getMenuitem().filter(value => wardAdmin.includes(value.state));
				break;
			}
		}

		// if(this.startLink === 'caregiver'){
		// 	this.router.navigate(['/', this.startLink, 'residents'])
		// }else{
		// 	this.router.navigate(['/', this.startLink, 'dashboard'])
		// }
	}

	ngOnDestroy(): void {
		this.mobileQuery.removeListener(this._mobileQueryListener);
	}
}
