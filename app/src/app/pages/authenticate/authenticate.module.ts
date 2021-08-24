/* --- PAGES --- */
import { AuthenticatePage } from './authenticate.page';

/* --- MODULES --- */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatContentModule } from 'src/app/libs/mat-content/mat-content.module';
import { Routes, RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

const routes: Routes = [
	{
		path: '',
		component: AuthenticatePage
	}
];

@NgModule({
	imports: [
		CommonModule,
		MatIconModule,
		MatButtonModule,
		MatContentModule,
		MatProgressSpinnerModule,
		RouterModule.forChild(routes)
	],
	declarations: [
		AuthenticatePage
	]
})

export class AuthenticatePageModule { }
