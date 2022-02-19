import { Routes } from '@angular/router';
import { DashboardComponent } from '../shared/dashboard/dashboard.component';
import { WearablesComponent } from './wearables/wearables.component';
import { CaregiversComponent } from './caregivers/caregivers.component';
import { WardsComponent } from './wards/wards.component';
import { ResidentsComponent } from './residents/residents.component';
import { InnerWardComponent } from './wards/inner-ward/inner-ward.component';

export const FacilityRoutes: Routes = [
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
                        { title: 'Home', url: '/facility/dashboard' },
                        { title: 'Dashboard' }
                    ]
                }
            },
            {
                path: 'wearables',
                component: WearablesComponent,
                data: {
                    title: 'Wearables',
                    urls: [
                        { title: 'Home', url: '/facility/dashboard' },
                        { title: 'Wearables' }
                    ]
                }
            },
            {
                path: 'caregivers',
                component: CaregiversComponent,
                data: {
                    title: 'Caregivers',
                    urls: [
                        { title: 'Home', url: '/facility/dashboard' },
                        { title: 'Caregivers' }
                    ]
                }
            },
            {
                path: 'wards',
                component: WardsComponent,
                data: {
                    title: 'Wards',
                    urls: [
                        { title: 'Home', url: '/facility/dashboard' },
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
                        { title: 'Home', url: '/facility/dashboard' },
                        { title: 'Wards', url: '/wards' }
                    ]
                }
            },
            {
                path: 'residents',
                component: ResidentsComponent,
                data: {
                    title: 'Residents',
                    urls: [
                        { title: 'Home', url: '/facility/dashboard' },
                        { title: 'Residents' }
                    ]
                }
            },
        ]
    }
];
