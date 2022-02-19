import { Routes } from '@angular/router';
import { DashboardComponent } from '../shared/dashboard/dashboard.component';
import { WardsComponent } from './wards/wards.component';
import { FacilitiesComponent } from './facilities/facilities.component';
import { InnerFacilityComponent } from './facilities/inner-facility/inner-facility.component';
import { InnerWardComponent } from './wards/inner-ward/inner-ward.component';

export const HqRoutes: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                redirectTo: 'dashboard'
            },
           {
                path: 'dashboard',
                component: DashboardComponent,
                data: {
                    title: 'Dashboard',
                    urls: [
                        { title: 'Home', url: '/dashboard' },
                        { title: 'Dashboard' }
                    ]
                }
            },
            {
                path: 'wards',
                component: WardsComponent,
                data: {
                    title: 'Wards',
                    urls: [
                        { title: 'Dashboard', url: '/hq/dashboard' },
                        { title: 'Wards' }
                    ]
                }
            },
            {
                path: 'wards/:wardId',
                component: InnerWardComponent,
                data: {
                    title: 'Wards',
                    urls: [
                        { title: 'Home', url: '/hq/dashboard' },
                        { title: 'Wards', url: '/wards' }
                    ]
                }
            },
            {
                path: 'facilities',
                component: FacilitiesComponent,
                data: {
                    title: 'facilities',
                    urls: [
                        { title: 'Dashboard', url: '/hq/dashboard' },
                        { title: 'Facilities' }
                    ]
                }
            },
            {
                path: 'facilities/:facilityId',
                component: InnerFacilityComponent,
                data: {
                    title: 'Wards',
                    urls: [
                        { title: 'Home', url: '/hq/dashboard' },
                        { title: 'Facilities', url: '/facilities' }
                    ]
                }
            },
        ]
    }
];
