// Angular Imports
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// This Module's Components
import { ReadmeComponent } from './readme.component';
import { RouterModule, Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'readme', pathMatch: 'full' },
    
    { path: '', component: ReadmeComponent , pathMatch: 'full' },
	
];

@NgModule({
    imports: [
        CommonModule,
		FormsModule,
		ReactiveFormsModule,
        RouterModule.forChild(routes),
    ],
    declarations: [
        ReadmeComponent,
    ],
    exports: [
        ReadmeComponent,
    ]
})
export class ReadmeModule {
    static routes = routes;
}

