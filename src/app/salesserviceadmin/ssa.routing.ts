import { Routes } from '@angular/router';
import { DashboardComponent } from '../shared/dashboard/dashboard.component';
import { WardsComponent } from './wards/wards.component';
import { FacilitiesComponent } from './facilities/facilities.component';
import { InnerFacilityComponent } from './facilities/inner-facility/inner-facility.component';
import { CustomersComponent } from './customers/customers.component';
import { InnerCustomersComponent } from './customers/inner-customers/inner-customers.component';
import { UsersComponent } from './users/users.component'
import { InnerWardComponent } from './wards/inner-ward/inner-ward.component';

export const SsaRoutes: Routes = [
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
                        { title: 'Home', url: '/ssa/dashboard' },
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
                        { title: 'Dashboard', url: '/ssa/dashboard' },
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
                        { title: 'Home', url: '/ssa/dashboard' },
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
                        { title: 'Dashboard', url: '/ssa/dashboard' },
                        { title: 'Facilities' }
                    ]
                }
            },
            {
                path: 'customers',
                component: CustomersComponent,
                data: {
                    title: 'Customers',
                    urls: [
                        { title: 'Dashboard', url: '/ssa/dashboard' },
                        { title: 'Customers' }
                    ]
                }
            },
            {
                path: 'customers/:customer_id',
                component: InnerCustomersComponent,
                data: {
                    title: 'Customers',
                    urls: [
                        { title: 'Dashboard', url: '/ssa/dashboard' },
                        { title: 'Customers', url: '/ssa/facilities' }
                    ]
                }
            },
            {
                path: 'facilities/:facilityId',
                component: InnerFacilityComponent,
                data: {
                    title: 'Facilities',
                    urls: [
                        { title: 'Home', url: '/ssa/dashboard' },
                        { title: 'Facilities', url: '/ssa/facilities' }
                    ]
                }
            },
            {
                path: 'users',
                component: UsersComponent,
                data: {
                    title: 'Users',
                    urls: [
                        { title: 'Dashboard', url: '/ssa/dashboard' },
                        { title: 'Users' }
                    ]
                }
            },
        ]
    }
];
