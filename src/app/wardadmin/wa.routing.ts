import { Routes } from '@angular/router';
import { DashboardComponent } from '../shared/dashboard/dashboard.component';
import { WearablesComponent } from './wearables/wearables.component';
import { CaregiversComponent } from './caregivers/caregivers.component';
import { ResidentsComponent } from './residents/residents.component';

export const waRoutes: Routes = [
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
                        { title: 'Home', url: '/wa/dashboard' },
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
                        { title: 'Home', url: '/wa/dashboard' },
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
                        { title: 'Home', url: '/wa/dashboard' },
                        { title: 'Caregivers' }
                    ]
                }
            },
            {
                path: 'residents',
                component: ResidentsComponent,
                data: {
                    title: 'Residents',
                    urls: [
                        { title: 'Home', url: '/wa/dashboard' },
                        { title: 'Residents' }
                    ]
                }
            },
            {
                path: 'rooms',
                component: ResidentsComponent,
                data: {
                    title: 'Rooms',
                    urls: [
                        { title: 'Home', url: '/wa/dashboard' },
                        { title: 'Rooms' }
                    ]
                }
            },
        ]
    }
];
