import { Injectable } from '@angular/core';

export interface BadgeItem {
    type: string;
    value: string;
}
export interface Saperator {
    name: string;
    type?: string;
}
export interface ChildrenItems {
    state: string;
    name: string;
    type?: string;
}

export interface Menu {
    state: string;
    name: string;
    type: string;
    icon: string;
    image: string;
    badge?: BadgeItem[];
    saperator?: Saperator[];
    children?: ChildrenItems[];
}

const MENUITEMS = [
    {
        state: 'dashboard',
        name: 'Dashboard',
        type: 'link',
        icon: 'av_timer',
        image: '',
        children: [
            
        ]
    },
    {
        state: 'customers',
        name: 'Customers',
        type: 'link',
        icon: 'av_timer',
        image: '',
        children: [
            
        ]
    },
    {
        state: 'facilities',
        name: 'Facilities',
        type: 'link',
        icon: 'av_timer',
        image: '',
        children: [
            
        ]
    },
    {
        state: 'wards',
        name: 'Wards',
        type: 'link',
        icon: 'av_timer',
        image: '',
        children: [
            
        ]
    },
    {
        state: 'caregivers',
        name: 'Caregivers',
        type: 'link',
        icon: 'av_timer',
        image: '',
        children: [
            
        ]
    },
    {
        state: 'residents',
        name: 'Residents',
        type: 'link',
        icon: 'supervised_user_circle',
        image: 'residents.png',
        badge: [{ type: 'warning', value: 'new' }],
        children: [
            
        ]
    },
    {
        state: 'wearables',
        name: 'Wearables',
        type: 'link',
        icon: 'supervised_user_circle',
        image: '',
        badge: [{ type: 'warning', value: 'new' }],
        children: [
            
        ]
    },
    {
        state: 'notifications',
        name: 'Notifications',
        type: 'link',
        icon: 'notifications',
        image: '',
        badge: [{ type: 'warning', value: 'new' }],
        children: [
            
        ]
    },
    {
        state: 'interventions',
        name: 'Interventions',
        type: 'link',
        icon: 'interventions',
        image: '',
        children: [
            
        ]
    },
    {
        state: 'users',
        name: 'Access control',
        type: 'link',
        icon: 'person_pin',
        image: '',
        children: [
            
        ]
    }
    // {
    //     state: 'support',
    //     name: 'Support',
    //     type: 'link',
    //     icon: 'contact_support',
    //     image: '',
    //     badge: [{ type: 'warning', value: 'new' }],
    //     children: [
            
    //     ]
    // },
];

@Injectable()
export class MenuItems {
    getMenuitem(): Menu[] {
        return MENUITEMS;
    }
}
